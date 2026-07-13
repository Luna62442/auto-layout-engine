import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export class ExportService {
  async exportPdf(html: string): Promise<Buffer> {
    // 获取 Chromium 可执行路径
    const executablePath = await chromium.executablePath();

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 1600 });
    await page.setContent(html, { waitUntil: 'networkidle0' });
    // 等待图片加载
    await page.evaluate(() => {
      return Promise.all(
        Array.from(document.images)
          .filter(img => !img.complete)
          .map(img => new Promise(resolve => { img.onload = resolve; img.onerror = resolve; }))
      );
    });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', bottom: '0', left: '0', right: '0' },
    });
    await browser.close();
    return pdfBuffer;
  }
}