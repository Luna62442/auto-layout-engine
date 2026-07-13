export interface PlacedImage {
  url: string;
  aspect: number;          // 原始宽高比
  left: number;            // 百分比 (0-100)
  top: number;             // 百分比 (0-100)
  width: number;           // 百分比 (0-100)
  height: number;          // 百分比 (0-100)
}

export interface LayoutPage {
  images: PlacedImage[];
  text?: string;
  colors: string[];
}

export interface LayoutData {
  title: string;
  coverImage: string;
  pages: LayoutPage[];
}