/*
  Generates optimized responsive images for the hero logo and a full favicon set.
  Requires: sharp

  Input source: media/Portfolio_Image.jpg
  Outputs:
    - public/static/img/hero-110.jpg, hero-140.jpg, hero-180.jpg, hero-256.jpg (center-cropped square)
    - public/static/img/favicon-16x16.png, favicon-32x32.png, favicon.ico (multi-size)
    - public/static/img/apple-touch-icon.png (180x180)
    - public/static/img/android-chrome-192x192.png, android-chrome-512x512.png
    - public/static/img/safari-pinned-tab.svg (monochrome mask)
*/

const fs = require('fs');
const path = require('path');

async function ensureDir(p) {
  await fs.promises.mkdir(p, { recursive: true });
}

function fileExists(p) {
  try { fs.accessSync(p); return true; } catch { return false; }
}

async function main() {
  const projectRoot = path.join(__dirname, '..');
  const src = path.join(projectRoot, 'media', 'Portfolio_Image.jpg');
  const outDir = path.join(projectRoot, 'public', 'static', 'img');

  if (!fileExists(src)) {
    console.warn(`Source image not found at ${src}. Skipping image generation.`);
    return;
  }

  await ensureDir(outDir);

  let sharp;
  try {
    sharp = require('sharp');
  } catch (e) {
    console.error('sharp is not installed. Run: npm i -D sharp');
    process.exit(1);
  }

  // Helper to create a square cropped resize
  const square = (size) => sharp(src).resize(size, size, { fit: 'cover', position: 'centre' });

  // Hero responsive sizes
  const heroSizes = [110, 140, 180, 256];
  await Promise.all(heroSizes.map(async (s) => {
    const out = path.join(outDir, `hero-${s}.jpg`);
    await square(s).jpeg({ quality: 82, progressive: true }).toFile(out);
    console.log(`✔ hero-${s}.jpg`);
  }));

  // Favicons and platform icons
  const icons = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'android-chrome-192x192.png', size: 192 },
    { name: 'android-chrome-512x512.png', size: 512 },
    { name: 'apple-touch-icon.png', size: 180 },
  ];

  await Promise.all(icons.map(async ({ name, size }) => {
    const out = path.join(outDir, name);
    await square(size).png({ compressionLevel: 9 }).toFile(out);
    console.log(`✔ ${name}`);
  }));

  // favicon.ico with multiple sizes
  const icoTmp16 = path.join(outDir, 'tmp-16.png');
  const icoTmp32 = path.join(outDir, 'tmp-32.png');
  const icoTmp48 = path.join(outDir, 'tmp-48.png');
  await square(16).png().toFile(icoTmp16);
  await square(32).png().toFile(icoTmp32);
  await square(48).png().toFile(icoTmp48);

  try {
    const toIco = require('png-to-ico');
    const ico = await toIco([icoTmp16, icoTmp32, icoTmp48]);
    await fs.promises.writeFile(path.join(outDir, 'favicon.ico'), ico);
    console.log('✔ favicon.ico');
  } catch (e) {
    console.warn('png-to-ico not installed, skipping favicon.ico. Run: npm i -D png-to-ico');
  } finally {
    // cleanup
    for (const tmp of [icoTmp16, icoTmp32, icoTmp48]) {
      try { await fs.promises.unlink(tmp); } catch {}
    }
  }

  // Simple monochrome Safari pinned tab SVG mask
  const maskSvg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">\n  <circle cx="512" cy="512" r="480" fill="#000"/>\n</svg>`;
  await fs.promises.writeFile(path.join(outDir, 'safari-pinned-tab.svg'), maskSvg, 'utf8');
  console.log('✔ safari-pinned-tab.svg');

  console.log('\n✅ Image generation complete');
}

main().catch((e) => {
  console.error('Image generation failed:', e);
  process.exit(1);
});
