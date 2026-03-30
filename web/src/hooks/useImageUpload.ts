import { useCallback, useRef, useState } from "react";
import { ImageProcessor } from "@/services/imageProcessor";
import { logger } from "@/utils/logger";

export function useImageUpload() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const imageElementRef = useRef<HTMLImageElement | null>(null);

  const upload = useCallback(async (file: File) => {
    try {
      setLoading(true);
      setError(null);

      const imageUrl = await ImageProcessor.loadImageFile(file);
      const imageElement = await ImageProcessor.loadImageElement(imageUrl);

      imageElementRef.current = imageElement;
      setImage(imageUrl);
    } catch (err) {
      setError("Failed to load image");
      logger.error("Image upload failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setImage(null);
    setError(null);
    imageElementRef.current = null;
  }, []);

  return {
    image,
    imageElement: imageElementRef,
    uploading: loading,
    uploadError: error,
    upload,
    reset,
    clearError: () => setError(null),
  };
}
