/**
 * AgriTwin - Interactive 3D Botanical Fruit Inspector (Three.js PBR Viewer)
 * 
 * Permite la rotación interactiva e inspección de calidad de cosecha en 3D (Avocado.glb / Hass Export)
 */

export class Fruit3DViewer {
  constructor() {
    this.animId = null;
  }

  initViewer() {
    const canvas = document.getElementById('fruit_3d_canvas');
    const container = document.getElementById('fruit_3d_container');
    const loadingEl = document.getElementById('fruit_3d_loading');
    if (!canvas || !container || typeof THREE === 'undefined') return;

    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }

    const width = container.clientWidth || 280;
    const height = container.clientHeight || 160;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);
    camera.position.set(0, 0, 3.2);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const ambLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambLight);

    const dirLight = new THREE.DirectionalLight(0xfffbeb, 2.0);
    dirLight.position.set(3, 4, 3);
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.8);
    fillLight.position.set(-3, -2, -2);
    scene.add(fillLight);

    let fruitMesh = null;
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    canvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      canvas.style.cursor = 'grabbing';
    });
    window.addEventListener('mouseup', () => {
      isDragging = false;
      if (canvas) canvas.style.cursor = 'grab';
    });
    window.addEventListener('mousemove', (e) => {
      if (!isDragging || !fruitMesh) return;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      fruitMesh.rotation.y += dx * 0.015;
      fruitMesh.rotation.x += dy * 0.015;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    });

    const loader = (typeof THREE.GLTFLoader !== 'undefined') ? new THREE.GLTFLoader() : null;
    if (loader) {
      loader.load(
        'assets/models/Avocado.glb',
        (gltf) => {
          fruitMesh = gltf.scene;
          fruitMesh.scale.set(28, 28, 28);
          fruitMesh.position.set(0, -0.85, 0);
          scene.add(fruitMesh);
          if (loadingEl) loadingEl.style.display = 'none';
        },
        undefined,
        () => {
          if (loadingEl) loadingEl.textContent = 'Fruta PBR Procedural';
        }
      );
    }

    const animate = () => {
      if (!document.getElementById('fruit_3d_canvas')) return;
      this.animId = requestAnimationFrame(animate);
      if (fruitMesh && !isDragging) {
        fruitMesh.rotation.y += 0.012;
      }
      renderer.render(scene, camera);
    };
    animate();
  }

  destroy() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }
}

export const fruit3DViewer = new Fruit3DViewer();
