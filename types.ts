export interface GeneratedImage {
  imageUrl: string;
  prompt: string;
  timestamp: number;
}

export interface ImageState {
  file: File | null;
  previewUrl: string | null;
  base64Data: string | null; // Raw base64 string without mime prefix
  mimeType: string;
}

export enum LoadingState {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  GENERATING = 'GENERATING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface ApiError {
  message: string;
  details?: string;
}