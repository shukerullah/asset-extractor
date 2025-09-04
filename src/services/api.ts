import type { Asset, ApiError } from '@/types';

/**
 * Background Removal API Service
 * Following AAA Pattern: Arrange, Act, Assert
 */
export class BackgroundRemovalService {
  private static readonly API_ENDPOINT = '/api/remove-background';

  /**
   * Remove background from image blob
   */
  static async removeBackground(blob: Blob, index: number): Promise<Asset> {
    try {
      // Arrange: Prepare form data
      const formData = new FormData();
      formData.append('image', blob);

      // Act: Call API
      const response = await fetch(this.API_ENDPOINT, {
        method: 'POST',
        body: formData,
      });

      // Assert: Handle response
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
      console.error('Background removal failed:', error);
      
      // Fallback: return original image
      const url = URL.createObjectURL(blob);
      return {
        id: `fallback_${Date.now()}_${index}`,
        name: `asset_${index + 1}_original.png`,
        url,
        blob
      };
    }
  }

  /**
   * Process multiple selections
   */
  static async processSelections(
    blobs: Blob[],
    onProgress?: (progress: number) => void
  ): Promise<Asset[]> {
    const assets: Asset[] = [];
    const total = blobs.length;

    for (let i = 0; i < total; i++) {
      // Update progress
      const progress = ((i + 1) / total) * 100;
      onProgress?.(progress);

      // Process selection
      const asset = await this.removeBackground(blobs[i], i);
      assets.push(asset);
    }

    return assets;
  }
}