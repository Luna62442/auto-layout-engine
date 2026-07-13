import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { AssetMetadata } from './asset.types';

export class AssetService {
  private assets: AssetMetadata[] = [];

  async upload(file: Express.Multer.File): Promise<AssetMetadata> {
    const id = uuidv4();
    const ext = path.extname(file.originalname) || '.jpg';
    const filename = `${id}${ext}`;
    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    const savePath = path.join(uploadDir, filename);

    // 确保上传目录存在
    await fs.mkdir(uploadDir, { recursive: true });

    // 保存文件到磁盘
    await fs.writeFile(savePath, file.buffer);
    console.log(`💾 File saved: ${savePath}`);

    // 使用 sharp 处理图片
    const image = sharp(file.buffer);
    const metadata = await image.metadata();
    const { width = 0, height = 0 } = metadata;

    // 提取主色（平均色）
    const stats = await image.stats();
    const channels = stats.channels;
    const avgR = Math.round(channels[0].mean);
    const avgG = Math.round(channels[1].mean);
    const avgB = Math.round(channels[2].mean);
    const dominantColor = `#${[avgR, avgG, avgB].map(v => v.toString(16).padStart(2, '0')).join('')}`;

    // 模拟其他AI分析数据（实际可替换为真实AI）
    const score = 0.8 + Math.random() * 0.2;
    const peopleCount = Math.floor(Math.random() * 4) + 1;
    const faceScore = 0.7 + Math.random() * 0.3;
    const tagPool = ['校园', '毕业', '操场', '教室', '图书馆', '宿舍', '聚会', '旅行', '合影', '单人'];
    const tags: string[] = [];
    const count = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < count; i++) {
      const tag = tagPool[Math.floor(Math.random() * tagPool.length)];
      if (!tags.includes(tag)) tags.push(tag);
    }

    const asset: AssetMetadata = {
      id,
      url: `/uploads/${filename}`,
      width,
      height,
      orientation: width > height ? 'landscape' : width < height ? 'portrait' : 'square',
      score,
      peopleCount,
      faceScore,
      tags,
      createdAt: new Date(),
      dominantColor,
    };

    this.assets.push(asset);
    console.log(`✅ Asset saved with URL: ${asset.url}`);
    return asset;
  }

  getAll(): AssetMetadata[] {
    return this.assets;
  }

  getById(id: string): AssetMetadata | undefined {
    return this.assets.find(a => a.id === id);
  }

  async clearAll(): Promise<void> {
    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    for (const asset of this.assets) {
      const filePath = path.join(uploadDir, path.basename(asset.url));
      try {
        await fs.unlink(filePath);
        console.log(`🗑️ Deleted file: ${filePath}`);
      } catch (err) {
        // 文件可能已不存在，忽略
      }
    }
    this.assets = [];
    console.log('🧹 All assets cleared from memory');
  }
}