import chromium from '@sparticuz/chromium-min';
import playwright from 'playwright-core';

const ALLOWED_HOSTS = new Set([
  'eduacion-libre-proyecto-arkaios.vercel.app',
  'www.eduacion-libre-proyecto-arkaios.vercel.app'
]);

function getBaseUrl(req) {
  const forwardedProto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers.host;
  return `${forwardedProto}://${host}`;
}

function getTargetUrl(req) {
  const method = req.method || 'GET';
  const source = method === 'POST' ? (req.body || {}) : (req.query || {});
  return String(source.url || '').trim();
}

function assertAllowedTarget(rawUrl, req) {
  if (!rawUrl) {
    throw new Error('Missing url parameter');
  }

  const baseUrl = getBaseUrl(req);
  const parsed = new URL(rawUrl, baseUrl);
  const isSameHost = parsed.host === new URL(baseUrl).host;
  const isAllowedHost = ALLOWED_HOSTS.has(parsed.host);

  if (!isSameHost && !isAllowedHost) {
    throw new Error('Target host not allowed');
  }

  return parsed.toString();
}

async function launchBrowser() {
  const executablePath = await chromium.executablePath(
    'https://github.com/Sparticuz/chromium/releases/download/v138.0.2/chromium-v138.0.2-pack.x64.tar'
  );

  return playwright.chromium.launch({
    args: chromium.args,
    executablePath,
    headless: true
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!['GET', 'POST'].includes(req.method)) {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let browser;

  try {
    const targetUrl = assertAllowedTarget(getTargetUrl(req), req);
    browser = await launchBrowser();
    const page = await browser.newPage({
      viewport: { width: 1440, height: 2200 }
    });

    await page.goto(targetUrl, { waitUntil: 'networkidle' });
    await page.emulateMedia({ media: 'print' });
    await page.waitForTimeout(2500);

    const pdf = await page.pdf({
      format: 'Letter',
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: '0',
        right: '0',
        bottom: '0',
        left: '0'
      }
    });

    await page.close();
    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="arkaios-plantilla.pdf"');
    return res.status(200).send(Buffer.from(pdf));
  } catch (error) {
    if (browser) {
      try { await browser.close(); } catch {}
    }
    return res.status(500).json({
      error: 'PDF export failed',
      details: error.message
    });
  }
}
