const https = require('https');
const fs = require('fs');
const path = require('path');

const fontsDir = path.join(__dirname, '..', 'public', 'fonts');
if (!fs.existsSync(fontsDir)) fs.mkdirSync(fontsDir, { recursive: true });

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const request = (u) => {
      https.get(u, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          request(res.headers.location);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${u}`));
          return;
        }
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => { file.close(); resolve(); });
      }).on('error', reject);
    };
    request(url);
  });
}

function extractUrls(css) {
  const urls = [];
  const regex = /url\((https:\/\/fonts\.gstatic\.com[^\)]+)\)/g;
  let match;
  while ((match = regex.exec(css)) !== null) {
    urls.push(match[1]);
  }
  return urls;
}

function urlToFilename(url) {
  // Extract meaningful name from URL
  const parts = url.split('/');
  const filename = parts[parts.length - 1];
  // Find the font family from path
  const familyMatch = url.match(/\/s\/([^/]+)\//);
  const family = familyMatch ? familyMatch[1] : 'unknown';
  return `${family}-${filename}`;
}

async function main() {
  const allUrls = new Set();

  // Read both CSS files
  for (const cssFile of ['material-symbols-raw.css', 'text-fonts-raw.css']) {
    const cssPath = path.join(fontsDir, cssFile);
    if (!fs.existsSync(cssPath)) {
      console.log(`Skipping ${cssFile} (not found)`);
      continue;
    }
    const css = fs.readFileSync(cssPath, 'utf8');
    const urls = extractUrls(css);
    urls.forEach(u => allUrls.add(u));
    console.log(`Found ${urls.length} font URLs in ${cssFile}`);
  }

  console.log(`\nTotal unique font files to download: ${allUrls.size}\n`);

  let downloaded = 0;
  let failed = 0;

  for (const url of allUrls) {
    const filename = urlToFilename(url);
    const dest = path.join(fontsDir, filename);

    if (fs.existsSync(dest)) {
      downloaded++;
      continue;
    }

    try {
      await download(url, dest);
      const size = (fs.statSync(dest).size / 1024).toFixed(1);
      console.log(`  ✓ ${filename} (${size} kB)`);
      downloaded++;
    } catch (err) {
      console.log(`  ✗ ${filename}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone! Downloaded: ${downloaded}, Failed: ${failed}`);

  // Calculate total size
  const files = fs.readdirSync(fontsDir).filter(f => f.endsWith('.ttf') || f.endsWith('.woff2'));
  let totalSize = 0;
  for (const f of files) {
    totalSize += fs.statSync(path.join(fontsDir, f)).size;
  }
  console.log(`Total font size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
}

main();
