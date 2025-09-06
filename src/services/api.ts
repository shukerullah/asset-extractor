import type { Asset, ApiError } from '@/types';
import { logger } from '@/utils/logger';

export class BackgroundRemovalService {
  private static readonly BACKEND_URL = 
    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

  static async removeBackground(blob: Blob, index: number): Promise<Asset> {
    try {
      const formData = new FormData();
      formData.append('image', blob);

      const endpoint = `${this.BACKEND_URL}/remove-background`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.error || 'API request failed');
      }

      const resultBlob = await response.blob();
      const url = URL.createObjectURL(resultBlob);
      
      return {
        id: `asset_${Date.now()}_${index}`,
        name: `asset_${index + 1}.png`,
        url,
        blob: resultBlob
      };
    } catch (error) {
      logger.error('Background removal failed:', error);
      
      const url = URL.createObjectURL(blob);
      return {
        id: `fallback_${Date.now()}_${index}`,
        name: `asset_${index + 1}_original.png`,
        url,
        blob
      };
    }
  }

  static async processSelections(
    blobs: Blob[],
    onProgress?: (progress: number) => void
  ): Promise<Asset[]> {
    const assets: Asset[] = [];
    const total = blobs.length;

    for (let i = 0; i < total; i++) {
      const progress = ((i + 1) / total) * 100;
      onProgress?.(progress);

      const asset = await this.removeBackground(blobs[i], i);
      assets.push(asset);
    }

    return assets;
  }
}