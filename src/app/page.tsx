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
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import CanvasSection from "@/components/CanvasSection";
import FooterSection from "@/components/FooterSection";
import ProgressBar from "@/components/ProgressBar";

export default function AssetExtractorApp() {
  // Get selection limit from environment variable
  const maxSelections = process.env.NEXT_PUBLIC_MAX_SELECTIONS 
    ? parseInt(process.env.NEXT_PUBLIC_MAX_SELECTIONS, 10) 
    : null; // null means unlimited

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

  // Check if selection limit is reached
  const isSelectionLimitReached = maxSelections !== null && appState.selections.length >= maxSelections;

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
      // Check if selection limit is reached
      if (isSelectionLimitReached) {
        setAppState((prev) => ({
          ...prev,
          error: `Maximum ${maxSelections} selections allowed. Please clear some selections or generate assets first.`,
        }));
        return;
      }

      // Clear any existing selection and error
      setCanvasState((prev) => ({
        ...prev,
        selectedSelectionId: null,
      }));

      setAppState((prev) => ({ ...prev, error: null }));

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
    [isSelectionLimitReached, maxSelections]
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
            <BeforeAfterSlider
              beforeImage="/assets/village_with-background.png"
              afterImage="/assets/village_without-background.png"
              beforeAlt="Village with background"
              afterAlt="Village without background"
            />
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
                priority
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
          <CanvasSection
            appState={appState}
            canvasState={canvasState}
            canvasRef={canvasRef}
            maxSelections={maxSelections}
            onSelectionStart={handleSelectionStart}
            onSelectionUpdate={handleSelectionUpdate}
            onSelectionComplete={handleSelectionComplete}
            onSelectionSelect={handleSelectionSelect}
            onSelectionMove={handleSelectionMove}
            onSelectionResize={handleSelectionResize}
            onSelectionDelete={handleSelectionDelete}
            onClearSelections={handleClearSelections}
            onGenerateAssets={handleGenerateAssets}
          />
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

      <FooterSection />
    </div>
  );
}
