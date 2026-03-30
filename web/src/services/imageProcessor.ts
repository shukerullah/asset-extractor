import type { Selection } from "@/types";

export class ImageProcessor {
  static async cropSelection(
    imageElement: HTMLImageElement,
    selection: Selection,
    canvasSize: { width: number; height: number }
  ): Promise<Blob> {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Cannot get 2D context");

    canvas.width = selection.width;
    canvas.height = selection.height;

    const scale = imageElement.width / canvasSize.width;

    ctx.drawImage(
      imageElement,
      selection.x * scale,
      selection.y * scale,
      selection.width * scale,
      selection.height * scale,
      0,
      0,
      selection.width,
      selection.height
    );

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        blob ? resolve(blob) : reject(new Error("Failed to create blob"));
      }, "image/png");
    });
  }

  static async loadImageFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        typeof reader.result === "string"
          ? resolve(reader.result)
          : reject(new Error("Failed to read file"));
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  }

  static async loadImageElement(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = src;
    });
  }

  static calculateCanvasSize(
    imageWidth: number,
    imageHeight: number,
    maxSize = 600
  ): { width: number; height: number } {
    const scale = Math.min(maxSize / imageWidth, maxSize / imageHeight);
    return {
      width: imageWidth * scale,
      height: imageHeight * scale,
    };
  }
}
