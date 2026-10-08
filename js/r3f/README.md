# AgroTwin 3D — Suite Modular React Three Fiber (R3F)

Suite modular de componentes para **React Three Fiber**, diseñada con dirección de arte inspirada en **Civilization VI** y precisión biofísica de **Farming Simulator (Precision Farming)**.

---

## 📁 Componentes Incluidos

1. **`AgroTwinCanvas.jsx`**: Lienzo principal (`<Canvas shadows>`) con configuración de cámara orbital, renderizado PBR con mapeo tonal ACES Filmic y balance de color sRGB.
2. **`AtmosphereAndSun.jsx`**: Sistema solar físico (acimut y elevación solar basados en hora del día y latitud de Parral, Maule), sombras suaves `PCFSoftShadowMap` con `normalBias = 0.04` (sin *shadow acne*), y luz de entorno HDRI `<Environment preset="sunset" />` para iluminación difusa y reflejos especulares de atardecer agrícola (*golden hour*).
3. **`TerrainPBR.jsx`**: Malla de terreno con mapas normales y de rugosidad generados procedimentalmente (`PBRSoilGenerator`) que simulan surcos de arado, micro-topografía y textura de humus. Incorpora un shader GLSL (`BiophysicalTerrainShader`) que conmuta dinámicamente el color y la rugosidad del suelo según la humedad del terreno.
4. **`VegetationInstances.jsx`**: Renderizado de miles de árboles nativos (Quillay, Boldo, Maitén), hileras de viñedos en espaldera y tractores de precisión telemetrizados en **1 a 3 draw calls** utilizando `<instancedMesh>`.
5. **`InteractiveParcels.jsx`**: Extrusión 3D de cuarteles/parcelas con animación de elevación suave amortiguada en el eje Y (`Y-axis hover lerp`) y borde resplandeciente (`glowing outline`) al posar el cursor o seleccionar.
6. **`IoTSensorNodes.jsx`**: Nodos IoT con etiquetas flotantes 3D `<Html>` de `@react-three/drei` con frustum culling, dials circulares animados de humedad de suelo, temperatura y baliza LoRaWAN activa.
7. **`PostProcessingPipeline.jsx`**: Pipeline de post-procesamiento con oclusión ambiental `N8AO` (destaca hendiduras de surcos de arado y zanjas), `Bloom` selectivo para el agua y leds, y `Vignette`.

---

## 🚀 Instalación en Proyectos React / Vite / Next.js

```bash
npm install three @react-three/fiber @react-three/drei @react-three/postprocessing
```

### Uso Rápido

```jsx
import React, { useState } from 'react';
import { AgroTwinCanvas } from './js/r3f/AgroTwinCanvas';

export default function App() {
  const [moisture, setMoisture] = useState(0.42);
  const [hour, setHour] = useState(17.5); // Golden Hour

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <AgroTwinCanvas
        hourOfDay={hour}
        moistureLevel={moisture}
        onSelectEntity={(entity) => console.log('Seleccionado:', entity)}
      />
    </div>
  );
}
```
