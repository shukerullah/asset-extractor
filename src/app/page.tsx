"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";

import { BackgroundRemovalService } from "@/services/api";
import { ImageProcessor } from "@/services/imageProcessor";
import type { AppState, Asset, CanvasState, Selection } from "@/types";
import { DownloadManager } from "@/utils/download";
import { logger } from "@/utils/logger";
import styles from "./page.module.css";

// Components
import AssetGrid from "@/components/AssetGrid";
import ProgressBar from "@/components/ProgressBar";
import SelectionCanvas from "@/components/SelectionCanvas";

export default function AssetExtractorApp() {
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
      logger.error("Image upload failed:", error);
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
      logger.error("Asset generation failed:", error);
    }
  }, [appState.selections]);

  const handleDownloadAsset = useCallback((asset: Asset) => {
    DownloadManager.downloadAsset(asset);
  }, []);

  const handleDownloadAll = useCallback(() => {
    DownloadManager.downloadAllAssets(appState.assets);
  }, [appState.assets]);

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <header className={styles.header} role="banner">
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
              aria-describedby="upload-description"
            >
              Upload Image
            </button>
            <span id="upload-description" className="sr-only">
              Upload an image to start extracting objects and removing backgrounds
            </span>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.comparisonContainer}>
              <div className={styles.comparisonItem}>
                <div className={styles.comparisonImage}>
                  <Image
                    src="/assets/village_with-background.png"
                    alt="Village with background"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
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
                    sizes="(max-width: 768px) 100vw, 50vw"
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <span className={styles.comparisonLabel}>After</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className={styles.main} role="main">
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
          aria-label="Upload image file for background removal"
        />

        {/* How it works */}
        <section className={styles.processSection} aria-labelledby="how-it-works">
          <h2 id="how-it-works" className={styles.sectionTitle}>How it works</h2>
          <div className={styles.processSteps}>
            <div className={styles.processStep}>
              <div className={styles.stepIcon}>
                <Image
                  alt="Upload icon showing document with arrow pointing up"
                  src="/assets/upload.png"
                  fill
                  sizes="64px"
                  style={{ objectFit: "contain", padding: "16px" }}
                />
              </div>
              <h3>Upload image</h3>
            </div>
            <div className={styles.processStep}>
              <div className={styles.stepIcon}>
                <Image
                  src="/assets/select.png"
                  alt="Selection tool icon showing cursor with dotted rectangle"
                  fill
                  sizes="64px"
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
                  alt="Download icon showing arrow pointing down to folder"
                  fill
                  sizes="64px"
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
        </section>

        {/* Features */}
        <section className={styles.featuresSection} aria-labelledby="features">
          <h2 id="features" className={styles.sectionTitle}>Features</h2>
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
        </section>

        {/* Example Section */}
        <section className={styles.demoSection} aria-labelledby="example">
          <h2 id="example" className={styles.sectionTitle}>Example</h2>
          <div className={styles.demoContainer}>
            <div className={styles.demoSourceImage}>
              <Image
                src="/assets/village_with-background.png"
                alt="Village with background - source image"
                fill
                sizes="(max-width: 768px) 100vw, 60vw"
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
                    sizes="120px"
                    style={{ objectFit: "contain" }}
                  />
                </div>
                <div className={styles.assetPreview}>
                  <Image
                    src="/assets/castle.png"
                    alt="Extracted castle"
                    fill
                    sizes="120px"
                    style={{ objectFit: "contain" }}
                  />
                </div>
                <div className={styles.assetPreview}>
                  <Image
                    src="/assets/mill.png"
                    alt="Extracted mill"
                    fill
                    sizes="120px"
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
        </section>

        {/* Canvas Selection Section */}
        {appState.image && (
          <section className={styles.workspaceSection} aria-labelledby="workspace">
            <h3 id="workspace" className="sr-only">Image Selection Workspace</h3>
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
          </section>
        )}

        {/* Progress Section */}
        {appState.loading && (
          <section className={styles.progressSection} aria-labelledby="progress">
            <h3 id="progress" className="sr-only">Processing Progress</h3>
            <ProgressBar
              progress={appState.progress}
              message={`Processing asset ${Math.ceil(
                (appState.progress / 100) * appState.selections.length
              )} of ${appState.selections.length}`}
            />
          </section>
        )}

        {/* Asset Grid Section */}
        {appState.assets.length > 0 && (
          <section className={styles.resultsSection} aria-labelledby="results">
            <h3 id="results" className="sr-only">Generated Assets</h3>
            <AssetGrid
              assets={appState.assets}
              onDownload={handleDownloadAsset}
              onDownloadAll={handleDownloadAll}
            />
          </section>
        )}
      </main>

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
                sizes="200px"
                className={styles.coffeeButton}
              />
            </a>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>Made with ❤️ for creators worldwide.</p>
        </div>
      </footer>
    </div>
  );
}
