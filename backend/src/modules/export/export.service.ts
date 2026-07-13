// backend/src/modules/export/export.service.ts
import puppeteer from 'puppeteer';

export class ExportService {
  async exportPdf(html: string): Promise<Buffer> {
    // 启动无头浏览器
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    // 设置视口尺寸（A4 比例）
    await page.setViewport({
      width: 1200,
      height: 1600,
    });

    // 加载 HTML 内容（图片路径已为绝对 URL，无需 baseURL）
    await page.setContent(html, {
      waitUntil: 'networkidle0',
    });

    // 等待所有图片加载完成（增强可靠性）
    await page.evaluate(() => {
      return Promise.all(
        Array.from(document.images)
          .filter(img => !img.complete)
          .map(img => new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve; // 即使加载失败也继续
          }))
      );
    });

    // 生成 PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0',
        bottom: '0',
        left: '0',
        right: '0',
      },
    });

    // 关闭浏览器
    await browser.close();
    return pdfBuffer;
  }
}