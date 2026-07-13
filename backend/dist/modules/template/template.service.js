"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateService = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
class TemplateService {
    constructor() {
        this.templates = new Map();
        this.loadTemplates();
    }
    async loadTemplates() {
        try {
            // 使用绝对路径，基于当前文件所在目录
            const classicDir = path_1.default.join(__dirname, 'templates', 'classic');
            const [coverHbs, pageHbs, styleCss] = await Promise.all([
                promises_1.default.readFile(path_1.default.join(classicDir, 'cover.hbs'), 'utf-8'),
                promises_1.default.readFile(path_1.default.join(classicDir, 'page.hbs'), 'utf-8'),
                promises_1.default.readFile(path_1.default.join(classicDir, 'style.css'), 'utf-8'),
            ]);
            this.templates.set('classic', {
                id: 'classic',
                name: '经典简约',
                coverHtml: coverHbs,
                pageHtml: pageHbs,
                styles: styleCss,
            });
            console.log('✅ Templates loaded');
        }
        catch (err) {
            console.error('⚠️ Failed to load template files, using fallback templates.');
            // 后备模板（纯文本）
            this.templates.set('classic', {
                id: 'classic',
                name: 'Fallback',
                coverHtml: '<div class="cover"><h1>{{title}}</h1><p>{{subtitle}}</p></div>',
                pageHtml: '<div class="page">{{#each images}}<img src="{{this}}" style="max-width:30%;"/>{{/each}}{{#if text}}<p>{{text}}</p>{{/if}}</div>',
                styles: 'body { margin:0; } .cover { height:100vh; } .page { display:flex; flex-wrap:wrap; }',
            });
        }
    }
    getTemplate(id) {
        return this.templates.get(id);
    }
}
exports.TemplateService = TemplateService;
