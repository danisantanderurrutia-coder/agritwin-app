# 🚁 Arquitectura Técnica: AgriTwin Vision & Drones Autónomos (Sentinel & DJI Dock 2)

Este documento detalla la implementación en código del subsistema de visión computacional y drones autónomos dentro del repositorio `agritwin`.

---

## 📂 1. Módulos Implementados

### A. `js/entities/VisionManager.js`
Gestiona la red de cámaras terrestres fijas georreferenciadas:
- **Cámaras Físicas:**
  - `CAM-01-NORTE`: Perímetro norte y portón de acceso vehicular.
  - `CAM-02-DGA`: Aforo de canal Maule y compuerta de telemetría hídrica.
  - `CAM-03-FAUNA`: Borde de bosque nativo esclerófilo (Rewilding corridor).
  - `CAM-04-PRV`: Potrero de pastoreo rotacional Voisin.
- **Entidades 3D:**
  - Postes metálicos con gabinete estanco IP65 y panel fotovoltaico inclinado a 33° hacia el norte (óptimo Maule).
  - Conos de visión volumétricos (`THREE.ConeGeometry`) con mallas alámbricas superpuestas (`LineSegments`).
  - Animación de pulso en shader de material: cian (#38bdf8) en reposo y rojo sangre (#ef4444) durante estados de alerta.
- **Ventana PiP (Picture-in-Picture):**
  - Controles PTZ interactivos (pan/tilt) sincronizados en tiempo real con la rotación del cono 3D en Three.js.
  - Selector de señal dual: `[📹 Feed Terrestre]` (cámara fija) y `[🚁 Feed Gimbal Dron]` (retícula cenital).
  - Botón de despacho reactivo: `[🚁 Despachar Dron a este Punto (Intercepción)]`.

### B. `js/entities/DroneMissionManager.js`
Controla el ciclo de vida del dron y la estación Drone-in-a-Box:
- **Modelo 3D DJI Dock 2:**
  - Hangar estanco en coordenadas del predio con escotilla motorizada que se abre durante misiones.
  - Mástil con antena RTK centimétrica y LED de telemetría de estado.
  - Cuadricóptero con 4 rotores animados por delta-time.
- **Widget Diegético Táctico:**
  - Pastilla flotante en la barra superior usando `assets/ui/sprite_cerro_drone.png`.
  - Despliega estado en vivo (`Hangar`, `Misión Fotogrametría`, `Intercepción`), porcentaje de batería y botón de despegue con 1 clic.
- **Máquina de Estados de Vuelo:**
  1. `docked`: En reposo dentro del hangar, cargando batería LiFePO4.
  2. `takeoff`: Apertura de escotilla y ascenso vertical a 22 m de altura.
  3. `survey`: Patrulla regular de fotogrametría siguiendo waypoints prediales.
  4. `intercept`: Vuelo a alta velocidad (12 m/s) en línea recta hacia el objetivo de alerta.
  5. `orbit`: Órbita circular de 360° a 22 m de altura manteniendo el gimbal centrado en el blanco, con haz láser táctico proyectado (`THREE.LineDashedMaterial`).
  6. `rth`: Regreso al hangar (Return-to-Home).
  7. `landing`: Descenso vertical de precisión y cierre de escotilla.
- **Actualización Dinámica de Terreno:**
  - Al completar la misión, genera un nuevo canvas de ortomosaico NDVI y lo asigna a `material.map` con `needsUpdate = true` sin recargar la sesión web.

---

## ⚡ 2. Bus de Eventos (EventBus Pub-Sub)

La comunicación entre el subsistema de cámaras y el gestor de misiones de drones se realiza mediante el EventBus desacoplado:

* **Emisión de Solicitud de Intercepción:**
  ```javascript
  // Emitido por VisionManager al pulsar el botón de intercepción en el PiP
  bus.emit('drone:dispatch_intercept', {
    target: camera.position,
    camera: camera
  });
  ```
* **Recepción en Gestor de Drones:**
  ```javascript
  // Capturado por DroneMissionManager
  bus.on('drone:dispatch_intercept', (data) => {
    this.dispatchIntercept(data.target, data.camera);
  });
  ```

---

## 🛠️ 3. Ejecución y Pruebas

Para probar el subsistema en el navegador:
1. Iniciar el servidor local:
   ```bash
   node server.cjs
   ```
2. Acceder a: `http://localhost:7773/?noworkshop=1&mode=3d`
3. Comandos de inspección en la consola del navegador:
   - `window.visionManager.openPiP(window.visionManager.cameras[1]);` // Abre PiP de CAM-02 DGA
   - `window.droneMissionManager.launchMission();` // Despega dron en misión de fotogrametría
   - `window.droneMissionManager.dispatchIntercept(window.visionManager.cameras[0].position, window.visionManager.cameras[0]);` // Despacho reactivo a CAM-01
