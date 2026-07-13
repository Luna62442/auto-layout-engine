import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export class ExportService {
  async exportPdf(html: string): Promise<Buffer> {
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // 1. 获取 Chromium 可执行路径（首次会触发下载）
        let executablePath = await chromium.executablePath();
        if (!executablePath) {
          console.warn('Chromium executable path not found, waiting for download...');
          await new Promise(resolve => setTimeout(resolve, 3000));
          executablePath = await chromium.executablePath();
        }

        console.log(`[Attempt ${attempt}] Executable path: ${executablePath}`);

        // 2. 启动浏览器
        const browser = await puppeteer.launch({
          args: chromium.args,
          defaultViewport: chromium.defaultViewport,
          executablePath,
          headless: chromium.headless,
          timeout: 60000,
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1200, height: 1600 });
        await page.setContent(html, { waitUntil: 'networkidle0' });

        // 等待图片加载
        await page.evaluate(() => {
          return Promise.all(
            Array.from(document.images)
              .filter(img => !img.complete)
              .map(img => new Promise(resolve => {
                img.onload = resolve;
                img.onerror = resolve;
              }))
          );
        });

        const pdfBuffer = await page.pdf({
          format: 'A4',
          printBackground: true,
          margin: { top: '0', bottom: '0', left: '0', right: '0' },
        });

        await browser.close();
        console.log(`[Attempt ${attempt}] PDF exported successfully.`);
        return pdfBuffer;
      } catch (err: any) {
        console.error(`[Attempt ${attempt}] Failed:`, err.message);

        // 如果是 ETXTBSY 错误且还有重试次数，等待后重试
        if (attempt < maxRetries && err.message.includes('ETXTBSY')) {
          const waitTime = attempt * 1000;
          console.log(`⏳ Retrying after ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }

        // 其他错误或最后一次尝试失败则抛出
        throw err;
      }
    }

    throw new Error('PDF export failed after maximum retries.');
  }
}