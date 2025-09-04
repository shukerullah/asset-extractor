'use client';

import { useCallback, useState } from 'react';
import type { ImageUploaderProps } from '@/types';

/**
 * Image Uploader Component
 * Handles file upload via click or drag & drop
 */
export default function ImageUploader({ onImageUpload, disabled = false }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file);
    }
  }, [onImageUpload]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file);
    }
  }, [onImageUpload]);

  return (
    <div className="w-full max-w-md mx-auto">
      <label 
        htmlFor="fileInput"
        className={`
          block w-full p-8 border-2 border-dashed rounded-lg cursor-pointer
          transition-all duration-200 hover:bg-gray-50
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <div className="text-4xl mb-4">📁</div>
          <h3 className="text-lg font-semibold mb-2">Upload your image</h3>
          <p className="text-gray-600">
            {isDragging ? 'Drop image here' : 'Click to browse or drag & drop'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Supports: JPG, PNG, GIF, WebP
          </p>
        </div>
        <input
          id="fileInput"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={disabled}
          className="hidden"
        />
      </label>
    </div>
  );
}