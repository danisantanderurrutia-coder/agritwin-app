# 🚁 METODOLOGÍA Y ARQUITECTURA: AGRITWIN VISION & DRONES AUTÓNOMOS
========================================================================
Fecha de Certificación: 2026-10-11 | Versión: 1.0 (Producción)
Emisor: AgroTech Labs & Nanobanana 3D Engine • Fundo Meniels, Maule
Custodia: Bóveda Documental AgriTwin (ID: doc-007)
========================================================================

## 1. DESCRIPCIÓN DEL MÉTODO CIBERFÍSICO
AgriTwin Vision & Drones Autónomos implementa la convergencia ciberfísica
entre una red de vigilancia fija de bajo consumo con inteligencia artificial
en el borde (Edge AI) y una estación robótica aérea "Drone-in-a-Box" (DJI Dock 2),
orquestada bidireccionalmente por el gemelo digital 3D (Three.js WebGL).

El sistema resuelve la "ceguera espacial" del agricultor remoto mediante una
interfaz diegética táctica de 2 clics:
1. Inspección volumétrica 3D de los campos de visión (frustums) de las cámaras.
2. Despacho reactivo de intercepción aérea ante cualquier evento de riesgo en tierra.
3. Actualización de texturas ortomosaicas NDVI en caliente sin recargar la web.

---

## 2. ARQUITECTURA DE DATOS Y PROTOCOLOS
- **Streaming de Video:** Protocolo WebRTC con gateway MediaSoup/Janus.
  Latencia inferior a 500 ms sobre enlaces celulares 4G/LTE Cat-4 rurales o Starlink Mini.
- **Inferencia en el Borde (Edge AI):** Modelos YOLOv8-Nano / Edge TPU corriendo
  en postes solares y naves de packing a 15 fps continuo (detección de intrusiones,
  aforo de caudales DGA y estado de cercos PRV).
- **Telemetría y Alertas:** Broker MQTT sobre TLS (Mosquitto/AWS IoT Core).
  Mensajería ligera JSON en tópicos `agritwin/alerts/{camId}` y `agritwin/drone/telemetry`.
- **Fotogrametría Aérea:** Motor NodeODM / WebODM para ortomosaicos multiespectrales (NDVI).

---

## 3. REPRESENTACIÓN DIEGÉTICA EN EL GEMELO 3D (THREE.JS)
- **Postes Físicos 3D:** Modelos georreferenciados con postes de acero, gabinetes IP65,
  domos PTZ y paneles solares orientados a 33° N (óptimo para la latitud de Parral/Maule).
- **Conos Frustum Volumétricos:** Geometría cónica (`THREE.ConeGeometry`) con mallas
  alámbricas de ingeniería que pulsan en cian en régimen normal y cambian a rojo sangre
  parpadeante (#ef4444) durante estados de alerta.
- **Ventana Flotante PiP Dual:** Selector de señal `[📹 Feed Terrestre]` (cámara fija) y
  `[🚁 Feed Gimbal Dron]` (retícula cenital estabilizada con altímetro) con controles PTZ
  que rotan el cono 3D en vivo.
- **Widget Táctico Top Bar:** Pastilla flotante con el sprite diegético histórico
  `assets/ui/sprite_cerro_drone.png`, indicando estado en vivo (`Hangar`, `Intercepción`),
  batería y botón de despegue inmediato.

---

## 4. ALGORITMO DE ORQUESTACIÓN REACTIVA (CÁMARA ➔ DRON)
1. **Detección en Tierra:** La cámara fija CAM-02 detecta una anomalía (ej. caída de nivel
   en aforador de canal DGA o intrusión en portón norte).
2. **Disparo de Alerta:** El microprocesador del poste publica un evento MQTT JSON.
3. **Reacción Visual en AgriTwin:** El frustum 3D de la cámara en el gemelo digital pasa a rojo
   parpadeante y el visor PiP despliega la advertencia con botón de acción táctica.
4. **Despacho Reactivo:** El operador presiona `[🚁 Despachar Dron a este Punto]`
   (o el sistema auto-despacha si la severidad es CRÍTICA).
5. **Secuencia de Vuelo:**
   - DJI Dock 2 abre su escotilla motorizada y adquiere fijación RTK centimétrica.
   - Despegue vertical en menos de 90 segundos hasta altitud de seguridad (22 m AGL).
   - Vuelo de crucero directo a 12 m/s hacia las coordenadas de la cámara.
   - Proyección de haz láser táctico 3D (`THREE.LineDashedMaterial`) uniendo dron y blanco.
   - Órbita circular de 360° con cámara cenital transmitiendo en vivo al PiP.
6. **Resolución y Retorno:** Verificada la incidencia, el dron ejecuta Return-to-Home (RTH),
   aterriza con precisión centimétrica y cierra compuertas para recarga rápida LiFePO4.

---

## 5. ACTUALIZACIÓN EN CALIENTE DE ORTOMOSAICOS NDVI
Al completar misiones de fotogrametría aérea, la textura del terreno se actualiza
inmediatamente sobre el shader PBR de Three.js sin recargar la sesión:
```javascript
const newTexture = new THREE.CanvasTexture(canvasOrtho);
newTexture.wrapS = THREE.RepeatWrapping;
newTexture.wrapT = THREE.RepeatWrapping;
mapManager.groundCiv6Mat.map = newTexture;
mapManager.groundCiv6Mat.needsUpdate = true;
```

Firma Digital Criptográfica: 0x8f2d4a19c6e3b7fa99d140e-AGRITWIN-VISION-DOCK2
AgroTech Digital Engineering • Bóveda Documental AgriTwin v3.4
========================================================================
