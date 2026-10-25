/**
 * AgriTwin - ProjectManager Module (.agritwin Format & GIS Shapefile Importer)
 * 
 * Manages:
 *  1. Project saving/loading (.agritwin JSON format).
 *  2. ESRI Shapefile (.zip with .shp/.dbf/.shx, or raw .shp) and GeoJSON imports.
 *  3. Dynamic 3D polygon projection, extrusion, and raycasting integration.
 */

import { bus } from '../utils/EventBus.js';
import { MapManager } from '../map/MapManager.js';

export class ProjectManager {
  constructor(app) {
    this.app = app;
    this.currentProject = {
      name: 'Fundo Colliguay (Parral, Maule)',
      author: 'AgroTech Chile & Rewild',
      created: new Date().toISOString(),
      parcels: [],
      customPolygons: []
    };

    this.importedLayersGroup = new THREE.Group();
    this.importedLayersGroup.name = 'importedGisLayers';
    this.stagedGeojson = null;
    this.stagedFileName = '';

    // If mapManager scene is ready, attach group
    if (this.app?.mapManager?.scene) {
      this.app.mapManager.scene.add(this.importedLayersGroup);
    }
  }

  ensureSceneGroup() {
    if (this.app?.mapManager?.scene && !this.importedLayersGroup.parent) {
      this.app.mapManager.scene.add(this.importedLayersGroup);
    }
  }

  static renderWelcomeModalHTML() {
    return `
      <div id="welcomeProjectModal" class="modal-overlay glass-modal-backdrop" style="display: none;">
        <div class="modal-container glass-panel width-medium">
          <div class="modal-header">
            <div class="modal-title-group">
              <img src="assets/agritwin_isotype_clean.png" width="36" height="36" alt="AgriTwin Logo" style="border-radius: 6px; object-fit: contain;">
              <div>
                <h2 class="modal-title">Bienvenido a AgriTwin 3D</h2>
                <div class="modal-subtitle">Gemelo Digital Agrícola by AgroTech Chile & Rewild</div>
              </div>
            </div>
          </div>

          <div class="modal-body" style="text-align: center; padding: 24px 16px;">
            <p style="color: var(--text-muted); margin-bottom: 24px; font-size: 0.95rem;">
              Selecciona cómo deseas comenzar a trabajar con tu gemelo digital espacial.
            </p>

            <div class="project-option-cards">
              <div class="option-card glass-panel" id="btnProjectDefault">
                <div class="option-icon">🌾</div>
                <h3>Fundo Estero Colliguay</h3>
                <p>Cargar proyecto predeterminado con parcelas, sensores IoT y cobertura de frutales y bosque nativo.</p>
                <button class="btn-primary" style="margin-top: 12px; width: 100%;">Abrir Fundo Colliguay</button>
              </div>

              <div class="option-card glass-panel" id="btnProjectNew">
                <div class="option-icon">✨</div>
                <h3>Crear Nuevo Proyecto</h3>
                <p>Iniciar un predio en blanco con herramientas de dibujo vectorial 3D y trazado de parcelas desde cero.</p>
                <button class="btn-secondary" style="margin-top: 12px; width: 100%;">Nuevo Predio</button>
              </div>

              <div class="option-card glass-panel" id="btnProjectOpen">
                <div class="option-icon">📁</div>
                <h3>Abrir Proyecto (.agritwin)</h3>
                <p>Cargar un archivo de proyecto guardado previamente o importar capas vectoriales GIS.</p>
                <input type="file" id="agritwinFileInput" accept=".agritwin,.json" style="display:none;">
                <button class="btn-secondary" style="margin-top: 12px; width: 100%;">Examinar Archivo</button>
              </div>
            </div>

            <div class="shapefile-import-box glass-panel" style="margin-top: 20px; padding: 14px 18px; background: rgba(6,182,212,0.08); border: 1px solid rgba(6,182,212,0.25); display: flex; align-items: center; justify-content: space-between;">
              <div style="text-align: left;">
                <div style="font-size: 0.9rem; font-weight: 600; color: var(--accent-cyan);">🗺️ ¿Tienes archivos vectoriales GIS?</div>
                <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 2px;">Carga polígonos ESRI Shapefile (.zip / .shp) o GeoJSON (.geojson) directamente al terreno 3D.</div>
              </div>
              <button id="btnOpenShapefileImporter" class="btn-tool-sm" style="border-color: var(--accent-cyan); white-space: nowrap; margin-left: 14px;">Importar Shapefile (.shp / GeoJSON)</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  static renderShapefileModalHTML() {
    return `
      <!-- MODAL: Importador de Shapefiles & GeoJSON -->
      <div id="shapefileModal" class="modal-overlay glass-modal-backdrop" style="display: none;">
        <div class="modal-container glass-panel width-medium">
          <div class="modal-header">
            <div class="modal-title-group">
              <span style="font-size: 1.6rem;">🗺️</span>
              <div>
                <h3 class="modal-title">Importar Capas GIS (Shapefile / GeoJSON)</h3>
                <div class="modal-subtitle">Proyecta y extruye parcelas vectoriales en el Gemelo Digital 3D</div>
              </div>
            </div>
            <button id="closeShapefileModalBtn" class="close-btn">&times;</button>
          </div>

          <div class="modal-body" style="padding: 16px 8px;">
            <!-- Dropzone -->
            <div id="gisDropzone" class="gis-dropzone glass-panel" style="border: 2px dashed rgba(6,182,212,0.45); border-radius: 14px; padding: 32px 20px; text-align: center; cursor: pointer; transition: all 0.25s ease; background: rgba(6,182,212,0.04);">
              <div style="font-size: 2.6rem; margin-bottom: 8px;">📂</div>
              <div style="font-weight: 700; color: #fff; font-size: 1.02rem; margin-bottom: 6px;">Haz clic o arrastra tu archivo GIS aquí</div>
              <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 14px; line-height: 1.4;">
                Formatos compatibles: <strong>.zip</strong> (Shapefile completo con .shp, .dbf, .shx, .prj), archivo <strong>.shp</strong> o <strong>.geojson</strong> / <strong>.json</strong>.
              </div>
              <button type="button" class="btn-primary" style="pointer-events: none; padding: 7px 16px; font-size: 0.82rem;">Seleccionar Archivo</button>
              <input type="file" id="gisFileInput" accept=".zip,.shp,.geojson,.json" style="display: none;">
            </div>

            <!-- Previsualización de Datos Cargados -->
            <div id="gisPreviewSection" style="display: none; margin-top: 16px;">
              <div class="glass-card" style="border-left: 3px solid var(--accent-cyan); background: rgba(6,182,212,0.07);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                  <strong id="gisFileName" style="color: #fff; font-size: 0.92rem;">archivo.geojson</strong>
                  <span id="gisFeatureBadge" class="selected-family-badge">4 Polígonos</span>
                </div>
                <div style="font-size: 0.8rem; color: var(--text-secondary); display: grid; grid-template-columns: 1fr 1fr; gap: 8px;" id="gisMetaGrid">
                  <div>Superficie estimada: <strong id="gisAreaVal" style="color: var(--accent-emerald);">0.0 ha</strong></div>
                  <div>Tipo espacial: <strong id="gisTypeVal" style="color: var(--accent-cyan);">Polygon</strong></div>
                  <div>Capas vectoriales: <strong id="gisLayersCount" style="color: #fff;">1 capa</strong></div>
                  <div>Estado de carga: <strong style="color: var(--accent-emerald);">Listo para proyectar</strong></div>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer" style="display: flex; justify-content: space-between; align-items: center; margin-top: 16px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 14px;">
            <span style="font-size: 0.76rem; color: var(--text-muted); max-width: 60%;">
              ℹ️ Los polígonos se centrarán y adaptarán automáticamente al relieve 3D del predio.
            </span>
            <div style="display: flex; gap: 10px;">
              <button id="cancelShapefileBtn" class="btn-secondary">Cancelar</button>
              <button id="btnProcessGisImport" class="btn-primary" disabled style="opacity: 0.5;">✅ Cargar al Gemelo 3D</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  setupImporterUI() {
    this.ensureSceneGroup();

    const shapefileModal = document.getElementById('shapefileModal');
    const welcomeModal = document.getElementById('welcomeProjectModal');
    const btnOpenShp = document.getElementById('btnOpenShapefileImporter');
    const closeBtn = document.getElementById('closeShapefileModalBtn');
    const cancelBtn = document.getElementById('cancelShapefileBtn');
    const dropzone = document.getElementById('gisDropzone');
    const fileInput = document.getElementById('gisFileInput');
    const processBtn = document.getElementById('btnProcessGisImport');

    const openImporter = () => {
      if (welcomeModal) welcomeModal.style.display = 'none';
      if (shapefileModal) {
        shapefileModal.style.display = 'flex';
        this.resetImporterUI();
      }
    };

    const closeImporter = () => {
      if (shapefileModal) shapefileModal.style.display = 'none';
      this.resetImporterUI();
    };

    if (btnOpenShp) btnOpenShp.addEventListener('click', openImporter);
    if (closeBtn) closeBtn.addEventListener('click', closeImporter);
    if (cancelBtn) cancelBtn.addEventListener('click', closeImporter);

    // Dropzone interaction
    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());

      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = 'var(--accent-emerald)';
        dropzone.style.background = 'rgba(16,185,129,0.12)';
      });

      const resetDropzoneStyle = () => {
        dropzone.style.borderColor = 'rgba(6,182,212,0.45)';
        dropzone.style.background = 'rgba(6,182,212,0.04)';
      };

      dropzone.addEventListener('dragleave', resetDropzoneStyle);

      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        resetDropzoneStyle();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          this.handleFileSelected(e.dataTransfer.files[0]);
        }
      });

      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
          this.handleFileSelected(e.target.files[0]);
        }
      });
    }

    if (processBtn) {
      processBtn.addEventListener('click', () => {
        this.applyStagedGisImport();
        closeImporter();
      });
    }

    this.openImporterModal = openImporter;
    if (typeof window !== 'undefined') {
      window.openGisImporter = () => openImporter();
    }
  }

  resetImporterUI() {
    this.stagedGeojson = null;
    this.stagedFileName = '';

    const preview = document.getElementById('gisPreviewSection');
    const processBtn = document.getElementById('btnProcessGisImport');
    const fileInput = document.getElementById('gisFileInput');

    if (preview) preview.style.display = 'none';
    if (processBtn) {
      processBtn.disabled = true;
      processBtn.style.opacity = '0.5';
    }
    if (fileInput) fileInput.value = '';
  }

  async handleFileSelected(file) {
    const preview = document.getElementById('gisPreviewSection');
    const fileNameEl = document.getElementById('gisFileName');
    const badgeEl = document.getElementById('gisFeatureBadge');
    const areaValEl = document.getElementById('gisAreaVal');
    const typeValEl = document.getElementById('gisTypeVal');
    const processBtn = document.getElementById('btnProcessGisImport');

    const ext = file.name.split('.').pop().toLowerCase();
    this.stagedFileName = file.name;

    try {
      let geojson = null;

      if (ext === 'zip') {
        // ESRI Shapefile compressed archive (.zip)
        if (typeof window !== 'undefined' && window.shp) {
          const buffer = await file.arrayBuffer();
          geojson = await window.shp(buffer);
        } else {
          throw new Error('La librería shpjs para Shapefiles no está cargada. Usa GeoJSON o verifica tu conexión.');
        }
      } else if (ext === 'shp') {
        // Raw single .shp binary file
        if (typeof window !== 'undefined' && window.shp && window.shp.parseShp) {
          const buffer = await file.arrayBuffer();
          const geoms = window.shp.parseShp(buffer);
          geojson = {
            type: 'FeatureCollection',
            features: geoms.map((geom, idx) => ({
              type: 'Feature',
              properties: { id: `shp_${idx + 1}`, name: `Parcela ${idx + 1}` },
              geometry: geom
            }))
          };
        } else {
          throw new Error('Para archivos Shapefile ESRI completos, se recomienda subir el archivo .zip con .shp y .dbf.');
        }
      } else if (ext === 'geojson' || ext === 'json') {
        const text = await file.text();
        geojson = JSON.parse(text);
      } else {
        throw new Error(`Formato .${ext} no soportado. Sube .zip, .shp o .geojson.`);
      }

      // If shp returned an array of layers, take the first one with polygons
      if (Array.isArray(geojson)) {
        geojson = geojson.find(layer => layer.type === 'FeatureCollection' && layer.features?.length > 0) || geojson[0];
      }

      if (!geojson || (!geojson.features && geojson.type === 'Polygon')) {
        // Wrap single polygon into feature collection
        if (geojson.type === 'Polygon') {
          geojson = {
            type: 'FeatureCollection',
            features: [{ type: 'Feature', properties: { name: 'Parcela' }, geometry: geojson }]
          };
        }
      }

      if (!geojson.features || geojson.features.length === 0) {
        throw new Error('El archivo no contiene entidades vectoriales reconocibles.');
      }

      // Count polygon geometries
      let polyCount = 0;
      let totalEstHa = 0;

      geojson.features.forEach((f, idx) => {
        if (!f.properties) f.properties = {};
        if (!f.properties.id) f.properties.id = `GIS_${idx + 1}`;
        if (!f.properties.name) f.properties.name = f.properties.nombre || f.properties.PARCELA || f.properties.NAME || `Parcela ${idx + 1}`;

        const geomType = f.geometry?.type;
        if (geomType === 'Polygon' || geomType === 'MultiPolygon') {
          polyCount++;
          // Approximate area calculation
          const coords = geomType === 'Polygon' ? f.geometry.coordinates[0] : f.geometry.coordinates[0][0];
          if (coords && coords.length >= 3) {
            totalEstHa += this.calculateApproxHectares(coords);
          }
        }
      });

      this.stagedGeojson = geojson;

      if (fileNameEl) fileNameEl.textContent = file.name;
      if (badgeEl) badgeEl.textContent = `${polyCount} Polígonos`;
      if (areaValEl) areaValEl.textContent = `${totalEstHa > 0 ? totalEstHa.toFixed(1) : (polyCount * 2.5).toFixed(1)} ha`;
      if (typeValEl) typeValEl.textContent = polyCount > 0 ? 'Polígonos 3D' : 'Puntos / Líneas';
      if (preview) preview.style.display = 'block';

      if (processBtn) {
        processBtn.disabled = false;
        processBtn.style.opacity = '1';
      }

      bus.emit('ui:show_toast', `📂 Archivo '${file.name}' analizado: ${polyCount} polígonos detectados.`);
    } catch (err) {
      console.error('Error parseando archivo GIS:', err);
      alert(`⚠️ Error al leer el archivo: ${err.message}`);
      this.resetImporterUI();
    }
  }

  calculateApproxHectares(coords) {
    if (!coords || coords.length < 3) return 0;
    let area = 0;
    for (let i = 0; i < coords.length - 1; i++) {
      area += coords[i][0] * coords[i + 1][1] - coords[i + 1][0] * coords[i][1];
    }
    const degArea = Math.abs(area) / 2;
    // rough conversion at 36°S: 1 sq degree ~ 88000m * 111000m / 10000 = ~976,800 ha
    return degArea * 950000;
  }

  applyStagedGisImport() {
    if (!this.stagedGeojson || !this.stagedGeojson.features) return;
    this.ensureSceneGroup();

    const features = this.stagedGeojson.features;
    let importedCount = 0;

    // Calculate bounding box of all polygons to decide if normalization is needed
    let minLon = Infinity, maxLon = -Infinity;
    let minLat = Infinity, maxLat = -Infinity;

    features.forEach(f => {
      const gType = f.geometry?.type;
      if (gType === 'Polygon' || gType === 'MultiPolygon') {
        const rings = gType === 'Polygon' ? f.geometry.coordinates : f.geometry.coordinates[0];
        rings.forEach(ring => {
          ring.forEach(([lon, lat]) => {
            if (lon < minLon) minLon = lon;
            if (lon > maxLon) maxLon = lon;
            if (lat < minLat) minLat = lat;
            if (lat > maxLat) maxLat = lat;
          });
        });
      }
    });

    const isBundledCoords = (minLon < -100 && maxLat > 20);
    const isMauleCoords = (minLon > -75 && maxLon < -70 && minLat > -40 && maxLat < -34);

    const centerLon = (minLon + maxLon) / 2;
    const centerLat = (minLat + maxLat) / 2;
    const spanLon = Math.max(maxLon - minLon, 0.0001);
    const spanLat = Math.max(maxLat - minLat, 0.0001);

    // Target scene span is ~40-60 units on the 180x180 terrain
    const normScaleX = 50.0 / spanLon;
    const normScaleZ = 50.0 / spanLat;

    const palette = ['#10b981', '#06b6d4', '#f59e0b', '#65a30d', '#8b5cf6', '#ef4444', '#ca8a04'];

    features.forEach((feature, idx) => {
      const gType = feature.geometry?.type;
      if (gType !== 'Polygon' && gType !== 'MultiPolygon') return;

      const rawRings = gType === 'Polygon' ? feature.geometry.coordinates : feature.geometry.coordinates[0];
      const outerRing = rawRings[0];
      if (!outerRing || outerRing.length < 3) return;

      const shapePoints = [];
      let centerSumX = 0;
      let centerSumZ = 0;

      outerRing.forEach(([lon, lat]) => {
        let vx, vz;
        if (isBundledCoords || isMauleCoords) {
          const v = MapManager.latLonToVector3(lon, lat);
          vx = v.x;
          vz = v.z;
        } else {
          // Normalize custom world coordinates to fit on center of farm
          vx = (lon - centerLon) * normScaleX;
          vz = -(lat - centerLat) * normScaleZ;
        }

        shapePoints.push(new THREE.Vector2(vx, vz));
        centerSumX += vx;
        centerSumZ += vz;
      });

      const centerX = centerSumX / outerRing.length;
      const centerZ = centerSumZ / outerRing.length;

      const shape = new THREE.Shape(shapePoints);
      const extrudeSettings = { depth: 0.65, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.15, bevelThickness: 0.15 };
      const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      geometry.rotateX(Math.PI / 2);

      const color = palette[idx % palette.length];
      const material = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.65,
        transparent: true,
        opacity: 0.72
      });

      const fieldMesh = new THREE.Mesh(geometry, material);
      fieldMesh.position.y = 0.45;
      fieldMesh.castShadow = true;
      fieldMesh.receiveShadow = true;

      // Border line for crisp vector clarity
      const borderPts = shapePoints.map(p => new THREE.Vector3(p.x, 0.48 + 0.65, p.y));
      borderPts.push(borderPts[0]);
      const borderGeo = new THREE.BufferGeometry().setFromPoints(borderPts);
      const borderMat = new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.85 });
      const borderLine = new THREE.Line(borderGeo, borderMat);

      const polyGroup = new THREE.Group();
      polyGroup.add(fieldMesh);
      polyGroup.add(borderLine);

      const props = feature.properties || {};
      const polyName = props.name || props.nombre || props.id || `Parcela GIS ${idx + 1}`;
      const entityData = {
        type: 'parcel',
        id: `gis_${props.id || idx + 1}`,
        name: polyName,
        parcelId: props.id || `GIS-${idx + 1}`,
        crop: props.crop || props.cultivo || props.uso || 'Capa GIS Importada',
        areaHa: props.area_ha || props.hectareas || (shapePoints.length * 0.4).toFixed(1),
        ndvi: props.ndvi || 0.75,
        soilType: props.soil_type || 'Franco Arcilloso',
        irrigationType: props.irrigation_type || 'Goteo Tecnificado',
        status: 'Óptimo'
      };

      fieldMesh.userData = entityData;
      polyGroup.userData = entityData;

      this.importedLayersGroup.add(polyGroup);

      if (this.app?.mapManager?.addPickable) {
        this.app.mapManager.addPickable(fieldMesh, entityData);
      }

      // Add 3D hex billboard badge at centroid
      this.addGisBadge(centerX, centerZ, '🗺️', entityData, polyGroup);

      importedCount++;
    });

    bus.emit('ui:show_toast', `🗺️ Capa GIS '${this.stagedFileName}' importada con éxito: ${importedCount} polígonos integrados.`);
    
    // Fly camera smoothly to overview
    if (this.app?.mapManager?.flyToPreset) {
      this.app.mapManager.flyToPreset('overview');
    }
  }

  addGisBadge(x, z, symbol, entityData, parentGroup) {
    const badgeGroup = new THREE.Group();
    badgeGroup.position.set(x, 6.0, z);

    const outerGeo = new THREE.CylinderGeometry(1.5, 1.5, 0.3, 6);
    const outerMat = new THREE.MeshStandardMaterial({ color: '#0284c7', metalness: 0.7, roughness: 0.3, flatShading: true });
    const outerMesh = new THREE.Mesh(outerGeo, outerMat);
    outerMesh.castShadow = true;
    badgeGroup.add(outerMesh);

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 128, 128);
    ctx.font = '64px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(symbol, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const topGeo = new THREE.CircleGeometry(1.1, 6);
    topGeo.rotateX(-Math.PI / 2);
    const topMat = new THREE.MeshBasicMaterial({ map: texture });
    const topMesh = new THREE.Mesh(topGeo, topMat);
    topMesh.position.y = 0.18;
    badgeGroup.add(topMesh);

    parentGroup.add(badgeGroup);

    if (this.app?.mapManager?.addAnimated) {
      this.app.mapManager.addAnimated(badgeGroup, (time) => {
        badgeGroup.position.y = 6.0 + Math.sin(time * 0.003 + x) * 0.3;
        badgeGroup.rotation.y = Math.sin(time * 0.001) * 0.12;
      });
    }
  }

  exportProject() {
    const movedRaw = localStorage.getItem('agritwin_moved_objects') || '{}';
    let movedObjects = {};
    try { movedObjects = JSON.parse(movedRaw); } catch (e) {}

    const projectData = {
      ...this.currentProject,
      exportedAt: new Date().toISOString(),
      version: '2.0.0',
      customPolygons: this.app?.drawingManager ? this.app.drawingManager.customPolygons : [],
      movedObjects: movedObjects
    };

    const jsonStr = JSON.stringify(projectData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.currentProject.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.agritwin`;
    a.click();
    URL.revokeObjectURL(url);

    bus.emit('ui:show_toast', '💾 Proyecto exportado en formato .agritwin exitosamente.');
  }

  async loadProjectFile(file) {
    try {
      const text = await file.text();
      const projectData = JSON.parse(text);
      this.currentProject = projectData;

      // Restore custom polygons into scene
      if (Array.isArray(projectData.customPolygons) && this.app?.drawingManager) {
        this.app.drawingManager.clearAllPolygons();
        projectData.customPolygons.forEach(item => {
          if (item.points && item.points.length >= 3) {
            const pts = item.points.map(p => new THREE.Vector3(p.x, p.y, p.z));
            this.app.drawingManager.renderFinal3DPolygon(pts, item.itemDetails || item, item.areaHa);
          }
        });
      }

      // Restore moved objects
      if (projectData.movedObjects) {
        localStorage.setItem('agritwin_moved_objects', JSON.stringify(projectData.movedObjects));
        if (this.app?.drawingManager) {
          this.app.drawingManager.restoreMovedObjectPositions();
        }
      }

      bus.emit('ui:show_toast', `📂 Proyecto '${projectData.name}' cargado correctamente.`);
      const modal = document.getElementById('welcomeProjectModal');
      if (modal) modal.style.display = 'none';
    } catch (err) {
      console.error('Error parseando proyecto:', err);
      alert('⚠️ El archivo seleccionado no es un proyecto .agritwin válido.');
    }
  }
}

