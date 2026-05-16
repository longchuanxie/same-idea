const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');

// Splash screen sizes for different densities
const SIZES = {
  'drawable': { width: 288, height: 288 },
  'drawable-port-mdpi': { width: 320, height: 480 },
  'drawable-port-hdpi': { width: 480, height: 800 },
  'drawable-port-xhdpi': { width: 720, height: 1280 },
  'drawable-port-xxhdpi': { width: 960, height: 1600 },
  'drawable-port-xxxhdpi': { width: 1280, height: 1920 },
  'drawable-land-mdpi': { width: 480, height: 320 },
  'drawable-land-hdpi': { width: 800, height: 480 },
  'drawable-land-xhdpi': { width: 1280, height: 720 },
  'drawable-land-xxhdpi': { width: 1600, height: 960 },
  'drawable-land-xxxhdpi': { width: 1920, height: 1280 },
};

const BACKGROUND_COLOR = '#fdf8f8';

function createSplashSvg(width, height) {
  const iconSize = Math.min(width, height) * 0.35;
  const scale = iconSize / 200;
  const offsetX = (width - iconSize) / 2;
  const offsetY = (height - iconSize) / 2;

  return `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="${BACKGROUND_COLOR}"/>
  <g transform="translate(${offsetX}, ${offsetY}) scale(${scale})">
    <rect width="200" height="200" rx="48" fill="#FDF8F8"/>
    <rect x="65" y="70" width="8" height="60" rx="4" fill="#1A1A1A"/>
    <rect x="67" y="75" width="4" height="2" rx="1" fill="white" fill-opacity="0.8"/>
    <rect x="80" y="60" width="8" height="80" rx="4" fill="#1A1A1A"/>
    <rect x="82" y="125" width="4" height="6" rx="1" fill="#E53E3E"/>
    <rect x="95" y="65" width="8" height="70" rx="4" fill="#1A1A1A"/>
    <rect x="97" y="72" width="4" height="2" rx="1" fill="white" fill-opacity="0.8"/>
    <rect x="97" y="77" width="4" height="2" rx="1" fill="white" fill-opacity="0.8"/>
    <rect x="110" y="55" width="8" height="90" rx="4" fill="#1A1A1A"/>
    <rect x="112" y="65" width="4" height="8" rx="1" fill="#38A169"/>
    <rect x="125" y="75" width="8" height="50" rx="4" fill="#1A1A1A"/>
    <rect x="127" y="82" width="4" height="2" rx="1" fill="white" fill-opacity="0.8"/>
  </g>
</svg>
  `.trim();
}

async function generate() {
  for (const [dir, size] of Object.entries(SIZES)) {
    const dirPath = path.join(BASE_DIR, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    const svg = createSplashSvg(size.width, size.height);
    const outputPath = path.join(dirPath, 'splash.png');

    await sharp(Buffer.from(svg))
      .png()
      .toFile(outputPath);

    console.log(`Generated: ${outputPath} (${size.width}x${size.height})`);
  }
  console.log('All splash screens generated successfully!');
}

generate().catch((err) => {
  console.error('Error generating splash screens:', err);
  process.exit(1);
});
