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
  dominantColor: string; // 新增：十六进制主色
}

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
  dominantColor: string;  // 新增
}