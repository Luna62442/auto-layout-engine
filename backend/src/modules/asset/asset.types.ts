export interface AssetMetadata {
  id: string;
  url: string;
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape' | 'square';
  score: number;
  peopleCount: number;
  faceScore: number;
  tags: string[];
  createdAt: Date;
  dominantColor: string;
}

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}