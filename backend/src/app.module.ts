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

// 加载环境变量
dotenv.config();

// 初始化服务（单例）
const assetService = new AssetService();
const analysisService = new AnalysisService();
const templateService = new TemplateService();
const layoutService = new LayoutService(templateService, analysisService);
const exportService = new ExportService();

const app = express();
const PORT = process.env.PORT || 3000;
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';

// 静态文件目录的绝对路径（项目根目录下的 uploads）
const uploadPath = path.join(process.cwd(), UPLOAD_DIR);

// 确保上传目录存在
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
  console.log(`📁 Created upload directory: ${uploadPath}`);
}

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 静态文件服务（挂载到 /uploads）
app.use('/uploads', express.static(uploadPath));
console.log(`📁 Serving static files from: ${uploadPath}`);

// Multer 配置（内存存储）
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

// ========== 全局基础 URL（关键） ==========
// 从环境变量读取，若未设置则使用 localhost（开发环境）
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
console.log(`🌐 Base URL for images: ${BASE_URL}`);

// ========== API 路由 ==========

// 1. 上传图片（仅上传，不生成预览）
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

// 2. 预览（基于已上传的 assets）
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
    // 使用全局 BASE_URL 生成绝对路径
    const html = layoutService.renderHtml(layoutData, templateId, BASE_URL);
    res.json({ html });
  } catch (err: any) {
    console.error('Preview error:', err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

// 3. 合并上传+预览（一步到位，推荐使用）
app.post('/api/generate', upload.array('photos', 100), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    const { title = '', texts = '[]' } = req.body;

    // 解析 texts：支持 JSON 数组或换行分隔的文本
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

    // 上传所有图片
    const assets = await Promise.all(files.map(file => assetService.upload(file)));
    console.log(`✅ Saved ${assets.length} assets`);

    // 生成排版数据
    const layoutData = layoutService.generateLayout(assets, 'classic', {
      title: title || undefined,
      texts: textsArray,
    });
    // 使用全局 BASE_URL 生成绝对路径
    const html = layoutService.renderHtml(layoutData, 'classic', BASE_URL);

    res.json({ html });
  } catch (err: any) {
    console.error('Generate error:', err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

// 4. 导出 PDF
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

// 5. 清除所有资产（清理数据）
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

// 6. 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 全局错误处理（可选）
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;