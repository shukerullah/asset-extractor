'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import type { SelectionCanvasProps, Selection } from '@/types';
import { ImageProcessor } from '@/services/imageProcessor';
import styles from '../app/page.module.css';

/**
 * Professional Rectangular Selection Canvas Component
 * Features: Rectangle selection, move, resize, delete (like Photoshop)
 */
export default function SelectionCanvas({
  image,
  selections,
  currentSelection,
  selectedSelectionId,
  onSelectionStart,
  onSelectionUpdate,
  onSelectionComplete,
  onSelectionSelect,
  onSelectionMove,
  onSelectionResize,
  onSelectionDelete,
  disabled = false
}: SelectionCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  
  // Canvas interaction state
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [cursor, setCursor] = useState('crosshair');

  // Handle size constants
  const HANDLE_SIZE = 8;
  const SELECTION_MIN_SIZE = 20;

  // Get selection by ID
  const getSelectionById = useCallback((id: string): Selection | null => {
    return selections.find(s => s.id === id) || null;
  }, [selections]);

  // Check if point is inside a rectangle
  const isPointInRect = useCallback((point: { x: number; y: number }, rect: Selection): boolean => {
    return point.x >= rect.x && 
           point.x <= rect.x + rect.width && 
           point.y >= rect.y && 
           point.y <= rect.y + rect.height;
  }, []);

  // Get resize handle at point
  const getResizeHandleAt = useCallback((point: { x: number; y: number }, selection: Selection): string | null => {
    const handles = [
      { name: 'nw', x: selection.x - HANDLE_SIZE/2, y: selection.y - HANDLE_SIZE/2 },
      { name: 'ne', x: selection.x + selection.width - HANDLE_SIZE/2, y: selection.y - HANDLE_SIZE/2 },
      { name: 'sw', x: selection.x - HANDLE_SIZE/2, y: selection.y + selection.height - HANDLE_SIZE/2 },
      { name: 'se', x: selection.x + selection.width - HANDLE_SIZE/2, y: selection.y + selection.height - HANDLE_SIZE/2 },
      { name: 'n', x: selection.x + selection.width/2 - HANDLE_SIZE/2, y: selection.y - HANDLE_SIZE/2 },
      { name: 's', x: selection.x + selection.width/2 - HANDLE_SIZE/2, y: selection.y + selection.height - HANDLE_SIZE/2 },
      { name: 'w', x: selection.x - HANDLE_SIZE/2, y: selection.y + selection.height/2 - HANDLE_SIZE/2 },
      { name: 'e', x: selection.x + selection.width - HANDLE_SIZE/2, y: selection.y + selection.height/2 - HANDLE_SIZE/2 }
    ];

    for (const handle of handles) {
      if (point.x >= handle.x && point.x <= handle.x + HANDLE_SIZE &&
          point.y >= handle.y && point.y <= handle.y + HANDLE_SIZE) {
        return handle.name;
      }
    }
    return null;
  }, []);

  // Get cursor for resize handle
  const getCursorForHandle = useCallback((handle: string): string => {
    switch (handle) {
      case 'nw': case 'se': return 'nw-resize';
      case 'ne': case 'sw': return 'ne-resize';
      case 'n': case 's': return 'ns-resize';
      case 'e': case 'w': return 'ew-resize';
      default: return 'crosshair';
    }
  }, []);

  // Draw selection rectangle with handles
  const drawSelection = useCallback((ctx: CanvasRenderingContext2D, selection: Selection, isSelected: boolean, isCurrentSelection: boolean) => {
    // Selection rectangle
    ctx.strokeStyle = isCurrentSelection ? '#ef4444' : (isSelected ? '#3b82f6' : '#6b7280');
    ctx.lineWidth = isSelected ? 2 : 1;
    ctx.setLineDash(isCurrentSelection ? [5, 5] : []);
    ctx.strokeRect(selection.x, selection.y, selection.width, selection.height);
    ctx.setLineDash([]);

    // Selection fill (semi-transparent)
    if (isSelected || isCurrentSelection) {
      ctx.fillStyle = isCurrentSelection ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)';
      ctx.fillRect(selection.x, selection.y, selection.width, selection.height);
    }

    // Draw resize handles only for selected selection
    if (isSelected && !isCurrentSelection) {
      const handles = [
        { x: selection.x - HANDLE_SIZE/2, y: selection.y - HANDLE_SIZE/2 },
        { x: selection.x + selection.width - HANDLE_SIZE/2, y: selection.y - HANDLE_SIZE/2 },
        { x: selection.x - HANDLE_SIZE/2, y: selection.y + selection.height - HANDLE_SIZE/2 },
        { x: selection.x + selection.width - HANDLE_SIZE/2, y: selection.y + selection.height - HANDLE_SIZE/2 },
        { x: selection.x + selection.width/2 - HANDLE_SIZE/2, y: selection.y - HANDLE_SIZE/2 },
        { x: selection.x + selection.width/2 - HANDLE_SIZE/2, y: selection.y + selection.height - HANDLE_SIZE/2 },
        { x: selection.x - HANDLE_SIZE/2, y: selection.y + selection.height/2 - HANDLE_SIZE/2 },
        { x: selection.x + selection.width - HANDLE_SIZE/2, y: selection.y + selection.height/2 - HANDLE_SIZE/2 }
      ];

      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 1;

      handles.forEach(handle => {
        ctx.fillRect(handle.x, handle.y, HANDLE_SIZE, HANDLE_SIZE);
        ctx.strokeRect(handle.x, handle.y, HANDLE_SIZE, HANDLE_SIZE);
      });
    }

  }, [selections]);

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

    // Draw completed selections
    selections.forEach(selection => {
      const isSelected = selection.id === selectedSelectionId;
      drawSelection(ctx, selection, isSelected, false);
    });

    // Draw current selection being created
    if (currentSelection) {
      drawSelection(ctx, currentSelection, false, true);
    }
  }, [selections, selectedSelectionId, currentSelection, drawSelection]);

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

  // Update cursor based on mouse position
  const updateCursor = useCallback((point: { x: number; y: number }) => {
    if (disabled) {
      setCursor('not-allowed');
      return;
    }

    // Check if over a resize handle
    if (selectedSelectionId) {
      const selectedSelection = getSelectionById(selectedSelectionId);
      if (selectedSelection) {
        const handle = getResizeHandleAt(point, selectedSelection);
        if (handle) {
          setCursor(getCursorForHandle(handle));
          return;
        }
        // Check if over selected selection (for moving)
        if (isPointInRect(point, selectedSelection)) {
          setCursor('move');
          return;
        }
      }
    }

    // Check if over any selection
    for (const selection of selections) {
      if (isPointInRect(point, selection)) {
        setCursor('pointer');
        return;
      }
    }

    setCursor('crosshair');
  }, [disabled, selectedSelectionId, selections, getSelectionById, getResizeHandleAt, getCursorForHandle, isPointInRect]);

  // Mouse event handlers
  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    
    const position = getMousePosition(event);

    // Check for resize handle click
    if (selectedSelectionId) {
      const selectedSelection = getSelectionById(selectedSelectionId);
      if (selectedSelection) {
        const handle = getResizeHandleAt(position, selectedSelection);
        if (handle) {
          setIsResizing(true);
          setResizeHandle(handle);
          return;
        }

        // Check for selection move
        if (isPointInRect(position, selectedSelection)) {
          setIsDragging(true);
          setDragOffset({
            x: position.x - selectedSelection.x,
            y: position.y - selectedSelection.y
          });
          return;
        }
      }
    }

    // Check for selection click
    for (let i = selections.length - 1; i >= 0; i--) {
      const selection = selections[i];
      if (isPointInRect(position, selection)) {
        onSelectionSelect(selection.id);
        return;
      }
    }

    // Start new selection
    onSelectionStart(position);
  }, [disabled, getMousePosition, selectedSelectionId, selections, getSelectionById, getResizeHandleAt, isPointInRect, onSelectionSelect, onSelectionStart]);

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const position = getMousePosition(event);

    // Update cursor
    if (!isDragging && !isResizing) {
      updateCursor(position);
    }

    if (disabled) return;

    // Handle current selection creation
    if (currentSelection && !isDragging && !isResizing) {
      const width = position.x - currentSelection.x;
      const height = position.y - currentSelection.y;
      
      onSelectionUpdate({
        ...currentSelection,
        width: Math.abs(width),
        height: Math.abs(height),
        x: width < 0 ? position.x : currentSelection.x,
        y: height < 0 ? position.y : currentSelection.y
      });
      return;
    }

    // Handle selection dragging
    if (isDragging && selectedSelectionId && dragOffset) {
      const newX = position.x - dragOffset.x;
      const newY = position.y - dragOffset.y;
      onSelectionMove(selectedSelectionId, newX, newY);
      return;
    }

    // Handle selection resizing
    if (isResizing && selectedSelectionId && resizeHandle) {
      const selectedSelection = getSelectionById(selectedSelectionId);
      if (!selectedSelection) return;

      let { x, y, width, height } = selectedSelection;

      switch (resizeHandle) {
        case 'nw':
          width = width + (x - position.x);
          height = height + (y - position.y);
          x = position.x;
          y = position.y;
          break;
        case 'ne':
          width = position.x - x;
          height = height + (y - position.y);
          y = position.y;
          break;
        case 'sw':
          width = width + (x - position.x);
          height = position.y - y;
          x = position.x;
          break;
        case 'se':
          width = position.x - x;
          height = position.y - y;
          break;
        case 'n':
          height = height + (y - position.y);
          y = position.y;
          break;
        case 's':
          height = position.y - y;
          break;
        case 'w':
          width = width + (x - position.x);
          x = position.x;
          break;
        case 'e':
          width = position.x - x;
          break;
      }

      // Ensure minimum size
      if (width < SELECTION_MIN_SIZE) {
        if (resizeHandle.includes('w')) {
          x = selectedSelection.x + selectedSelection.width - SELECTION_MIN_SIZE;
        }
        width = SELECTION_MIN_SIZE;
      }
      if (height < SELECTION_MIN_SIZE) {
        if (resizeHandle.includes('n')) {
          y = selectedSelection.y + selectedSelection.height - SELECTION_MIN_SIZE;
        }
        height = SELECTION_MIN_SIZE;
      }

      onSelectionResize(selectedSelectionId, x, y, width, height);
    }
  }, [getMousePosition, updateCursor, disabled, currentSelection, isDragging, isResizing, selectedSelectionId, dragOffset, resizeHandle, onSelectionUpdate, onSelectionMove, getSelectionById, onSelectionResize]);

  const handleMouseUp = useCallback(() => {
    if (disabled) return;

    // Complete current selection
    if (currentSelection && !isDragging && !isResizing) {
      if (currentSelection.width > SELECTION_MIN_SIZE && currentSelection.height > SELECTION_MIN_SIZE) {
        onSelectionComplete(currentSelection);
      }
    }

    // Reset interaction state
    setIsDragging(false);
    setIsResizing(false);
    setDragOffset(null);
    setResizeHandle(null);
  }, [disabled, currentSelection, isDragging, isResizing, onSelectionComplete]);

  // Handle keyboard events for deletion
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (selectedSelectionId) {
          onSelectionDelete(selectedSelectionId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedSelectionId, onSelectionDelete]);

  return (
    <canvas
      ref={canvasRef}
      className={styles.canvas}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ 
        cursor,
        opacity: disabled ? 0.7 : 1
      }}
      tabIndex={0} // Enable keyboard events
    />
  );
}