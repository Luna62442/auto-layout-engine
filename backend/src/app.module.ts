import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

import { AssetService } from './modules/asset/asset.service';
import { AnalysisService } from './modules/analysis/analysis.service';
import { TemplateService } from './modules/template/template.service';
import { LayoutService } from './modules/layout/layout.service';
import { ExportService } from './modules/export/export.service';

dotenv.config();

// 实例化服务（单例）
const assetService = new AssetService();
const analysisService = new AnalysisService();
const templateService = new TemplateService();
const layoutService = new LayoutService(templateService, analysisService);
const exportService = new ExportService();

const app = express();
const PORT = process.env.PORT || 3000;
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.resolve(UPLOAD_DIR)));

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
});

// ========== 路由 ==========

app.post('/api/upload', upload.array('photos', 100), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    console.log(`📸 Upload received: ${files.length} files`);
    const assets = await Promise.all(files.map(file => assetService.upload(file)));
    console.log(`✅ Saved ${assets.length} assets`);
    res.json({ success: true, assets });
  } catch (err: any) {
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
  } catch (err: any) {
    console.error('Preview error:', err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

app.post('/api/generate', upload.array('photos', 100), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    const { title = '', texts = '[]' } = req.body;

    let textsArray: string[] = [];
    if (typeof texts === 'string') {
      try {
        const parsed = JSON.parse(texts);
        if (Array.isArray(parsed)) textsArray = parsed;
      } catch {
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
    const baseUrl = process.env.BASE_URL || `http://localhost:${PORT}`;
    const html = layoutService.renderHtml(layoutData, 'classic', baseUrl);

    res.json({ html });
  } catch (err: any) {
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
  } catch (err: any) {
    console.error('Export error:', err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

app.delete('/api/assets', async (req, res) => {
  try {
    await assetService.clearAll();
    console.log('🧹 All assets cleared');
    res.json({ success: true, message: 'All assets cleared' });
  } catch (err: any) {
    console.error('Clear error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;