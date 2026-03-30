import { useCallback, useRef, useState } from "react";
import type { Selection, CanvasState } from "@/types";

const INITIAL_CANVAS_STATE: CanvasState = {
  isSelecting: false,
  isDragging: false,
  isResizing: false,
  startPoint: null,
  currentSelection: null,
  selectedSelectionId: null,
  dragOffset: null,
  resizeHandle: null,
};

export function useSelections(maxSelections: number | null) {
  const [selections, setSelections] = useState<Selection[]>([]);
  const [canvasState, setCanvasState] = useState<CanvasState>(INITIAL_CANVAS_STATE);
  const counter = useRef(1);

  const isLimitReached =
    maxSelections !== null && selections.length >= maxSelections;

  const start = useCallback(
    (point: { x: number; y: number }) => {
      if (isLimitReached) return;

      setCanvasState({
        isSelecting: true,
        isDragging: false,
        isResizing: false,
        startPoint: point,
        currentSelection: {
          id: `selection_${counter.current}`,
          x: point.x,
          y: point.y,
          width: 0,
          height: 0,
        },
        selectedSelectionId: null,
        dragOffset: null,
        resizeHandle: null,
      });
    },
    [isLimitReached]
  );

  const update = useCallback((selection: Selection) => {
    setCanvasState((prev) => ({ ...prev, currentSelection: selection }));
  }, []);

  const complete = useCallback((selection: Selection) => {
    if (selection.width > 20 && selection.height > 20) {
      setSelections((prev) => [...prev, selection]);
      setCanvasState((prev) => ({
        ...prev,
        selectedSelectionId: selection.id,
        isSelecting: false,
        startPoint: null,
        currentSelection: null,
      }));
      counter.current++;
    } else {
      setCanvasState((prev) => ({
        ...prev,
        isSelecting: false,
        startPoint: null,
        currentSelection: null,
      }));
    }
  }, []);

  const select = useCallback((id: string) => {
    setCanvasState((prev) => ({ ...prev, selectedSelectionId: id }));
  }, []);

  const move = useCallback((id: string, x: number, y: number) => {
    setSelections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, x, y } : s))
    );
  }, []);

  const resize = useCallback(
    (id: string, x: number, y: number, width: number, height: number) => {
      setSelections((prev) =>
        prev.map((s) => (s.id === id ? { ...s, x, y, width, height } : s))
      );
    },
    []
  );

  const remove = useCallback((id: string) => {
    setSelections((prev) => prev.filter((s) => s.id !== id));
    setCanvasState((prev) => ({
      ...prev,
      selectedSelectionId:
        prev.selectedSelectionId === id ? null : prev.selectedSelectionId,
    }));
  }, []);

  const clearAll = useCallback(() => {
    setSelections([]);
    setCanvasState((prev) => ({ ...prev, selectedSelectionId: null }));
  }, []);

  return {
    selections,
    canvasState,
    isLimitReached,
    start,
    update,
    complete,
    select,
    move,
    resize,
    remove,
    clearAll,
  };
}
