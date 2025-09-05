'use client';

import { useCallback, useState } from 'react';
import type { ImageUploaderProps } from '@/types';
import styles from '../app/page.module.css';

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
    <label 
      htmlFor="fileInput"
      className={`${styles.uploadArea} ${isDragging ? styles.dragover : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{ opacity: disabled ? 0.6 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
    >
      <div className={styles.uploadIcon}>📁</div>
      <h3>Upload your image</h3>
      <p>{isDragging ? 'Drop image here' : 'Click to browse or drag & drop'}</p>
      <p style={{ fontSize: '0.9em', color: '#999', marginTop: '10px' }}>
        Supports: JPG, PNG, GIF, WebP
      </p>
      <input
        id="fileInput"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={disabled}
        style={{ display: 'none' }}
      />
    </label>
  );
}