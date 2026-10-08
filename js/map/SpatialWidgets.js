/**
 * AgriTwin - SpatialWidgets Module
 * 
 * Renders & updates spatial map UI overlays:
 *  - Rosa de los Vientos (Compass Rose synced with OrbitControls angle)
 *  - Sun Location Tracker (Sun position arc, Azimuth, Altitude, Sunrise/Sunset)
 *  - Escala de Espacialidad (Dynamic scale bar calibrated to camera frustum distance)
 */

export class SpatialWidgets {
  constructor(mapManager) {
    this.mapManager = mapManager;
    this.compassNeedleEl = null;
    this.compassDegreeEl = null;
    this.sunAzimuthEl = null;
    this.sunElevationEl = null;
    this.sunIconEl = null;
    this.scaleBarLineEl = null;
    this.scaleBarTextEl = null;

    this.initialized = false;
  }

  init() {
    this.compassNeedleEl = document.getElementById('compassNeedle');
    this.compassDegreeEl = document.getElementById('compassDegree');

    this.sunAzimuthEl = document.getElementById('sunAzimuthVal');
    this.sunElevationEl = document.getElementById('sunElevationVal');
    this.sunIconEl = document.getElementById('sunOrbWidget');

    this.scaleBarLineEl = document.getElementById('scaleBarLine');
    this.scaleBarTextEl = document.getElementById('scaleBarText');

    this.setupPanelMaestroToggle();

    this.initialized = true;
    this.update();
  }

  setupPanelMaestroToggle() {
    const panel = document.getElementById('panelMaestro');
    const header = document.getElementById('panelMaestroHeader');
    if (header && panel) {
      header.addEventListener('click', () => {
        panel.classList.toggle('collapsed');
      });
    }
  }

  /**
   * Main update loop called continuously on camera render frame
   */
  update() {
    if (!this.initialized || !this.mapManager || !this.mapManager.controls) return;

    this.updateCompass();
    this.updateSunWidget();
    this.updateScaleBar();
  }

  /**
   * Sync Compass Rose with Three.js camera azimuthal angle
   */
  updateCompass() {
    const controls = this.mapManager.controls;
    if (!controls) return;

    const azimuthRad = controls.getAzimuthalAngle();
    let deg = Math.round((azimuthRad * 180 / Math.PI + 360) % 360);

    if (this.compassNeedleEl) {
      this.compassNeedleEl.style.transform = `rotate(${-deg}deg)`;
    }
    if (this.compassDegreeEl) {
      this.compassDegreeEl.textContent = `${deg}°`;
    }
  }

  /**
   * Calculate Solar Azimuth & Elevation and update Sun location widget
   */
  updateSunWidget() {
    const hour = this.mapManager.hourOfDay || 12;
    const dayOfYear = this.mapManager.dayOfYear || 172;

    // Solar declination
    const declination = 23.45 * Math.sin((2 * Math.PI / 365) * (dayOfYear - 81)) * (Math.PI / 180);
    const hourAngle = (hour - 12) * 15 * (Math.PI / 180);
    const latRad = -36.14 * (Math.PI / 180); // Parral latitude

    const sinElevation = Math.sin(latRad) * Math.sin(declination) + Math.cos(latRad) * Math.cos(declination) * Math.cos(hourAngle);
    const elevationRad = Math.asin(Math.max(-1, Math.min(1, sinElevation)));
    const elevationDeg = Math.round(elevationRad * (180 / Math.PI));

    const cosAzimuth = (Math.sin(declination) - Math.sin(latRad) * sinElevation) / (Math.cos(latRad) * Math.cos(elevationRad));
    const azimuthRad = Math.atan2(Math.sin(hourAngle), cosAzimuth);
    let azimuthDeg = Math.round((azimuthRad * (180 / Math.PI) + 360) % 360);

    if (this.sunAzimuthEl) this.sunAzimuthEl.textContent = `${azimuthDeg}° Az`;
    if (this.sunElevationEl) this.sunElevationEl.textContent = `${elevationDeg}° Alt`;

    // Position sun icon orb on circular arc (0 - 180 deg)
    if (this.sunIconEl) {
      const normalizedHour = (hour - 6) / 14; // 0 at 06:00, 1 at 20:00
      const arcPercent = Math.max(0, Math.min(1, normalizedHour));
      const leftPos = Math.round(arcPercent * 100);
      const topPos = Math.round(Math.sin(arcPercent * Math.PI) * 45); // Curve height
      this.sunIconEl.style.left = `${leftPos}%`;
      this.sunIconEl.style.bottom = `${topPos}px`;
    }
  }

  /**
   * Recalculate physical scale bar distance based on camera distance
   */
  updateScaleBar() {
    const camera = this.mapManager.camera;
    const controls = this.mapManager.controls;
    if (!camera || !controls) return;

    // Distance from camera to orbit target
    const distance = camera.position.distanceTo(controls.target);

    // Calculate approximate meters visible across 100px bar
    const fovRad = camera.fov * (Math.PI / 180);
    const visibleHeightAtDistance = 2 * Math.tan(fovRad / 2) * distance;
    const metersPerPixel = visibleHeightAtDistance / window.innerHeight;

    const barPixelWidth = 90; // width of scale bar in pixels
    const totalMeters = metersPerPixel * barPixelWidth * 12; // Scale factor for farm coords

    let displayValue = '50 m';
    if (totalMeters > 1000) {
      displayValue = `${(Math.round(totalMeters / 100) / 10).toFixed(1)} km`;
    } else if (totalMeters > 500) {
      displayValue = '500 m';
    } else if (totalMeters > 200) {
      displayValue = '250 m';
    } else if (totalMeters > 80) {
      displayValue = '100 m';
    } else if (totalMeters > 30) {
      displayValue = '50 m';
    } else if (totalMeters > 15) {
      displayValue = '25 m';
    } else {
      displayValue = '10 m';
    }

    if (this.scaleBarTextEl) {
      this.scaleBarTextEl.textContent = displayValue;
    }
  }
}
