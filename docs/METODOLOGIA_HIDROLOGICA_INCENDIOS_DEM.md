# Metodología Científica e Hidrológica: Modelación de Inundaciones, Dinámica de Vientos, Biomasa Satelital e Incendios en Cuencas Agrícolas

## AgriTwin 3D • Sistema de Gemelo Digital de Cuenca (Cuenca del Maule / Río Perquilauquén)

Este documento detalla los fundamentos matemáticos, geomorfológicos y de teledetección implementados en AgriTwin para el análisis integral de riesgos hidrológicos (inundaciones por DEM), transporte eólico (partículas estilo Windy), estimación de biomasa y propagación de incendios forestales.

---

## 1. Modelación Hidrológica de Inundaciones a partir del DEM y Gravedad

### 1.1 Modelo Digital de Elevaciones (DEM) y Matriz de Pendientes
A partir de la malla tridimensional o ráster altimétrico $z = h(x, y)$, se derivan los componentes vectoriales del gradiente topográfico espacial en cada celda:

$$\nabla h(x, y) = \left( \frac{\partial h}{\partial x}, \frac{\partial h}{\partial y} \right)$$

La pendiente local $S$ (en m/m o porcentaje) y el ángulo de inclinación $\beta$ corresponden a:

$$S = \|\nabla h\| = \sqrt{\left(\frac{\partial h}{\partial x}\right)^2 + \left(\frac{\partial h}{\partial y}\right)^2}, \quad \beta = \arctan(S)$$

### 1.2 Algoritmo de Dirección de Flujo Gravitacional (D8 / Steepest Descent)
Bajo la acción exclusiva del potencial gravitatorio $V = g \cdot h$, el agua superficial fluye en la dirección ortogonal a las curvas de nivel, es decir, a lo largo del vector de máxima pendiente descendente:

$$\vec{v}_{\text{drenaje}} = - \frac{\nabla h}{\|\nabla h\|}$$

En una celda discreta de 8 vecinos (D8), el flujo se asigna a la celda vecina $k$ con la mayor caída hidráulica:

$$\Delta h_k = \frac{h_0 - h_k}{d_k}$$

Donde $d_k$ es la distancia entre centros de celdas ($d = \Delta x$ para ortogonales, $d = \sqrt{2}\Delta x$ para diagonales).

### 1.3 Área de Contribución Acumulada ($\alpha$) e Índice Topográfico de Humedad (TWI)
El área de drenaje acumulada aguas arriba por unidad de ancho de contorno ($\alpha$, en $m^2/m$) se determina propagando el flujo desde las divisorias de aguas (*watersheds*) hasta los talwegs o fondos de quebrada.

Siguiendo el marco hidrológico **TOPMODEL (Beven & Kirkby, 1979)**, el potencial de acumulación de agua subsuperficial y saturación superficial se define mediante el **Índice Topográfico de Humedad (TWI)**:

$$TWI = \ln\left( \frac{\alpha}{\tan \beta} \right)$$

- **$TWI > 10$**: Zonas de llanura aluvial, fondos de vaguada y meandros con drenaje deficiente $\to$ **Alta susceptibilidad a encharcamiento e inundación permanente**.
- **$4 \le TWI \le 10$**: Terrazas intermedias de recarga y drenaje equilibrado.
- **$TWI < 4$**: Laderas andinas y crestas con alta pendiente y baja retención $\to$ **Zonas de generación de escorrentía rápida (escorrentía hortoniana)**.

### 1.4 Simulación Hidráulica 2D de Inundaciones (Aproximación de Onda Difusiva / Saint-Venant)
Para la propagación del flujo bidimensional en la llanura de inundación se emplean las ecuaciones promediadas en la profundidad de Saint-Venant:

$$\frac{\partial h_w}{\partial t} + \frac{\partial (u \cdot h_w)}{\partial x} + \frac{\partial (v \cdot h_w)}{\partial y} = R - I$$

$$\frac{\partial u}{\partial t} + u\frac{\partial u}{\partial x} + v\frac{\partial u}{\partial y} = -g \frac{\partial (z + h_w)}{\partial x} - g \frac{n^2 u \sqrt{u^2 + v^2}}{h_w^{4/3}}$$

Donde:
- $h_w$: Tirante de agua superficial (profundidad de inundación).
- $z$: Elevación del terreno (DEM).
- $n$: Coeficiente de rugosidad de Manning ($n \approx 0.035$ para suelo aluvial limpio, $n \approx 0.075$ para corredores de bosque ribereño con Quillay/Sauce).
- $R - I$: Precipitación líquida neta menos tasa de infiltración de Green-Ampt.

### 1.5 Acople Dinámico de Macro-Cuenca: Río Longaví y Embalse Bullileo (Doctrina Extremes DT)
En la versión 4.2.0, AgriTwin supera el enfoque de caudales fluviales estáticos mediante el motor `basin-hydrology-engine.js`, implementando un modelo acoplado de propagación aguas arriba $\rightarrow$ aguas abajo:

1. **Hidrograma Fluvial Dinámico del Río Longaví ($Q_{\text{Longaví}}$)**:
   El caudal en la estación de aforo DGA El Castillo / Retiro se modela como la superposición de caudal base, deshielo térmico andino y escorrentía rápida superficial:

   $$Q_{\text{Longaví}}(t) = Q_{\text{base}} + \max(0, (T_{\text{aire}} - 18.0) \cdot 0.45) + (P_{24\text{h}} \cdot 0.42 + P_{72\text{h}} \cdot 0.15)$$

   Donde $Q_{\text{base}} = 8.5\text{ m}^3/\text{s}$ es el caudal base estival de recesión de acuíferos fracturados cordilleranos. El nivel de agua de la sección ($h$) se calibra mediante curva gasto-altura $h = 0.45 + 0.22 \cdot Q^{0.42}$.

2. **Balance Volumétrico del Embalse Bullileo ($110\text{ hm}^3$)**:
   La reserva estratégica de cabecera se actualiza diariamente según el balance neto entre afluentes cordilleranos y la extracción de los canales matrices de Parral y Retiro:

   $$V_{\text{Bullileo}}(t) = V(t-1) + (Q_{\text{afluente}} - Q_{\text{demanda\_riego}}) \cdot 0.0864 \quad [\text{hm}^3/\text{día}]$$

   Donde $Q_{\text{demanda\_riego}} \approx 12.0\text{ m}^3/\text{s}$.

3. **Condición de Borde y Regla de Turnos de Riego para Fundo Meniel ($28\text{ L/s}$)**:
   El caudal disponible en el río condiciona la entrega efectiva de la Junta de Vigilancia hacia el Tranque Keyline ($18.500\text{ m}^3$):

   $$\text{Entrega}(Q) = \begin{cases} 100\% \quad (28.0\text{ L/s}) & \text{si } Q_{\text{Longaví}} \ge 12.0\text{ m}^3/\text{s} \quad \text{[Régimen Abundante]} \\ 75\% \quad (21.0\text{ L/s}) & \text{si } 8.0 \le Q_{\text{Longaví}} < 12.0\text{ m}^3/\text{s} \quad \text{[Turno Moderado]} \\ 45\% \quad (12.6\text{ L/s}) & \text{si } Q_{\text{Longaví}} < 8.0\text{ m}^3/\text{s} \quad \text{[Estiaje Severo - Activar Pozo]} \end{cases}$$

---

## 2. Modelación de Dinámica de Vientos: Macroescala (Windy) vs. Microescala Orográfica de Cuenca

### 2.1 ¿Por qué Windy cubre todo el mapa y cómo difiere de un Visor de Cuenca 3D?
En visores sinópticos globales como **Windy**, se representan modelos meteorológicos regionales (ECMWF ~9 km, GFS ~22 km, ICON ~13 km). A esa resolución:
1. **Promedio espacial sinóptico:** Las montañas, quebradas de 200 metros y valles intermedios quedan aplanados en una celda regular homogénea.
2. **Textura continua 2D en pantalla:** Windy proyecta un campo regular bidimensional $\vec{W}(x, y) = (u, v)$ en el espacio plano de la pantalla (*screen-space flow*).
3. **Incompatibilidad a ras de suelo:** Proyectar el campo de Windy sin considerar la física orográfica haría que los vectores atravesaran cerros y montañas como si fueran transparentes, ignorando el confinamiento que sufre el aire contra el suelo.

En el **Visor de Cuenca 3D de AgriTwin**, la física desciende a resolución métrica sobre el Modelo Digital de Elevación ($z = h(x, y)$), donde el relieve fragmenta, desvía y canaliza el flujo en corrientes locales estratificadas:

$$\vec{V}_{\text{local}}(x, y, z) = \vec{V}_{\text{sinóptico}} + \vec{V}_{\text{orográfico}}(\nabla h) + \vec{V}_{\text{térmico}}(\Delta T, z)$$

### 2.2 Las 4 Corrientes de Aire Dominantes en la Cuenca del Perquilauquén / Maule

A escala de cuenca, el flujo de aire no es un vector único, sino un sistema distribuido de corrientes gobernadas por gradientes barométricos, pendiente y radiación solar:

| Corriente Orográfica | Origen / Dirección | Física & Fenómeno Impulsor | Velocidad Típica | Impacto Agroclimático & Riesgo |
| :--- | :--- | :--- | :--- | :--- |
| **1. Viento Puelche / Raco** | $ENE \to WSW$ (Andes $\to$ Valle) | Descenso foehn catabático cálido, compresión adiabática al bajar de 2.500m. | $38 - 65\text{ km/h}$ | Desecación súbita de follaje, regla 30-30-30, piro-riesgo extremo (FWI). |
| **2. Brisa Marina Diurna** | $SW \to NE$ (Pacífico $\to$ Cordillera) | Gradiente térmico tierra-mar; asciende por laderas soleadas (flujo anabático). | $14 - 24\text{ km/h}$ | Alivio de estrés térmico vespertino, evapotranspiración moderada. |
| **3. Drenaje Catabático Nocturno**| Cerros $\to$ Fondos de Vaguada | Enfriamiento radiativo nocturno; aire frío y denso desciende pegado a tierra ($h \approx 0.8\text{m}$). | $6 - 12\text{ km/h}$ | **Inversión térmica**: acumulación de heladas agronómicas en hondonadas bajas. |
| **4. Chorro Quebrada (Venturi)** | Talweg del Estero ($E \to W$) | Encajonamiento en gargantas y cañones fluviales; conservación de masa $(\nabla \cdot \vec{V} = 0)$. | $20 - 35\text{ km/h}$ | Corredores biológicos riparios, dispersión de esporas y microclima de ribera. |

### 2.3 Formulación Matemática de Partículas 3D Acopladas al DEM
Cada corriente emite partículas lagrangianas sobre el terreno con seguimiento de cota y meandros topográficos:

$$P_{t + \Delta t}.x = P_t.x + \left( \vec{u}_{\text{base}} + \Delta u_{\text{turb}}(\sin(\omega t + \kappa z)) \right) \cdot \Delta t$$

$$P_{t + \Delta t}.z = P_t.z + \left( \vec{w}_{\text{base}} + \Delta w_{\text{turb}} \right) \cdot \Delta t$$

$$P_{t + \Delta t}.y = h(P_x, P_z)_{\text{DEM}} + h_{\text{offset}} + A \sin(\omega_y t)$$

Donde:
- $h(P_x, P_z)_{\text{DEM}}$: Cota interpolada bilinealmente desde la malla topográfica.
- $h_{\text{offset}}$: Altitud estratificada (0.8 m para drenaje de heladas frío, 1.1 m para chorro fluvial, 2.2 m para viento Puelche).
- La estela aerodinámica mantiene un historial temporal FIFO de 6 nodos con decaimiento senoidal de opacidad alfa $\alpha(t) = \sin\left(\pi \frac{\text{edad}}{\text{maxAge}}\right) \cdot \alpha_{\max}$, evitando discontinuidades visuales.

---

## 3. Estimación de Biomasa Satelital e Índices Multiespectrales (Sentinel-2 L2A STAC + COG)

En la versión 4.2.0, AgriTwin supera el uso de filtros cosméticos CSS de color y adopta la arquitectura canónica de **Destination Earth Data Lake (DEDL)** mediante el protocolo **STAC (SpatioTemporal Asset Catalog 1.0.0)** y **COGs (Cloud-Optimized GeoTIFFs)** implementados en `stac-cog-client.js`.

### 3.1 Protocolo de Acceso Bajo Demanda (HTTP Range Requests)
En lugar de descargar escenas completas de Sentinel-2 L2A (~1 GB por órbita), el cliente formula consultas espaciales delimitadas al Bounding Box de Fundo Meniel (`[-71.6150, -36.2160, -71.5980, -36.2070]`, Tile `18HYD`):
* Mediante *HTTP Range Requests (RFC 7233)*, el servidor lee únicamente los offsets de bytes correspondientes a los píxeles de los cuarteles (~160 KB por banda).
* El cálculo radiométrico se ejecuta directamente en memoria RAM sobre reflectancias de superficie corregidas atmosféricamente (Bottom-Of-Atmosphere, BOA).

### 3.2 Librería Canónica de Índices Biofísicos Calculados

| Índice | Ecuación Canónica | Bandas Sentinel-2 | Aplicación Agronómica & Hidrológica en Fundo Meniel |
| :--- | :--- | :--- | :--- |
| **NDVI** | $\frac{B08 - B04}{B08 + B04}$ | NIR (842nm) vs Red (665nm) | Vigor fotosintético general y densidad de biomasa activa. |
| **NDRE** | $\frac{B08 - B05}{B08 + B05}$ | NIR (842nm) vs RedEdge (705nm) | Contenido de clorofila en frutales densos (Avellano/Cerezo) donde el NDVI se satura. |
| **NDWI (McFeeters)** | $\frac{B03 - B08}{B03 + B08}$ | Green (560nm) vs NIR (842nm) | Detección de lámina libre de agua en Tranque Keyline ($18.500\text{ m}^3$) y Estero Colliguay. |
| **NDMI (Gao)** | $\frac{B08 - B11}{B08 + B11}$ | NIR (842nm) vs SWIR1 (1610nm) | Contenido de agua en tejido foliar vivo (*Fuel Moisture*). Detecta estrés 10-14 días antes de marchitez visible. |
| **SAVI (Huete)** | $\frac{B08 - B04}{B08 + B04 + 0.5} \cdot 1.5$ | NIR vs Red con factor $L=0.5$ | Vigor ajustado eliminando el ruido de reflectancia del suelo desnudo entre hileras. |
| **NBR** | $\frac{B08 - B12}{B08 + B12}$ | NIR vs SWIR2 (2190nm) | Diagnóstico de necromasa vegetal seca y susceptibilidad a ignición de incendios. |

### 3.3 Relación entre NDVI y Biomasa Forestal
La biomasa aérea leñosa y de pastizal (*Above Ground Biomass*, $AGB$, en $t/\text{ha}$) se modela empíricamente con saturación logística:

$$AGB = AGB_{\max} \cdot \left( \frac{1}{1 + e^{-k \cdot (NDVI - NDVI_0)}} \right)$$

---

## 4. Algoritmo de Propagación de Incendios Acoplado (Rothermel & FWI)

La tasa de avance lineal del frente de fuego ($R$, en m/min) combina combustible, pendiente y viento:

$$R = R_0 \cdot (1 + \phi_w + \phi_s)$$

1. **Tasa de Avance Base ($R_0$)**: Función de la carga de biomasa ($w_0 \propto NDVI$) y el contenido de humedad del combustible fino ($FMC$ obtenido de sensores IoT y NDII):
   $$R_0 \propto \frac{I_R \cdot \xi}{\rho_b \cdot \varepsilon \cdot Q_{ig}}$$
2. **Factor de Viento ($\phi_w$)**: Aceleración exponencial en la dirección del viento vectorizado:
   $$\phi_w = C \cdot U^B \cdot \left(\frac{\beta}{\beta_{op}}\right)^{-E}$$
3. **Factor de Pendiente ($\phi_s$)**: Propagación cuesta arriba por precalentamiento convectivo y radiativo:
   $$\phi_s = 5.275 \cdot (\tan \beta)^2$$
4. **Envolvente Elíptica de Fons / Anderson**:
   El fuego se expande desde el punto de ignición como una elipse alargada donde la razón largo/ancho ($L_w$) es función directa de la velocidad del viento $U$:
   $$L_w = 0.936 \cdot e^{0.143 \cdot U} + 0.461$$

---

## 5. Diseño Gráfico Geomorfológico y Estratigráfico

Inspirado en los tratados de geomorfología (Arthur Holmes, Tarbuck & Lutgens) y perfiles estratigráficos de bloques de cuenca:
1. **Líneas de Contorno / Curvas de Nivel**: Estilizadas matemáticamente con líneas secundarias suaves y maestras destacadas en blanco/grafito.
2. **Flechas Vectoriales 3D de Drenaje**: Símbolos hidrológicos limpios que fluyen a lo largo de los ejes de vaguada indicando magnitud y sentido de la escorrentía gravitatoria.
3. **Zonas Demarcadas de Riesgo Hidráulico y Piro-Riesgo**: Envolventes poligonales de estilo cartográfico con contornos sutiles, códigos de color normados y transparencias calibradas para no ocultar la topografía del terreno.

---

## 6. Doctrina Táctica de Mando (C2): Superación del Enfoque Lineal hacia Unidades de Riesgo y Maniobra Multiamenaza

### 6.1 Limitación de los Flujos Lineales y Necesidad de Áreas de Influencia
La modelación hidrológica tradicional centrada en isolíneas de tirante o vectores unidimensionales de viento no logra representar la interacción espacial con la vulnerabilidad antrópica y productiva. En AgriTwin se adopta una **Doctrina C2 (Command & Control)** inspirada en los gráficos de maniobra militar operativa (frentes, escalones y líneas de contención):

1. **Unidades Tácticas de Riesgo (UD):** Delimitadas mediante polígonos permeables con borde segmentado (`dashArray: '10, 8'`) y trama de puntos estipulados (*stippled SVG*), distinguiendo unidades en avance activo frente a áreas estáticas de shapefile:
   - **UD-01 (Frente Fluvial):** Cabecera Quilaimo ➔ Desborde R5 Sur (Azul Cian `#0ea5e9`).
   - **UD-02 (Foco Pirogénico):** Ladera Bullileo ➔ Salto de Pavesas 1.5 km WUI (Rojo `#ef4444`).
   - **UD-03 (Deslizamiento A110):** Escarpe 34° ➔ Cono Runout 420m (Naranja `#f97316`).

2. **Vectores de Maniobra Multi-Fase:**
   - **Fase 1 (0-2h):** Contención inmediata en cabecera de quebrada o foco primario.
   - **Fase 2 (2-6h):** Propagación a lo largo de llanuras y activación de defensas pasivas.
   - **Fase 3 (6-12h):** Envolvente crítica hacia ejes vitales (Ruta 5 Sur, bocatomas y pozos APR).

3. **Líneas de Defensa Activa:**
   - **Línea Keyline (~18.5k m³):** Red de tranques y zanjas en cota clave (Cian `#06b6d4`, línea sólida).
   - **Faja Cortafuegos WUI 45m:** 28 km continuos con 90% de quórum de predios vecinos (Esmeralda `#10b981`, línea segmentada).

### 6.2 Ecuación Cuantitativa Canónica $R = (H \times V) / 100$
El riesgo no es un concepto cualitativo difuso, sino un producto matemático normalizado:

$$R = \frac{\text{Amenaza Física }(H) \times \text{Vulnerabilidad Expuesta }(V)}{100}$$

Con una escala unificada de 5 clases de riesgo:
- **Clase 1 (0 - 20%):** Muy Bajo (`#10b981`).
- **Clase 2 (20 - 40%):** Bajo (`#84cc16`).
- **Clase 3 (40 - 60%):** Moderado (`#f59e0b`).
- **Clase 4 (60 - 80%):** Alto / Severo (`#f97316`).
- **Clase 5 (80 - 100%):** Muy Alto / Crítico (`#ef4444`).

Para una especificación exhaustiva de las matrices, capas SIG acopladas (Colonia, CAL FIRE FHSZ, Austin WUI, Remoción en Masa A110) y leyendas cromáticas completas, consultar [ENFOQUE_TACTICO_C2_RIESGO_CUENCA.md](file:///Users/danielsantander/Documents/Agrotech/agritwin/docs/ENFOQUE_TACTICO_C2_RIESGO_CUENCA.md).

