import { AssetMetadata } from '../asset/asset.types';

export interface AnalysisResult {
  sortedAssets: AssetMetadata[];
  filteredAssets: AssetMetadata[];
  cover: AssetMetadata | null;
  copy: string;
  paginated: AssetMetadata[][];
}