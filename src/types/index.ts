// Core Types
export interface Selection {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  selected?: boolean;
}

export interface Asset {
  name: string;
  url: string;
  blob: Blob;
  id: string;
}

export interface AppState {
  image: string | null;
  selections: Selection[];
  assets: Asset[];
  loading: boolean;
  progress: number;
  error: string | null;
}

export interface CanvasState {
  isSelecting: boolean;
  isDragging: boolean;
  isResizing: boolean;
  startPoint: { x: number; y: number } | null;
  currentSelection: Selection | null;
  selectedSelectionId: string | null;
  dragOffset: { x: number; y: number } | null;
  resizeHandle: string | null; // 'nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'
}

// API Types
export interface ApiError {
  error: string;
}

// Component Props Types
export interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  disabled?: boolean;
}

export interface SelectionCanvasProps {
  image: string;
  selections: Selection[];
  currentSelection: Selection | null;
  selectedSelectionId: string | null;
  onSelectionStart: (point: { x: number; y: number }) => void;
  onSelectionUpdate: (selection: Selection) => void;
  onSelectionComplete: (selection: Selection) => void;
  onSelectionSelect: (id: string) => void;
  onSelectionMove: (id: string, x: number, y: number) => void;
  onSelectionResize: (id: string, x: number, y: number, width: number, height: number) => void;
  onSelectionDelete: (id: string) => void;
  disabled?: boolean;
}

export interface AssetGridProps {
  assets: Asset[];
  onDownload: (asset: Asset) => void;
  onDownloadAll: () => void;
}