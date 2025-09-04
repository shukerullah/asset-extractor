import type { Selection } from '@/types';

/**
 * Image Processing Utilities
 * Following AAA Pattern: Arrange, Act, Assert
 */
export class ImageProcessor {
  /**
   * Crop selection from image
   */
  static async cropSelection(
    imageElement: HTMLImageElement,
    selection: Selection,
    canvasSize: { width: number; height: number }
  ): Promise<Blob> {
    // Arrange: Create canvas and context
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Cannot get 2D context');
    }

    // Act: Calculate dimensions and draw
    const size = selection.radius * 2;
    canvas.width = size;
    canvas.height = size;

    // Calculate scale from canvas to original image
    const scale = imageElement.width / canvasSize.width;
    
    const sx = (selection.x - selection.radius) * scale;
    const sy = (selection.y - selection.radius) * scale;
    const sw = size * scale;
    const sh = size * scale;

    ctx.drawImage(imageElement, sx, sy, sw, sh, 0, 0, size, size);
    
    // Assert: Return blob
    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob from canvas'));
        }
      }, 'image/png');
    });
  }

  /**
   * Load image file as data URL
   */
  static async loadImageFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file as data URL'));
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Load image element from URL
   */
  static async loadImageElement(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image'));
      
      img.src = src;
    });
  }

  /**
   * Calculate optimal canvas size
   */
  static calculateCanvasSize(
    imageWidth: number, 
    imageHeight: number, 
    maxSize: number = 600
  ): { width: number; height: number } {
    const scale = Math.min(maxSize / imageWidth, maxSize / imageHeight);
    
    return {
      width: imageWidth * scale,
      height: imageHeight * scale
    };
  }
}