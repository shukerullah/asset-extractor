import type { Asset } from '@/types';

/**
 * Download Utilities
 * Following AAA Pattern: Arrange, Act, Assert
 */
export class DownloadManager {
  /**
   * Download single asset
   */
  static downloadAsset(asset: Asset): void {
    // Arrange: Create download link
    const link = document.createElement('a');
    
    // Act: Configure and trigger download
    link.href = asset.url;
    link.download = asset.name;
    document.body.appendChild(link);
    link.click();
    
    // Assert: Cleanup
    document.body.removeChild(link);
  }

  /**
   * Download all assets with delay
   */
  static downloadAllAssets(assets: Asset[], delayMs: number = 500): void {
    assets.forEach((asset, index) => {
      setTimeout(() => {
        this.downloadAsset(asset);
      }, index * delayMs);
    });
  }

  /**
   * Create ZIP and download (future enhancement)
   */
  static async downloadAsZip(assets: Asset[], zipName = 'assets.zip'): Promise<void> {
    // This would require a ZIP library like JSZip
    // For now, fall back to individual downloads
    console.log(`ZIP download (${zipName}) not implemented yet, downloading individually...`);
    this.downloadAllAssets(assets);
  }
}