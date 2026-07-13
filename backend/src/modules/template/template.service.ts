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

  private setFallbackTemplate() {
    this.templates.set('classic', {
      id: 'classic',
      name: 'Fallback',
      coverHtml: `<div class="cover"><h1>{{title}}</h1><p>{{subtitle}}</p></div>`,
      pageHtml: `<div class="page">{{#each images}}<img src="{{url}}" style="max-width:30%;"/>{{/each}}{{#if text}}<p>{{text}}</p>{{/if}}</div>`,
      styles: 'body{margin:0;} .cover{height:100vh;} .page{display:flex;flex-wrap:wrap;}',
    });
    console.log('✅ Fallback template set.');
  }

  private async loadTemplates() {
    try {
      // 使用 process.cwd() 获取项目根目录（/opt/render/project/src/backend）
      const rootDir = process.cwd();
      const classicDir = path.join(rootDir, 'src', 'modules', 'template', 'templates', 'classic');
      console.log(`📁 Loading templates from: ${classicDir}`);
      const [cover, page, style] = await Promise.all([
        fs.readFile(path.join(classicDir, 'cover.hbs'), 'utf-8'),
        fs.readFile(path.join(classicDir, 'page.hbs'), 'utf-8'),
        fs.readFile(path.join(classicDir, 'style.css'), 'utf-8'),
      ]);
      this.templates.set('classic', {
        id: 'classic',
        name: '经典简约',
        coverHtml: cover,
        pageHtml: page,
        styles: style,
      });
      console.log('✅ Templates loaded from files.');
    } catch (err) {
      console.warn('⚠️ Could not load template files, using fallback.');
      this.setFallbackTemplate();
    }
  }

  getTemplate(id: string): Template | undefined {
    return this.templates.get(id);
  }
}