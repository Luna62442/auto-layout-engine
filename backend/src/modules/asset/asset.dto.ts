export class UploadAssetDto {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
}

export interface AssetMetadata {
  id: string;
  url: string;
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape' | 'square';
  score: number;           // 清晰度等综合评分
  peopleCount: number;
  faceScore: number;       // 表情评分
  tags: string[];
  createdAt: Date;
}