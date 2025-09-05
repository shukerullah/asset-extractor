"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";

import { BackgroundRemovalService } from "@/services/api";
import { ImageProcessor } from "@/services/imageProcessor";
import type { AppState, Asset, CanvasState, Selection } from "@/types";
import { DownloadManager } from "@/utils/download";
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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

      // Focus on canvas after successful upload
      setTimeout(() => {
        canvasRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
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
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
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
              className={styles.primaryButton}
              onClick={() => document.getElementById("fileInput")?.click()}
              disabled={appState.loading}
            >
              Upload Image
            </button>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.comparisonContainer}>
              <div className={styles.comparisonItem}>
                <div className={styles.comparisonImage}>
                  <Image
                    src="/assets/village_with-background.png"
                    alt="Village with background"
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <span className={styles.comparisonLabel}>Before</span>
              </div>
              <div className={styles.comparisonArrow}>
                <div className={styles.arrowIcon}>→</div>
              </div>
              <div className={styles.comparisonItem}>
                <div className={styles.comparisonImage}>
                  <Image
                    src="/assets/village_without-background.png"
                    alt="Village without background"
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <span className={styles.comparisonLabel}>After</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.main}>
        {/* Error Display */}
        {appState.error && (
          <div className={styles.errorMessage}>⚠️ {appState.error}</div>
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
        <div className={styles.processSection}>
          <h2 className={styles.sectionTitle}>How it works</h2>
          <div className={styles.processSteps}>
            <div className={styles.processStep}>
              <div className={styles.stepIcon}>
                <Image
                  alt="Upload"
                  src="/assets/upload.png"
                  fill
                  style={{ objectFit: "contain", padding: "16px" }}
                />
              </div>
              <h3>Upload image</h3>
            </div>
            <div className={styles.processStep}>
              <div className={styles.stepIcon}>
                <Image
                  src="/assets/select.png"
                  alt="Select"
                  fill
                  style={{ objectFit: "contain", padding: "16px" }}
                />
              </div>
              <h3>
                Select objects/
                <br />
                areas
              </h3>
            </div>
            <div className={styles.processStep}>
              <div className={styles.stepIcon}>
                <Image
                  src="/assets/download.png"
                  alt="Download"
                  fill
                  style={{ objectFit: "contain", padding: "16px" }}
                />
              </div>
              <h3>
                Download assets
                <br />
                as PNG
              </h3>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className={styles.featuresSection}>
          <h2 className={styles.sectionTitle}>Features</h2>
          <div className={styles.featureGrid}>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>✓</div>
              <span>Fast &amp; simple</span>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>✓</div>
              <span>Transparent PNGs</span>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>✓</div>
              <span>Multiple object extraction</span>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>✓</div>
              <span>Quality results</span>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>✓</div>
              <span>No signup required</span>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>✓</div>
              <span>Free to start</span>
            </div>
          </div>
        </div>

        {/* Example Section */}
        <div className={styles.demoSection}>
          <h2 className={styles.sectionTitle}>Example</h2>
          <div className={styles.demoContainer}>
            <div className={styles.demoSourceImage}>
              <Image
                src="/assets/village_with-background.png"
                alt="Village with background - source image"
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
            <div className={styles.demoResults}>
              <div className={styles.extractedAssets}>
                <div className={styles.assetPreview}>
                  <Image
                    src="/assets/house.png"
                    alt="Extracted house"
                    fill
                    style={{ objectFit: "contain" }}
                  />
                </div>
                <div className={styles.assetPreview}>
                  <Image
                    src="/assets/castle.png"
                    alt="Extracted castle"
                    fill
                    style={{ objectFit: "contain" }}
                  />
                </div>
                <div className={styles.assetPreview}>
                  <Image
                    src="/assets/mill.png"
                    alt="Extracted mill"
                    fill
                    style={{ objectFit: "contain" }}
                  />
                </div>
              </div>
              <div className={styles.callToActionSection}>
                <button
                  className={styles.fullWidthButton}
                  onClick={() => document.getElementById("fileInput")?.click()}
                  disabled={appState.loading}
                >
                  Upload image
                </button>
                <p className={styles.ctaSubtext}>
                  Start now — no signup required
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Canvas Selection Section */}
        {appState.image && (
          <div className={styles.workspaceSection}>
            <div className={styles.instructionsPanel}>
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
              ref={canvasRef}
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
            <div className={styles.controlsGroup}>
              <button
                onClick={handleClearSelections}
                disabled={appState.loading || appState.selections.length === 0}
                className={styles.buttonSecondary}
              >
                Clear All
              </button>

              <button
                onClick={handleGenerateAssets}
                disabled={appState.loading || appState.selections.length === 0}
                className={styles.buttonPrimary}
              >
                {appState.loading ? "Processing..." : "Generate Assets"}
              </button>
            </div>
          </div>
        )}

        {/* Progress Section */}
        {appState.loading && (
          <div className={styles.progressSection}>
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
          <div className={styles.resultsSection}>
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
            &copy; 2025 Asset Extractor. Made with ❤️ for creators worldwide.
          </p>
        </div>
      </footer>
    </div>
  );
}
