"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalysisService = void 0;
class AnalysisService {
    sortAssets(assets) {
        return [...assets].sort((a, b) => b.score - a.score || b.peopleCount - a.peopleCount);
    }
    filterAssets(assets, minScore = 0.7) {
        return assets.filter(a => a.score >= minScore);
    }
    recommendCover(assets) {
        return assets.length > 0 ? assets[0] : null;
    }
    generateCopy(keywords = []) {
        const templates = ['青春不会散场，愿未来皆坦途。', '每一段旅程，都值得被铭记。', '时光荏苒，影像永恒。'];
        return templates[Math.floor(Math.random() * templates.length)];
    }
    paginateAssets(assets, perPage = 3) {
        const pages = [];
        for (let i = 0; i < assets.length; i += perPage) {
            pages.push(assets.slice(i, i + perPage));
        }
        return pages;
    }
}
exports.AnalysisService = AnalysisService;
