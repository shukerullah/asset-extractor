"use client";

import Image from "next/image";
import { useCallback, useRef } from "react";
import styles from "./page.module.css";

import { useImageUpload } from "@/hooks/useImageUpload";
import { useSelections } from "@/hooks/useSelections";
import { useAssetGenerator } from "@/hooks/useAssetGenerator";
import { downloadAsset, downloadAllAssets } from "@/utils/download";

import BeforeAfterSlider from "@/components/BeforeAfterSlider/BeforeAfterSlider";
import CanvasSection from "@/components/CanvasSection/CanvasSection";
import ProgressBar from "@/components/ProgressBar/ProgressBar";
import AssetGrid from "@/components/AssetGrid/AssetGrid";
import FooterSection from "@/components/FooterSection/FooterSection";

const maxSelections = process.env.NEXT_PUBLIC_MAX_SELECTIONS
  ? parseInt(process.env.NEXT_PUBLIC_MAX_SELECTIONS, 10)
  : null;

export default function AssetExtractorApp() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const { image, imageElement, uploading, uploadError, upload } =
    useImageUpload();

  const sel = useSelections(maxSelections);

  const generator = useAssetGenerator();

  // Combine errors from upload and generator
  const error = uploadError || generator.error;

  const loading = uploading || generator.loading;

  const handleImageUpload = useCallback(
    async (file: File) => {
      sel.clearAll();
      generator.cancel();
      await upload(file);
      setTimeout(() => {
        canvasRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    },
    [upload, sel, generator]
  );

  const handleGenerateAssets = useCallback(() => {
    if (!imageElement.current || !sel.selections.length) return;
    generator.generate(sel.selections, imageElement.current);
  }, [generator, sel.selections, imageElement]);

  const triggerFileInput = () =>
    document.getElementById("fileInput")?.click();

  return (
    <div className={styles.container}>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
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
              onClick={triggerFileInput}
              disabled={loading}
            >
              Upload Image
            </button>
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
        {/* ── Error ───────────────────────────────────────────────────────── */}
        {error && (
          <div className={styles.errorMessage}>⚠️ {error}</div>
        )}

        {/* ── Hidden File Input ───────────────────────────────────────────── */}
        <input
          id="fileInput"
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(file);
          }}
          disabled={loading}
          style={{ display: "none" }}
          aria-label="Upload image file for background removal"
        />

        {/* ── How It Works ────────────────────────────────────────────────── */}
        <section
          className={styles.processSection}
          aria-labelledby="how-it-works"
        >
          <h2 id="how-it-works" className={styles.sectionTitle}>
            How it works
          </h2>
          <div className={styles.processSteps}>
            <div className={styles.processStep}>
              <div className={styles.stepIcon}>
                <Image
                  alt="Upload icon"
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
                  alt="Selection tool icon"
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
                  alt="Download icon"
                  fill
                  sizes="64px"
                  style={{ objectFit: "contain", padding: "16px" }}
                />
              </div>
              <h3>Download assets</h3>
            </div>
          </div>
        </section>

        {/* ── Features ────────────────────────────────────────────────────── */}
        <section className={styles.featuresSection}>
          <div className={styles.featureGrid}>
            {[
              "AI-powered background removal",
              "Multiple object selection",
              "Transparent PNG output",
              "No signup required",
              "Fast processing",
              "Completely free",
            ].map((feature) => (
              <div key={feature} className={styles.featureItem}>
                <div className={styles.featureIcon}>✓</div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Demo ────────────────────────────────────────────────────────── */}
        <section className={styles.demoSection}>
          <h2 className={styles.sectionTitle}>See it in action</h2>
          <div className={styles.demoContainer}>
            <div className={styles.demoSourceImage}>
              <Image
                src="/assets/village_with-background.png"
                alt="Village with background — source image"
                fill
                sizes="(max-width: 768px) 100vw, 60vw"
                style={{ objectFit: "cover" }}
                priority
              />
            </div>
            <div className={styles.demoResults}>
              <div className={styles.extractedAssets}>
                {["house", "castle", "mill"].map((name) => (
                  <div key={name} className={styles.assetPreview}>
                    <Image
                      src={`/assets/${name}.png`}
                      alt={`Extracted ${name}`}
                      fill
                      sizes="120px"
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                ))}
              </div>
              <div className={styles.callToActionSection}>
                <button
                  className={styles.fullWidthButton}
                  onClick={triggerFileInput}
                  disabled={loading}
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

        {/* ── Canvas Workspace ────────────────────────────────────────────── */}
        {image && (
          <CanvasSection
            image={image}
            selections={sel.selections}
            canvasState={sel.canvasState}
            canvasRef={canvasRef}
            maxSelections={maxSelections}
            loading={loading}
            onSelectionStart={sel.start}
            onSelectionUpdate={sel.update}
            onSelectionComplete={sel.complete}
            onSelectionSelect={sel.select}
            onSelectionMove={sel.move}
            onSelectionResize={sel.resize}
            onSelectionDelete={sel.remove}
            onClearSelections={sel.clearAll}
            onGenerateAssets={handleGenerateAssets}
          />
        )}

        {/* ── Progress ────────────────────────────────────────────────────── */}
        {generator.loading && (
          <section className={styles.progressSection}>
            <ProgressBar
              progress={generator.progress}
              message={`Processing asset ${Math.ceil(
                (generator.progress / 100) * sel.selections.length
              )} of ${sel.selections.length}`}
            />
          </section>
        )}

        {/* ── Results ─────────────────────────────────────────────────────── */}
        {generator.assets.length > 0 && (
          <section className={styles.resultsSection}>
            <AssetGrid
              assets={generator.assets}
              onDownload={downloadAsset}
              onDownloadAll={() => downloadAllAssets(generator.assets)}
            />
          </section>
        )}
      </main>

      <FooterSection />
    </div>
  );
}
