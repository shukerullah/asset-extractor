import { RefObject } from "react";
import type { AppState, CanvasState, Selection } from "@/types";
import Canvas from "./Canvas";
import styles from "./CanvasSection.module.css";

interface CanvasSectionProps {
  appState: AppState;
  canvasState: CanvasState;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  maxSelections: number | null;
  onSelectionStart: (point: { x: number; y: number }) => void;
  onSelectionUpdate: (selection: Selection) => void;
  onSelectionComplete: (selection: Selection) => void;
  onSelectionSelect: (id: string) => void;
  onSelectionMove: (id: string, x: number, y: number) => void;
  onSelectionResize: (id: string, x: number, y: number, width: number, height: number) => void;
  onSelectionDelete: (id: string) => void;
  onClearSelections: () => void;
  onGenerateAssets: () => void;
}

export default function CanvasSection({
  appState,
  canvasState,
  canvasRef,
  maxSelections,
  onSelectionStart,
  onSelectionUpdate,
  onSelectionComplete,
  onSelectionSelect,
  onSelectionMove,
  onSelectionResize,
  onSelectionDelete,
  onClearSelections,
  onGenerateAssets,
}: CanvasSectionProps) {
  const isSelectionLimitReached = maxSelections !== null && appState.selections.length >= maxSelections;

  return (
    <section className={styles.workspaceSection} aria-labelledby="workspace">
      <h3 id="workspace" className="sr-only">Image Selection Workspace</h3>
      
      <div className={styles.instructionsPanel}>
        <h4>📝 Instructions:</h4>
        <p>
          • <strong>Create:</strong> Click and drag to create rectangular
          selections
        </p>
        <p>
          • <strong>Select:</strong> Click on any selection to select it
        </p>
        <p>
          • <strong>Move:</strong> Drag selected selection to move it
        </p>
        <p>
          • <strong>Resize:</strong> Drag the corner/edge handles to
          resize
        </p>
        <p>
          • <strong>Delete:</strong> Press Delete/Backspace key to remove
          selected
        </p>
      </div>

      <div className={styles.canvasContainer}>
        <Canvas
        ref={canvasRef}
        image={appState.image!}
        selections={appState.selections}
        currentSelection={canvasState.currentSelection}
        selectedSelectionId={canvasState.selectedSelectionId}
        onSelectionStart={onSelectionStart}
        onSelectionUpdate={onSelectionUpdate}
        onSelectionComplete={onSelectionComplete}
        onSelectionSelect={onSelectionSelect}
        onSelectionMove={onSelectionMove}
        onSelectionResize={onSelectionResize}
        onSelectionDelete={onSelectionDelete}
        disabled={appState.loading}
      />
        
        {/* Selection Limit Overlay Warning */}
        {isSelectionLimitReached && (
          <div className={styles.limitOverlay}>
            <div className={styles.limitOverlayContent}>
              ⚠️ Selection limit reached
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className={styles.controlsGroup}>
        <button
          onClick={onClearSelections}
          disabled={appState.loading || appState.selections.length === 0}
          className={styles.buttonSecondary}
        >
          Clear All
        </button>

        <button
          onClick={onGenerateAssets}
          disabled={appState.loading || appState.selections.length === 0}
          className={styles.buttonPrimary}
        >
          {appState.loading ? "Processing..." : "Generate Assets"}
        </button>
      </div>
    </section>
  );
}