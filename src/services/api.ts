import type { Asset, ApiError } from '@/types';
import { logger } from '@/utils/logger';

export class BackgroundRemovalService {
  private static readonly API_ENDPOINT = process.env.NODE_ENV === 'production' 
    ? process.env.NEXT_PUBLIC_BACKEND_URL || 'https://example.railway.app'
    : '/api/remove-background';

  static async removeBackground(blob: Blob, index: number): Promise<Asset> {
    try {
      const formData = new FormData();
      formData.append('image', blob);

      const endpoint = process.env.NODE_ENV === 'production' 
        ? `${this.API_ENDPOINT}/remove-background`
        : this.API_ENDPOINT;
      
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