"use client";

import { BackgroundRemovalService } from "@/services/api";
import { ImageProcessor } from "@/services/imageProcessor";
import type { AppState, Asset, CanvasState, Selection } from "@/types";
import { DownloadManager } from "@/utils/download";
import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import styles from "./page.module.css";

// Components
import AssetGrid from "@/components/AssetGrid";
import ProgressBar from "@/components/ProgressBar";
import SelectionCanvas from "@/components/SelectionCanvas";

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
    error: null,
  });

  const [canvasState, setCanvasState] = useState<CanvasState>({
    isSelecting: false,
    isDragging: false,
    isResizing: false,
    startPoint: null,
    currentSelection: null,
    selectedSelectionId: null,
    dragOffset: null,
    resizeHandle: null,
  });

  const selectionCounter = useRef(1);

  const imageRef = useRef<HTMLImageElement | null>(null);

  // Act: Event Handlers
  const handleImageUpload = useCallback(async (file: File) => {
    try {
      setAppState((prev) => ({ ...prev, loading: true, error: null }));

      // Load image and create element reference
      const imageUrl = await ImageProcessor.loadImageFile(file);
      const imageElement = await ImageProcessor.loadImageElement(imageUrl);

      imageRef.current = imageElement;

      // Reset state for new image
      setAppState((prev) => ({
        ...prev,
        image: imageUrl,
        selections: [],
        assets: [],
        loading: false,
        progress: 0,
      }));
    } catch (error) {
      setAppState((prev) => ({
        ...prev,
        error: "Failed to load image",
        loading: false,
      }));
      console.error("Image upload error:", error);
    }
  }, []);

  const handleSelectionStart = useCallback(
    (point: { x: number; y: number }) => {
      // Clear any existing selection
      setCanvasState((prev) => ({
        ...prev,
        selectedSelectionId: null,
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
          height: 0,
        },
        selectedSelectionId: null,
        dragOffset: null,
        resizeHandle: null,
      });
    },
    []
  );

  const handleSelectionUpdate = useCallback((selection: Selection) => {
    setCanvasState((prev) => ({
      ...prev,
      currentSelection: selection,
    }));
  }, []);

  const handleSelectionComplete = useCallback((selection: Selection) => {
    if (selection.width > 20 && selection.height > 20) {
      setAppState((prev) => ({
        ...prev,
        selections: [...prev.selections, selection],
      }));

      // Auto-select the newly created selection
      setCanvasState((prev) => ({
        ...prev,
        selectedSelectionId: selection.id,
        isSelecting: false,
        startPoint: null,
        currentSelection: null,
      }));

      selectionCounter.current++;
    } else {
      // Selection too small, just clear the current selection
      setCanvasState((prev) => ({
        ...prev,
        isSelecting: false,
        startPoint: null,
        currentSelection: null,
      }));
    }
  }, []);

  const handleSelectionSelect = useCallback((id: string) => {
    setCanvasState((prev) => ({
      ...prev,
      selectedSelectionId: id,
    }));
  }, []);

  const handleSelectionMove = useCallback(
    (id: string, x: number, y: number) => {
      setAppState((prev) => ({
        ...prev,
        selections: prev.selections.map((selection) =>
          selection.id === id ? { ...selection, x, y } : selection
        ),
      }));
    },
    []
  );

  const handleSelectionResize = useCallback(
    (id: string, x: number, y: number, width: number, height: number) => {
      setAppState((prev) => ({
        ...prev,
        selections: prev.selections.map((selection) =>
          selection.id === id
            ? { ...selection, x, y, width, height }
            : selection
        ),
      }));
    },
    []
  );

  const handleSelectionDelete = useCallback((id: string) => {
    setAppState((prev) => ({
      ...prev,
      selections: prev.selections.filter((selection) => selection.id !== id),
    }));

    // Clear selection if the deleted one was selected
    setCanvasState((prev) => ({
      ...prev,
      selectedSelectionId:
        prev.selectedSelectionId === id ? null : prev.selectedSelectionId,
    }));
  }, []);

  const handleClearSelections = useCallback(() => {
    setAppState((prev) => ({ ...prev, selections: [] }));
    setCanvasState((prev) => ({ ...prev, selectedSelectionId: null }));
  }, []);

  const handleGenerateAssets = useCallback(async () => {
    if (!appState.selections.length || !imageRef.current) return;

    try {
      setAppState((prev) => ({
        ...prev,
        loading: true,
        assets: [],
        error: null,
      }));

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
        (progress) => setAppState((prev) => ({ ...prev, progress }))
      );

      setAppState((prev) => ({
        ...prev,
        assets,
        loading: false,
        progress: 0,
      }));
    } catch (error) {
      setAppState((prev) => ({
        ...prev,
        error: "Failed to generate assets",
        loading: false,
        progress: 0,
      }));
      console.error("Asset generation error:", error);
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
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerText}>
            <h1>
              Remove Backgrounds.
              <br />
              Extract Assets. Simple.
            </h1>
            <p>
              Upload any image, select objects, and
              <br />
              download them as transparent PNGs.
            </p>
            <button
              className={styles.uploadButton}
              onClick={() => document.getElementById("fileInput")?.click()}
              disabled={appState.loading}
            >
              Upload Image
            </button>
          </div>
          <div className={styles.headerIllustration}>
            <div className={styles.beforeAfter}>
              <div className={styles.beforeSection}>
                <div className={styles.houseIllustration}>
                  <div className={styles.house}>
                    <div className={styles.roof}></div>
                    <div className={styles.walls}></div>
                    <div className={styles.door}></div>
                  </div>
                  <div className={styles.ground}></div>
                </div>
                <span className={styles.label}>Before</span>
              </div>
              <div className={styles.afterSection}>
                <div className={styles.houseIllustration}>
                  <div className={styles.house}>
                    <div className={styles.roof}></div>
                    <div className={styles.walls}></div>
                    <div className={styles.door}></div>
                  </div>
                </div>
                <span className={styles.label}>After</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.main}>
        {/* Error Display */}
        {appState.error && (
          <div className={styles.error}>⚠️ {appState.error}</div>
        )}

        {/* Hidden File Input */}
        <input
          id="fileInput"
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(file);
          }}
          disabled={appState.loading}
          style={{ display: "none" }}
        />

        {/* How it works */}
        <div className={styles.howItWorks}>
          <h2>How it works</h2>
          <div className={styles.steps}>
            <div className={styles.step}>
              <div className={styles.stepIcon}>📷</div>
              <h3>Upload image</h3>
            </div>
            <div className={styles.step}>
              <div className={styles.stepIcon}>👤</div>
              <h3>
                Select objects/
                <br />
                areas
              </h3>
            </div>
            <div className={styles.step}>
              <div className={styles.stepIcon}>⬇️</div>
              <h3>
                Download assets
                <br />
                as PNG
              </h3>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className={styles.features}>
          <h2>Features</h2>
          <div className={styles.featureList}>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>•</div>
              <span>Fast &amp; simple</span>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>•</div>
              <span>Transparent PNGs</span>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>•</div>
              <span>Multiple object extraction</span>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>•</div>
              <span>Free to start</span>
            </div>
          </div>
        </div>

        {/* Example Section */}
        <div className={styles.example}>
          <h2>Example</h2>
          <div className={styles.exampleContent}>
            <div className={styles.sourceImage}>
              <div className={styles.exampleHouse}>
                <div className={styles.house}>
                  <div className={styles.roof}></div>
                  <div className={styles.walls}></div>
                  <div className={styles.door}></div>
                </div>
                <div className={styles.tree}></div>
                <div className={styles.tree2}></div>
                <div className={styles.ground}></div>
              </div>
            </div>
            <div className={styles.rightSide}>
              <div className={styles.extractedObjects}>
                <div className={styles.extractedItem}>
                  <div className={styles.tree}></div>
                </div>
                <div className={styles.extractedItem}>
                  <div className={styles.tree2}></div>
                </div>
              </div>
              <div className={styles.uploadSection}>
                <button
                  className={styles.uploadImageBtn}
                  onClick={() => document.getElementById("fileInput")?.click()}
                  disabled={appState.loading}
                >
                  Upload image
                </button>
                <p className={styles.uploadSubtext}>
                  Start now — no signup required
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Canvas Selection Section */}
        {appState.image && (
          <div className={styles.canvasSection}>
            <div className={styles.instructions}>
              <h4>📝 Instructions:</h4>
              <p>
                • <strong>Create:</strong> Click and drag to create rectangular
                selections
              </p>
              <p>
                • <strong>Select:</strong> Click on any selection to select it
              </p>
              <p>
                • <strong>Move:</strong> Drag selected selection to move it
              </p>
              <p>
                • <strong>Resize:</strong> Drag the corner/edge handles to
                resize
              </p>
              <p>
                • <strong>Delete:</strong> Press Delete/Backspace key to remove
                selected
              </p>
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
                {appState.loading ? "Processing..." : "Generate Assets"}
              </button>
            </div>
          </div>
        )}

        {/* Progress Section */}
        {appState.loading && (
          <div className={styles.progress}>
            <ProgressBar
              progress={appState.progress}
              message={`Processing asset ${Math.ceil(
                (appState.progress / 100) * appState.selections.length
              )} of ${appState.selections.length}`}
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

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerMessage}>
          <h3>Remove backgrounds from any image in seconds</h3>
          <p>
            Fast, reliable, and completely free. Extract objects, remove
            backgrounds, and download transparent PNGs with just a few clicks.
          </p>
        </div>

        <div className={styles.footerLinks}>
          <div className={styles.socialLinks}>
            <p>
              Follow me on Twitter:{" "}
              <a
                href="https://twitter.com/shukerullah"
                target="_blank"
                rel="noopener noreferrer"
              >
                @shukerullah
              </a>
            </p>
          </div>
          <div className={styles.coffeeLink}>
            <a
              href="https://www.buymeacoffee.com/shukerullah"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png"
                alt="Buy Me A Coffee"
                width={200}
                height={55}
                className={styles.coffeeButton}
              />
            </a>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>
            &copy; 2024 Asset Extractor. Made with ❤️ for creators worldwide.
          </p>
        </div>
      </footer>
    </div>
  );
}
