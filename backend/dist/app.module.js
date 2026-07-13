"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const dotenv_1 = __importDefault(require("dotenv"));
const asset_service_1 = require("./modules/asset/asset.service");
const analysis_service_1 = require("./modules/analysis/analysis.service");
const template_service_1 = require("./modules/template/template.service");
const layout_service_1 = require("./modules/layout/layout.service");
const export_service_1 = require("./modules/export/export.service");
dotenv_1.default.config();
// 实例化服务（单例）
const assetService = new asset_service_1.AssetService();
const analysisService = new analysis_service_1.AnalysisService();
const templateService = new template_service_1.TemplateService();
const layoutService = new layout_service_1.LayoutService(templateService, analysisService);
const exportService = new export_service_1.ExportService();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
if (!fs_1.default.existsSync(UPLOAD_DIR)) {
    fs_1.default.mkdirSync(UPLOAD_DIR, { recursive: true });
}
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express_1.default.static(path_1.default.resolve(UPLOAD_DIR)));
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 },
});
// ========== 路由 ==========
app.post('/api/upload', upload.array('photos', 100), async (req, res) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }
        console.log(`📸 Upload received: ${files.length} files`);
        const assets = await Promise.all(files.map(file => assetService.upload(file)));
        console.log(`✅ Saved ${assets.length} assets`);
        res.json({ success: true, assets });
    }
    catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ error: err.message, stack: err.stack });
    }
});
app.post('/api/preview', async (req, res) => {
    try {
        const { templateId = 'classic', title, texts } = req.body;
        const allAssets = assetService.getAll();
        if (allAssets.length === 0) {
            return res.status(400).json({ error: 'No assets uploaded yet' });
        }
        console.log(`📄 Preview called, assets count: ${allAssets.length}`);
        const layoutData = layoutService.generateLayout(allAssets, templateId, {
            title: title || undefined,
            texts: texts || [],
        });
        const baseUrl = `http://localhost:${PORT}`;
        const html = layoutService.renderHtml(layoutData, templateId, baseUrl);
        res.json({ html });
    }
    catch (err) {
        console.error('Preview error:', err);
        res.status(500).json({ error: err.message, stack: err.stack });
    }
});
app.post('/api/generate', upload.array('photos', 100), async (req, res) => {
    try {
        const files = req.files;
        const { title = '', texts = '[]' } = req.body;
        let textsArray = [];
        if (typeof texts === 'string') {
            try {
                const parsed = JSON.parse(texts);
                if (Array.isArray(parsed))
                    textsArray = parsed;
            }
            catch {
                textsArray = texts.split('\n').filter(t => t.trim());
            }
        }
        if (!files || files.length === 0) {
            return res.status(400).json({ error: 'No images uploaded' });
        }
        console.log(`📸 Generate received ${files.length} images`);
        const assets = await Promise.all(files.map(file => assetService.upload(file)));
        console.log(`✅ Saved ${assets.length} assets`);
        const layoutData = layoutService.generateLayout(assets, 'classic', {
            title: title || undefined,
            texts: textsArray,
        });
        const baseUrl = `http://localhost:${PORT}`;
        const html = layoutService.renderHtml(layoutData, 'classic', baseUrl);
        res.json({ html });
    }
    catch (err) {
        console.error('Generate error:', err);
        res.status(500).json({ error: err.message, stack: err.stack });
    }
});
app.post('/api/export', async (req, res) => {
    try {
        const { html } = req.body;
        if (!html) {
            return res.status(400).json({ error: 'Missing HTML content' });
        }
        console.log('📄 Exporting PDF...');
        const pdfBuffer = await exportService.exportPdf(html);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="album.pdf"');
        res.send(pdfBuffer);
    }
    catch (err) {
        console.error('Export error:', err);
        res.status(500).json({ error: err.message, stack: err.stack });
    }
});
app.delete('/api/assets', async (req, res) => {
    try {
        await assetService.clearAll();
        console.log('🧹 All assets cleared');
        res.json({ success: true, message: 'All assets cleared' });
    }
    catch (err) {
        console.error('Clear error:', err);
        res.status(500).json({ error: err.message });
    }
});
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
exports.default = app;
