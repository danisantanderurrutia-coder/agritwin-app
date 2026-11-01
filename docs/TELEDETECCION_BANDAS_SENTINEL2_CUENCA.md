# Teledetección Espectral Satelital Sentinel-2 L2A en Modo Cuenca: Física de la Luz, Catálogo de Bandas e Índices Biofísicos

## AgriTwin Master Suite • Gemelo Digital Biofísico Multiescala
**Macro-Cuenca del Maule Sur • Río Longaví / Embalse Bullileo • Fundo Meniel (24.8 ha)**  
*Documento Canónico de Especificación Espectral, Reflectancia BOA y Límites Ópticos*  
*Versión:* 3.5.0 • *Fecha:* Octubre 2026 • *Estado:* Operativo (`#sat-cuenca-core`)

---

## 1. Introducción & Fundamento de la Reflectancia BOA

En la arquitectura de AgriTwin, la teledetección espacial no opera como una simple capa cartográfica ornamental, sino como un **forzamiento radiométrico determinista continuo**. Se alimenta de la constelación **Sentinel-2 MSI (MultiSpectral Instrument)** de la Agencia Espacial Europea (ESA) mediante el catálogo **STAC 1.0.0** (SpatioTemporal Asset Catalog) y consultas HTTP Range sobre **Cloud-Optimized GeoTIFFs (COGs)** alojados en AWS y Copernicus Data Space Ecosystem (CDSE).

El nivel de procesamiento adoptado es **Level-2A (L2A)**, que proporciona **Reflectancia de Superficie en el Fondo de la Atmósfera (BOA - Bottom-Of-Atmosphere)**. Este preprocesamiento elimina el efecto de aerosoles, vapor de agua y dispersión atmosférica mediante el algoritmo Sen2Cor, asegurando que los valores de reflectancia $\rho \in [0, 1]$ representen la firma física real de los tejidos vegetales, el agua libre y los minerales del suelo de la cuenca.

---

## 2. Catálogo Exhaustivo: Análisis Banda por Banda (Las 10 Bandas Activas en Cuenca)

AgriTwin explota diez bandas ópticas clave de Sentinel-2 para capturar la interacción de la radiación solar con los componentes biológicos y físicos del paisaje:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│             ESPECTRO ELECTROMAGNÉTICO Y BANDAS SENTINEL-2 EN AGRITWIN                  │
├───────┬─────────────────┬───────────┬────────────┬─────────────────────────────────────┤
│ Banda │ Nombre Espectral│ Centro λ  │ Resolución │ Física de Interacción con la Materia│
├───────┼─────────────────┼───────────┼────────────┼─────────────────────────────────────┤
│ B02   │ Azul            │ 490 nm    │ 10 metros  │ Absorción por carotenoides; Rayleigh│
│ B03   │ Verde           │ 560 nm    │ 10 metros  │ Pico de reflectancia de clorofila   │
│ B04   │ Rojo            │ 665 nm    │ 10 metros  │ Máxima absorción fotosintética      │
│ B05   │ Red-Edge 1      │ 705 nm    │ 20 metros  │ Límite crítico de borde rojo        │
│ B06   │ Red-Edge 2      │ 740 nm    │ 20 metros  │ Estructura de canopia y LAI         │
│ B07   │ Red-Edge 3      │ 783 nm    │ 20 metros  │ Meseta de biomasa aérea y nitrógeno │
│ B08   │ NIR Ancho       │ 842 nm    │ 10 metros  │ Dispersión celular en mesófilo      │
│ B8A   │ NIR Estrecho    │ 865 nm    │ 20 metros  │ Calibración libre de vapor de agua  │
│ B11   │ SWIR 1          │ 1.610 nm  │ 20 metros  │ Fuerte absorción por agua en hoja   │
│ B12   │ SWIR 2          │ 2.190 nm  │ 20 metros  │ Absorción por lignina, C-H y SOC    │
└───────┴─────────────────┴───────────┴────────────┴─────────────────────────────────────┘
```

### 2.1 Banda B02 — Azul Visible ($490\text{ nm}$ • $10\text{ m}$)
* **Física:** La radiación azul es absorbida intensamente por las clorofilas $a$ y $b$ y por los carotenoides (pigmentos accesorios fotoprotectores). En la atmósfera sufre una alta dispersión de Rayleigh.
* **Función en Cuenca:** Es el componente de referencia para el **Bare Soil Index (BSI)** y para evaluar la transparencia o turbidez por sedimentos en suspensión en el Embalse Bullileo y el Río Longaví.

### 2.2 Banda B03 — Verde Visible ($560\text{ nm}$ • $10\text{ m}$)
* **Física:** Corresponde a la ventana del espectro visible donde la clorofila no absorbe eficientemente, produciendo el pico de reflectancia que da el color verde a la vegetación sana.
* **Función en Cuenca:** Componente reflectivo fundamental del **Índice Diferencial de Agua Normalizado (NDWI de McFeeters)** para mapear la lámina de agua libre en tranques de infiltración Keyline y esteros.

### 2.3 Banda B04 — Rojo Visible ($665\text{ nm}$ • $10\text{ m}$)
* **Física:** Punto de máxima absorción fotónica de la clorofila para impulsar la fase lumínica de la fotosíntesis. Una planta sana absorbe entre el $85\%$ y $95\%$ de esta luz.
* **Función en Cuenca:** Proporciona el contraste negativo esencial contra el infrarrojo cercano para calcular el **NDVI**, el **SAVI** y la fracción mineral de suelo expuesto en el **BSI**.

### 2.4 Banda B05 — Borde Rojo 1 / Red-Edge 1 ($705\text{ nm}$ • $20\text{ m}$)
* **Física:** El límite físico de inflexión entre la absorción fotosintética y la dispersión estructural de la hoja. Es la región más sensible a cambios sutiles en la concentración de clorofila.
* **Función en Cuenca:** **Crítica para frutales mayores (Avellano Europeo y Cerezo).** Permite calcular el **NDRE** y el **MCARI**, evitando la saturación del NDVI cuando el índice de área foliar supera $LAI > 3.0$ en pleno verano.

### 2.5 Banda B06 — Borde Rojo 2 / Red-Edge 2 ($740\text{ nm}$ • $20\text{ m}$)
* **Física:** Situada en la pendiente ascendente del borde rojo. La luz penetra múltiples capas celulares del dosel sin saturarse.
* **Función en Cuenca:** Estimación del Índice de Área Foliar (LAI) y diferenciación de estratos verticales entre copas de árboles y cubiertas vegetales vivas de suelo.

### 2.6 Banda B07 — Borde Rojo 3 / Red-Edge 3 ($783\text{ nm}$ • $20\text{ m}$)
* **Física:** Punto de entrada a la meseta del infrarrojo cercano. Insensible a la concentración de pigmentos, pero altamente sensible al volumen de biomasa verde.
* **Función en Cuenca:** Monitoreo de senescencia otoñal, acumulación de materia seca y contenido de nitrógeno en canopias densas.

### 2.7 Banda B08 — Infrarrojo Cercano Ancho / NIR ($842\text{ nm}$ • $10\text{ m}$)
* **Física:** La radiación no es absorbida por pigmentos (lo que evitaría el sobrecalentamiento letal de la hoja), sino que es dispersada por refracción interna en los espacios de aire del tejido esponjoso del mesófilo. El agua pura absorbe casi el $100\%$ de esta banda.
* **Función en Cuenca:** Pilar del cálculo de vigor foliar, biomasa activa y diferenciación inmediata de cuerpos de agua.

### 2.8 Banda B8A — Infrarrojo Cercano Estrecho / NIR Narrow ($865\text{ nm}$ • $20\text{ m}$)
* **Física:** Banda estrecha ($20\text{ nm}$ de ancho) posicionada deliberadamente en una ventana libre de bandas de absorción de vapor de agua atmosférico.
* **Función en Cuenca:** Calibración radiométrica fina frente a variaciones de humedad atmosférica y cálculo del índice canónico de agua de Gao (1996).

### 2.9 Banda B11 — Infrarrojo de Onda Corta 1 / SWIR 1 ($1.610\text{ nm}$ • $20\text{ m}$)
* **Física:** Coincide con una fuerte banda de absorción de agua líquida molecular dentro de los tejidos de la hoja. A menor agua en la célula, mayor es la reflectancia en SWIR 1.
* **Función en Cuenca:** Diagnóstico temprano de estrés hídrico foliar (**NDMI**) con $10-14$ días de anticipación respecto al marchitamiento visible. Diferenciación de suelo seco mineral.

### 2.10 Banda B12 — Infrarrojo de Onda Corta 2 / SWIR 2 ($2.190\text{ nm}$ • $20\text{ m}$)
* **Física:** Zona de absorción característica de compuestos carbonatados complejos: lignina, celulosa seca, necromasa vegetal y enlaces C-H y C-O de la materia orgánica del suelo.
* **Función en Cuenca:** Detección de pastizal seco combustible para el modelo de propagación de incendios (**NBR**), mapeo de severidad de quema y proxy de **Carbono Orgánico del Suelo (SOC)** en áreas con cobertura discontinua.

---

## 3. Formulación Matemática de los 8 Índices Biofísicos del Twin

El motor `stac-cog-client.js` ejecuta la resolución de ocho ecuaciones radiométricas normalizadas sobre cada cuartel del mosaico territorial:

### 3.1 Vigor Vegetal General ($NDVI$)
$$\text{NDVI} = \frac{\rho_{\text{B08}} - \rho_{\text{B04}}}{\rho_{\text{B08}} + \rho_{\text{B04}}}$$
* *Rouse et al. (1974).* Diagnóstico macro de biomasa fotosintéticamente activa. Se satura en avellanos con $NDVI > 0.82$.

### 3.2 Clorofila Fiel en Dosel Denso ($NDRE$)
$$\text{NDRE} = \frac{\rho_{\text{B08}} - \rho_{\text{B05}}}{\rho_{\text{B08}} + \rho_{\text{B05}}}$$
* *Gitelson & Merzlyak (1994).* Sustituye la banda roja por el Red-Edge 1, penetrando las capas inferiores de la copa sin saturación estival.

### 3.3 Clorofila Pura Libre de Suelo ($MCARI$)
$$\text{MCARI} = \left[(\rho_{\text{B05}} - \rho_{\text{B04}}) - 0.2 \cdot (\rho_{\text{B05}} - \rho_{\text{B03}})\right] \cdot \left(\frac{\rho_{\text{B05}}}{\rho_{\text{B04}}}\right)$$
* *Daughtry et al. (2000).* Máxima sensibilidad al contenido de clorofila pura, eliminando el ruido de fondo del suelo desnudo entre hileras.

### 3.4 Espejo de Agua Libre en Tranques ($MNDWI$)
$$\text{MNDWI} = \frac{\rho_{\text{B03}} - \rho_{\text{B11}}}{\rho_{\text{B03}} + \rho_{\text{B11}}}$$
* *Xu (2006).* El agua libre absorbe el $99.8\%$ de SWIR 1 ($\rho_{\text{B11}} \to 0$), otorgando un umbral positivo nítido ($\text{MNDWI} > 0.2$) inmune a sombras de cerros o álamos cortaviento.

### 3.5 Contenido Hídrico de Canopia ($NDMI$)
$$\text{NDMI} = \frac{\rho_{\text{B08}} - \rho_{\text{B11}}}{\rho_{\text{B08}} + \rho_{\text{B11}}}$$
* *Gao (1996).* Mide el espesor de la lámina equivalente de agua foliar. Valores $\text{NDMI} < 0.20$ activan la alerta de estrés hídrico previo a daño tisular.

### 3.6 Ajuste por Suelo Descubierto ($SAVI$)
$$\text{SAVI} = \frac{(\rho_{\text{B08}} - \rho_{\text{B04}}) \cdot (1 + L)}{\rho_{\text{B08}} + \rho_{\text{B04}} + L}, \quad L = 0.5$$
* *Huete (1988).* Introduce el factor $L=0.5$ para alinear las líneas de isovegetación en huertos jóvenes o viñedos espaciados.

### 3.7 Piro-Riesgo y Necromasa Combustible ($NBR$)
$$\text{NBR} = \frac{\rho_{\text{B08}} - \rho_{\text{B12}}}{\rho_{\text{B08}} + \rho_{\text{B12}}}$$
* *Key & Benson (2006).* Cuantifica la proporción de pastizal muerto y seco frente a vegetación verde viva, alimentando el combustible fino ($FFMC$) del modelo de fuego.

### 3.8 Fracción de Suelo Desnudo ($BSI$) y Proxy de Carbono ($SOC$)
$$\text{BSI} = \frac{(\rho_{\text{B11}} + \rho_{\text{B04}}) - (\rho_{\text{B08}} + \rho_{\text{B02}})}{(\rho_{\text{B11}} + \rho_{\text{B04}}) + (\rho_{\text{B08}} + \rho_{\text{B02}})}$$
$$\text{SOC}_{\text{proxy}} = (1 - \text{BSI}) \cdot 0.5 + \left(1 - \frac{\rho_{\text{B11}} + \rho_{\text{B12}}}{2}\right) \cdot 0.5$$
* *Rikimaru (2002) & Castaldi et al. (2018).* Mapea la presencia de rastrojo y la acumulación de materia orgánica en los primeros $5\text{ cm}$ de suelo descubierto.

---

## 4. La Frontera Epistemológica: «¿Qué Ve y Qué No Ve la Física de la Luz?»

Uno de los aportes teóricos de AgriTwin es desmitificar la teledetección satelital, trazando una frontera clara entre lo que el sensor óptico resuelve a $786\text{ km}$ y lo que requiere balance biofísico acoplado:

| Propiedad Biofísica | ¿Lo Resuelve la Física de la Luz? | Mecanismo Físico / Limitación | Solución Acoplada en AgriTwin |
| :--- | :---: | :--- | :--- |
| **Vigor y Clorofila Foliar** | **SÍ** | Absorción de fotones en bandas B04 y B05 (Red-Edge). | Índices $NDRE$ y $MCARI$ automáticos. |
| **Estrés Hídrico de Hojas** | **SÍ** | Absorción molecular en SWIR 1 (B11). | Índice $NDMI$ con umbral de alerta $< 0.20$. |
| **Espejos de Agua Libre** | **SÍ** | Absorción casi total en B11 y contraste verde B03. | Índice $MNDWI$ + curva hipsométrica $V(A)$. |
| **Necromasa e Incendios** | **SÍ** | Absorción de celulosa seca en SWIR 2 (B12). | Índice $NBR$ acoplado a la regla 30-30-30. |
| **Materia Orgánica Superficial** | **SÍ (Parcial)** | Absorción en SWIR de enlaces C-H y C-O en suelo visible. | Bare Soil Index ($BSI$) y proxy $SOC$. |
| **Humedad en Raíz (30-100 cm)** | **NO** | La luz óptica no penetra más de 1-2 mm en suelo opaco. | **Motor FAO-56 dual + curvas van Genuchten.** |
| **Fósforo, Potasio y pH** | **NO** | No poseen absorción electrónica/vibracional directa en VNIR. | Muestreo de suelo y balance biológico. |
| **Microbiología del Suelo** | **NO** | Invisible al sensor satelital óptico. | Manejo regenerativo Voisin / Keyline. |
| **Caudal Fluvial Subsuperficial** | **NO** | Drenaje subterráneo en acuíferos fracturados. | **Modelo Maillet-Boussinesq + estaciones DGA.** |

---

## 5. Conclusión: La Teledetección como Línea Base Soberana

Al dominar la física de estas diez bandas espectrales y sus índices derivados, el Gemelo Digital AgriTwin no requiere que el agricultor invierta en decenas de sensores costosos en cada árbol. **El satélite abierto provee la línea base espacial continua de la cuenca (el 80% del estado del sistema a costo $0 USD)**, mientras que la instrumentación física local se reserva estrictamente para las variables que la luz no puede ver (estación meteorológica in-situ con piranómetro y sondas radiculares testigo).
