# Regla de Diseño Visual Unificada: Menús de Campaña AoE II (6 Ramas)

> **Documento Normativo de UI/UX Diegética para AgriTwin**  
> *Versión:* 1.0.0-aoe-normative  
> *Ramas aplicadas:* 1. El Galpón (Predio 3D) • 2. Invernadero • 3. Establo PRV • 4. Incursión • 5. La Cumbre del Cerro (Cuenca) • 6. La Mesa Vecinal DAO.

---

## 1. Diagnóstico de los Visores Anteriores

1. **Modo Predio (El Galpón - Menú Campaña AoE II):**
   * **Virtud:** Botones siempre activos y visibles permanentemente sobre la escena, con una paleta cromática unificada y armónica (madera oscura, latón y reflejo ámbar `#fbbf24`).
   * **Limitación:** El botón en reposo exponía poca densidad de datos técnicos antes de interactuar.
2. **Modo Cuenca (El Cerro - Mirador Panorámico 122k ha):**
   * **Virtud:** Botones de mayor escala, alta jerarquía técnica (código de nodo, badge de subsistema, métrica ambiental real y descripción operativa).
   * **Limitación:** Dispersión cromática (cada botón tenía un color no coordinado) y dependencia excesiva del estado *hover*, obligando al operador a rastrear con el cursor para saber qué hace cada elemento.

---

## 2. La Regla Unificada: "Cartela de Campaña Diegética"

La nueva especificación estandariza los botones y cartelas de las 6 ramas en una arquitectura de **3 capas complementarias**:

```
┌────────────────────────────────────────────────────────────────────────┐
│ CAPA 1: CROMÁTICA MATRIZ (Consistencia & Elegancia Predial)             │
│ • Fondo: Obsidiana & Madera profunda [rgba(13, 19, 34, 0.94)]         │
│ • Marco: Latón / Oro viejo [1px solid rgba(245, 158, 11, 0.45)]        │
│ • Tipografía Principal: Plus Jakarta Sans / Georgia (Blanco Cálido)    │
│ • Métrica Numérica: JetBrains Mono en Ámbar Dorado [#fbbf24]           │
│ • Tinte de Rama: Reservado EXCLUSIVAMENTE al micro-código y beacon ping│
├────────────────────────────────────────────────────────────────────────┤
│ CAPA 2: ESTADO EN REPOSO PERMANENTE (Siempre Activo / Visible)        │
│ • Tamaño: 135px a 155px de ancho                                       │
│ • No requiere hover para leer el estado del campo                     │
│ • Contenido: [Icono] + [Título Estación] + [Métrica Clave en Vivo]     │
├────────────────────────────────────────────────────────────────────────┤
│ CAPA 3: ENRIQUECIMIENTO EN HOVER (Profundidad Cuenca)                  │
│ • Despliegue de cartela superior (Tooltip Wood & Brass)                 │
│ • Resumen de algoritmo o impacto económico / agronómico               │
│ • Micro-física AoE: Ligero balanceo (sway) y halo áureo                │
│ • Llamado a la acción: "▶ Clic para interactuar / abrir inspector"     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Matriz de Identificadores y Métricas en las 6 Ramas

| # | Rama | Escena / Fondo | Código de Rama | Tinte Beacon | Métrica Viva Visible en Reposo |
|---|------|----------------|----------------|--------------|--------------------------------|
| **1** | **El Galpón Predial (3D)** | `workshop_bg.png` | `RAMA-PREDIO-01` | `#fbbf24` (Ámbar) | *Humedad 37.2% VWC • Bulbo 1.2m* |
| **2** | **Invernadero & Cultivos** | `invernadero_landing_bg.jpg` | `RAMA-CULT-02` | `#34d399` (Esmeralda) | *840 Plántulas • LER 1.34 (+34%)* |
| **3** | **Establo & PRV** | `establo_landing_bg.jpg` | `RAMA-GANAD-03` | `#f59e0b` (Caramelo) | *Potrero P4 • 2.850 kg MS • Clarita* |
| **4** | **Incursión (Rewilding)** | `incursion_landing_bg.jpg` | `RAMA-REWILD-04` | `#a3e635` (Lima) | *Faja 45m • Zanja Keyline • Esclerófilo*|
| **5** | **La Cumbre (Cuenca)** | `cerro_landing_bg.jpg` | `RAMA-CUENCA-05` | `#38bdf8` (Cielo) | *Río 124.5 m³/s • FWI 24 • Bullileo 78%* |
| **6** | **La Mesa Vecinal DAO** | `sprite_map_vecinal.png` | `RAMA-MESA-06` | `#818cf8` (Índigo) | *10 Predios • Voto V² • 78% Quórum* |

---

## 4. Estructura HTML & CSS Recomendada

```html
<!-- Estación Diegética Unificada -->
<div class="diegetic-sprite-anchor sprite-station-unified" style="top: 45%; left: 30%;">
  <!-- Imagen del sprite con física diegética -->
  <img src="assets/ui/sprite_ejemplo.png" class="diegetic-sprite-img" alt="Estación">
  <span class="diegetic-sprite-ping"></span>

  <!-- Botón persistente (Siempre activo y legible) -->
  <div class="aoe-unified-station-badge">
    <div class="badge-header">
      <span class="badge-code">OBJ-CUENCA-01</span>
      <span class="badge-indicator"></span>
    </div>
    <div class="badge-title">🛰️ Drone LULC Sentinel-2</div>
    <div class="badge-metric">NDVI 0.74 • Cota 680m</div>
  </div>

  <!-- Cartela táctica expandida (Solo en hover) -->
  <div class="diegetic-tooltip">
    <div class="tooltip-header">
      <span>OBJ-CUENCA-01 • RESOLUCIÓN 10M</span>
      <span>SENTINEL-2B</span>
    </div>
    <h4>Monitoreo Aéreo & Coberturas LULC</h4>
    <p>Ortomosaico multiespectral, clasificación de coberturas y vigor fotosintético de la cuenca.</p>
    <div class="tooltip-footer">
      <span>▶ Clic para abrir inspector</span>
      <span>3 submódulos</span>
    </div>
  </div>
</div>
```

```css
/* Botón persistente siempre activo en mismos colores */
.aoe-unified-station-badge {
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  width: 145px;
  background: rgba(13, 19, 34, 0.94);
  border: 1px solid rgba(245, 158, 11, 0.45);
  border-radius: 10px;
  padding: 6px 8px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(12px);
  text-align: center;
  pointer-events: auto;
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.aoe-unified-station-badge:hover {
  transform: translateX(-50%) translateY(-2px) scale(1.05);
  border-color: #fde047;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.9), 0 0 16px rgba(245, 158, 11, 0.6);
}
```
