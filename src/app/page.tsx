'use client';

import { useState, useCallback, useRef } from 'react';
import type { AppState, CanvasState, Selection, Asset } from '@/types';
import { ImageProcessor } from '@/services/imageProcessor';
import { BackgroundRemovalService } from '@/services/api';
import { DownloadManager } from '@/utils/download';

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
    startPoint: null,
    currentSelection: null
  });

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
    setCanvasState({
      isSelecting: true,
      startPoint: point,
      currentSelection: { x: point.x, y: point.y, radius: 0 }
    });
  }, []);

  const handleSelectionUpdate = useCallback((selection: Selection) => {
    setCanvasState(prev => ({
      ...prev,
      currentSelection: selection
    }));
  }, []);

  const handleSelectionComplete = useCallback((selection: Selection) => {
    if (selection.radius > 10) {
      setAppState(prev => ({
        ...prev,
        selections: [...prev.selections, selection]
      }));
    }
    
    setCanvasState({
      isSelecting: false,
      startPoint: null,
      currentSelection: null
    });
  }, []);

  const handleClearSelections = useCallback(() => {
    setAppState(prev => ({ ...prev, selections: [] }));
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
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🎮 Game Asset Extractor
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Extract transparent PNGs from AI-generated images using advanced background removal technology
          </p>
        </header>

        {/* Error Display */}
        {appState.error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            ⚠️ {appState.error}
          </div>
        )}

        {/* Image Upload Section */}
        <section className="mb-12">
          <ImageUploader 
            onImageUpload={handleImageUpload}
            disabled={appState.loading}
          />
        </section>

        {/* Canvas Selection Section */}
        {appState.image && (
          <section className="mb-12">
            <SelectionCanvas
              image={appState.image}
              selections={appState.selections}
              currentSelection={canvasState.currentSelection}
              onSelectionStart={handleSelectionStart}
              onSelectionUpdate={handleSelectionUpdate}
              onSelectionComplete={handleSelectionComplete}
              disabled={appState.loading}
            />
            
            {/* Controls */}
            <div className="flex justify-center space-x-4 mt-6">
              <button
                onClick={handleClearSelections}
                disabled={appState.loading || appState.selections.length === 0}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Clear ({appState.selections.length})
              </button>
              
              <button
                onClick={handleGenerateAssets}
                disabled={appState.loading || appState.selections.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {appState.loading ? 'Processing...' : 'Generate Assets'}
              </button>
            </div>
          </section>
        )}

        {/* Progress Section */}
        {appState.loading && (
          <section className="mb-12">
            <ProgressBar
              progress={appState.progress}
              message={`Processing asset ${Math.ceil((appState.progress / 100) * appState.selections.length)} of ${appState.selections.length}`}
              className="max-w-md mx-auto"
            />
          </section>
        )}

        {/* Asset Grid Section */}
        <section>
          <AssetGrid
            assets={appState.assets}
            onDownload={handleDownloadAsset}
            onDownloadAll={handleDownloadAll}
          />
        </section>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>Built with Next.js, TypeScript, and Hugging Face RMBG-1.4</p>
        </footer>
      </div>
    </div>
  );
}
