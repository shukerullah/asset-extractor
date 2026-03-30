"use client";

import { ImageProcessor } from "@/services/imageProcessor";
import type { Selection, SelectionCanvasProps } from "@/types";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import styles from "./Canvas.module.css";

const HANDLE_SIZE = 8;
const SELECTION_MIN_SIZE = 20;

const Canvas = forwardRef<HTMLCanvasElement, SelectionCanvasProps>(
  (
    {
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
      disabled = false,
    },
    ref
  ) => {
    const internalRef = useRef<HTMLCanvasElement>(null);
    const canvasRef =
      (ref as React.RefObject<HTMLCanvasElement>) || internalRef;
    const imageRef = useRef<HTMLImageElement | null>(null);

    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragOffset, setDragOffset] = useState<{
      x: number;
      y: number;
    } | null>(null);
    const [resizeHandle, setResizeHandle] = useState<string | null>(null);
    const [cursor, setCursor] = useState("crosshair");

    // ── Helpers ────────────────────────────────────────────────────────────

    const getSelectionById = useCallback(
      (id: string): Selection | null =>
        selections.find((s) => s.id === id) || null,
      [selections]
    );

    const isPointInRect = useCallback(
      (point: { x: number; y: number }, rect: Selection): boolean =>
        point.x >= rect.x &&
        point.x <= rect.x + rect.width &&
        point.y >= rect.y &&
        point.y <= rect.y + rect.height,
      []
    );

    const getResizeHandleAt = useCallback(
      (
        point: { x: number; y: number },
        selection: Selection
      ): string | null => {
        const handles = [
          { name: "nw", x: selection.x, y: selection.y },
          { name: "ne", x: selection.x + selection.width, y: selection.y },
          {
            name: "sw",
            x: selection.x,
            y: selection.y + selection.height,
          },
          {
            name: "se",
            x: selection.x + selection.width,
            y: selection.y + selection.height,
          },
          {
            name: "n",
            x: selection.x + selection.width / 2,
            y: selection.y,
          },
          {
            name: "s",
            x: selection.x + selection.width / 2,
            y: selection.y + selection.height,
          },
          {
            name: "w",
            x: selection.x,
            y: selection.y + selection.height / 2,
          },
          {
            name: "e",
            x: selection.x + selection.width,
            y: selection.y + selection.height / 2,
          },
        ];

        const hs = HANDLE_SIZE / 2;
        for (const h of handles) {
          if (
            point.x >= h.x - hs &&
            point.x <= h.x + hs &&
            point.y >= h.y - hs &&
            point.y <= h.y + hs
          ) {
            return h.name;
          }
        }
        return null;
      },
      []
    );

    const cursorForHandle = useCallback((handle: string): string => {
      const map: Record<string, string> = {
        nw: "nwse-resize",
        se: "nwse-resize",
        ne: "nesw-resize",
        sw: "nesw-resize",
        n: "ns-resize",
        s: "ns-resize",
        e: "ew-resize",
        w: "ew-resize",
      };
      return map[handle] || "crosshair";
    }, []);

    const updateCursor = useCallback(
      (position: { x: number; y: number }) => {
        if (selectedSelectionId) {
          const sel = getSelectionById(selectedSelectionId);
          if (sel) {
            const handle = getResizeHandleAt(position, sel);
            if (handle) {
              setCursor(cursorForHandle(handle));
              return;
            }
            if (isPointInRect(position, sel)) {
              setCursor("move");
              return;
            }
          }
        }
        for (let i = selections.length - 1; i >= 0; i--) {
          if (isPointInRect(position, selections[i])) {
            setCursor("pointer");
            return;
          }
        }
        setCursor("crosshair");
      },
      [
        selectedSelectionId,
        selections,
        getSelectionById,
        getResizeHandleAt,
        cursorForHandle,
        isPointInRect,
      ]
    );

    // ── Drawing ────────────────────────────────────────────────────────────

    const drawSelection = useCallback(
      (
        ctx: CanvasRenderingContext2D,
        selection: Selection,
        isSelected: boolean,
        isCurrent: boolean
      ) => {
        ctx.strokeStyle = isCurrent
          ? "#ef4444"
          : isSelected
          ? "#3b82f6"
          : "#6b7280";
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.setLineDash(isCurrent ? [5, 5] : []);
        ctx.strokeRect(selection.x, selection.y, selection.width, selection.height);
        ctx.setLineDash([]);

        if (isSelected || isCurrent) {
          ctx.fillStyle = isCurrent
            ? "rgba(239, 68, 68, 0.1)"
            : "rgba(59, 130, 246, 0.1)";
          ctx.fillRect(selection.x, selection.y, selection.width, selection.height);
        }

        if (isSelected && !isCurrent) {
          const handles = [
            { x: selection.x, y: selection.y },
            { x: selection.x + selection.width, y: selection.y },
            { x: selection.x, y: selection.y + selection.height },
            { x: selection.x + selection.width, y: selection.y + selection.height },
            { x: selection.x + selection.width / 2, y: selection.y },
            { x: selection.x + selection.width / 2, y: selection.y + selection.height },
            { x: selection.x, y: selection.y + selection.height / 2 },
            { x: selection.x + selection.width, y: selection.y + selection.height / 2 },
          ];

          ctx.fillStyle = "#ffffff";
          ctx.strokeStyle = "#3b82f6";
          ctx.lineWidth = 1;
          const hs = HANDLE_SIZE;
          for (const h of handles) {
            ctx.fillRect(h.x - hs / 2, h.y - hs / 2, hs, hs);
            ctx.strokeRect(h.x - hs / 2, h.y - hs / 2, hs, hs);
          }
        }
      },
      []
    );

    const drawCanvas = useCallback(() => {
      const canvas = canvasRef.current;
      const img = imageRef.current;
      if (!canvas || !img) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const size = ImageProcessor.calculateCanvasSize(img.width, img.height);
      canvas.width = size.width;
      canvas.height = size.height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      selections.forEach((s) =>
        drawSelection(ctx, s, s.id === selectedSelectionId, false)
      );

      if (currentSelection) {
        drawSelection(ctx, currentSelection, false, true);
      }
    }, [selections, selectedSelectionId, currentSelection, drawSelection, canvasRef]);

    // ── Image loading & redraw ─────────────────────────────────────────────

    useEffect(() => {
      if (!image) return;
      const load = async () => {
        const img = await ImageProcessor.loadImageElement(image);
        imageRef.current = img;
        drawCanvas();
      };
      load();
    }, [image, drawCanvas]);

    useEffect(() => {
      drawCanvas();
    }, [drawCanvas]);

    // ── Pointer position ───────────────────────────────────────────────────

    const getPointerPosition = useCallback(
      (
        event:
          | React.MouseEvent<HTMLCanvasElement>
          | React.TouchEvent<HTMLCanvasElement>
      ) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const clientX =
          "touches" in event ? event.touches[0]?.clientX ?? 0 : event.clientX;
        const clientY =
          "touches" in event ? event.touches[0]?.clientY ?? 0 : event.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
      },
      [canvasRef]
    );

    // ── Pointer handlers ───────────────────────────────────────────────────

    const handlePointerDown = useCallback(
      (
        event:
          | React.MouseEvent<HTMLCanvasElement>
          | React.TouchEvent<HTMLCanvasElement>
      ) => {
        if (disabled) return;
        const position = getPointerPosition(event);

        if (selectedSelectionId) {
          const sel = getSelectionById(selectedSelectionId);
          if (sel) {
            const handle = getResizeHandleAt(position, sel);
            if (handle) {
              setIsResizing(true);
              setResizeHandle(handle);
              return;
            }
            if (isPointInRect(position, sel)) {
              setIsDragging(true);
              setDragOffset({ x: position.x - sel.x, y: position.y - sel.y });
              return;
            }
          }
        }

        for (let i = selections.length - 1; i >= 0; i--) {
          if (isPointInRect(position, selections[i])) {
            onSelectionSelect(selections[i].id);
            return;
          }
        }

        onSelectionStart(position);
      },
      [
        disabled,
        getPointerPosition,
        selectedSelectionId,
        selections,
        getSelectionById,
        getResizeHandleAt,
        isPointInRect,
        onSelectionSelect,
        onSelectionStart,
      ]
    );

    const handlePointerMove = useCallback(
      (
        event:
          | React.MouseEvent<HTMLCanvasElement>
          | React.TouchEvent<HTMLCanvasElement>
      ) => {
        const position = getPointerPosition(event);

        if (!("touches" in event) && !isDragging && !isResizing) {
          updateCursor(position);
        }

        if (disabled) return;

        // Creating a new selection
        if (currentSelection && !isDragging && !isResizing) {
          const width = position.x - currentSelection.x;
          const height = position.y - currentSelection.y;
          onSelectionUpdate({
            ...currentSelection,
            width: Math.abs(width),
            height: Math.abs(height),
            x: width < 0 ? position.x : currentSelection.x,
            y: height < 0 ? position.y : currentSelection.y,
          });
        }

        // Moving
        if (isDragging && selectedSelectionId && dragOffset) {
          onSelectionMove(
            selectedSelectionId,
            position.x - dragOffset.x,
            position.y - dragOffset.y
          );
        }

        // Resizing
        if (isResizing && selectedSelectionId && resizeHandle) {
          const sel = getSelectionById(selectedSelectionId);
          if (!sel) return;

          let { x, y, width, height } = sel;

          for (const dir of resizeHandle) {
            switch (dir) {
              case "n":
                height = height + (y - position.y);
                y = position.y;
                break;
              case "s":
                height = position.y - y;
                break;
              case "w":
                width = width + (x - position.x);
                x = position.x;
                break;
              case "e":
                width = position.x - x;
                break;
            }
          }

          if (width < SELECTION_MIN_SIZE) {
            if (resizeHandle.includes("w"))
              x = sel.x + sel.width - SELECTION_MIN_SIZE;
            width = SELECTION_MIN_SIZE;
          }
          if (height < SELECTION_MIN_SIZE) {
            if (resizeHandle.includes("n"))
              y = sel.y + sel.height - SELECTION_MIN_SIZE;
            height = SELECTION_MIN_SIZE;
          }

          onSelectionResize(selectedSelectionId, x, y, width, height);
        }
      },
      [
        getPointerPosition,
        updateCursor,
        disabled,
        currentSelection,
        isDragging,
        isResizing,
        selectedSelectionId,
        dragOffset,
        resizeHandle,
        onSelectionUpdate,
        onSelectionMove,
        getSelectionById,
        onSelectionResize,
      ]
    );

    const handlePointerUp = useCallback(() => {
      if (disabled) return;

      if (currentSelection && !isDragging && !isResizing) {
        if (
          currentSelection.width > SELECTION_MIN_SIZE &&
          currentSelection.height > SELECTION_MIN_SIZE
        ) {
          onSelectionComplete(currentSelection);
        }
      }

      setIsDragging(false);
      setIsResizing(false);
      setDragOffset(null);
      setResizeHandle(null);
    }, [disabled, currentSelection, isDragging, isResizing, onSelectionComplete]);

    // ── Keyboard ───────────────────────────────────────────────────────────

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.key === "Delete" || e.key === "Backspace") && selectedSelectionId) {
          onSelectionDelete(selectedSelectionId);
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedSelectionId, onSelectionDelete]);

    // ── Render ─────────────────────────────────────────────────────────────

    return (
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
        style={{
          cursor,
          opacity: disabled ? 0.7 : 1,
          touchAction: "none",
        }}
        tabIndex={0}
      />
    );
  }
);

Canvas.displayName = "Canvas";
export default Canvas;
