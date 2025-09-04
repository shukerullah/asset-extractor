'use client';

import { useRef, useEffect, useCallback } from 'react';
import type { SelectionCanvasProps } from '@/types';
import { ImageProcessor } from '@/services/imageProcessor';
import styles from '../app/home.module.css';

/**
 * Selection Canvas Component
 * Handles image display and selection drawing
 */
export default function SelectionCanvas({
  image,
  selections,
  currentSelection,
  onSelectionStart,
  onSelectionUpdate,
  onSelectionComplete,
  disabled = false
}: SelectionCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Draw canvas content
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate and set canvas size
    const canvasSize = ImageProcessor.calculateCanvasSize(img.width, img.height);
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    // Draw image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Draw selections
    const allSelections = [...selections];
    if (currentSelection) {
      allSelections.push(currentSelection);
    }

    allSelections.forEach((selection, index) => {
      const isCurrentSelection = currentSelection === selection;
      
      ctx.strokeStyle = isCurrentSelection ? '#ef4444' : '#3b82f6';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(selection.x, selection.y, selection.radius, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw selection number
      if (!isCurrentSelection) {
        ctx.fillStyle = '#3b82f6';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(
          (index + 1).toString(), 
          selection.x, 
          selection.y - selection.radius - 10
        );
      }
    });
  }, [selections, currentSelection]);

  // Load and setup image
  useEffect(() => {
    const loadImage = async () => {
      try {
        const img = await ImageProcessor.loadImageElement(image);
        imageRef.current = img;
        drawCanvas();
      } catch (error) {
        console.error('Failed to load image:', error);
      }
    };

    if (image) {
      loadImage();
    }
  }, [image, drawCanvas]);

  // Redraw when selections change
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Get mouse position relative to canvas
  const getMousePosition = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height)
    };
  }, []);

  // Mouse event handlers
  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    
    const position = getMousePosition(event);
    onSelectionStart(position);
  }, [disabled, getMousePosition, onSelectionStart]);

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (disabled || !currentSelection) return;
    
    const position = getMousePosition(event);
    const dx = position.x - currentSelection.x;
    const dy = position.y - currentSelection.y;
    const radius = Math.sqrt(dx * dx + dy * dy);

    onSelectionUpdate({
      x: currentSelection.x,
      y: currentSelection.y,
      radius
    });
  }, [disabled, currentSelection, getMousePosition, onSelectionUpdate]);

  const handleMouseUp = useCallback(() => {
    if (disabled || !currentSelection) return;
    
    if (currentSelection.radius > 10) {
      onSelectionComplete(currentSelection);
    }
  }, [disabled, currentSelection, onSelectionComplete]);

  return (
    <canvas
      ref={canvasRef}
      className={styles.canvas}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ 
        cursor: disabled ? 'not-allowed' : 'crosshair',
        opacity: disabled ? 0.7 : 1
      }}
    />
  );
}