/**
 * AgriTwin - DrawingManager Module (Herramienta Pincel & Catálogo de Ítems 3D)
 *
 * Allows interactive vector polygon drawing on the 3D map terrain,
 * cataloging elements, calculating spatial area (ha), and rendering accurate
 * 3D models and floating billboard badges for each catalog item.
 */

import { bus } from '../utils/EventBus.js';

// Shared geometry instances for drawing nodes
const SHARED_NODE_GEO = new THREE.SphereGeometry(0.6, 12, 12);
const SHARED_NODE_MAT = new THREE.MeshBasicMaterial({ color: '#facc15' });

/**
 * Recursively disposes all geometries and materials inside a Three.js Object3D.
 */
function disposeObject3D(obj) {
  if (!obj) return;
  if (obj.geometry) {
    obj.geometry.dispose();
  }
  if (obj.material) {
    if (Array.isArray(obj.material)) {
      obj.material.forEach(m => m.dispose());
    } else {
      obj.material.dispose();
    }
  }
  if (obj.children && obj.children.length > 0) {
    [...obj.children].forEach(child => disposeObject3D(child));
  }
}

export class DrawingManager {
  constructor(mapManager) {
    this.mapManager = mapManager;
    this.isDrawingActive = false;
    this.isEraseMode = false;
    this.isMoveMode = false;
    this.selectedMoveObject = null;
    this.moveSelectionHelper = null;
    this.pointerDownX = 0;
    this.pointerDownY = 0;
    this.pointerDownTime = 0;
    this.draggedObject = null;
    this.dragOffset = new THREE.Vector3();

    this.currentPoints = [];
    this.tempNodesGroup = new THREE.Group();
    this.drawnPolygonsGroup = new THREE.Group();

    this.mouseLine = null;
    this.customPolygons = [];
    this.polygonsMap = new Map(); // id -> { group, mesh, borderLine, centroidGroup, points, areaHa, elementMeta }

    this.init();
  }

  init() {
    if (this.mapManager.scene) {
      this.mapManager.scene.add(this.tempNodesGroup);
      this.mapManager.scene.add(this.drawnPolygonsGroup);
    }

    this.setupEventListeners();

    // Auto-load previously saved custom polygons and moved object positions
    setTimeout(() => {
      this.loadFromLocalStorage();
      this.restoreMovedObjectPositions();
    }, 400);
  }

  setupEventListeners() {
    const container = document.getElementById(this.mapManager.containerId);
    if (!container) return;

    container.addEventListener('click', (e) => this.onMapClick(e));
    container.addEventListener('mousemove', (e) => this.onMouseMove(e));

    // Double-click to close polygon instantly
    container.addEventListener('dblclick', (e) => {
      if (this.isDrawingActive && this.currentPoints.length >= 3) {
        e.preventDefault();
        e.stopPropagation();
        this.finishPolygon();
      }
    });

    // Move / Hand tool drag listeners
    container.addEventListener('pointerdown', (e) => this.onPointerDown(e));
    window.addEventListener('pointermove', (e) => this.onPointerMove(e));
    window.addEventListener('pointerup', (e) => this.onPointerUp(e));

    // Floating HUD button listeners
    const btnFinish = document.getElementById('btnHudFinishPoly');
    if (btnFinish) btnFinish.addEventListener('click', () => this.finishPolygon());
    const btnCancel = document.getElementById('btnHudCancelPoly');
    if (btnCancel) btnCancel.addEventListener('click', () => this.cancelDrawing());
    const btnDeselectMove = document.getElementById('btnHudDeselectMove');
    if (btnDeselectMove) btnDeselectMove.addEventListener('click', () => this.deselectMoveObject());
    const btnExitMove = document.getElementById('btnHudExitMove');
    if (btnExitMove) btnExitMove.addEventListener('click', () => this.toggleMoveMode(false));

    // Soporte Táctil (Tap to place node on Mobile & Tablet)
    let touchStartTime = 0;
    let touchStartX = 0;
    let touchStartY = 0;

    container.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1 && (this.isDrawingActive || this.isEraseMode)) {
        touchStartTime = Date.now();
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
      if ((this.isDrawingActive || this.isEraseMode) && e.changedTouches && e.changedTouches.length > 0) {
        const dt = Date.now() - touchStartTime;
        const dist = Math.hypot(e.changedTouches[0].clientX - touchStartX, e.changedTouches[0].clientY - touchStartY);
        if (dt < 350 && dist < 14) {
          const syntheticEvent = {
            clientX: e.changedTouches[0].clientX,
            clientY: e.changedTouches[0].clientY
          };
          this.onMapClick(syntheticEvent);
        }
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.isDrawingActive) this.cancelDrawing();
        if (this.selectedMoveObject) {
          this.deselectMoveObject();
        } else if (this.isMoveMode) {
          this.toggleMoveMode(false);
        }
      } else if (e.key === 'Enter') {
        if (this.isDrawingActive && this.currentPoints.length >= 3) {
          this.finishPolygon();
        }
      }
    });
  }

  toggleDrawingMode(active) {
    this.isDrawingActive = active;
    this.isEraseMode = false;
    this.isMoveMode = false;

    const container = document.getElementById(this.mapManager.containerId);
    if (container) {
      container.style.cursor = active ? 'crosshair' : 'default';
    }

    const drawHud = document.getElementById('drawingHudPill');
    if (drawHud) {
      drawHud.style.display = active ? 'flex' : 'none';
      const text = document.getElementById('drawingHudText');
      if (text) text.textContent = '✏️ Trazando polígono (haz clic en el terreno)...';
      const btnF = document.getElementById('btnHudFinishPoly');
      if (btnF) btnF.style.display = 'none';
    }

    const moveHud = document.getElementById('moveHudPill');
    if (moveHud) moveHud.style.display = 'none';

    if (!active) {
      this.clearTempNodes();
    }
  }

  toggleEraseMode(active) {
    this.isEraseMode = active;
    this.isDrawingActive = false;
    this.isMoveMode = false;

    const container = document.getElementById(this.mapManager.containerId);
    if (container) {
      container.style.cursor = active ? 'not-allowed' : 'default';
    }

    const drawHud = document.getElementById('drawingHudPill');
    if (drawHud) drawHud.style.display = 'none';
    const moveHud = document.getElementById('moveHudPill');
    if (moveHud) moveHud.style.display = 'none';

    this.clearTempNodes();
  }

  toggleMoveMode(active) {
    this.isMoveMode = active;
    this.isDrawingActive = false;
    this.isEraseMode = false;
    this.deselectMoveObject();

    const container = document.getElementById(this.mapManager.containerId);
    if (container) {
      container.style.cursor = active ? 'pointer' : 'default';
    }

    const moveHud = document.getElementById('moveHudPill');
    if (moveHud) moveHud.style.display = active ? 'flex' : 'none';

    const drawHud = document.getElementById('drawingHudPill');
    if (drawHud) drawHud.style.display = 'none';

    this.updateMoveHudText('✋ <strong>Modo Mover:</strong> 1. Haz clic sobre el objeto o cultivo a mover.', false);

    if (active) {
      bus.emit('ui:show_toast', '✋ Modo Mover: 1. Haz clic en el objeto a mover y 2. Haz clic en el terreno donde quieras dejarlo.');
    }
  }

  deselectMoveObject() {
    this.clearMoveSelectionHelper();
    this.selectedMoveObject = null;
    this.updateMoveHudText('✋ <strong>Modo Mover:</strong> 1. Haz clic sobre el objeto o cultivo a mover.', false);
    const container = document.getElementById(this.mapManager.containerId);
    if (container && this.isMoveMode) {
      container.style.cursor = 'pointer';
    }
  }

  updateMoveHudText(htmlText, hasSelected) {
    const textEl = document.getElementById('moveHudText');
    if (textEl) textEl.innerHTML = htmlText;
    const btnDeselect = document.getElementById('btnHudDeselectMove');
    if (btnDeselect) btnDeselect.style.display = hasSelected ? 'inline-block' : 'none';
  }

  showMoveSelectionHelper(target) {
    this.clearMoveSelectionHelper();
    if (!target || !this.mapManager?.scene) return;
    try {
      this.moveSelectionHelper = new THREE.BoxHelper(target, 0x38bdf8);
      this.moveSelectionHelper.name = 'moveSelectionHelper';
      this.moveSelectionHelper.renderOrder = 999;
      if (this.moveSelectionHelper.material) {
        this.moveSelectionHelper.material.depthTest = false;
        this.moveSelectionHelper.material.transparent = true;
        this.moveSelectionHelper.material.opacity = 0.95;
      }
      this.mapManager.scene.add(this.moveSelectionHelper);
    } catch (e) {
      console.warn('Could not create BoxHelper for move selection:', e);
    }
  }

  clearMoveSelectionHelper() {
    if (this.moveSelectionHelper) {
      if (this.moveSelectionHelper.parent) {
        this.moveSelectionHelper.parent.remove(this.moveSelectionHelper);
      }
      if (this.moveSelectionHelper.geometry) {
        this.moveSelectionHelper.geometry.dispose();
      }
      if (this.moveSelectionHelper.material) {
        if (Array.isArray(this.moveSelectionHelper.material)) {
          this.moveSelectionHelper.material.forEach(m => m.dispose());
        } else {
          this.moveSelectionHelper.material.dispose();
        }
      }
      this.moveSelectionHelper = null;
    }
  }

  onPointerDown(event) {
    if (!this.isMoveMode) return;
    if (event.button !== 0) return; // Left click only
    this.pointerDownX = event.clientX;
    this.pointerDownY = event.clientY;
    this.pointerDownTime = Date.now();
  }

  onPointerMove(event) {
    // Note: BoxHelper.update() should not run on raw pointer movements when the object is stationary,
    // to prevent heavy bounding-box recomputations and WebGL line buffer exhaustion.
  }

  onPointerUp(event) {
    if (!this.isMoveMode) return;
    if (event.button !== 0) return;
    const dx = Math.abs(event.clientX - this.pointerDownX);
    const dy = Math.abs(event.clientY - this.pointerDownY);
    const dt = Date.now() - this.pointerDownTime;
    // If the user was panning or orbiting the camera with OrbitControls, ignore
    if (dx > 7 || dy > 7 || dt > 550) return;

    this.handleMoveClick(event);
  }

  handleMoveClick(event) {
    const container = document.getElementById(this.mapManager.containerId);
    if (!container) return;
    const rect = container.getBoundingClientRect();
    this.mapManager.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mapManager.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.mapManager.raycaster.setFromCamera(this.mapManager.mouse, this.mapManager.camera);

    // PASO 2: Objeto ya seleccionado -> Clic en el terreno para colocarlo
    if (this.selectedMoveObject) {
      const groundHits = this.mapManager.groundMesh 
        ? this.mapManager.raycaster.intersectObject(this.mapManager.groundMesh, false)
        : [];

      if (groundHits.length > 0) {
        const hitPt = groundHits[0].point;
        const obj = this.selectedMoveObject;
        const parent = obj.parent;

        if (parent) {
          // World center of the whole entity (trunk + canopy together)
          const box = new THREE.Box3().setFromObject(obj);
          const centerWorld = new THREE.Vector3();
          box.getCenter(centerWorld);

          const targetY = this.mapManager.getTerrainElevation 
            ? this.mapManager.getTerrainElevation(hitPt.x, hitPt.z) 
            : hitPt.y;
          const targetWorld = new THREE.Vector3(hitPt.x, targetY, hitPt.z);

          // Convert hitPt and center to parent local space
          const parentInv = parent.matrixWorld.clone().invert();
          const localTarget = targetWorld.clone().applyMatrix4(parentInv);
          const localCenter = centerWorld.clone().applyMatrix4(parentInv);

          const deltaX = localTarget.x - localCenter.x;
          const deltaZ = localTarget.z - localCenter.z;

          obj.position.x += deltaX;
          obj.position.z += deltaZ;
          obj.position.y = localTarget.y;
          obj.updateMatrixWorld?.(true);
        } else {
          obj.position.set(hitPt.x, hitPt.y, hitPt.z);
          obj.updateMatrixWorld?.(true);
        }

        const objName = obj.userData?.name || obj.name || 'Objeto';
        this.saveMovedObjectPosition(obj);

        // Si es un polígono personalizado, actualizar también sus puntos guardados
        if (obj.userData?.type === 'custom_polygon' || obj.userData?.isCustom) {
          this.saveToLocalStorage();
        }

        bus.emit('ui:show_toast', `✅ "${objName}" reubicado con éxito en (${hitPt.x.toFixed(1)}, ${hitPt.z.toFixed(1)}).`);
        this.deselectMoveObject();
        return;
      }
    }

    // PASO 1: Seleccionar objeto a mover
    const candidates = [];
    this.drawnPolygonsGroup.children.forEach(c => candidates.push(c));
    if (this.mapManager.pickableObjects) {
      this.mapManager.pickableObjects.forEach(p => {
        if (p !== this.mapManager.groundMesh) candidates.push(p);
      });
    }
    const objPlacementMgr = this.mapManager.objectPlacementManager;
    if (objPlacementMgr && objPlacementMgr.placedObjectsGroup) {
      objPlacementMgr.placedObjectsGroup.children.forEach(c => candidates.push(c));
    }

    const intersects = this.mapManager.raycaster.intersectObjects(candidates, true);
    if (intersects.length > 0) {
      const rawHit = intersects[0].object;
      const target = this.resolveMoveTarget(rawHit);

      if (!target) return;

      // Si hace clic sobre el mismo ya seleccionado, deseleccionar
      if (this.selectedMoveObject === target) {
        this.deselectMoveObject();
        return;
      }

      this.selectedMoveObject = target;
      const objName = target.userData?.name || target.name || 'Elemento seleccionado';
      this.showMoveSelectionHelper(target);
      this.updateMoveHudText(`✋ <strong>Moviendo "${objName}":</strong> 2. Haz clic en el terreno donde deseas dejarlo.`, true);
      container.style.cursor = 'crosshair';
      bus.emit('ui:show_toast', `✋ "${objName}" seleccionado. Haz clic en el terreno donde deseas colocarlo.`);
    } else if (this.selectedMoveObject) {
      this.deselectMoveObject();
    }
  }

  isContainerGroup(obj) {
    if (!obj) return false;
    if (obj === this.mapManager?.scene) return true;
    if (obj === this.drawnPolygonsGroup) return true;
    if (obj === this.tempNodesGroup) return true;
    if (obj === this.mapManager?.groundMesh) return true;
    if (obj === this.mapManager?.waterMesh) return true;
    if (obj === this.mapManager?.skyMesh) return true;

    const name = obj.name || '';
    if (name === 'cropGroup' || 
        name === 'sensorGroup' || 
        name === 'placedObjectsGroup' ||
        name === 'nativeForestGLBGroup' || 
        name === 'real3DTreesGroup' ||
        name === 'orchardGLBGroup' || 
        name === 'realFarmsteadGLBGroup' ||
        name === 'instancedVegetationRoot' || 
        name === 'aoe3_batch_preview' ||
        name === 'moveSelectionHelper') {
      return true;
    }

    if (this.mapManager?.cropManager?.cropGroup && obj === this.mapManager.cropManager.cropGroup) return true;
    if (this.mapManager?.sensorManager?.sensorGroup && obj === this.mapManager.sensorManager.sensorGroup) return true;
    if (this.mapManager?.objectPlacementManager?.placedObjectsGroup && obj === this.mapManager.objectPlacementManager.placedObjectsGroup) return true;
    if (this.mapManager?.parcelManager?.parcelGroup && obj === this.mapManager.parcelManager.parcelGroup) return true;

    return false;
  }

  isEntityObject(obj) {
    if (!obj || !obj.userData) return false;
    const ud = obj.userData;
    if (ud.type === 'crop' || 
        ud.type === 'sensor' || 
        ud.type === 'placed_aoe_object' || 
        ud.type === 'custom_polygon' ||
        ud.type === 'drone_dock' ||
        ud.type === 'livestock') {
      return true;
    }
    if (ud.isCustom && ud.id) return true;
    if (ud.species || ud.variety || ud.cropCategory) return true;
    return false;
  }

  resolveMoveTarget(object) {
    if (!object) return null;
    if (this.isContainerGroup(object)) return null;

    // Si el objeto ya es hijo directo de polígonos dibujados:
    if (this.drawnPolygonsGroup && this.drawnPolygonsGroup.children.includes(object)) {
      return object;
    }

    // Si el objeto mismo ya es una entidad identificada
    if (this.isEntityObject(object)) {
      return object;
    }

    let cur = object;
    let candidateEntity = null;

    while (cur.parent) {
      if (this.isEntityObject(cur)) {
        candidateEntity = cur;
      }

      const p = cur.parent;

      // Si el padre es un contenedor de nivel superior o la escena
      if (this.isContainerGroup(p)) {
        const target = candidateEntity || cur;
        if (this.isContainerGroup(target)) return null;
        return target;
      }

      cur = p;
    }

    if (candidateEntity && !this.isContainerGroup(candidateEntity)) {
      return candidateEntity;
    }

    return this.isContainerGroup(cur) ? null : cur;
  }

  onMapClick(event) {
    if (this.isEraseMode) {
      this.handleEraseClick(event);
      return;
    }

    if (!this.isDrawingActive) return;

    const intersection = this.getTerrainIntersection(event);
    if (!intersection) return;

    const point = intersection.point.clone();
    point.y += 0.3;

    if (this.currentPoints.length >= 3) {
      const firstPoint = this.currentPoints[0];
      if (point.distanceTo(firstPoint) < 5.0) {
        this.finishPolygon();
        return;
      }
      for (let i = 0; i < this.currentPoints.length - 1; i++) {
        if (point.distanceTo(this.currentPoints[i]) < 4.0) {
          this.finishPolygon();
          return;
        }
      }
    }

    this.currentPoints.push(point);
    this.addNodeVisual(point);
    this.updateTempPolyline();

    // Update floating HUD pill
    const drawHud = document.getElementById('drawingHudPill');
    const drawHudText = document.getElementById('drawingHudText');
    const btnFinish = document.getElementById('btnHudFinishPoly');
    if (drawHud) drawHud.style.display = 'flex';
    if (drawHudText) drawHudText.textContent = `✏️ Trazando: ${this.currentPoints.length} vértices. [Haz clic en inicio, Enter o 'Finalizar']`;
    if (btnFinish) btnFinish.style.display = this.currentPoints.length >= 3 ? 'inline-block' : 'none';
  }

  onMouseMove(event) {
    if (!this.isDrawingActive || this.currentPoints.length === 0) return;

    const intersection = this.getTerrainIntersection(event);
    if (!intersection) return;

    const mousePt = intersection.point.clone();
    mousePt.y += 0.3;

    this.updateMouseGuideLine(mousePt);
  }

  getTerrainIntersection(event) {
    const container = document.getElementById(this.mapManager.containerId);
    if (!container) return null;
    const rect = container.getBoundingClientRect();
    this.mapManager.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mapManager.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.mapManager.raycaster.setFromCamera(this.mapManager.mouse, this.mapManager.camera);

    const targets = [];
    if (this.mapManager.groundMesh) targets.push(this.mapManager.groundMesh);
    this.drawnPolygonsGroup.children.forEach(c => targets.push(c));

    const intersects = this.mapManager.raycaster.intersectObjects(targets, true);
    return intersects.length > 0 ? intersects[0] : null;
  }

  addNodeVisual(point) {
    const sphere = new THREE.Mesh(SHARED_NODE_GEO, SHARED_NODE_MAT);
    sphere.position.copy(point);
    this.tempNodesGroup.add(sphere);
  }

  updateTempPolyline() {
    const existing = this.tempNodesGroup.getObjectByName('tempLine');
    if (existing) {
      disposeObject3D(existing);
      this.tempNodesGroup.remove(existing);
    }

    if (this.currentPoints.length < 2) return;

    const geo = new THREE.BufferGeometry().setFromPoints([...this.currentPoints]);
    const mat = new THREE.LineBasicMaterial({ color: '#06b6d4' });
    const line = new THREE.Line(geo, mat);
    line.name = 'tempLine';
    this.tempNodesGroup.add(line);
  }

  updateMouseGuideLine(mousePt) {
    const existing = this.tempNodesGroup.getObjectByName('mouseGuide');
    if (existing) {
      disposeObject3D(existing);
      this.tempNodesGroup.remove(existing);
    }

    const lastPt = this.currentPoints[this.currentPoints.length - 1];
    const geo = new THREE.BufferGeometry().setFromPoints([lastPt, mousePt]);
    const mat = new THREE.LineDashedMaterial({ color: '#f59e0b', dashSize: 1, gapSize: 0.5 });
    const line = new THREE.Line(geo, mat);
    line.computeLineDistances();
    line.name = 'mouseGuide';
    this.tempNodesGroup.add(line);
  }

  finishPolygon() {
    if (this.currentPoints.length < 3) return;

    const points = [...this.currentPoints];
    this.clearTempNodes();
    this.isDrawingActive = false;

    const drawHud = document.getElementById('drawingHudPill');
    if (drawHud) drawHud.style.display = 'none';

    const areaSqMeters = this.calculatePolygonArea(points);
    const areaHa = Math.round((areaSqMeters / 10000) * 100) / 100;

    bus.emit('drawing:polygon_completed', {
      points,
      areaHa,
      onSave: (elementMeta) => this.renderFinal3DPolygon(points, elementMeta, areaHa)
    });
  }

  cancelDrawing() {
    this.clearTempNodes();
    this.isDrawingActive = false;
    const container = document.getElementById(this.mapManager.containerId);
    if (container) container.style.cursor = 'default';
    const drawHud = document.getElementById('drawingHudPill');
    if (drawHud) drawHud.style.display = 'none';
  }

  calculatePolygonArea(points) {
    let area = 0;
    const n = points.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += points[i].x * points[j].z;
      area -= points[j].x * points[i].z;
    }
    return Math.abs(area) / 2;
  }

  /**
   * Generates the 3D extruded polygon surface, perimeter line,
   * centroid 3D model, and floating billboard badge.
   */
  renderFinal3DPolygon(points, elementMeta, areaHa) {
    const polyId = `poly_${Date.now()}`;
    const group = new THREE.Group();
    group.name = polyId;

    const style = (elementMeta.style || '').toLowerCase();
    const nameLower = (elementMeta.name || '').toLowerCase();
    const isWater = style.startsWith('water') ||
      nameLower.includes('agua') ||
      nameLower.includes('estanque') ||
      nameLower.includes('estero') ||
      nameLower.includes('canal') ||
      nameLower.includes('río');

    // 1. Extruded polygon shape adjusted to terrain height
    const shape = new THREE.Shape();
    shape.moveTo(points[0].x, points[0].z);
    for (let i = 1; i < points.length; i++) {
      shape.lineTo(points[i].x, points[i].z);
    }
    shape.closePath();

    const avgY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
    const extrudeHeight = isWater ? 0.35 : 0.55;
    const extrudeSettings = { depth: extrudeHeight, bevelEnabled: false };
    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geo.rotateX(Math.PI / 2);

    const mainColor = isWater ? '#0284c7' : (elementMeta.color || '#10b981');
    const mat = new THREE.MeshStandardMaterial({
      color: mainColor,
      roughness: isWater ? 0.04 : 0.45,
      metalness: isWater ? 0.85 : 0.1,
      transparent: true,
      opacity: isWater ? 0.88 : 0.8,
      side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = avgY + (isWater ? 0.15 : 0.25);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    mesh.userData = {
      id: polyId,
      name: elementMeta.customName || elementMeta.name,
      itemName: elementMeta.name,
      category: elementMeta.category || elementMeta.categoryTitle || 'Cultivo',
      cropType: elementMeta.name,
      areaHa: areaHa,
      color: mainColor,
      icon: elementMeta.icon || '📍',
      style: elementMeta.style || 'generic',
      itemDetails: elementMeta,
      points: points,
      isCustom: true,
      type: 'custom_polygon'
    };
    group.userData = mesh.userData;

    group.add(mesh);

    // 2. Perimeter border line snapped to terrain elevation
    const borderPoints = [...points, points[0]].map(p => new THREE.Vector3(p.x, p.y + (isWater ? 0.22 : 0.32), p.z));
    const borderGeo = new THREE.BufferGeometry().setFromPoints(borderPoints);
    const borderMat = new THREE.LineBasicMaterial({
      color: isWater ? '#38bdf8' : '#ffffff',
    });
    const borderLine = new THREE.Line(borderGeo, borderMat);
    group.add(borderLine);

    // 3. Build accurate 3D model & Billboard badge at centroid
    const centroidGroup = this.populateCentroidWith3D(points, elementMeta, isWater);
    centroidGroup.name = 'centroidElement';
    group.add(centroidGroup);

    // Make pickable in MapManager
    if (this.mapManager && this.mapManager.addPickable) {
      this.mapManager.addPickable(mesh, mesh.userData);
    }

    this.drawnPolygonsGroup.add(group);
    this.customPolygons.push(mesh.userData);
    this.polygonsMap.set(polyId, {
      id: polyId,
      group,
      mesh,
      borderLine,
      centroidGroup,
      points,
      areaHa,
      elementMeta
    });

    this.saveToLocalStorage();

    bus.emit('ui:show_toast', `✅ Polígono ${elementMeta.icon || '🌾'} ${mesh.userData.name} (${areaHa} ha) generado con éxito.`);
    
    // Notificación al ecosistema Permacultural / Hidrológico
    if (elementMeta.isKeylineElement || elementMeta.isPermacultureZone || elementMeta.isPrvElement) {
      bus.emit('permaculture:element_created', {
        id: polyId,
        elementMeta,
        points,
        areaHa
      });
    }

    // Automatically select the newly created polygon in drawer
    bus.emit('entity:selected', {
      id: polyId,
      name: mesh.userData.name,
      properties: mesh.userData
    });
  }

  /**
   * Reclassifies an existing polygon with a new item from the catalog.
   */
  updatePolygonItem(polyId, newElementMeta) {
    const entry = this.polygonsMap.get(polyId);
    if (!entry) return;

    const isWater = (newElementMeta.style && newElementMeta.style.startsWith('water')) ||
      (newElementMeta.name || '').toLowerCase().includes('agua') ||
      (newElementMeta.name || '').toLowerCase().includes('estanque');

    // 1. Remove and dispose old centroid
    if (entry.centroidGroup) {
      disposeObject3D(entry.centroidGroup);
      entry.group.remove(entry.centroidGroup);
    }

    // 2. Update mesh colors & material properties
    const newColor = isWater ? '#0284c7' : (newElementMeta.color || '#10b981');
    entry.mesh.material.color.set(newColor);
    entry.mesh.material.roughness = isWater ? 0.05 : 0.45;
    entry.mesh.material.metalness = isWater ? 0.6 : 0.1;
    entry.mesh.material.opacity = isWater ? 0.85 : 0.78;

    if (entry.borderLine && entry.borderLine.material) {
      entry.borderLine.material.color.set(isWater ? '#38bdf8' : '#ffffff');
    }

    // 3. Build new centroid 3D model & billboard
    const newCentroid = this.populateCentroidWith3D(entry.points, newElementMeta, isWater);
    newCentroid.name = 'centroidElement';
    entry.group.add(newCentroid);
    entry.centroidGroup = newCentroid;

    // 4. Update userData
    const customName = newElementMeta.customName || entry.mesh.userData.name || newElementMeta.name;
    entry.mesh.userData.name = customName;
    entry.mesh.userData.itemName = newElementMeta.name;
    entry.mesh.userData.category = newElementMeta.category || newElementMeta.categoryTitle || 'Cultivo';
    entry.mesh.userData.cropType = newElementMeta.name;
    entry.mesh.userData.color = newColor;
    entry.mesh.userData.icon = newElementMeta.icon || '📍';
    entry.mesh.userData.style = newElementMeta.style || 'generic';
    entry.mesh.userData.itemDetails = newElementMeta;
    entry.group.userData = entry.mesh.userData;
    entry.elementMeta = newElementMeta;

    bus.emit('ui:show_toast', `🔄 Polígono actualizado a ${newElementMeta.icon || ''} ${newElementMeta.name}`);
    this.saveToLocalStorage();
    bus.emit('entity:selected', {
      id: polyId,
      name: customName,
      properties: entry.mesh.userData
    });
  }

  /**
   * Deletes a polygon by ID and frees all GPU resources.
   */
  deletePolygonById(polyId) {
    const entry = this.polygonsMap.get(polyId);
    if (!entry) return;

    disposeObject3D(entry.group);
    this.drawnPolygonsGroup.remove(entry.group);
    this.polygonsMap.delete(polyId);
    this.customPolygons = this.customPolygons.filter(p => p.id !== polyId);

    // Remove from pickables
    if (this.mapManager && this.mapManager.pickableObjects) {
      this.mapManager.pickableObjects = this.mapManager.pickableObjects.filter(obj => obj !== entry.mesh);
    }

    this.saveToLocalStorage();
    bus.emit('ui:show_toast', '🗑️ Polígono eliminado.');
    bus.emit('entity:deselected', {});
  }

  /**
   * Populates the polygon centroid with an accurate 3D model
   * and a high-resolution camera-facing Billboard badge.
   */
  populateCentroidWith3D(points, elementMeta, isWater) {
    let cx = 0, cz = 0;
    points.forEach(p => { cx += p.x; cz += p.z; });
    cx /= points.length;
    cz /= points.length;

    const group = new THREE.Group();
    const cy = this.mapManager.getTerrainElevation ? this.mapManager.getTerrainElevation(cx, cz) : (points[0]?.y || 0.5);
    group.position.set(cx, cy + 0.2, cz);

    const style = (elementMeta.style || '').toLowerCase();
    const nameLower = (elementMeta.name || '').toLowerCase();
    let modelHeight = 4.0;

    // ─── 1. PASTURE / PASTIZAL / CEREAL (NO TREES!) ───
    if (style.startsWith('pasture') || nameLower.includes('pastizal') || nameLower.includes('cereal') || nameLower.includes('trigo') || nameLower.includes('alfalfa') || nameLower.includes('trébol') || nameLower.includes('hierba')) {
      modelHeight = this.buildPastureModel(group, elementMeta);
    }
    // ─── 2. ORCHARD FRUIT TREES (Apples, Cherries, Citrus, Olives) ───
    else if (style.startsWith('orchard') || style === 'vineyard' || style === 'berry_shrub' || nameLower.includes('manzano') || nameLower.includes('cerezo') || nameLower.includes('olivo') || nameLower.includes('cítrico') || nameLower.includes('avellano') || nameLower.includes('vid')) {
      modelHeight = this.buildOrchardModel(group, elementMeta, style);
    }
    // ─── 3. NATIVE FOREST (Roble, Quillay, Peumo, Boldo) ───
    else if (style.startsWith('native') || nameLower.includes('roble') || nameLower.includes('quillay') || nameLower.includes('peumo') || nameLower.includes('boldo') || nameLower.includes('coigüe') || nameLower.includes('nativo')) {
      modelHeight = this.buildNativeForestModel(group, elementMeta);
    }
    // ─── 4. COMMERCIAL CONIFER / EUCALYPTUS ───
    else if (style === 'conifer_pine' || style === 'slender_eucalyptus' || nameLower.includes('pino') || nameLower.includes('eucalipto')) {
      modelHeight = this.buildForestPlantationModel(group, elementMeta, style);
    }
    // ─── 5. SHRUBS / BUSHES (Maqui, Rosa Mosqueta) ───
    else if (style.startsWith('shrub') || nameLower.includes('maqui') || nameLower.includes('rosa mosqueta') || nameLower.includes('arbusto')) {
      modelHeight = this.buildShrubClusterModel(group, elementMeta);
    }
    // ─── 6. GREENHOUSE (Invernadero) ───
    else if (style === 'greenhouse' || nameLower.includes('invernadero')) {
      modelHeight = this.buildGreenhouseModel(group, elementMeta);
    }
    // ─── 7. BARN / WORKSHOP / STORAGE (Galpón, Bodega, Taller) ───
    else if (style.startsWith('barn') || nameLower.includes('galpón') || nameLower.includes('bodega') || nameLower.includes('taller')) {
      modelHeight = this.buildBarnModel(group, elementMeta);
    }
    // ─── 8. WATER BODY / POND / ESTANQUE & TRANQUE KEYLINE ───
    else if (isWater || style.startsWith('water') || style === 'pump_station' || elementMeta.isKeylineElement || style === 'swale_keyline') {
      if (style === 'swale_keyline' || nameLower.includes('zanja') || nameLower.includes('swale')) {
        modelHeight = this.buildSwaleModel(group, elementMeta);
      } else {
        modelHeight = this.buildWaterPondModel(group, elementMeta);
      }
    }
    // ─── 9. IOT SENSOR / METEOROLOGICAL TOWER ───
    else if (style.startsWith('iot') || nameLower.includes('sensor') || nameLower.includes('estación') || nameLower.includes('nodo')) {
      modelHeight = this.buildIoTStationModel(group, elementMeta);
    }
    // ─── 10. COUNTRY HOUSE / VILLA ───
    else if (style === 'house_villa' || nameLower.includes('casa') || nameLower.includes('vivienda')) {
      modelHeight = this.buildHouseModel(group, elementMeta);
    }
    // ─── 11. PEST TRAP ───
    else if (style === 'pest_trap' || nameLower.includes('trampa')) {
      modelHeight = this.buildPestTrapModel(group, elementMeta);
    }
    // ─── FALLBACK GENERIC ───
    else {
      modelHeight = this.buildStylizedTree(group, elementMeta.color || '#10b981');
    }

    // ─── FLOATING BILLBOARD BADGE (Emoji + Item Label) ───
    const badge = this.createBillboardBadge(elementMeta.icon || '🌾', elementMeta.name);
    badge.position.y = modelHeight + 1.2;
    group.add(badge);

    return group;
  }

  /**
   * 1. PASTURE MODEL (Fardos de Heno dorados + Cercado campestre + Espigas)
   * NO TREES — true to agricultural pasture realism.
   */
  buildPastureModel(group, elementMeta) {
    const isAlfalfaOrClover = (elementMeta.name || '').toLowerCase().includes('alfalfa') ||
                             (elementMeta.name || '').toLowerCase().includes('trébol');
    const strawColor = isAlfalfaOrClover ? '#84cc16' : '#d97706';
    const hayColor = isAlfalfaOrClover ? '#65a30d' : '#ca8a04';

    // Hay Bale 1 (Large horizontal cylindrical bale)
    const bale1Geo = new THREE.CylinderGeometry(0.85, 0.85, 1.6, 16);
    bale1Geo.rotateZ(Math.PI / 2);
    const bale1Mat = new THREE.MeshStandardMaterial({ color: hayColor, roughness: 0.95 });
    const bale1 = new THREE.Mesh(bale1Geo, bale1Mat);
    bale1.position.set(0, 0.85, 0);
    bale1.castShadow = true;
    group.add(bale1);

    // Black / brown twine straps around bale
    const strapGeo = new THREE.CylinderGeometry(0.86, 0.86, 0.08, 16);
    strapGeo.rotateZ(Math.PI / 2);
    const strapMat = new THREE.MeshBasicMaterial({ color: '#451a03' });
    const strap1 = new THREE.Mesh(strapGeo, strapMat);
    strap1.position.set(-0.4, 0.85, 0);
    const strap2 = new THREE.Mesh(strapGeo, strapMat);
    strap2.position.set(0.4, 0.85, 0);
    group.add(strap1);
    group.add(strap2);

    // Hay Bale 2 (Stacked at an angle behind)
    const bale2Geo = new THREE.CylinderGeometry(0.75, 0.75, 1.4, 16);
    bale2Geo.rotateZ(Math.PI / 2);
    bale2Geo.rotateY(Math.PI / 6);
    const bale2 = new THREE.Mesh(bale2Geo, bale1Mat);
    bale2.position.set(0.8, 0.75, 1.2);
    bale2.castShadow = true;
    group.add(bale2);

    // Rustic Wooden Fence Posts & Rails
    const postMat = new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.9 });
    const postGeo = new THREE.CylinderGeometry(0.1, 0.12, 1.6, 8);
    const p1 = new THREE.Mesh(postGeo, postMat); p1.position.set(-1.8, 0.8, -1.0); p1.castShadow = true;
    const p2 = new THREE.Mesh(postGeo, postMat); p2.position.set(0, 0.8, -1.0); p2.castShadow = true;
    const p3 = new THREE.Mesh(postGeo, postMat); p3.position.set(1.8, 0.8, -1.0); p3.castShadow = true;
    group.add(p1); group.add(p2); group.add(p3);

    // Horizontal rails
    const railMat = new THREE.MeshStandardMaterial({ color: '#5c2d12', roughness: 0.85 });
    const railGeo = new THREE.CylinderGeometry(0.06, 0.06, 3.8, 8);
    railGeo.rotateZ(Math.PI / 2);
    const railUpper = new THREE.Mesh(railGeo, railMat);
    railUpper.position.set(0, 1.2, -1.0);
    const railLower = new THREE.Mesh(railGeo, railMat);
    railLower.position.set(0, 0.6, -1.0);
    group.add(railUpper);
    group.add(railLower);

    // Clustered grass & wheat blades
    const bladeMat = new THREE.MeshStandardMaterial({ color: strawColor, roughness: 0.8 });
    const bladeGeo = new THREE.ConeGeometry(0.12, 1.4, 4);
    for (let i = 0; i < 7; i++) {
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      const angle = (i / 7) * Math.PI * 2;
      blade.position.set(Math.cos(angle) * 1.5, 0.7, Math.sin(angle) * 1.5);
      blade.rotation.x = (Math.random() - 0.5) * 0.4;
      blade.rotation.z = (Math.random() - 0.5) * 0.4;
      group.add(blade);
    }

    return 2.2;
  }

  /**
   * 2. ORCHARD MODEL (Frutales con frutos visibles: Cerezos, Manzanos, Viñedos)
   */
  buildOrchardModel(group, elementMeta, style) {
    // Vineyard special case: trellised vines
    if (style === 'vineyard' || (elementMeta.name || '').toLowerCase().includes('vid')) {
      const postMat = new THREE.MeshStandardMaterial({ color: '#5c2d12', roughness: 0.9 });
      const vineMat = new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 0.7 });
      const grapeMat = new THREE.MeshStandardMaterial({ color: '#581c87', roughness: 0.4 });

      // 3 Trellis posts
      for (let i = -1; i <= 1; i++) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 2.0, 8), postMat);
        post.position.set(i * 1.4, 1.0, 0);
        post.castShadow = true;
        group.add(post);
      }

      // Foliage hedge canopy along trellis
      const foliage = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.2, 0.8), vineMat);
      foliage.position.set(0, 1.5, 0);
      foliage.castShadow = true;
      group.add(foliage);

      // Grape clusters
      for (let j = -1; j <= 1; j++) {
        const grape = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), grapeMat);
        grape.position.set(j * 1.0, 1.0, 0.45);
        group.add(grape);
      }
      return 2.6;
    }

    // Standard Orchard Tree with fruit specks
    const trunkMat = new THREE.MeshStandardMaterial({ color: '#5c3a1e', roughness: 0.9 });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.4, 2.0, 8), trunkMat);
    trunk.position.y = 1.0;
    trunk.castShadow = true;
    group.add(trunk);

    // Rounded leafy canopy
    const leafColor = elementMeta.color || '#15803d';
    const canopyMat = new THREE.MeshStandardMaterial({ color: leafColor, roughness: 0.65 });
    const canopyMain = new THREE.Mesh(new THREE.SphereGeometry(1.6, 12, 12), canopyMat);
    canopyMain.position.y = 2.8;
    canopyMain.castShadow = true;
    group.add(canopyMain);

    const canopyTop = new THREE.Mesh(new THREE.SphereGeometry(1.2, 10, 10), canopyMat);
    canopyTop.position.y = 3.6;
    group.add(canopyTop);

    // Fruit dots based on species
    let fruitColor = '#dc2626'; // cherries / red apples default
    if (style === 'orchard_citrus') fruitColor = '#ea580c';
    else if (style === 'orchard_olive') fruitColor = '#3f6212';
    else if (style === 'orchard_hazel') fruitColor = '#78350f';
    else if (style === 'berry_shrub') fruitColor = '#1e3a8a';

    const fruitMat = new THREE.MeshStandardMaterial({ color: fruitColor, roughness: 0.3 });
    const fruitGeo = new THREE.SphereGeometry(0.18, 6, 6);
    const fruitPositions = [
      [1.0, 2.6, 0.8], [-0.9, 2.7, 0.7], [0.6, 3.2, 0.9],
      [-0.4, 3.4, -0.9], [1.1, 2.4, -0.5], [-1.0, 2.5, -0.6]
    ];
    fruitPositions.forEach(pos => {
      const fruit = new THREE.Mesh(fruitGeo, fruitMat);
      fruit.position.set(...pos);
      group.add(fruit);
    });

    return 4.4;
  }

  /**
   * 3. NATIVE FOREST MODEL (Roble, Quillay, Peumo — Broadleaf organic umbrella)
   */
  buildNativeForestModel(group, elementMeta) {
    const trunkMat = new THREE.MeshStandardMaterial({ color: '#3b2010', roughness: 0.95 });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.6, 2.4, 8), trunkMat);
    trunk.position.y = 1.2;
    trunk.castShadow = true;
    group.add(trunk);

    // Multi-domed natural canopy
    const canopyMat = new THREE.MeshStandardMaterial({ color: elementMeta.color || '#166534', roughness: 0.7 });
    const domePositions = [
      [0, 3.4, 0, 1.8],
      [-1.1, 3.0, 0.5, 1.4],
      [1.1, 3.1, -0.4, 1.4],
      [0.2, 3.9, 0.3, 1.3]
    ];
    domePositions.forEach(([x, y, z, r]) => {
      const dome = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), canopyMat);
      dome.position.set(x, y, z);
      dome.castShadow = true;
      group.add(dome);
    });

    return 5.0;
  }

  /**
   * 4. CONIFER PINE / SLENDER EUCALYPTUS
   */
  buildForestPlantationModel(group, elementMeta, style) {
    if (style === 'slender_eucalyptus') {
      const trunkMat = new THREE.MeshStandardMaterial({ color: '#d6d3d1', roughness: 0.6 });
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.35, 5.0, 8), trunkMat);
      trunk.position.y = 2.5;
      trunk.castShadow = true;
      group.add(trunk);

      const leafMat = new THREE.MeshStandardMaterial({ color: '#047857', roughness: 0.6 });
      const top = new THREE.Mesh(new THREE.SphereGeometry(1.4, 10, 10), leafMat);
      top.position.y = 5.6;
      top.scale.set(1.0, 1.6, 1.0);
      top.castShadow = true;
      group.add(top);
      return 6.6;
    }

    // Pine Radiata: tiered dark conifer cones
    const trunkMat = new THREE.MeshStandardMaterial({ color: '#451a03', roughness: 0.9 });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.4, 2.2, 8), trunkMat);
    trunk.position.y = 1.1;
    group.add(trunk);

    const needleMat = new THREE.MeshStandardMaterial({ color: '#064e3b', roughness: 0.8 });
    const cone1 = new THREE.Mesh(new THREE.ConeGeometry(2.0, 2.4, 8), needleMat);
    cone1.position.y = 3.0;
    cone1.castShadow = true;
    const cone2 = new THREE.Mesh(new THREE.ConeGeometry(1.4, 2.0, 8), needleMat);
    cone2.position.y = 4.4;
    cone2.castShadow = true;
    const cone3 = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.5, 7), needleMat);
    cone3.position.y = 5.6;
    group.add(cone1); group.add(cone2); group.add(cone3);

    return 6.2;
  }

  /**
   * 5. SHRUBS / BUSHES (Maqui, Rosa Mosqueta)
   */
  buildShrubClusterModel(group, elementMeta) {
    const bushMat = new THREE.MeshStandardMaterial({ color: elementMeta.color || '#4ade80', roughness: 0.75 });
    const b1 = new THREE.Mesh(new THREE.SphereGeometry(1.2, 10, 10), bushMat);
    b1.position.set(0, 1.0, 0); b1.castShadow = true;
    const b2 = new THREE.Mesh(new THREE.SphereGeometry(0.8, 8, 8), bushMat);
    b2.position.set(0.9, 0.7, 0.5); b2.castShadow = true;
    const b3 = new THREE.Mesh(new THREE.SphereGeometry(0.9, 8, 8), bushMat);
    b3.position.set(-0.8, 0.8, -0.4); b3.castShadow = true;
    group.add(b1); group.add(b2); group.add(b3);

    return 2.4;
  }

  /**
   * 6. GREENHOUSE MODEL (Invernadero translúcido)
   */
  buildGreenhouseModel(group, elementMeta) {
    const frameMat = new THREE.MeshStandardMaterial({ color: '#e2e8f0', metalness: 0.8, roughness: 0.2 });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: '#38bdf8',
      roughness: 0.1,
      metalness: 0.1,
      transparent: true,
      opacity: 0.65
    });

    const tunnelGeo = new THREE.CylinderGeometry(1.8, 1.8, 4.0, 16, 1, false, 0, Math.PI);
    tunnelGeo.rotateZ(Math.PI / 2);
    const tunnel = new THREE.Mesh(tunnelGeo, glassMat);
    tunnel.position.set(0, 0.8, 0);
    tunnel.castShadow = true;
    group.add(tunnel);

    // End walls
    const wallGeo = new THREE.CircleGeometry(1.8, 16, 0, Math.PI);
    wallGeo.rotateY(Math.PI / 2);
    const wall1 = new THREE.Mesh(wallGeo, frameMat); wall1.position.set(-2.0, 0.8, 0);
    const wall2 = new THREE.Mesh(wallGeo, frameMat); wall2.position.set(2.0, 0.8, 0);
    group.add(wall1); group.add(wall2);

    return 2.8;
  }

  /**
   * 7. BARN / WORKSHOP (Galpón, Bodega, Taller)
   */
  buildBarnModel(group, elementMeta) {
    const wallColor = (elementMeta.style === 'barn_workshop') ? '#475569' : '#b45309';
    const bodyMat = new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.75 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.4, 3.2), bodyMat);
    body.position.y = 1.2;
    body.castShadow = true;
    body.receiveShadow = true;

    // Gable roof
    const roofMat = new THREE.MeshStandardMaterial({ color: '#7f1d1d', roughness: 0.6 });
    const roofGeo = new THREE.ConeGeometry(3.1, 1.8, 4);
    roofGeo.rotateY(Math.PI / 4);
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 3.2;
    roof.castShadow = true;
    group.add(body); group.add(roof);

    // Wooden door
    const doorMat = new THREE.MeshStandardMaterial({ color: '#451a03', roughness: 0.9 });
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.6, 0.1), doorMat);
    door.position.set(0, 0.8, 1.62);
    group.add(door);

    return 4.2;
  }

  /**
   * 8. WATER POND / ESTANQUE (Dock de madera + Bomba + Boya)
   */
  buildWaterPondModel(group, elementMeta) {
    // Water basin circle
    const basinGeo = new THREE.CylinderGeometry(2.4, 2.6, 0.4, 24);
    const basinMat = new THREE.MeshStandardMaterial({
      color: '#0284c7',
      roughness: 0.05,
      metalness: 0.8,
      transparent: true,
      opacity: 0.85
    });
    const basin = new THREE.Mesh(basinGeo, basinMat);
    basin.position.y = 0.2;
    group.add(basin);

    // Wooden Pier / Dock
    const dockMat = new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.9 });
    const dock = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.2, 2.2), dockMat);
    dock.position.set(0, 0.35, 1.4);
    dock.castShadow = true;
    group.add(dock);

    // Water Pump Housing
    const pumpMat = new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.5 });
    const pump = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.6), pumpMat);
    pump.position.set(-1.2, 0.6, 0);
    pump.castShadow = true;
    group.add(pump);

    // Lifebuoy ring (Torus)
    const buoyMat = new THREE.MeshStandardMaterial({ color: '#ef4444', roughness: 0.4 });
    const buoy = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.08, 8, 16), buoyMat);
    buoy.rotation.x = Math.PI / 2;
    buoy.position.set(0.4, 0.4, 1.8);
    group.add(buoy);

    return 2.2;
  }

  /**
   * 8B. SWALE / ZANJA DE INFILTRACIÓN KEYLINE (Camellón de tierra + franja de humedad + estacas)
   */
  buildSwaleModel(group, elementMeta) {
    // Camellón curvado de infiltración
    const bermGeo = new THREE.CylinderGeometry(0.35, 0.65, 3.8, 12);
    bermGeo.rotateZ(Math.PI / 2);
    const bermMat = new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.95 });
    const berm = new THREE.Mesh(bermGeo, bermMat);
    berm.position.set(0, 0.35, -0.4);
    berm.castShadow = true;
    group.add(berm);

    // Espejo de agua / humedad en el fondo de la zanja
    const waterGeo = new THREE.BoxGeometry(3.6, 0.15, 0.8);
    const waterMat = new THREE.MeshStandardMaterial({
      color: '#06b6d4',
      roughness: 0.1,
      metalness: 0.4,
      transparent: true,
      opacity: 0.85
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.set(0, 0.12, 0.3);
    group.add(water);

    // Estacas de nivel Keyline (Madera con marca cyan de cota)
    const stakeGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.2, 6);
    const stakeMat = new THREE.MeshStandardMaterial({ color: '#ca8a04', roughness: 0.8 });
    const stakeTipMat = new THREE.MeshBasicMaterial({ color: '#06b6d4' });

    [-1.2, 0, 1.2].forEach(xOffset => {
      const stake = new THREE.Mesh(stakeGeo, stakeMat);
      stake.position.set(xOffset, 0.6, -0.4);
      group.add(stake);

      const tip = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 0.12), stakeTipMat);
      tip.position.set(xOffset, 1.15, -0.4);
      group.add(tip);
    });

    return 2.0;
  }

  /**
   * 9. IOT SENSOR STATION
   */
  buildIoTStationModel(group, elementMeta) {
    const mastMat = new THREE.MeshStandardMaterial({ color: '#475569', metalness: 0.8, roughness: 0.3 });
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 4.4, 8), mastMat);
    mast.position.y = 2.2;
    mast.castShadow = true;
    group.add(mast);

    // Solar Panel tilted
    const panelMat = new THREE.MeshStandardMaterial({ color: '#1e3a8a', metalness: 0.9, roughness: 0.2 });
    const panel = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.06, 0.7), panelMat);
    panel.rotation.x = Math.PI / 5;
    panel.position.set(0, 3.2, 0.4);
    group.add(panel);

    // Beacon light
    const ledMat = new THREE.MeshStandardMaterial({ color: '#a855f7', emissive: '#c084fc', emissiveIntensity: 1.2 });
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), ledMat);
    led.position.y = 4.4;
    group.add(led);

    return 4.8;
  }

  /**
   * 10. COUNTRY HOUSE (Casa Patronal)
   */
  buildHouseModel(group, elementMeta) {
    const wallMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.8 });
    const house = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.2, 2.8), wallMat);
    house.position.y = 1.1;
    house.castShadow = true;
    group.add(house);

    const roofMat = new THREE.MeshStandardMaterial({ color: '#c2410c', roughness: 0.6 });
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.8, 1.6, 4), roofMat);
    roof.rotateY(Math.PI / 4);
    roof.position.y = 3.0;
    roof.castShadow = true;
    group.add(roof);

    // Chimney
    const chimMat = new THREE.MeshStandardMaterial({ color: '#78350f' });
    const chim = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.2, 0.5), chimMat);
    chim.position.set(1.0, 3.6, 0.5);
    group.add(chim);

    return 4.4;
  }

  /**
   * 11. PEST TRAP
   */
  buildPestTrapModel(group, elementMeta) {
    const stakeMat = new THREE.MeshStandardMaterial({ color: '#78350f' });
    const stake = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 1.8, 6), stakeMat);
    stake.position.y = 0.9;
    group.add(stake);

    const trapMat = new THREE.MeshStandardMaterial({ color: '#f59e0b', roughness: 0.5 });
    const trap = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.7, 3), trapMat);
    trap.position.y = 1.9;
    group.add(trap);

    return 2.2;
  }

  /**
   * Generic stylized tree
   */
  buildStylizedTree(group, leafColor) {
    const trunkMat = new THREE.MeshStandardMaterial({ color: '#5c3a1e', roughness: 0.9 });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.38, 2.2, 8), trunkMat);
    trunk.position.y = 1.1;
    trunk.castShadow = true;
    group.add(trunk);

    const leafMat = new THREE.MeshStandardMaterial({ color: leafColor, roughness: 0.65 });
    const cone1 = new THREE.Mesh(new THREE.ConeGeometry(2.0, 2.6, 8), leafMat);
    cone1.position.y = 3.2;
    cone1.castShadow = true;
    const cone2 = new THREE.Mesh(new THREE.ConeGeometry(1.4, 2.0, 8), leafMat.clone());
    cone2.position.y = 4.8;
    group.add(cone1); group.add(cone2);

    return 5.2;
  }

  /**
   * Creates a camera-facing glass capsule billboard with the item emoji and name.
   */
  createBillboardBadge(icon, label) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 96;
    const ctx = canvas.getContext('2d');

    // Rounded rectangle pill
    ctx.save();
    ctx.fillStyle = 'rgba(10, 15, 29, 0.88)';
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.75)';
    ctx.lineWidth = 4;

    const x = 6, y = 6, w = 244, h = 84, r = 24;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Icon emoji
    ctx.font = '36px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon || '📍', 18, 48);

    // Text label
    ctx.font = 'bold 21px "Inter", -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    let text = (label || '').trim();
    if (text.length > 13) text = text.substring(0, 12) + '…';
    ctx.fillText(text, 68, 48);
    ctx.restore();

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: true
    });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(4.2, 1.6, 1);
    return sprite;
  }

  handleEraseClick(event) {
    const container = document.getElementById(this.mapManager.containerId);
    if (!container) return;
    const rect = container.getBoundingClientRect();
    this.mapManager.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mapManager.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.mapManager.raycaster.setFromCamera(this.mapManager.mouse, this.mapManager.camera);

    const candidates = [];
    this.drawnPolygonsGroup.children.forEach(c => candidates.push(c));
    const objMgr = this.mapManager.objectPlacementManager;
    if (objMgr && objMgr.placedObjectsGroup) {
      objMgr.placedObjectsGroup.children.forEach(c => candidates.push(c));
    }

    const intersects = this.mapManager.raycaster.intersectObjects(candidates, true);
    if (intersects.length > 0) {
      const target = this.resolveMoveTarget(intersects[0].object);
      if (!target) return;

      if (target.parent === this.drawnPolygonsGroup) {
        const polyId = target.name;
        this.deletePolygonById(polyId);
      } else if (objMgr && target.parent === objMgr.placedObjectsGroup) {
        objMgr.removePlacedObjectById(target.name);
      }
    }
  }

  clearTempNodes() {
    this.currentPoints = [];
    const children = [...this.tempNodesGroup.children];
    children.forEach(child => {
      if (child.name === 'tempLine' || child.name === 'mouseGuide') {
        disposeObject3D(child);
      }
      this.tempNodesGroup.remove(child);
    });
  }

  cancelDrawing() {
    this.isDrawingActive = false;
    this.isEraseMode = false;
    this.clearTempNodes();
    const container = document.getElementById(this.mapManager.containerId);
    if (container) container.style.cursor = 'default';
  }

  clearAllPolygons() {
    const children = [...this.drawnPolygonsGroup.children];
    children.forEach(child => {
      disposeObject3D(child);
      this.drawnPolygonsGroup.remove(child);
    });
    this.customPolygons = [];
    this.polygonsMap.clear();
    this.saveToLocalStorage();
    bus.emit('ui:show_toast', '🧹 Todos los polígonos eliminados.');
    bus.emit('entity:deselected', {});
  }

  saveToLocalStorage() {
    try {
      const dataToSave = this.customPolygons.map(p => ({
        id: p.id,
        name: p.name,
        itemName: p.itemName,
        category: p.category,
        cropType: p.cropType,
        areaHa: p.areaHa,
        color: p.color,
        icon: p.icon,
        style: p.style,
        itemDetails: p.itemDetails,
        points: p.points ? p.points.map(pt => ({ x: pt.x, y: pt.y, z: pt.z })) : []
      }));
      localStorage.setItem('agritwin_custom_polygons', JSON.stringify(dataToSave));
      bus.emit('project:modified');
    } catch (e) {
      console.warn('Could not save custom polygons to localStorage:', e);
    }
  }

  loadFromLocalStorage() {
    try {
      const raw = localStorage.getItem('agritwin_custom_polygons');
      if (!raw) return;
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length > 0) {
        list.forEach(item => {
          if (item.points && item.points.length >= 3 && !this.polygonsMap.has(item.id)) {
            const pts = item.points.map(p => new THREE.Vector3(p.x, p.y, p.z));
            this.renderFinal3DPolygon(pts, item.itemDetails || item, item.areaHa);
          }
        });
        console.log(`💾 Restaurados ${list.length} polígonos personalizados guardados.`);
      }
    } catch (e) {
      console.warn('Error loading custom polygons from localStorage:', e);
    }
  }

  saveMovedObjectPosition(obj) {
    if (!obj) return;
    try {
      const id = obj.userData?.id || obj.name || `moved_${Date.now()}`;
      const movedRaw = localStorage.getItem('agritwin_moved_objects') || '{}';
      const movedMap = JSON.parse(movedRaw);
      movedMap[id] = {
        x: obj.position.x,
        y: obj.position.y,
        z: obj.position.z,
        rotY: obj.rotation ? obj.rotation.y : 0
      };
      localStorage.setItem('agritwin_moved_objects', JSON.stringify(movedMap));

      // Si es un objeto de ObjectPlacementManager, actualizar su record interno
      if (obj.userData?.type === 'placed_aoe_object' && this.mapManager?.objectPlacementManager) {
        const mgr = this.mapManager.objectPlacementManager;
        const rec = mgr.placedObjects.find(o => o.id === id);
        if (rec) {
          rec.x = obj.position.x;
          rec.y = obj.position.y;
          rec.z = obj.position.z;
          if (obj.rotation) rec.rotationY = THREE.MathUtils.radToDeg(obj.rotation.y);
          mgr.saveToLocalStorage();
          mgr.updateDockStatusSummary();
        }
      }

      bus.emit('project:modified');
    } catch (e) {
      console.warn('Error saving moved object:', e);
    }
  }

  restoreMovedObjectPositions() {
    try {
      const movedRaw = localStorage.getItem('agritwin_moved_objects');
      if (!movedRaw) return;
      const movedMap = JSON.parse(movedRaw);
      if (!this.mapManager?.scene) return;

      // Clean any accidental container keys from past sessions
      delete movedMap[''];
      delete movedMap['cropGroup'];
      delete movedMap['sensorGroup'];
      delete movedMap['placedObjectsGroup'];
      delete movedMap['nativeForestGLBGroup'];
      delete movedMap['realFarmsteadGLBGroup'];

      this.mapManager.scene.traverse((obj) => {
        if (this.isContainerGroup(obj)) return;
        const id = obj.userData?.id || obj.name;
        if (id && movedMap[id]) {
          const pos = movedMap[id];
          obj.position.set(pos.x, pos.y, pos.z);
          if (pos.rotY !== undefined) obj.rotation.y = pos.rotY;
        }
      });
      console.log('✋ Restauradas posiciones de objetos movidos desde localStorage.');
    } catch (e) {
      console.warn('Error restoring moved objects:', e);
    }
  }
}
