"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetService = void 0;
const uuid_1 = require("uuid");
const sharp_1 = __importDefault(require("sharp"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
class AssetService {
    constructor() {
        this.assets = [];
    }
    async upload(file) {
        const id = (0, uuid_1.v4)();
        const ext = path_1.default.extname(file.originalname) || '.jpg';
        const filename = `${id}${ext}`;
        const uploadDir = process.env.UPLOAD_DIR || 'uploads';
        const savePath = path_1.default.join(uploadDir, filename);
        await promises_1.default.writeFile(savePath, file.buffer);
        const image = (0, sharp_1.default)(file.buffer);
        const metadata = await image.metadata();
        const { width = 0, height = 0 } = metadata;
        // 提取主色
        const stats = await image.stats();
        const channels = stats.channels;
        const avgR = Math.round(channels[0].mean);
        const avgG = Math.round(channels[1].mean);
        const avgB = Math.round(channels[2].mean);
        const dominantColor = `#${[avgR, avgG, avgB].map(v => v.toString(16).padStart(2, '0')).join('')}`;
        // 模拟AI评分
        const score = 0.8 + Math.random() * 0.2;
        const peopleCount = Math.floor(Math.random() * 4) + 1;
        const faceScore = 0.7 + Math.random() * 0.3;
        const tagPool = ['校园', '毕业', '操场', '教室', '图书馆', '宿舍', '聚会', '旅行', '合影', '单人'];
        const tags = [];
        const count = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < count; i++) {
            const tag = tagPool[Math.floor(Math.random() * tagPool.length)];
            if (!tags.includes(tag))
                tags.push(tag);
        }
        const asset = {
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
        return asset;
    }
    getAll() {
        return this.assets;
    }
    getById(id) {
        return this.assets.find(a => a.id === id);
    }
    async clearAll() {
        const uploadDir = process.env.UPLOAD_DIR || 'uploads';
        for (const asset of this.assets) {
            const filePath = path_1.default.join(uploadDir, path_1.default.basename(asset.url));
            try {
                await promises_1.default.unlink(filePath);
            }
            catch (err) {
                // ignore
            }
        }
        this.assets = [];
    }
}
exports.AssetService = AssetService;
