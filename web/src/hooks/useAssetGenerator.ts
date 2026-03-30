import { useCallback, useRef, useState } from "react";
import type { Asset, Selection } from "@/types";
import { ImageProcessor } from "@/services/imageProcessor";
import { processSelections } from "@/services/api";
import { logger } from "@/utils/logger";

export function useAssetGenerator() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(
    async (
      selections: Selection[],
      imageElement: HTMLImageElement
    ) => {
      if (!selections.length) return;

      // Cancel any in-flight request
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        setLoading(true);
        setAssets([]);
        setError(null);
        setProgress(0);

        // Crop all selections from the canvas
        const canvasSize = ImageProcessor.calculateCanvasSize(
          imageElement.width,
          imageElement.height
        );

        const blobs: Blob[] = [];
        for (const selection of selections) {
          const blob = await ImageProcessor.cropSelection(
            imageElement,
            selection,
            canvasSize
          );
          blobs.push(blob);
        }

        // Send to API sequentially with progress
        const results = await processSelections(
          blobs,
          setProgress,
          controller.signal
        );

        setAssets(results);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          logger.info("Processing was cancelled");
        } else {
          setError("Failed to generate assets. Please try again.");
          logger.error("Asset generation failed:", err);
        }
      } finally {
        setLoading(false);
        setProgress(0);
        abortRef.current = null;
      }
    },
    []
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { assets, loading, progress, error, generate, cancel, clearError };
}
