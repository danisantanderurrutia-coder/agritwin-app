/**
 * AgriTwin 3D - PBRSoilGenerator Module
 * Procedural PBR Soil Texture Generator (Normal & Roughness Maps)
 * 
 * Simulates:
 * - Directional agricultural plowing furrows (surcos de arado periódicos)
 * - Micro-topography with organic humus clods and gravel aggregate
 * - High-efficiency canvas-to-texture generation with seamless tiling (RepeatWrapping)
 */

export class PBRSoilGenerator {
  /**
   * Generates a seamless 1024×1024 Normal Map encoding agricultural furrows and humus texture.
   * Uses Sobel elevation gradients to construct tangent-space normal vectors.
   * 
   * @param {number} size - Resolution (e.g., 1024)
   * @returns {THREE.CanvasTexture}
   */
  static createSoilNormalMap(size = 1024) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(size, size);
    const data = imgData.data;

    // 1. Generate procedural heightfield (multi-scale organic soil aggregates & clods)
    const heightField = new Float32Array(size * size);

    for (let y = 0; y < size; y++) {
      const ny = y / size;

      for (let x = 0; x < size; x++) {
        const nx = x / size;

        // Smooth continuous organic soil aggregates (eliminates high-frequency noise/moiré)
        const clod1 = Math.sin(nx * Math.PI * 6 + ny * Math.PI * 4) * Math.cos(ny * Math.PI * 6 - nx * Math.PI * 4) * 0.45;
        const clod2 = Math.sin(nx * Math.PI * 14 - ny * Math.PI * 10) * Math.sin(ny * Math.PI * 12 + nx * Math.PI * 8) * 0.20;

        heightField[y * size + x] = clod1 + clod2;
      }
    }

    // 2. Compute Sobel normal gradients (dh/dx, dh/dy) with wrapping for seamless tiling
    const strength = 0.35; // Natural subtle micro-relief intensity (eliminates harsh moiré)

    for (let y = 0; y < size; y++) {
      const ym1 = (y - 1 + size) % size;
      const yp1 = (y + 1) % size;

      for (let x = 0; x < size; x++) {
        const xm1 = (x - 1 + size) % size;
        const xp1 = (x + 1) % size;

        // Horizontal Sobel kernel
        const dx = (
          -heightField[ym1 * size + xm1] + heightField[ym1 * size + xp1]
          - 2.0 * heightField[y * size + xm1] + 2.0 * heightField[y * size + xp1]
          - heightField[yp1 * size + xm1] + heightField[yp1 * size + xp1]
        ) * strength;

        // Vertical Sobel kernel
        const dy = (
          -heightField[ym1 * size + xm1] - 2.0 * heightField[ym1 * size + x] - heightField[ym1 * size + xp1]
          + heightField[yp1 * size + xm1] + 2.0 * heightField[yp1 * size + x] + heightField[yp1 * size + xp1]
        ) * strength;

        const dz = 1.0;

        // Normalize (nx, ny, nz)
        const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const nx = -dx / len;
        const ny = -dy / len;
        const nz = dz / len;

        const idx = (y * size + x) * 4;
        // Pack into 8-bit RGB normal map: [0, 255]
        data[idx]     = Math.floor((nx * 0.5 + 0.5) * 255); // Red = X
        data[idx + 1] = Math.floor((ny * 0.5 + 0.5) * 255); // Green = Y
        data[idx + 2] = Math.floor((nz * 0.5 + 0.5) * 255); // Blue = Z
        data[idx + 3] = 255;                                // Alpha
      }
    }

    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 8);
    texture.anisotropy = 8;
    texture.needsUpdate = true;
    return texture;
  }

  /**
   * Generates a 1024×1024 Roughness Map.
   * Furrow valleys hold moisture -> smoother/more specular (darker gray ~0.35)
   * Furrow crests are dry aerated soil -> rougher/matte (light gray ~0.88)
   * 
   * @param {number} size
   * @returns {THREE.CanvasTexture}
   */
  static createSoilRoughnessMap(size = 1024) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(size, size);
    const data = imgData.data;

    for (let y = 0; y < size; y++) {
      const ny = y / size;

      for (let x = 0; x < size; x++) {
        const nx = x / size;

        // Isotropic organic roughness: macro clods (0.75-0.92) with micro-variations
        const macro = Math.sin(nx * Math.PI * 12 + ny * Math.PI * 8) * 0.08;
        const micro = Math.cos(nx * Math.PI * 32 - ny * Math.PI * 28) * 0.05;

        // Natural agricultural earth roughness ~ 0.85
        let r = 0.85 + macro + micro;
        r = Math.max(0.65, Math.min(0.96, r));

        const byteVal = Math.floor(r * 255);
        const idx = (y * size + x) * 4;
        data[idx]     = byteVal;
        data[idx + 1] = byteVal;
        data[idx + 2] = byteVal;
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 8);
    texture.anisotropy = 8;
    texture.needsUpdate = true;
    return texture;
  }
}
