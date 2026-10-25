# Doctrina de Mando Táctico C2 & Matriz Multiamenaza H-V-R en Cuencas Agrícolas

## AgriTwin Master Suite • Sistema de Soporte de Decisión Espacial (SDSS)
**Macro-Cuenca del Maule Sur • Río Longaví / Río Perquilauquén (122.070 ha)**  
*Documento de Especificación Científica, Doctrina Operativa y Cartografía Multiescala*  
*Versión:* 2.4 • *Fecha:* Octubre 2026 • *Estado:* Operativo en Producción (`#tactico`)

---

## 1. Justificación y Cambio de Paradigma: De la Línea Estática a la Maniobra Territorial

### 1.1 La Insuficiencia del Enfoque Lineal Convencional
En la modelación hidrológica y de riesgos tradicional, las amenazas suelen representarse como líneas de drenaje unidimensionales o vectores estáticos de viento. Si bien estos elementos son matemáticamente válidos para el cálculo de caudales o advección teórica, resultan insuficientes para la toma de decisiones en emergencias complejas por tres razones críticas:

1. **Invisibilidad del Área de Afección Directa:** Una línea fluvial no informa sobre la profundidad del agua acumulada ni la cota crítica que amenaza viviendas rurales o norias de Comités de Agua Potable Rural (APR).
2. **Desconexión con los Activos Expuestos:** Los vectores no reflejan si el agua o el fuego avanzan sobre vegas de amortiguación natural, corredores viales estratégicos (Ruta 5 Sur, Ruta L-110) o cuarteles agrícolas de alto valor (frutales, arrozales).
3. **Ausencia de Dinámica de Maniobra Temporal:** La toma de decisiones en incendios o crecidas aluviales requiere proyectar la velocidad de propagación en horizontes operacionales (0-2h, 2-6h, 6-12h) para coordinar evacuaciones, apertura de compuertas y despliegue de maquinaria pesada.

### 1.2 La Doctrina C2 (Command & Control) de AgriTwin
Inspirada en la cartografía de maniobra militar y los gráficos de operaciones de estado mayor (Gaines's Mill, Gettysburg, Desert Storm), AgriTwin implementa una **Doctrina C2** que fusiona:
- **Unidades Tácticas de Riesgo (UD):** Polígonos discretos con patrones stippled (punteados) y bordes segmentados que delimitan la zona de avance activo de cada amenaza.
- **Vectores de Maniobra Multi-Fase:** Flechas tácticas con marcadores de fase temporal (`Fase 1: 0-2h`, `Fase 2: 2-6h`, `Fase 3: 6-12h`) indicando dirección, velocidad y saltos convectivos (pavesas).
- **Líneas de Defensa Activa:** Obras e infraestructuras territoriales de contención calibradas biofísicamente (Tranque Keyline de 18.500 m³ y Fajas Cortafuegos WUI de 45m).
- **Cartografía SIG de Exposición:** Integración de estándares internacionales probados (Cologne Floods, CAL FIRE FHSZ, Austin WUI Ember Zone, y susceptibilidad gravitacional de laderas).

---

## 2. Formulación Matemática Canónica: Matriz Multiamenaza $R = H \times V$

Siguiendo las directrices de la **Oficina de las Naciones Unidas para la Reducción del Riesgo de Desastres (UNDRR)** y la norma **ISO 31010**, el riesgo territorial integrado ($R$) se formula como el producto normalizado entre la amenaza física (*Hazard*, $H$) y la vulnerabilidad de los activos expuestos (*Vulnerability*, $V$):

$$R = \frac{H \times V}{100}$$

Donde:
- $H \in [0, 100]\%$: Magnitud e intensidad de la fuerza física biometeorológica.
- $V \in [0, 100]\%$: Grado de exposición intrínseca, fragilidad física y daño potencial sobre los activos humanos, viales y productivos.
- $R \in [0, 100]\%$: Índice cuantitativo adimensional de riesgo integrado de cuenca.

```
       ┌─────────────────────────────────────────────────────────────┐
       │             ECUACIÓN CANÓNICA DE RIESGO AGRITWIN            │
       │                                                             │
       │   AMENAZA FÍSICA (H)    ×   VULNERABILIDAD EXPUESTA (V)     │
       │   [Caudal, Viento, FWI]      [Viviendas APR, Vías, Suelo]   │
       │  ─────────────────────────────────────────────────────────  │
       │                         100                                 │
       │                          =                                  │
       │               RIESGO INTEGRADO CUENCA (R)                   │
       └─────────────────────────────────────────────────────────────┘
```

### 2.1 Desglose del Factor Amenaza ($H$)
El componente $H$ se alimenta en tiempo real a partir de telemetría de campo e interpolación orográfica:
$$H = w_q \cdot H_{\text{fluvial}} + w_f \cdot H_{\text{piro}} + w_m \cdot H_{\text{gravitacional}}$$
- **$H_{\text{fluvial}}$:** Relación entre el caudal medido en estación Quilaimo DGA y el caudal de diseño para período de retorno $T$ ($Q / Q_{T=100}$).
- **$H_{\text{piro}}$:** Función del Índice Piro-Meteorológico Canadiense (FWI de Van Wagner), velocidad del viento Puelche ($U$) y humedad relativa del combustible fino ($FFMC$).
- **$H_{\text{gravitacional}}$:** Lluvia antecedente de 24 horas acumulada frente al umbral crítico de saturación coluvial en laderas con pendiente $\beta > 30^\circ$.

### 2.2 Desglose del Factor Vulnerabilidad y Exposición ($V$)
El componente $V$ cuantifica la sensibilidad de los elementos situados dentro de la envolvente de impacto:
$$V = \frac{\sum_{i=1}^{N} \text{Activo}_i \cdot \omega_i}{\sum_{i=1}^{N} \omega_i}$$
- **Vidas y Asentamientos Humanos ($\omega = 0.40$):** Comités de Agua Potable Rural (APR Bullileo, Retiro Centro, Copihue, Romeral, Villaseca) y 4.850 habitantes rurales.
- **Conectividad y Red Vial Estratégica ($\omega = 0.25$):** Cruce Ruta 5 Sur (Km 328) y Puente Malcho (Ruta L-110).
- **Productividad Agrícola y Riego ($\omega = 0.20$):** 12.800 ha de arroz inundable, plantaciones de nogal y bocatomas matrices de canales DGA.
- **Infraestructura de Amortiguación ($\omega = 0.15$):** Zonas de vega y tranques de infiltración que absorben y disipan energía cinética.

---

## 3. Escala Cromática Normalizada de 5 Clases de Riesgo

Para garantizar una lectura visual unívoca y estandarizada entre operadores de terreno, ingenieros de cuenca y autoridades comunales (COE / SENAPRED), se define una escala de 5 clases:

| Clase | Rango Cuantitativo ($R$) | Rango Normalizado | Color Hex | Nivel Operacional | Protocolo y Acción C2 Requerida |
| :---: | :---: | :---: | :---: | :---: | :--- |
| **Clase 1** | **$0\% - 20\%$** | **$0.0 - 0.2$** | `#10b981` (Esmeralda) | **Muy Bajo (Línea Base)** | Monitoreo satelital ordinario Sentinel-2. Operación regularizada de compuertas DGA. |
| **Clase 2** | **$20\% - 40\%$** | **$0.2 - 0.4$** | `#84cc16` (Lima) | **Bajo (Alerta Preventiva)** | Revisión de zanjas de drenaje e inspección preventiva de pozos de bombeo APR. |
| **Clase 3** | **$40\% - 60\%$** | **$0.4 - 0.6$** | `#f59e0b` (Ámbar) | **Moderado (Alerta Amarilla)** | Apertura de aliviaderos hacia Tranques Keyline comunitarios (18.5k m³). Patrullaje de fajas con dron térmico. |
| **Clase 4** | **$60\% - 80\%$** | **$0.6 - 0.8$** | `#f97316` (Naranja) | **Alto / Severo (Alerta Naranja)** | Despacho de brigadas forestales a fajas cortafuegos 45m. Aviso radial VHF (146.520 MHz) a comités APR. |
| **Clase 5** | **$80\% - 100\%$** | **$0.8 - 1.0$** | `#ef4444` (Rojo Crítico) | **Muy Alto (Alerta Roja COE)** | Evacuación preventiva de riberas bajas. Cierre de calzada Ruta L-110 y activación de aspersores de techo WUI. |

---

## 4. Acople de Capas SIG Tradicionales de Exposición Territorial

El motor táctico integra cuatro capas geoespaciales vectoriales acopladas al Modelo Digital de Elevación:

### 4.1 Exposición y Vulnerabilidad de Suelo (Metodología de Inundaciones de Colonia)
Basada en la zonificación alemana de gestión de riesgo fluvial de Colonia (Köln Hochwasserschutz):
- 🔴 **Área Residencial & Asentamientos APR (`#f43f5e`, fill `#e11d48`, opacidad 0.50):** 4.850 habitantes, viviendas concentradas y escuelas rurales. Profundidad crítica de diseño: 1.2m - 2.1m.
- 🟠 **Corredores Viales & Puentes Estratégicos (`#ea580c`, fill `#c2410c`, opacidad 0.55):** Ruta 5 Sur (km 328) y Puente Malcho (Ruta L-110). Profundidad crítica: 0.8m - 1.5m.
- 🟡 **Suelo Agrícola Intensivo (`#eab308`, fill `#ca8a04`, opacidad 0.40):** 92 predios arroceros y frutícolas en valle regado. Profundidad crítica: 0.4m - 0.9m.
- 🟢 **Humedal Ribereño & Buffer de Amortiguación (`#10b981`, fill `#059669`, opacidad 0.35):** Vegas de sauces y colmatación natural diseñadas para recibir tirantes de hasta 3.5m sin daño patrimonial.

### 4.2 Zonificación de Severidad de Incendios CAL FIRE FHSZ & Austin WUI
Adaptación de la normativa californiana (CAL FIRE Fire Hazard Severity Zones) y el código de interfaz urbano-forestal de Austin, Texas:
- 🟤 **Very High FHSZ (`#b91c1c`, fill `#991b1b`, opacidad 0.45):** Laderas andinas con pendiente superior a 25°, monocultivo de Pino Insigne continuo y FWI de referencia entre 65 y 85.
- 🟠 **High FHSZ (`#ea580c`, fill `#c2410c`, opacidad 0.38):** Zona de transición agroforestal con matorral esclerófilo seco y espinales.
- 🟡 **Moderate FHSZ (`#f59e0b`, fill `#d97706`, opacidad 0.25):** Suelo agrícola bajo riego permanente y viñedos.
- 🌸 **WUI Ember Projection Zone (`#f43f5e`, trazo discontinuo `6, 4`, fill `#e11d48` al 30%):** Franja de proyección de pavesas ígneas arrastradas 1.5 km a sotavento por el viento Puelche.

### 4.3 Susceptibilidad de Remoción en Masa & Conos Aluviales (Ruta L-110)
- 🔴 **Zona de Escarpe Activo (`#ef4444`, fill `#dc2626`, opacidad 0.55):** Talud oriental descalzado por escorrentía con pendiente de 34° en coluvio volcánico alterado. Volumen desprendible estimado: 28.500 m³.
- 🟠 **Cono de Deyección Aluvial & Runout (`#f59e0b`, trazo discontinuo `8, 4`, opacidad 0.40):** Abanico de depósito con alcance proyectado de 420 metros sobre la calzada vehicular.

---

## 5. Unidades Tácticas de Riesgo (UD) y Vectores de Maniobra Multi-Fase

### 5.1 Especificación Gráfica de Unidades Tácticas
Para diferenciar inequívocamente las unidades tácticas operacionales de los polígonos catastrales estáticos, se implementa una gramática visual específica:
- **Contornos segmentados (`dashArray: '10, 8'`):** Indican que el límite es una envolvente operacional dinámica y permeable.
- **Trama de relleno estipulada (`SVG Stippled Dots Pattern`):** Una grilla semitransparente de micropuntos que transmite la idea de una fuerza o unidad activa sobre el terreno.
- **Badges tácticos flotantes:** Marcadores con tipografía monoespaciada de alta legibilidad, código de unidad y estado de avance.

```
       ╔═════════════════════════════════════════════════════════════════╗
       ║                UNIDADES TÁCTICAS OPERACIONALES (UD)             ║
       ╠═════════════════════════════════════════════════════════════════╣
       ║ • UD-01 [Fluvial]:     Azul Cian (#0ea5e9) con trama estipulada║
       ║ • UD-02 [Pirogénico]:  Rojo Carmesí (#ef4444) con trama         ║
       ║ • UD-03 [Aluvional]:   Naranja Ocre (#f97316) con trama        ║
       ║                                                                 ║
       ║               LÍNEAS DE DEFENSA ACTIVA EN EL MAPA               ║
       ║ ─────────────────────────────────────────────────────────────── ║
       ║ • Tranque Keyline:     Línea sólida Cian (#06b6d4, w: 4px)     ║
       ║ • Faja Cortafuegos:    Línea segmentada Esmeralda (#10b981)    ║
       ╚═════════════════════════════════════════════════════════════════╝
```

### 5.2 Secuencia Temporal de Maniobra por Fases
Cada unidad de riesgo proyecta vectores flecha con punta angular y rótulo de horizonte de tiempo:
1. **Fase 1 (0 a 2 horas):** Foco de cabecera o ignición inicial. Flecha de color saturado intenso. Representa el tiempo de contención inmediata.
2. **Fase 2 (2 a 6 horas):** Propagación a lo largo del talweg o salto de pavesas sobre la interfaz. Flecha de longitud media. Indica la zona de activación de defensas pasivas.
3. **Fase 3 (6 a 12 horas):** Envolvente crítica hacia ejes vitales (Ruta 5 Sur y bocatomas APR). Flecha de máxima proyección con rótulo de alerta mayor.

### 5.3 Líneas de Defensa Territorial Activa
- **Sistema Keyline Amortiguador (Yeomans):** 18.500 m³ de capacidad hidráulica de retención distribuida en tranques escalonados y zanjas de infiltración en cota clave, capaces de reducir el hidrograma de punta en un 4.2% para crecidas T=50.
- **Faja Cortafuegos WUI 45m:** 28 kilómetros de cortafuegos perimetral continuo con servidumbre firmada digitalmente por el 90% de los predios comunitarios (9 de 10 propietarios en quórum DAO).

---

## 6. Sincronización Reactiva con Presets Climáticos de Cuenca

Cuando el usuario selecciona un escenario en el panel de control o en el timeline scrubber, el motor ejecuta `window.updateHvrMatrix(presetKey)` recalculando instantáneamente la triada de riesgo y restilizando las capas cartográficas:

```javascript
// Ejemplo de recalibración reactiva ante Río Atmosférico T=100
updateHvrMatrix('storm_t100');
// H: 92% (Caudal 880 m³/s, 145 mm/24h)
// V: 74% (Vulnerabilidad máxima llanuras habitadas)
// R: (92 * 74) / 100 = 68.1% -> CLASE 4 (ALTO / SEVERO)
// Delta respecto a condición normal: +58.3% medio / +76.4% pico
```

| Escenario Climático | Amenaza ($H$) | Vulnerabilidad ($V$) | Riesgo Integrado ($R$) | Clase Resultante | Delta vs Línea Base |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Normal (Línea Base)** | **28%** | **35%** | **9.8%** | **Clase 1 (Muy Bajo)** | +0% (Estable) |
| **Helada Polar Invernal** | **35%** | **42%** | **14.7%** | **Clase 1 (Muy Bajo)** | +4.9% |
| **Megasequía Persistente** | **55%** | **58%** | **31.9%** | **Clase 2 (Bajo-Mod)** | +22.1% |
| **Ola de Calor Extrema** | **72%** | **58%** | **41.8%** | **Clase 3 (Moderado)** | +32.0% |
| **Temporal Fluvial T=10** | **68%** | **62%** | **42.2%** | **Clase 3 (Moderado)** | +32.4% |
| **Piro-Frente Puelche** | **88%** | **65%** | **57.2%** | **Clase 3 (Mod-Alto)** | +47.4% |
| **Río Atmosférico T=100** | **92%** | **74%** | **68.1%** | **Clase 4 (Alto/Severo)** | +58.3% (Pico +76.4%) |

---

## 7. Arquitectura de Visual Limpia Predial y Celdas Tácticas Orientadas en Transectos

Para evitar la fatiga cognitiva derivada de la superposición simultánea de capas SIG densas y permitir una toma de decisiones limpia y focalizada a nivel predial, AgriTwin implementa el principio de **Arranque en Visual Limpia (Clean Slate)** y la sustitución de macro-polígonos amorfos por **Celdas Tácticas Rectangulares Orientadas a lo Largo de Transectos Biofísicos**:

### 7.1 Principio de Arranque en Visual Limpia (Predio Meniel como Ancla)
1. **Línea Base Predial:** Al inicializar el mapa territorial (`[-36.2115, -71.6050]`, zoom 14), únicamente se renderiza el polígono perimetral del **Fundo Meniel** sobre la ortofotografía satelital nítida de alta resolución.
2. **Desacoplamiento de Macro-Capas:** Las capas macro-territoriales (inundación regional, FHSZ, exposición Colonia, remoción masiva, unidades tácticas globales, obras vecinales) y los motores de partículas continuas (flujo de agua, viento, curvas de nivel y acuífero) inician desactivados (`addTo(map)` condicional diferido).
3. **Mesa de Vecinos Bajo Demanda:** Los 9 predios colindantes de la red comunitaria se mantienen agrupados en una subcapa modular que se invoca selectivamente desde la botonera táctica sin saturar el análisis inicial.

### 7.2 Celdas Tácticas Rectangulares Orientadas ("Alertadoras, no Definitivas")
En lugar de macro-polígonos cerrados que proyectan falsas certezas de delimitación rígida, el riesgo dinámico se modela mediante **rectángulos tácticos pequeños con contorno segmentado** (`dashArray: '6, 4'`) y transparencias ligeras (`fillOpacity: 0.22`), orientados siguiendo los gradientes naturales de pendiente, talwegs y corredores de viento:

```
┌────────────────────────────────────────────────────────────────────────┐
│  ESTRUCTURA DE CELDAS TÁCTICAS EN TRANSECTOS BIOFÍSICOS                │
├────────────────────────────────────────────────────────────────────────┤
│ • TRANSECTO FLUVIAL (Eje Talweg Río Longaví - Cota 140m a 115m)        │
│   [F-01] Cabecera Quilaimo (0-2h)    -> H: 88%, V: 35%, R: 30.8%       │
│   [F-02] Valle Meniel Keyline (2-6h) -> H: 94%, V: 72%, R: 67.7%       │
│   [F-03] Eje Ruta 5 Sur (6-12h)      -> H: 76%, V: 89%, R: 67.6%       │
│   + Línea de Defensa Activa: Tranque Keyline Yeomans (18.500 m³)       │
├────────────────────────────────────────────────────────────────────────┤
│ • TRANSECTO PIROGÉNICO (Eje Corredor Puelche ESE - Ladera Cordillera)  │
│   [P-01] Ladera Alta Cordillera (0-2h)      -> H: 92%, V: 28%, R: 25.8%│
│   [P-02] Transición WUI Pavesas (2-6h)      -> H: 89%, V: 64%, R: 57.0%│
│   [P-03] Interfaz Peri-Predial Meniel (6-12h)->H: 82%, V: 88%, R: 72.2%│
│   + Línea de Defensa Activa: Faja Cortafuegos WUI 45m (Servidumbre 90%)│
├────────────────────────────────────────────────────────────────────────┤
│ • TRANSECTO REMOCIÓN EN MASA (Eje Ladera A110 - Pendiente >34°)        │
│   [M-01] Escarpe Activo 34° A110 (Descalce) -> H: 85%, V: 42%, R: 35.7%│
│   [M-02] Cono Runout Aluvial L-110 (420m)   -> H: 74%, V: 78%, R: 57.7%│
└────────────────────────────────────────────────────────────────────────┘
```

### 7.3 Encuadre Contextual Inteligente (Enfoque Opción 1A)
Al activar un transecto de riesgo desde la pastilla táctica correspondiente:
- **`flyToBounds` Contextual:** La cámara ajusta suavemente su encuadre (`padding: [60, 60]`) abarcando en un único cuadro tanto las celdas del transecto activo como el Predio Meniel. Esto garantiza que el operador territorial nunca pierda la referencia de su ubicación central ni la distancia relativa respecto al frente de avance.
- **Retorno Automático al Predio:** Al desactivar el transecto, la cámara ejecuta una transición suave de retorno `flyTo([-36.2115, -71.6050], 14)`, re-centrando el predio en vista de detalle satelital.

### 7.4 Régimen de Viento y Humo Según Emergencia
- Las partículas del motor de viento y dispersión de humo permanecen apagadas en tiempo de paz.
- Se activan exclusivamente bajo dos condiciones:
  1. Activación manual del botón de pastilla `[🌪️ Viento Puelche]` en el dock territorial.
  2. Selección de un escenario de emergencia pirogénica activa (`Piro-Frente Puelche` o `Ola de Calor Extrema`), donde el vector eólico y el cono de pavesas cobran relevancia crítica inmediata.

---

## 8. Disponibilidad en la Plataforma AgriTwin

El sistema se encuentra integrado en producción a través de:
1. **Ruta Directa URL:** `http://localhost:7777/#tactico` abre el visor territorial de cuenca en modo táctico oscuro con el subtab H-V-R expandido automáticamente.
2. **Panel Táctico Derecho (432px):** Pestaña `🎯 Táctico H-V-R` con barras animadas de progreso para Hazard, Vulnerability y Risk, delta tag estilo Burdeos, desglose de 5 clases de riesgo y controles de capas.
3. **Widget de Leyendas Flotante (`cuencaTacticalLegendWidget`):** Tarjeta HUD interactiva en la esquina inferior izquierda del mapa, accesible en todo momento mediante el botón `[🗺️ Leyendas C2]` del dock territorial.
4. **Bóveda de Conocimiento (Knowledge Vault):** Módulo 11 en la sección de Arquitectura (`docs-arch`), complementado con la descarga del Informe Integrado Multi-Escala en formato auditable.

