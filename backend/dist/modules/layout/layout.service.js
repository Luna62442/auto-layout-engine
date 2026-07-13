"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LayoutService = void 0;
const handlebars_1 = __importDefault(require("handlebars"));
class LayoutService {
    constructor(templateService, analysisService) {
        this.templateService = templateService;
        this.analysisService = analysisService;
        this.PAGE_MARGIN_TOP = 3.5;
        this.PAGE_MARGIN_LEFT = 3.0;
    }
    generateLayout(assets, templateId = 'classic', options = {}) {
        try {
            const { title: userTitle, texts: userTexts = [] } = options;
            if (!assets || assets.length === 0) {
                return {
                    title: userTitle?.trim() || '我的纪念册',
                    coverImage: '',
                    pages: [],
                };
            }
            const filtered = this.analysisService.filterAssets(assets, 0);
            const sorted = this.analysisService.sortAssets(filtered);
            const cover = assets[0] || null;
            let rest = assets.slice(1);
            if (rest.length === 0 && cover) {
                rest = [cover];
            }
            const pageAssets = this.paginateAssets(rest, 4);
            const finalTitle = userTitle?.trim() || '我的纪念册';
            const validTexts = userTexts.filter(t => t.trim().length > 0);
            const layoutPages = pageAssets.map((pageGroup, index) => {
                const imageItems = pageGroup.map(a => ({
                    url: a.url || '',
                    aspect: (a.width && a.height) ? a.width / a.height : 1,
                    dominantColor: a.dominantColor || '#cccccc',
                }));
                const landscape = imageItems.filter(img => img.aspect >= 1).length;
                const portrait = imageItems.filter(img => img.aspect < 1).length;
                const total = imageItems.length;
                const layoutType = this.chooseLayoutType(total, landscape, portrait);
                const template = this.selectTemplate(layoutType);
                const placedImages = imageItems.map((img, idx) => {
                    const pos = (template && template[idx]) || { left: 0, top: 0, width: 100, height: 100 };
                    const left = this.PAGE_MARGIN_LEFT + pos.left * (100 - 2 * this.PAGE_MARGIN_LEFT) / 100;
                    const top = this.PAGE_MARGIN_TOP + pos.top * (100 - 2 * this.PAGE_MARGIN_TOP) / 100;
                    const width = pos.width * (100 - 2 * this.PAGE_MARGIN_LEFT) / 100;
                    const height = pos.height * (100 - 2 * this.PAGE_MARGIN_TOP) / 100;
                    return {
                        url: img.url,
                        aspect: img.aspect,
                        left,
                        top,
                        width,
                        height,
                    };
                });
                const colors = imageItems.map(img => img.dominantColor);
                const text = validTexts.length > 0 ? validTexts[index % validTexts.length] : '';
                return {
                    images: placedImages,
                    text,
                    colors,
                };
            });
            return {
                title: finalTitle,
                coverImage: cover ? cover.url : '',
                pages: layoutPages,
            };
        }
        catch (err) {
            console.error('❌ generateLayout error:', err);
            // 返回空布局，防止崩溃
            return {
                title: options.title?.trim() || '我的纪念册',
                coverImage: assets[0]?.url || '',
                pages: [],
            };
        }
    }
    paginateAssets(assets, maxPerPage = 4) {
        if (!assets || assets.length === 0)
            return [];
        const pages = [];
        for (let i = 0; i < assets.length; i += maxPerPage) {
            pages.push(assets.slice(i, i + maxPerPage));
        }
        return pages;
    }
    chooseLayoutType(total, landscape, portrait) {
        if (total === 1)
            return 'single';
        if (total === 2) {
            if (landscape === 2)
                return 'double-horizontal';
            if (portrait === 2)
                return 'double-vertical';
            return 'mix-two';
        }
        if (total === 3) {
            if (landscape === 3)
                return 'triple-horizontal';
            if (portrait === 3)
                return 'triple-vertical';
            if (landscape > portrait)
                return 'horizontal-focus-3';
            return 'vertical-focus-3';
        }
        if (total === 4) {
            if (landscape === 4)
                return 'all-horizontal';
            if (portrait === 4)
                return 'all-vertical';
            if (landscape > portrait)
                return 'horizontal-focus-4';
            if (portrait > landscape)
                return 'vertical-focus-4';
            return 'balanced';
        }
        return 'balanced';
    }
    selectTemplate(layoutType) {
        const templates = this.getTemplates();
        const list = templates[layoutType] || templates['balanced'] || [];
        if (list.length === 0) {
            return [{ left: 0, top: 0, width: 100, height: 100 }];
        }
        const idx = Math.floor(Math.random() * list.length);
        return list[idx];
    }
    getTemplates() {
        return {
            single: [
                [{ left: 0, top: 0, width: 100, height: 100 }],
            ],
            'double-horizontal': [
                [{ left: 0, top: 0, width: 100, height: 48 }, { left: 0, top: 52, width: 100, height: 48 }],
                [{ left: 0, top: 0, width: 100, height: 45 }, { left: 0, top: 55, width: 100, height: 45 }],
            ],
            'double-vertical': [
                [{ left: 0, top: 0, width: 48, height: 100 }, { left: 52, top: 0, width: 48, height: 100 }],
                [{ left: 0, top: 0, width: 45, height: 100 }, { left: 55, top: 0, width: 45, height: 100 }],
            ],
            'mix-two': [
                [{ left: 0, top: 0, width: 65, height: 100 }, { left: 68, top: 0, width: 32, height: 100 }],
                [{ left: 0, top: 0, width: 32, height: 100 }, { left: 35, top: 0, width: 65, height: 100 }],
            ],
            'triple-horizontal': [
                [{ left: 0, top: 0, width: 100, height: 30 }, { left: 0, top: 33, width: 100, height: 30 }, { left: 0, top: 66, width: 100, height: 34 }],
                [{ left: 0, top: 0, width: 100, height: 32 }, { left: 0, top: 35, width: 100, height: 30 }, { left: 0, top: 68, width: 100, height: 32 }],
            ],
            'triple-vertical': [
                [{ left: 0, top: 0, width: 30, height: 100 }, { left: 33, top: 0, width: 30, height: 100 }, { left: 66, top: 0, width: 34, height: 100 }],
                [{ left: 0, top: 0, width: 32, height: 100 }, { left: 35, top: 0, width: 30, height: 100 }, { left: 68, top: 0, width: 32, height: 100 }],
            ],
            'horizontal-focus-3': [
                [{ left: 0, top: 0, width: 65, height: 100 }, { left: 68, top: 0, width: 32, height: 48 }, { left: 68, top: 52, width: 32, height: 48 }],
                [{ left: 0, top: 0, width: 65, height: 100 }, { left: 68, top: 0, width: 32, height: 45 }, { left: 68, top: 55, width: 32, height: 45 }],
            ],
            'vertical-focus-3': [
                [{ left: 0, top: 0, width: 32, height: 48 }, { left: 0, top: 52, width: 32, height: 48 }, { left: 35, top: 0, width: 65, height: 100 }],
                [{ left: 0, top: 0, width: 32, height: 45 }, { left: 0, top: 55, width: 32, height: 45 }, { left: 35, top: 0, width: 65, height: 100 }],
            ],
            'all-horizontal': [
                [{ left: 0, top: 0, width: 100, height: 23 }, { left: 0, top: 25, width: 100, height: 23 }, { left: 0, top: 50, width: 100, height: 23 }, { left: 0, top: 75, width: 100, height: 25 }],
                [{ left: 0, top: 0, width: 100, height: 22 }, { left: 0, top: 24, width: 100, height: 24 }, { left: 0, top: 50, width: 100, height: 24 }, { left: 0, top: 76, width: 100, height: 24 }],
            ],
            'all-vertical': [
                [{ left: 0, top: 0, width: 23, height: 100 }, { left: 25, top: 0, width: 23, height: 100 }, { left: 50, top: 0, width: 23, height: 100 }, { left: 75, top: 0, width: 25, height: 100 }],
                [{ left: 0, top: 0, width: 22, height: 100 }, { left: 24, top: 0, width: 24, height: 100 }, { left: 50, top: 0, width: 24, height: 100 }, { left: 76, top: 0, width: 24, height: 100 }],
            ],
            'horizontal-focus-4': [
                [{ left: 0, top: 0, width: 65, height: 100 }, { left: 68, top: 0, width: 32, height: 32 }, { left: 68, top: 34, width: 32, height: 32 }, { left: 68, top: 68, width: 32, height: 32 }],
                [{ left: 0, top: 0, width: 65, height: 100 }, { left: 68, top: 0, width: 32, height: 30 }, { left: 68, top: 32, width: 32, height: 30 }, { left: 68, top: 64, width: 32, height: 36 }],
                [{ left: 0, top: 0, width: 70, height: 48 }, { left: 73, top: 0, width: 27, height: 48 }, { left: 0, top: 52, width: 70, height: 48 }, { left: 73, top: 52, width: 27, height: 48 }],
            ],
            'vertical-focus-4': [
                [{ left: 0, top: 0, width: 32, height: 32 }, { left: 0, top: 34, width: 32, height: 32 }, { left: 0, top: 68, width: 32, height: 32 }, { left: 35, top: 0, width: 65, height: 100 }],
                [{ left: 0, top: 0, width: 32, height: 30 }, { left: 0, top: 32, width: 32, height: 30 }, { left: 0, top: 64, width: 32, height: 36 }, { left: 35, top: 0, width: 65, height: 100 }],
                [{ left: 0, top: 0, width: 27, height: 48 }, { left: 30, top: 0, width: 27, height: 48 }, { left: 0, top: 52, width: 27, height: 48 }, { left: 30, top: 52, width: 70, height: 48 }],
            ],
            'balanced': [
                [{ left: 0, top: 0, width: 48, height: 48 }, { left: 52, top: 0, width: 48, height: 48 }, { left: 0, top: 52, width: 48, height: 48 }, { left: 52, top: 52, width: 48, height: 48 }],
                [{ left: 0, top: 0, width: 65, height: 48 }, { left: 68, top: 0, width: 32, height: 48 }, { left: 0, top: 52, width: 32, height: 48 }, { left: 35, top: 52, width: 65, height: 48 }],
                [{ left: 0, top: 0, width: 32, height: 48 }, { left: 35, top: 0, width: 65, height: 48 }, { left: 0, top: 52, width: 48, height: 48 }, { left: 52, top: 52, width: 48, height: 48 }],
                [{ left: 0, top: 0, width: 48, height: 65 }, { left: 52, top: 0, width: 48, height: 32 }, { left: 0, top: 68, width: 48, height: 32 }, { left: 52, top: 35, width: 48, height: 65 }],
                [{ left: 0, top: 0, width: 48, height: 32 }, { left: 52, top: 0, width: 48, height: 65 }, { left: 0, top: 35, width: 48, height: 65 }, { left: 52, top: 68, width: 48, height: 32 }],
            ],
        };
    }
    generateBackgroundStyle(colors) {
        if (!colors || colors.length === 0)
            return 'background: #f0f0f0;';
        if (colors.length === 1)
            return `background: ${colors[0]};`;
        const used = colors.slice(0, 3);
        return `background: linear-gradient(135deg, ${used.join(', ')});`;
    }
    renderHtml(layoutData, templateId, baseUrl) {
        try {
            const template = this.templateService.getTemplate(templateId);
            if (!template)
                throw new Error(`Template "${templateId}" not found`);
            const toAbsolute = (url) => {
                try {
                    return new URL(url, baseUrl).href;
                }
                catch {
                    return url;
                }
            };
            const coverImageUrl = layoutData.coverImage ? toAbsolute(layoutData.coverImage) : '';
            const coverTemplate = handlebars_1.default.compile(template.coverHtml);
            const pageTemplate = handlebars_1.default.compile(template.pageHtml);
            const coverHtml = coverTemplate({
                coverImage: coverImageUrl,
                title: layoutData.title || '纪念册',
            });
            const pagesHtml = layoutData.pages.map(page => {
                const imageItems = page.images.map(img => ({
                    url: toAbsolute(img.url),
                    aspect: img.aspect,
                    left: img.left,
                    top: img.top,
                    width: img.width,
                    height: img.height,
                }));
                const bgStyle = this.generateBackgroundStyle(page.colors || ['#f0f0f0']);
                return pageTemplate({
                    images: imageItems,
                    text: page.text || '',
                    bgStyle,
                });
            }).join('');
            return `
        <!DOCTYPE html>
        <html>
          <head><meta charset="UTF-8"><title>${layoutData.title || '纪念册'}</title>
          <style>${template.styles}</style></head>
          <body>${coverHtml}${pagesHtml}</body>
        </html>
      `;
        }
        catch (err) {
            console.error('❌ renderHtml error:', err);
            // 返回简易HTML，防止崩溃
            return `<!DOCTYPE html><html><head><title>Error</title></head><body><h1>渲染失败</h1></body></html>`;
        }
    }
}
exports.LayoutService = LayoutService;
