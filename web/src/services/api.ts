import type { Asset } from "@/types";
import { logger } from "@/utils/logger";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const REQUEST_TIMEOUT_MS = 30_000;

/**
 * Remove background from a single image blob.
 * Supports cancellation via AbortSignal.
 */
async function removeBackground(
  blob: Blob,
  index: number,
  signal?: AbortSignal
): Promise<Asset> {
  const formData = new FormData();
  formData.append("image", blob);

  // Timeout via AbortSignal.timeout merged with caller's signal
  const timeoutSignal = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  const combinedSignal = signal
    ? AbortSignal.any([signal, timeoutSignal])
    : timeoutSignal;

  const response = await fetch(`${API_URL}/remove-background`, {
    method: "POST",
    body: formData,
    signal: combinedSignal,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(`API error ${response.status}: ${errorText}`);
  }

  const resultBlob = await response.blob();
  const url = URL.createObjectURL(resultBlob);

  return {
    id: `asset_${Date.now()}_${index}`,
    name: `asset_${index + 1}.png`,
    url,
    blob: resultBlob,
  };
}

/**
 * Process multiple selections sequentially.
 * Each request waits for the previous to finish before starting.
 * Supports cancellation — if the signal fires, remaining requests are skipped.
 */
export async function processSelections(
  blobs: Blob[],
  onProgress?: (progress: number) => void,
  signal?: AbortSignal
): Promise<Asset[]> {
  const assets: Asset[] = [];

  for (let i = 0; i < blobs.length; i++) {
    // Check if cancelled before starting next request
    if (signal?.aborted) {
      logger.info("Processing cancelled by user");
      break;
    }

    const asset = await removeBackground(blobs[i], i, signal);
    assets.push(asset);
    onProgress?.(((i + 1) / blobs.length) * 100);
  }

  return assets;
}
