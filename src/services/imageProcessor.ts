import type { Selection } from '@/types';

export class ImageProcessor {
  static async cropSelection(
    imageElement: HTMLImageElement,
    selection: Selection,
    canvasSize: { width: number; height: number }
  ): Promise<Blob> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Cannot get 2D context');
    }

    canvas.width = selection.width;
    canvas.height = selection.height;

    const scale = imageElement.width / canvasSize.width;
    
    const sx = selection.x * scale;
    const sy = selection.y * scale;
    const sw = selection.width * scale;
    const sh = selection.height * scale;

    ctx.drawImage(
      imageElement, 
      sx, sy, sw, sh,
      0, 0, selection.width, selection.height
    );
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

  static async loadImageElement(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image'));
      
      img.src = src;
    });
  }

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