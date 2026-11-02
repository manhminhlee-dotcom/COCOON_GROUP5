import * as THREE from 'three';
import { HeroBookData } from '../types/books';

/**
 * Cache procedural textures so they are created once and reused efficiently.
 */
const textureCache = new Map<string, THREE.CanvasTexture>();

/**
 * Procedural Honey-Oak wood grain texture for bookshelf and furniture.
 */
export function createWoodTexture(): { map: THREE.CanvasTexture; roughnessMap: THREE.CanvasTexture } {
  const cacheKey = 'honey_oak_wood';
  if (textureCache.has(cacheKey)) {
    return {
      map: textureCache.get(cacheKey)!,
      roughnessMap: textureCache.get(cacheKey + '_roughness')!,
    };
  }

  const width = 1024;
  const height = 1024;

  // Albedo canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Roughness canvas
  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = width;
  roughCanvas.height = height;
  const roughCtx = roughCanvas.getContext('2d')!;

  // Base warm honey-oak gradient
  const baseGrad = ctx.createLinearGradient(0, 0, width, 0);
  baseGrad.addColorStop(0, '#8c582c');
  baseGrad.addColorStop(0.3, '#9d6635');
  baseGrad.addColorStop(0.7, '#8f5b2f');
  baseGrad.addColorStop(1, '#976233');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, width, height);

  roughCtx.fillStyle = '#666666'; // Base roughness ~0.4
  roughCtx.fillRect(0, 0, width, height);

  // Longitudinal wood grain lines & pores
  ctx.fillStyle = 'rgba(65, 36, 14, 0.15)';
  roughCtx.fillStyle = 'rgba(255, 255, 255, 0.2)';

  for (let i = 0; i < 400; i++) {
    const x = Math.random() * width;
    const w = 1 + Math.random() * 3.5;
    const alpha = 0.04 + Math.random() * 0.12;

    ctx.fillStyle = `rgba(50, 25, 8, ${alpha})`;
    ctx.fillRect(x, 0, w, height);

    if (Math.random() > 0.6) {
      roughCtx.fillStyle = `rgba(200, 200, 200, ${alpha * 0.8})`;
      roughCtx.fillRect(x, 0, w, height);
    }
  }

  // Large annual growth wave rings
  for (let y = 0; y < height; y += 4) {
    const wave = Math.sin(y * 0.015) * 45 + Math.sin(y * 0.04) * 15;
    ctx.fillStyle = `rgba(130, 80, 40, ${0.03 + Math.sin(y * 0.02) * 0.03})`;
    ctx.fillRect(0, y, width, 2);
  }

  // Micro pore flecks
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 16) {
    const noise = (Math.random() - 0.5) * 14;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise * 0.8));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise * 0.6));
  }
  ctx.putImageData(imgData, 0, 0);

  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(2, 4);

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(2, 4);

  textureCache.set(cacheKey, map);
  textureCache.set(cacheKey + '_roughness', roughnessMap);

  return { map, roughnessMap };
}

/**
 * Procedural Spine Atlas for instanced decorative books (~64 distinct spines).
 */
export function createDecorativeSpineAtlas(): THREE.CanvasTexture {
  const cacheKey = 'decorative_spine_atlas';
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const cols = 8;
  const rows = 8;
  const spineW = 128;
  const spineH = 512;
  const width = cols * spineW;
  const height = rows * spineH;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Earthy library palette
  const palettes = [
    { base: '#2b1d16', accent: '#d4af37', name: 'leather-dark' },
    { base: '#1b324a', accent: '#e8c56c', name: 'navy-cloth' },
    { base: '#4a1e23', accent: '#f0d278', name: 'crimson-cloth' },
    { base: '#1c3e32', accent: '#dfc264', name: 'forest-buckram' },
    { base: '#7c4d21', accent: '#f7d884', name: 'ochre-canvas' },
    { base: '#3a2745', accent: '#deb958', name: 'plum-morocco' },
    { base: '#263b38', accent: '#e2caa0', name: 'teal-linen' },
    { base: '#593922', accent: '#efcf70', name: 'russet-leather' },
    { base: '#21242b', accent: '#cd9f42', name: 'charcoal-cloth' },
    { base: '#5c4838', accent: '#eed68a', name: 'taupe-weave' },
    { base: '#6e2b24', accent: '#f9e099', name: 'rust-vintage' },
    { base: '#22384a', accent: '#ddbc5e', name: 'slate-blue' },
  ];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      const palette = palettes[idx % palettes.length];
      const x = c * spineW;
      const y = r * spineH;

      // Base spine color
      ctx.fillStyle = palette.base;
      ctx.fillRect(x, y, spineW, spineH);

      // Fine cloth weave or leather texture simulation
      ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
      for (let i = 0; i < spineW; i += 3) {
        ctx.fillRect(x + i, y, 1, spineH);
      }
      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      for (let j = 0; j < spineH; j += 4) {
        ctx.fillRect(x, y + j, spineW, 1);
      }

      // Vertical spine edge shading (curvature shadows)
      const edgeGrad = ctx.createLinearGradient(x, y, x + spineW, y);
      edgeGrad.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
      edgeGrad.addColorStop(0.18, 'rgba(0, 0, 0, 0.0)');
      edgeGrad.addColorStop(0.82, 'rgba(0, 0, 0, 0.0)');
      edgeGrad.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
      ctx.fillStyle = edgeGrad;
      ctx.fillRect(x, y, spineW, spineH);

      // Gold foil ornamental bands at top and bottom
      ctx.fillStyle = palette.accent;
      const bandTopY = y + 35 + (idx % 3) * 10;
      const bandBotY = y + spineH - 55 - (idx % 3) * 10;

      // Double gold rules
      ctx.fillRect(x + 12, bandTopY, spineW - 24, 2.5);
      ctx.fillRect(x + 12, bandTopY + 6, spineW - 24, 1.5);
      ctx.fillRect(x + 12, bandBotY, spineW - 24, 1.5);
      ctx.fillRect(x + 12, bandBotY + 6, spineW - 24, 2.5);

      // Center title block framing
      const centerBoxY = y + 110 + (idx % 4) * 20;
      const centerBoxH = 140 + (idx % 3) * 30;
      ctx.strokeStyle = palette.accent;
      ctx.lineWidth = 1.2;
      ctx.strokeRect(x + 16, centerBoxY, spineW - 32, centerBoxH);

      // Simulated book spine typography lines
      ctx.fillStyle = palette.accent;
      const lines = 3 + (idx % 3);
      const lineSpacing = 16;
      for (let l = 0; l < lines; l++) {
        const lw = (spineW - 48) * (0.6 + Math.sin(idx * 7 + l) * 0.35);
        const lx = x + (spineW - lw) / 2;
        ctx.fillRect(lx, centerBoxY + 30 + l * lineSpacing, lw, 3.5);
      }

      // Small publisher mark at base
      ctx.beginPath();
      ctx.arc(x + spineW / 2, y + spineH - 28, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Procedural cover texture for hero books (front, spine, back layout).
 */
export function createHeroCoverTexture(book: HeroBookData): {
  map: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
} {
  const cacheKey = `hero_cover_${book.id}`;
  if (textureCache.has(cacheKey)) {
    return {
      map: textureCache.get(cacheKey)!,
      roughnessMap: textureCache.get(cacheKey + '_roughness')!,
    };
  }

  const width = 2048;
  const height = 1536;

  // Split:
  // Back Cover: 0 -> 900
  // Spine: 900 -> 1148
  // Front Cover: 1148 -> 2048
  const spineLeft = 900;
  const spineWidth = 248;
  const frontLeft = spineLeft + spineWidth;
  const coverWidth = width - frontLeft;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = width;
  roughCanvas.height = height;
  const roughCtx = roughCanvas.getContext('2d')!;

  // 1. Base cloth / leather tone
  ctx.fillStyle = book.accentColor;
  ctx.fillRect(0, 0, width, height);

  roughCtx.fillStyle = '#555555'; // Roughness ~0.33
  roughCtx.fillRect(0, 0, width, height);

  // Subtle fabric / leather texture overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
  for (let i = 0; i < width; i += 4) {
    ctx.fillRect(i, 0, 1.5, height);
  }
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  for (let j = 0; j < height; j += 4) {
    ctx.fillRect(0, j, width, 1.5);
  }

  // 2. Spine groove shadows (where cover hinges)
  const grooveGradLeft = ctx.createLinearGradient(spineLeft - 20, 0, spineLeft + 15, 0);
  grooveGradLeft.addColorStop(0, 'rgba(0, 0, 0, 0.0)');
  grooveGradLeft.addColorStop(0.5, 'rgba(0, 0, 0, 0.55)');
  grooveGradLeft.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
  ctx.fillStyle = grooveGradLeft;
  ctx.fillRect(spineLeft - 20, 0, 35, height);

  const grooveGradRight = ctx.createLinearGradient(frontLeft - 15, 0, frontLeft + 20, 0);
  grooveGradRight.addColorStop(0, 'rgba(0, 0, 0, 0.0)');
  grooveGradRight.addColorStop(0.5, 'rgba(0, 0, 0, 0.55)');
  grooveGradRight.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
  ctx.fillStyle = grooveGradRight;
  ctx.fillRect(frontLeft - 15, 0, 35, height);

  // 3. FRONT COVER ART (1148 -> 2048)
  const fcCenterX = frontLeft + coverWidth / 2;

  // Elegant decorative outer & inner gold border
  ctx.strokeStyle = book.foilColor;
  ctx.lineWidth = 4;
  ctx.strokeRect(frontLeft + 48, 48, coverWidth - 96, height - 96);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(frontLeft + 64, 64, coverWidth - 128, height - 128);

  // Corner ornaments
  const cornerSize = 40;
  const drawCorner = (cx: number, cy: number, signX: number, signY: number) => {
    ctx.beginPath();
    ctx.moveTo(cx, cy + signY * cornerSize);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx + signX * cornerSize, cy);
    ctx.strokeStyle = book.foilColor;
    ctx.lineWidth = 3;
    ctx.stroke();
  };
  drawCorner(frontLeft + 72, 72, 1, 1);
  drawCorner(width - 72, 72, -1, 1);
  drawCorner(frontLeft + 72, height - 72, 1, -1);
  drawCorner(width - 72, height - 72, -1, -1);

  // Front Cover Title
  ctx.fillStyle = book.foilColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Title styling
  ctx.font = 'bold 78px "Lora", "Playfair Display", Georgia, serif';
  ctx.fillText(book.title, fcCenterX, height * 0.32);

  if (book.originalTitle) {
    ctx.font = 'italic 34px "Lora", "Playfair Display", serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText(book.originalTitle, fcCenterX, height * 0.39);
  }

  // Central ornamental motif
  ctx.beginPath();
  ctx.arc(fcCenterX, height * 0.52, 45, 0, Math.PI * 2);
  ctx.strokeStyle = book.foilColor;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(fcCenterX, height * 0.52, 28, 0, Math.PI * 2);
  ctx.stroke();

  // Author name
  ctx.fillStyle = book.foilColor;
  ctx.font = '600 42px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(book.author.toUpperCase(), fcCenterX, height * 0.68);

  // Year & Classics label
  ctx.font = '500 28px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.fillText(`XUẤT BẢN NĂM ${book.year} · TÁC PHẨM KINH ĐIỂN`, fcCenterX, height * 0.82);

  // 4. SPINE ART (900 -> 1148)
  const spineCenterX = spineLeft + spineWidth / 2;

  // Gold foil bands
  ctx.fillStyle = book.foilColor;
  ctx.fillRect(spineLeft + 25, 90, spineWidth - 50, 4);
  ctx.fillRect(spineLeft + 25, 102, spineWidth - 50, 2);
  ctx.fillRect(spineLeft + 25, height - 120, spineWidth - 50, 2);
  ctx.fillRect(spineLeft + 25, height - 108, spineWidth - 50, 4);

  // Vertical spine title
  ctx.save();
  ctx.translate(spineCenterX, height * 0.48);
  ctx.rotate(Math.PI / 2);
  ctx.fillStyle = book.foilColor;
  ctx.font = 'bold 52px "Lora", "Playfair Display", serif';
  ctx.textAlign = 'center';
  ctx.fillText(book.title, 0, 0);

  // Spine author
  ctx.font = '32px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.fillText(book.author, 280, 0);
  ctx.restore();

  // 5. BACK COVER ART (0 -> 900)
  const bcCenterX = 450;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(60, 60, spineLeft - 120, height - 120);

  // Excerpt block on back
  ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
  ctx.font = 'italic 32px "Lora", serif';
  ctx.textAlign = 'center';

  const words = book.excerpt.split(' ');
  let line = '';
  let lineY = height * 0.42;
  const maxLineWidth = spineLeft - 220;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxLineWidth && n > 0) {
      ctx.fillText(line, bcCenterX, lineY);
      line = words[n] + ' ';
      lineY += 48;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, bcCenterX, lineY);

  // Back author citation
  ctx.fillStyle = book.foilColor;
  ctx.font = '500 28px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`— ${book.author}`, bcCenterX, lineY + 60);

  // Roughness map: gold foil areas have very low roughness (high shine / specular glint)
  roughCtx.fillStyle = '#111111'; // High gloss for gold
  // We mirror the foil title and bands onto roughCtx
  roughCtx.fillRect(spineLeft + 25, 90, spineWidth - 50, 16);
  roughCtx.fillRect(spineLeft + 25, height - 120, spineWidth - 50, 16);
  roughCtx.strokeRect(frontLeft + 48, 48, coverWidth - 96, height - 96);

  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);

  textureCache.set(cacheKey, map);
  textureCache.set(cacheKey + '_roughness', roughnessMap);

  return { map, roughnessMap };
}

/**
 * Paper block edge texture (simulating fine stacked pages).
 */
export function createPageEdgeTexture(): THREE.CanvasTexture {
  const cacheKey = 'book_page_edges';
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Warm aged ivory paper base
  ctx.fillStyle = '#eee6d4';
  ctx.fillRect(0, 0, 512, 512);

  // Fine horizontal page lines
  for (let y = 0; y < 512; y += 2) {
    const alpha = 0.08 + Math.random() * 0.15;
    ctx.fillStyle = `rgba(130, 110, 85, ${alpha})`;
    ctx.fillRect(0, y, 512, 1);
  }

  // Edge darkening (patina)
  const grad = ctx.createLinearGradient(0, 0, 512, 0);
  grad.addColorStop(0, 'rgba(120, 95, 70, 0.22)');
  grad.addColorStop(0.1, 'rgba(120, 95, 70, 0.0)');
  grad.addColorStop(0.9, 'rgba(120, 95, 70, 0.0)');
  grad.addColorStop(1, 'rgba(120, 95, 70, 0.22)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Kilim rug procedural texture matching REF_ROOM.png.
 */
export function createKilimRugTexture(): THREE.CanvasTexture {
  const cacheKey = 'kilim_rug';
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Warm terracotta / ochre background
  ctx.fillStyle = '#b87537';
  ctx.fillRect(0, 0, 1024, 1024);

  // Outer border
  ctx.fillStyle = '#6e2b18';
  ctx.fillRect(40, 40, 944, 944);

  ctx.fillStyle = '#dca358';
  ctx.fillRect(80, 80, 864, 864);

  ctx.fillStyle = '#9e4624';
  ctx.fillRect(120, 120, 784, 784);

  // Central field
  ctx.fillStyle = '#cb843f';
  ctx.fillRect(160, 160, 704, 704);

  // Diamond medallions in traditional kilim layout
  const drawMedallion = (cx: number, cy: number, radius: number) => {
    ctx.save();
    ctx.translate(cx, cy);

    // Outer diamond
    ctx.beginPath();
    ctx.moveTo(0, -radius);
    ctx.lineTo(radius, 0);
    ctx.lineTo(0, radius);
    ctx.lineTo(-radius, 0);
    ctx.closePath();
    ctx.fillStyle = '#542618';
    ctx.fill();

    // Inner diamond
    const r2 = radius * 0.72;
    ctx.beginPath();
    ctx.moveTo(0, -r2);
    ctx.lineTo(r2, 0);
    ctx.lineTo(0, r2);
    ctx.lineTo(-r2, 0);
    ctx.closePath();
    ctx.fillStyle = '#e4b669';
    ctx.fill();

    // Core diamond
    const r3 = radius * 0.42;
    ctx.beginPath();
    ctx.moveTo(0, -r3);
    ctx.lineTo(r3, 0);
    ctx.lineTo(0, r3);
    ctx.lineTo(-r3, 0);
    ctx.closePath();
    ctx.fillStyle = '#8a311b';
    ctx.fill();

    ctx.restore();
  };

  // 1 large center medallion, 4 corner medallions
  drawMedallion(512, 512, 190);
  drawMedallion(310, 310, 90);
  drawMedallion(714, 310, 90);
  drawMedallion(310, 714, 90);
  drawMedallion(714, 714, 90);

  // Wool weave fiber noise
  const imgData = ctx.getImageData(0, 0, 1024, 1024);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 8) {
    const noise = (Math.random() - 0.5) * 22;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise * 0.9));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise * 0.8));
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(cacheKey, texture);
  return texture;
}
