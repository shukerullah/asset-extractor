'use client';

import { useState, useCallback, useRef } from 'react';
import type { AppState, CanvasState, Selection, Asset } from '@/types';
import { ImageProcessor } from '@/services/imageProcessor';
import { BackgroundRemovalService } from '@/services/api';
import { DownloadManager } from '@/utils/download';
import styles from './home.module.css';

// Components
import ImageUploader from '@/components/ImageUploader';
import SelectionCanvas from '@/components/SelectionCanvas';
import AssetGrid from '@/components/AssetGrid';
import ProgressBar from '@/components/ProgressBar';

/**
 * Asset Extractor - Main Application Component
 * Following AAA Pattern: Arrange, Act, Assert
 * Clean Single Page Application with proper separation of concerns
 */
export default function AssetExtractorApp() {
  // Arrange: Application State
  const [appState, setAppState] = useState<AppState>({
    image: null,
    selections: [],
    assets: [],
    loading: false,
    progress: 0,
    error: null
  });

  const [canvasState, setCanvasState] = useState<CanvasState>({
    isSelecting: false,
    isDragging: false,
    isResizing: false,
    startPoint: null,
    currentSelection: null,
    selectedSelectionId: null,
    dragOffset: null,
    resizeHandle: null
  });

  const selectionCounter = useRef(1);

  const imageRef = useRef<HTMLImageElement | null>(null);

  // Act: Event Handlers
  const handleImageUpload = useCallback(async (file: File) => {
    try {
      setAppState(prev => ({ ...prev, loading: true, error: null }));
      
      // Load image and create element reference
      const imageUrl = await ImageProcessor.loadImageFile(file);
      const imageElement = await ImageProcessor.loadImageElement(imageUrl);
      
      imageRef.current = imageElement;
      
      // Reset state for new image
      setAppState(prev => ({
        ...prev,
        image: imageUrl,
        selections: [],
        assets: [],
        loading: false,
        progress: 0
      }));
      
    } catch (error) {
      setAppState(prev => ({
        ...prev,
        error: 'Failed to load image',
        loading: false
      }));
      console.error('Image upload error:', error);
    }
  }, []);

  const handleSelectionStart = useCallback((point: { x: number; y: number }) => {
    // Clear any existing selection
    setCanvasState(prev => ({
      ...prev,
      selectedSelectionId: null
    }));
    
    setCanvasState({
      isSelecting: true,
      isDragging: false,
      isResizing: false,
      startPoint: point,
      currentSelection: { 
        id: `selection_${selectionCounter.current}`, 
        x: point.x, 
        y: point.y, 
        width: 0, 
        height: 0 
      },
      selectedSelectionId: null,
      dragOffset: null,
      resizeHandle: null
    });
  }, []);

  const handleSelectionUpdate = useCallback((selection: Selection) => {
    setCanvasState(prev => ({
      ...prev,
      currentSelection: selection
    }));
  }, []);

  const handleSelectionComplete = useCallback((selection: Selection) => {
    if (selection.width > 20 && selection.height > 20) {
      setAppState(prev => ({
        ...prev,
        selections: [...prev.selections, selection]
      }));
      
      // Auto-select the newly created selection
      setCanvasState(prev => ({
        ...prev,
        selectedSelectionId: selection.id,
        isSelecting: false,
        startPoint: null,
        currentSelection: null
      }));
      
      selectionCounter.current++;
    } else {
      // Selection too small, just clear the current selection
      setCanvasState(prev => ({
        ...prev,
        isSelecting: false,
        startPoint: null,
        currentSelection: null
      }));
    }
  }, []);

  const handleSelectionSelect = useCallback((id: string) => {
    setCanvasState(prev => ({
      ...prev,
      selectedSelectionId: id
    }));
  }, []);

  const handleSelectionMove = useCallback((id: string, x: number, y: number) => {
    setAppState(prev => ({
      ...prev,
      selections: prev.selections.map(selection => 
        selection.id === id ? { ...selection, x, y } : selection
      )
    }));
  }, []);

  const handleSelectionResize = useCallback((id: string, x: number, y: number, width: number, height: number) => {
    setAppState(prev => ({
      ...prev,
      selections: prev.selections.map(selection => 
        selection.id === id ? { ...selection, x, y, width, height } : selection
      )
    }));
  }, []);

  const handleSelectionDelete = useCallback((id: string) => {
    setAppState(prev => ({
      ...prev,
      selections: prev.selections.filter(selection => selection.id !== id)
    }));
    
    // Clear selection if the deleted one was selected
    setCanvasState(prev => ({
      ...prev,
      selectedSelectionId: prev.selectedSelectionId === id ? null : prev.selectedSelectionId
    }));
  }, []);

  const handleClearSelections = useCallback(() => {
    setAppState(prev => ({ ...prev, selections: [] }));
    setCanvasState(prev => ({ ...prev, selectedSelectionId: null }));
  }, []);

  const handleGenerateAssets = useCallback(async () => {
    if (!appState.selections.length || !imageRef.current) return;

    try {
      setAppState(prev => ({ ...prev, loading: true, assets: [], error: null }));
      
      // Crop all selections
      const croppedBlobs: Blob[] = [];
      for (const selection of appState.selections) {
        const canvasSize = ImageProcessor.calculateCanvasSize(
          imageRef.current.width, 
          imageRef.current.height
        );
        
        const blob = await ImageProcessor.cropSelection(
          imageRef.current,
          selection,
          canvasSize
        );
        croppedBlobs.push(blob);
      }

      // Process with background removal
      const assets = await BackgroundRemovalService.processSelections(
        croppedBlobs,
        (progress) => setAppState(prev => ({ ...prev, progress }))
      );

      setAppState(prev => ({
        ...prev,
        assets,
        loading: false,
        progress: 0
      }));

    } catch (error) {
      setAppState(prev => ({
        ...prev,
        error: 'Failed to generate assets',
        loading: false,
        progress: 0
      }));
      console.error('Asset generation error:', error);
    }
  }, [appState.selections]);

  const handleDownloadAsset = useCallback((asset: Asset) => {
    DownloadManager.downloadAsset(asset);
  }, []);

  const handleDownloadAll = useCallback(() => {
    DownloadManager.downloadAllAssets(appState.assets);
  }, [appState.assets]);

  // Assert: Render Application
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className={styles.container}>
          {/* Header */}
          <div className={styles.header}>
            <h1>🎮 Game Asset Extractor</h1>
            <p>Extract transparent PNGs from AI-generated images using advanced background removal technology</p>
          </div>

          <div className={styles.main}>
            {/* Error Display */}
            {appState.error && (
              <div style={{ 
                marginBottom: '20px', 
                padding: '15px', 
                backgroundColor: '#ffebee', 
                border: '1px solid #f8bbd9', 
                borderRadius: '10px', 
                color: '#c62828' 
              }}>
                ⚠️ {appState.error}
              </div>
            )}

            {/* Image Upload Section */}
            <div className={styles.uploadSection}>
              <ImageUploader 
                onImageUpload={handleImageUpload}
                disabled={appState.loading}
              />
            </div>

            {/* Canvas Selection Section */}
            {appState.image && (
              <div className={styles.canvasSection}>
                <div className={styles.instructions}>
                  <h4>📝 Instructions:</h4>
                  <p>• <strong>Create:</strong> Click and drag to create rectangular selections</p>
                  <p>• <strong>Select:</strong> Click on any selection to select it</p>
                  <p>• <strong>Move:</strong> Drag selected selection to move it</p>
                  <p>• <strong>Resize:</strong> Drag the corner/edge handles to resize</p>
                  <p>• <strong>Delete:</strong> Press Delete/Backspace key to remove selected</p>
                </div>

                <SelectionCanvas
                  image={appState.image}
                  selections={appState.selections}
                  currentSelection={canvasState.currentSelection}
                  selectedSelectionId={canvasState.selectedSelectionId}
                  onSelectionStart={handleSelectionStart}
                  onSelectionUpdate={handleSelectionUpdate}
                  onSelectionComplete={handleSelectionComplete}
                  onSelectionSelect={handleSelectionSelect}
                  onSelectionMove={handleSelectionMove}
                  onSelectionResize={handleSelectionResize}
                  onSelectionDelete={handleSelectionDelete}
                  disabled={appState.loading}
                />
                
                {/* Controls */}
                <div className={styles.controls}>
                  
                  <button
                    onClick={handleClearSelections}
                    disabled={appState.loading || appState.selections.length === 0}
                    className={styles.btnSecondary}
                  >
                    Clear All
                  </button>
                  
                  <button
                    onClick={handleGenerateAssets}
                    disabled={appState.loading || appState.selections.length === 0}
                    className={styles.btnPrimary}
                  >
                    {appState.loading ? 'Processing...' : 'Generate Assets'}
                  </button>
                </div>
              </div>
            )}

            {/* Progress Section */}
            {appState.loading && (
              <div className={styles.progress}>
                <ProgressBar
                  progress={appState.progress}
                  message={`Processing asset ${Math.ceil((appState.progress / 100) * appState.selections.length)} of ${appState.selections.length}`}
                />
              </div>
            )}

            {/* Asset Grid Section */}
            {appState.assets.length > 0 && (
              <div className={styles.results}>
                <AssetGrid
                  assets={appState.assets}
                  onDownload={handleDownloadAsset}
                  onDownloadAll={handleDownloadAll}
                />
              </div>
            )}
          </div>
        </div>
      </main>
      
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <p className="text-gray-500 text-sm">Built with Next.js, TypeScript, and Hugging Face RMBG-1.4</p>
      </footer>
    </div>
  );
}
