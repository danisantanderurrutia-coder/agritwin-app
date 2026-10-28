/**
 * AgriTwin - WindyBasinEngine
 * Flow Field Visualizer for Macro-Cuenca & Predio Atmospheric Layers
 */
export class WindyBasinEngine {
  constructor(mapManager) {
    this.mapManager = mapManager;
    this.enabled = false;
    this.layer = 'wind';
    this.altitude = 10;
    this.model = 'ecmwf';
    this.particleSpeedMultiplier = 1.0;
    this.particleMaterial = {
      uniforms: {
        uOpacity: { value: 0.75 }
      }
    };
  }

  async init() {
    return this;
  }

  toggle(active) {
    this.enabled = typeof active === 'boolean' ? active : !this.enabled;
    if (this.mapManager && typeof this.mapManager.togglePuelcheWind === 'function') {
      this.mapManager.togglePuelcheWind(this.enabled);
    }
  }

  setLayer(layer) {
    this.layer = layer;
  }

  setAltitude(altM) {
    this.altitude = altM;
  }

  setModel(model) {
    this.model = model;
  }
}
