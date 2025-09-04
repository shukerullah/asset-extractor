// Core Types
export interface Selection {
  x: number;
  y: number;
  radius: number;
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
  startPoint: { x: number; y: number } | null;
  currentSelection: Selection | null;
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
  onSelectionStart: (point: { x: number; y: number }) => void;
  onSelectionUpdate: (selection: Selection) => void;
  onSelectionComplete: (selection: Selection) => void;
  disabled?: boolean;
}

export interface AssetGridProps {
  assets: Asset[];
  onDownload: (asset: Asset) => void;
  onDownloadAll: () => void;
}