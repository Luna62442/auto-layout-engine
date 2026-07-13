import { AssetMetadata } from '../asset/asset.types';

export class AnalysisService {
  sortAssets(assets: AssetMetadata[]): AssetMetadata[] {
    return [...assets].sort((a, b) => b.score - a.score || b.peopleCount - a.peopleCount);
  }
  filterAssets(assets: AssetMetadata[], minScore = 0.7): AssetMetadata[] {
    return assets.filter(a => a.score >= minScore);
  }
  recommendCover(assets: AssetMetadata[]): AssetMetadata | null {
    return assets.length > 0 ? assets[0] : null;
  }
  generateCopy(keywords: string[] = []): string {
    const templates = ['青春不会散场，愿未来皆坦途。', '每一段旅程，都值得被铭记。', '时光荏苒，影像永恒。'];
    return templates[Math.floor(Math.random() * templates.length)];
  }
  paginateAssets(assets: AssetMetadata[], perPage = 3): AssetMetadata[][] {
    const pages = [];
    for (let i = 0; i < assets.length; i += perPage) {
      pages.push(assets.slice(i, i + perPage));
    }
    return pages;
  }
}