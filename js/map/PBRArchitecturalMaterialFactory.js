/**
 * AgriTwin 3D - PBRArchitecturalMaterialFactory
 * High-Resolution Procedural PBR Texture & Material Generator
 * 
 * Generates tactile, micro-detailed physically-based materials:
 *  - Aged Artisan Brickwork (Running bond with deep recessed mortar joints & surface pitting)
 *  - Terracotta Curved Roof Tiles (Curved cylindrical overlapping pantiles with weather patina)
 *  - Aged Timber Wood (Longitudinal wood grain, growth rings & rustic gouges)
 *  - Chiseled Stone Masonry (Irregular quarry blocks for chimneys & foundations)
 *  - Native Tree Bark (Deep vertical furrowed fissures for Quillay / Boldo)
 *  - Botanical Canopy Foliage (Cluster leaf normals with chlorophyll gradient)
 */

export class PBRArchitecturalMaterialFactory {
  static _cache = new Map();

  /**
   * Helper: Generates a normal map from an intensity/heightfield Float32Array using Sobel operator.
   */
  static _createNormalMapFromHeight(heightField, size, strength = 1.0, repeat = 1) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(size, size);
    const data = imgData.data;

    for (let y = 0; y < size; y++) {
      const ym1 = (y - 1 + size) % size;
      const yp1 = (y + 1) % size;

      for (let x = 0; x < size; x++) {
        const xm1 = (x - 1 + size) % size;
        const xp1 = (x + 1) % size;

        // Sobel gradient horizontal
        const dx = (
          -heightField[ym1 * size + xm1] + heightField[ym1 * size + xp1]
          - 2.0 * heightField[y * size + xm1] + 2.0 * heightField[y * size + xp1]
          - heightField[yp1 * size + xm1] + heightField[yp1 * size + xp1]
        ) * strength;

        // Sobel gradient vertical
        const dy = (
          -heightField[ym1 * size + xm1] - 2.0 * heightField[ym1 * size + x] - heightField[ym1 * size + xp1]
          + heightField[yp1 * size + xm1] + 2.0 * heightField[yp1 * size + x] + heightField[yp1 * size + xp1]
        ) * strength;

        const dz = 1.0;
        const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const nx = -dx / len;
        const ny = -dy / len;
        const nz = dz / len;

        const idx = (y * size + x) * 4;
        data[idx]     = Math.floor((nx * 0.5 + 0.5) * 255);
        data[idx + 1] = Math.floor((ny * 0.5 + 0.5) * 255);
        data[idx + 2] = Math.floor((nz * 0.5 + 0.5) * 255);
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeat, repeat);
    texture.anisotropy = 8;
    texture.needsUpdate = true;
    return texture;
  }

  /**
   * 1. ARTISAN BRICKWORK PBR MATERIAL
   * Detailed running bond brick wall with deep mortar joints and terracotta color variation.
   */
  static getBrickMaterial(repeat = 4) {
    const key = `brick_${repeat}`;
    if (this._cache.has(key)) return this._cache.get(key);

    const size = 1024;
    const albedoCanvas = document.createElement('canvas');
    albedoCanvas.width = size;
    albedoCanvas.height = size;
    const ctx = albedoCanvas.getContext('2d');

    const roughnessCanvas = document.createElement('canvas');
    roughnessCanvas.width = size;
    roughnessCanvas.height = size;
    const rCtx = roughnessCanvas.getContext('2d');

    const heightField = new Float32Array(size * size);

    // Fill background mortar (sandy cement)
    ctx.fillStyle = '#948f85';
    ctx.fillRect(0, 0, size, size);

    rCtx.fillStyle = '#e2e0dc'; // Mortar is very rough (0.9)
    rCtx.fillRect(0, 0, size, size);

    const rows = 16;
    const rowHeight = size / rows;
    const brickWidth = size / 8;
    const mortarH = 5; // Mortar joint thickness
    const mortarV = 5;

    // Palette of earthy terracotta & kiln-fired bricks
    const brickPalette = [
      '#993322', '#b34728', '#8a2b1a', '#a63e26', 
      '#c05335', '#7a2214', '#a14227', '#8e301d'
    ];

    for (let r = 0; r < rows; r++) {
      const yStart = r * rowHeight + mortarH / 2;
      const h = rowHeight - mortarH;
      const offsetX = (r % 2 === 0) ? 0 : brickWidth * 0.5;

      for (let x = -brickWidth; x < size + brickWidth; x += brickWidth) {
        const xStart = x + offsetX + mortarV / 2;
        const w = brickWidth - mortarV;

        const brickColor = brickPalette[Math.floor(Math.random() * brickPalette.length)];
        ctx.fillStyle = brickColor;
        ctx.fillRect(xStart, yStart, w, h);

        // Weathering / kiln dark edge and micro noise
        ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
        ctx.fillRect(xStart, yStart, w, 3);
        ctx.fillRect(xStart, yStart + h - 3, w, 3);

        // Brick surface roughness (medium matte ~0.65 - 0.75)
        const roughVal = Math.floor(160 + Math.random() * 40);
        rCtx.fillStyle = `rgb(${roughVal}, ${roughVal}, ${roughVal})`;
        rCtx.fillRect(xStart, yStart, w, h);

        // Populate heightfield for normal map
        for (let py = Math.max(0, Math.floor(yStart)); py < Math.min(size, Math.floor(yStart + h)); py++) {
          for (let px = Math.max(0, Math.floor(xStart)); px < Math.min(size, Math.floor(xStart + w)); px++) {
            // Distance from brick edge for rounded beveled edge
            const edgeDist = Math.min(px - xStart, xStart + w - px, py - yStart, yStart + h - py);
            const bevel = Math.min(1.0, edgeDist / 4.0);
            const microNoise = (Math.random() - 0.5) * 0.08;
            heightField[py * size + px] = bevel * 0.85 + microNoise;
          }
        }
      }
    }

    const albedoTex = new THREE.CanvasTexture(albedoCanvas);
    albedoTex.wrapS = THREE.RepeatWrapping;
    albedoTex.wrapT = THREE.RepeatWrapping;
    albedoTex.repeat.set(repeat, repeat);
    albedoTex.anisotropy = 8;
    albedoTex.needsUpdate = true;

    const roughTex = new THREE.CanvasTexture(roughnessCanvas);
    roughTex.wrapS = THREE.RepeatWrapping;
    roughTex.wrapT = THREE.RepeatWrapping;
    roughTex.repeat.set(repeat, repeat);
    roughTex.needsUpdate = true;

    const normalTex = this._createNormalMapFromHeight(heightField, size, 1.8, repeat);

    const mat = new THREE.MeshStandardMaterial({
      map: albedoTex,
      normalMap: normalTex,
      normalScale: new THREE.Vector2(1.2, 1.2),
      roughnessMap: roughTex,
      roughness: 0.8,
      metalness: 0.05
    });

    this._cache.set(key, mat);
    return mat;
  }

  /**
   * 2. TERRACOTTA ROOF TILES PBR MATERIAL
   * Overlapping Spanish / French curved clay roof tiles with authentic terracotta ridges.
   */
  static getTerracottaRoofMaterial(repeat = 4) {
    const key = `roof_tiles_${repeat}`;
    if (this._cache.has(key)) return this._cache.get(key);

    const size = 1024;
    const albedoCanvas = document.createElement('canvas');
    albedoCanvas.width = size;
    albedoCanvas.height = size;
    const ctx = albedoCanvas.getContext('2d');

    const heightField = new Float32Array(size * size);
    const tileRows = 20;
    const tileCols = 16;
    const rowH = size / tileRows;
    const colW = size / tileCols;

    for (let y = 0; y < size; y++) {
      const rowIdx = Math.floor(y / rowH);
      const rowRelY = (y % rowH) / rowH; // 0 (top) to 1 (bottom overlap)

      for (let x = 0; x < size; x++) {
        const colRelX = (x % colW) / colW; // 0 to 1 across tile curve

        // Arch curve of cylindrical curved tile: sin wave across width
        const arch = Math.sin(colRelX * Math.PI);
        // Overlap step: stepped overlap where upper course covers lower
        const overlap = (1.0 - rowRelY * 0.35);

        const h = arch * overlap;
        heightField[y * size + x] = h;

        // Albedo coloring with terracotta tone gradient & shadow under overlap
        const shade = 0.75 + arch * 0.35 - (rowRelY < 0.15 ? 0.35 : 0);
        const r = Math.floor(190 * shade);
        const g = Math.floor(75 * shade);
        const b = Math.floor(45 * shade);

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }

    const albedoTex = new THREE.CanvasTexture(albedoCanvas);
    albedoTex.wrapS = THREE.RepeatWrapping;
    albedoTex.wrapT = THREE.RepeatWrapping;
    albedoTex.repeat.set(repeat, repeat);
    albedoTex.anisotropy = 8;
    albedoTex.needsUpdate = true;

    const normalTex = this._createNormalMapFromHeight(heightField, size, 2.2, repeat);

    const mat = new THREE.MeshStandardMaterial({
      map: albedoTex,
      normalMap: normalTex,
      normalScale: new THREE.Vector2(1.5, 1.5),
      roughness: 0.68,
      metalness: 0.08
    });

    this._cache.set(key, mat);
    return mat;
  }

  /**
   * 3. DARK AGED TIMBER / OAK BEAMS PBR MATERIAL
   * Deep longitudinal wood grain, dark rustic stain, saw marks and micro-crevices.
   */
  static getTimberMaterial(repeat = 2) {
    const key = `timber_${repeat}`;
    if (this._cache.has(key)) return this._cache.get(key);

    const size = 512;
    const albedoCanvas = document.createElement('canvas');
    albedoCanvas.width = size;
    albedoCanvas.height = size;
    const ctx = albedoCanvas.getContext('2d');

    const heightField = new Float32Array(size * size);

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        // High frequency wood grain along Y axis
        const grain1 = Math.sin(x * 0.25 + Math.sin(y * 0.04) * 4.0);
        const grain2 = Math.sin(x * 0.65 + Math.cos(y * 0.08) * 2.0);
        const fiber = (grain1 * 0.6 + grain2 * 0.4) * 0.5 + 0.5;

        heightField[y * size + x] = fiber * 0.6;

        const baseR = 55 + Math.floor(fiber * 30);
        const baseG = 28 + Math.floor(fiber * 18);
        const baseB = 10 + Math.floor(fiber * 12);

        ctx.fillStyle = `rgb(${baseR}, ${baseG}, ${baseB})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }

    const albedoTex = new THREE.CanvasTexture(albedoCanvas);
    albedoTex.wrapS = THREE.RepeatWrapping;
    albedoTex.wrapT = THREE.RepeatWrapping;
    albedoTex.repeat.set(repeat, repeat * 3);
    albedoTex.anisotropy = 8;
    albedoTex.needsUpdate = true;

    const normalTex = this._createNormalMapFromHeight(heightField, size, 1.4, repeat);

    const mat = new THREE.MeshStandardMaterial({
      map: albedoTex,
      normalMap: normalTex,
      normalScale: new THREE.Vector2(1.0, 1.0),
      roughness: 0.72,
      metalness: 0.05
    });

    this._cache.set(key, mat);
    return mat;
  }

  /**
   * 4. CHISELED STONE MASONRY PBR MATERIAL
   * Granite / basalt chiseled rock with deep mortar recesses for chimneys & foundations.
   */
  static getStoneMasonryMaterial(repeat = 2) {
    const key = `stone_${repeat}`;
    if (this._cache.has(key)) return this._cache.get(key);

    const size = 512;
    const albedoCanvas = document.createElement('canvas');
    albedoCanvas.width = size;
    albedoCanvas.height = size;
    const ctx = albedoCanvas.getContext('2d');

    const heightField = new Float32Array(size * size);

    ctx.fillStyle = '#475569';
    ctx.fillRect(0, 0, size, size);

    // Grid of irregular stone blocks
    const blockRows = 8;
    const rowH = size / blockRows;
    const blockCols = 6;
    const colW = size / blockCols;

    for (let r = 0; r < blockRows; r++) {
      const y0 = r * rowH;
      const offX = (r % 2 === 0) ? 0 : colW * 0.5;

      for (let c = -1; c <= blockCols + 1; c++) {
        const x0 = c * colW + offX;
        const pad = 4;
        const bw = colW - pad * 2;
        const bh = rowH - pad * 2;

        const gray = 90 + Math.floor(Math.random() * 40);
        ctx.fillStyle = `rgb(${gray}, ${gray + 4}, ${gray + 8})`;
        ctx.fillRect(x0 + pad, y0 + pad, bw, bh);

        for (let py = Math.max(0, Math.floor(y0 + pad)); py < Math.min(size, Math.floor(y0 + pad + bh)); py++) {
          for (let px = Math.max(0, Math.floor(x0 + pad)); px < Math.min(size, Math.floor(x0 + pad + bw)); px++) {
            const edge = Math.min(px - (x0 + pad), (x0 + pad + bw) - px, py - (y0 + pad), (y0 + pad + bh) - py);
            const bevel = Math.min(1.0, edge / 5.0);
            heightField[py * size + px] = bevel * 0.8 + (Math.random() - 0.5) * 0.12;
          }
        }
      }
    }

    const albedoTex = new THREE.CanvasTexture(albedoCanvas);
    albedoTex.wrapS = THREE.RepeatWrapping;
    albedoTex.wrapT = THREE.RepeatWrapping;
    albedoTex.repeat.set(repeat, repeat);
    albedoTex.anisotropy = 8;
    albedoTex.needsUpdate = true;

    const normalTex = this._createNormalMapFromHeight(heightField, size, 2.0, repeat);

    const mat = new THREE.MeshStandardMaterial({
      map: albedoTex,
      normalMap: normalTex,
      normalScale: new THREE.Vector2(1.4, 1.4),
      roughness: 0.88,
      metalness: 0.05
    });

    this._cache.set(key, mat);
    return mat;
  }

  /**
   * 5. TREE BARK PBR MATERIAL
   * Deep organic vertical bark fissures & textured ridges (Quillay / Boldo).
   */
  static getBarkMaterial(repeat = 2) {
    const key = `bark_${repeat}`;
    if (this._cache.has(key)) return this._cache.get(key);

    const size = 512;
    const albedoCanvas = document.createElement('canvas');
    albedoCanvas.width = size;
    albedoCanvas.height = size;
    const ctx = albedoCanvas.getContext('2d');

    const heightField = new Float32Array(size * size);

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        // Deep vertical wavy fissures
        const nx = x / size;
        const ny = y / size;
        const fissure = Math.abs(Math.sin(nx * Math.PI * 16 + Math.sin(ny * Math.PI * 8) * 3.0));
        const bump = Math.pow(fissure, 0.6);

        heightField[y * size + x] = bump * 0.85;

        const shade = 0.5 + bump * 0.5;
        const r = Math.floor(65 * shade);
        const g = Math.floor(45 * shade);
        const b = Math.floor(25 * shade);

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }

    const albedoTex = new THREE.CanvasTexture(albedoCanvas);
    albedoTex.wrapS = THREE.RepeatWrapping;
    albedoTex.wrapT = THREE.RepeatWrapping;
    albedoTex.repeat.set(repeat, repeat * 4);
    albedoTex.anisotropy = 8;
    albedoTex.needsUpdate = true;

    const normalTex = this._createNormalMapFromHeight(heightField, size, 2.5, repeat);

    const mat = new THREE.MeshStandardMaterial({
      map: albedoTex,
      normalMap: normalTex,
      normalScale: new THREE.Vector2(1.8, 1.8),
      roughness: 0.92,
      metalness: 0.02
    });

    this._cache.set(key, mat);
    return mat;
  }

  /**
   * 6. FOLIAGE PBR MATERIAL
   * Organic leaf cluster normals for soft volumetric light scattering.
   */
  static getFoliageMaterial() {
    const key = 'foliage_mat';
    if (this._cache.has(key)) return this._cache.get(key);

    const size = 512;
    const albedoCanvas = document.createElement('canvas');
    albedoCanvas.width = size;
    albedoCanvas.height = size;
    const ctx = albedoCanvas.getContext('2d');

    const heightField = new Float32Array(size * size);

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        // Multiple overlapping leaf bumps
        const l1 = Math.sin(x * 0.15) * Math.cos(y * 0.15);
        const l2 = Math.sin((x + y) * 0.22);
        const leafPattern = (l1 + l2) * 0.5 + 0.5;

        heightField[y * size + x] = leafPattern;

        const g = Math.floor(100 + leafPattern * 50);
        const r = Math.floor(25 + leafPattern * 25);
        const b = Math.floor(30 + leafPattern * 20);

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }

    const albedoTex = new THREE.CanvasTexture(albedoCanvas);
    albedoTex.wrapS = THREE.RepeatWrapping;
    albedoTex.wrapT = THREE.RepeatWrapping;
    albedoTex.repeat.set(3, 3);
    albedoTex.needsUpdate = true;

    const normalTex = this._createNormalMapFromHeight(heightField, size, 1.5, 3);

    const mat = new THREE.MeshStandardMaterial({
      map: albedoTex,
      normalMap: normalTex,
      normalScale: new THREE.Vector2(1.2, 1.2),
      roughness: 0.65,
      metalness: 0.05,
      vertexColors: true,
      flatShading: false
    });

    this._cache.set(key, mat);
    return mat;
  }
}
