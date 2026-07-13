export interface AnalysisResult {
  sortedAssets: AssetMetadata[];
  filteredAssets: AssetMetadata[];
  cover: AssetMetadata | null;
  copy: string;
  paginated: AssetMetadata[][];
}