import { RefObject } from "react";
import type { CanvasState, Selection } from "@/types";
import Canvas from "@/components/Canvas/Canvas";
import styles from "./CanvasSection.module.css";

interface CanvasSectionProps {
  image: string;
  selections: Selection[];
  canvasState: CanvasState;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  maxSelections: number | null;
  loading: boolean;
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
  image,
  selections,
  canvasState,
  canvasRef,
  maxSelections,
  loading,
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
  const isLimitReached =
    maxSelections !== null && selections.length >= maxSelections;

  return (
    <section className={styles.workspaceSection} aria-labelledby="workspace">
      <h3 id="workspace" className="sr-only">
        Image Selection Workspace
      </h3>

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
          • <strong>Resize:</strong> Drag the corner/edge handles to resize
        </p>
        <p>
          • <strong>Delete:</strong> Press Delete/Backspace key to remove
          selected
        </p>
      </div>

      <div className={styles.canvasContainer}>
        <Canvas
          ref={canvasRef}
          image={image}
          selections={selections}
          currentSelection={canvasState.currentSelection}
          selectedSelectionId={canvasState.selectedSelectionId}
          onSelectionStart={onSelectionStart}
          onSelectionUpdate={onSelectionUpdate}
          onSelectionComplete={onSelectionComplete}
          onSelectionSelect={onSelectionSelect}
          onSelectionMove={onSelectionMove}
          onSelectionResize={onSelectionResize}
          onSelectionDelete={onSelectionDelete}
          disabled={loading}
        />

        {isLimitReached && (
          <div className={styles.limitOverlay}>
            <div className={styles.limitOverlayContent}>
              ⚠️ Selection limit reached
            </div>
          </div>
        )}
      </div>

      <div className={styles.controlsGroup}>
        <button
          onClick={onClearSelections}
          disabled={loading || selections.length === 0}
          className={styles.buttonSecondary}
        >
          Clear All
        </button>

        <button
          onClick={onGenerateAssets}
          disabled={loading || selections.length === 0}
          className={styles.buttonPrimary}
        >
          {loading ? "Processing..." : "Generate Assets"}
        </button>
      </div>
    </section>
  );
}
