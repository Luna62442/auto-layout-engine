import Handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';

export interface Template {
  id: string;
  name: string;
  coverHtml: string;
  pageHtml: string;
  styles: string;
}

export class TemplateService {
  private templates: Map<string, Template> = new Map();

  constructor() {
    this.loadTemplates();
  }

  private async loadTemplates() {
    try {
      // 使用绝对路径，基于当前文件所在目录
      const classicDir = path.join(__dirname, 'templates', 'classic');
      const [coverHbs, pageHbs, styleCss] = await Promise.all([
        fs.readFile(path.join(classicDir, 'cover.hbs'), 'utf-8'),
        fs.readFile(path.join(classicDir, 'page.hbs'), 'utf-8'),
        fs.readFile(path.join(classicDir, 'style.css'), 'utf-8'),
      ]);
      this.templates.set('classic', {
        id: 'classic',
        name: '经典简约',
        coverHtml: coverHbs,
        pageHtml: pageHbs,
        styles: styleCss,
      });
      console.log('✅ Templates loaded');
    } catch (err) {
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

  getTemplate(id: string): Template | undefined {
    return this.templates.get(id);
  }
}