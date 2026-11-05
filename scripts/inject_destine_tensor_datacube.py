#!/usr/bin/env python3
"""
inject_destine_tensor_datacube.py
Updates Section 2.6 in scripts/generate_canonical_paper.py in both:
- /Users/danielsantander/Documents/agritwin-app/scripts/generate_canonical_paper.py
- /Users/danielsantander/Documents/Agrotech/agritwin-hub/scripts/generate_canonical_paper.py

Expands Section 2.6 to:
"2.6. Teledetección Espectral Óptica, Acceso STAC-COG y Cubo de Datos Espaciotemporal Tensorizado 4D"
Providing full academic rigor on:
1. Sentinel-2 10-band catalog & 8 normalized spectral indices.
2. Resolution of the Data Gravity bottleneck via Destination Earth (DestinE) architecture:
   STAC catalogs + Cloud Optimized GeoTIFF (COG) HTTP range requests (Range: bytes=...).
3. 4D Tensor Datacube formal mathematical definition:
   T in R^{S x D x T x V}
   with its 4 orthogonal axes (Space, Depth strata, Time, Biophysical variables).
4. O(1) Polytope/Zarr-style feature slicing.
5. Biophysical satellite-vadose fusion and ultra-lightweight memory footprint (<50 KB).
6. Updates TOC in both HTML and Markdown.
"""

import sys
import os
import re

TARGET_FILES = [
    "/Users/danielsantander/Documents/agritwin-app/scripts/generate_canonical_paper.py",
    "/Users/danielsantander/Documents/Agrotech/agritwin-hub/scripts/generate_canonical_paper.py"
]

NEW_TITLE = "2.6. Teledetección Espectral Óptica, Acceso STAC-COG y Cubo de Datos Espaciotemporal Tensorizado 4D"

NEW_HTML_2_6 = r"""        <h2 class="section-title">2.6. Teledetección Espectral Óptica, Acceso STAC-COG y Cubo de Datos Espaciotemporal Tensorizado 4D</h2>
        <p>
            Para garantizar que el gemelo digital prescinda de mallas densas de sensores físicos intra-hilera y supere la «trampa del hardware», se implementó un motor de asimilación espectral multiespectral basado en la constelación Sentinel-2 (MSI) de la Agencia Espacial Europea (ESA), integrado con la arquitectura de cubos de datos multidimensionales inspirada en la iniciativa <em>Destination Earth</em> (DestinE / ECMWF / ESA).
        </p>

        <h3 class="section-subtitle">2.6.1. Catálogo Espectral de 10 Bandas Terrestres y 8 Índices Biofísicos Normalizados</h3>
        <p>
            El sistema asimila continuamente 10 bandas terrestres de Sentinel-2 L2A corregidas atmosféricamente (Bottom-Of-Atmosphere, BOA) a resoluciones de 10 y 20 metros (B02 azul, B03 verde, B04 rojo, B05-B07 Red Edge, B08 NIR ancho, B8A NIR estrecho, B11 SWIR-1 y B12 SWIR-2), sintetizando una batería canónica de 8 índices biofísicos normalizados:
        </p>
        <ul>
            <li><strong>NDVI (Rouse et al., 1974):</strong> $(B08 - B04)/(B08 + B04)$ — Vigor fotosintético del dosel y fracción de cobertura verde ($f_{c}$).</li>
            <li><strong>NDRE (Barnes et al., 2000):</strong> $(B08 - B05)/(B08 + B05)$ — Contenido de clorofila y actividad fotosintética en doseles densos donde el $NDVI$ satura asintóticamente.</li>
            <li><strong>MCARI (Daughtry et al., 2000):</strong> $[(B05 - B04) - 0.2\,(B05 - B03)] \cdot (B05 / B04)$ — Absorción de clorofila en el borde rojo con mínima interferencia del fondo de suelo.</li>
            <li><strong>NDWI (Gao, 1996):</strong> $(B08 - B11)/(B08 + B11)$ — Contenido de agua libre en el tejido foliar e hidratación del follaje.</li>
            <li><strong>NDMI (Hardisky et al., 1983):</strong> $(B08 - B11)/(B08 + B11)$ — Estrés por contenido relativo de agua en el dosel esclerófilo y agrícola.</li>
            <li><strong>MSI (Hunt &amp; Rock, 1989):</strong> $B11 / B08$ — Índice de estrés por déficit de humedad en hoja.</li>
            <li><strong>SAVI (Huete, 1988):</strong> $[(B08 - B04)/(B08 + B04 + L)] \cdot (1 + L)$ con factor de ajuste $L = 0.5$ — Corrección de brillo edáfico en etapas de cultivo con suelo expuesto.</li>
            <li><strong>NBR (Key &amp; Benson, 2006):</strong> $(B08 - B12)/(B08 + B12)$ — Severidad de combustibilidad pirogénica e índice de desecación para prevención de fuego.</li>
        </ul>

        <h3 class="section-subtitle">2.6.2. Desarme de la Gravedad de Datos: Protocolo STAC y Peticiones por Rango de Bytes en Cloud Optimized GeoTIFF</h3>
        <p>
            El procesamiento convencional de teledetección satelital adolece del fenómeno conocido como <em>gravedad de los datos</em> (Data Gravity): cada escena completa de Sentinel-2 L2A posee un peso de 500 MB a 1 GB comprimida (100 × 100 km). Descargar, descomprimir y recortar imágenes completas en servidores dedicados introduce una latencia inaceptable y costes de infraestructura que impiden el despliegue distribuido a bajo coste.
        </p>
        <p>
            Inspirándose en la capa de datos del lago de datos de Destination Earth (DestinE Data Lake, DEDL), AgriTwin implementa en <code>stac-cog-client.js</code> un protocolo de acceso selectivo sin descarga de escenas:
        </p>
        <ol>
            <li><strong>Catálogo STAC Abierto:</strong> Se consultan únicamente los metadatos de las pasadas satelitales vía catálogos STAC (SpatioTemporal Asset Catalog) abiertos (Earth Search / AWS, Copernicus CDSE, Microsoft Planetary Computer), filtrando por el Bounding Box ($BBOX$) exacto de la cuenca o predio y porcentaje de nubosidad.</li>
            <li><strong>Acceso Parcial a Cloud Optimized GeoTIFF (COG):</strong> Los archivos están almacenados como COGs remotos organizados en pirámides internas y teselas georreferenciadas con encabezados indexados. El cliente realiza peticiones HTTP con cabecera de rango parcial:
                <br>
                <code style="display:block; margin:8px 0; padding:8px 12px; background:#f1f5f9; border-radius:4px; font-size:0.82em;">GET /sentinel-s2-l2a-cogs/18/H/YD/.../B04.tif HTTP/1.1<br>Range: bytes=4194304-4325376</code>
            </li>
            <li><strong>Cero Huella Local:</strong> Mediante estas peticiones selectivas, el gemelo extrae únicamente los píxeles correspondientes a los cuarteles del predio (un paquete de apenas 15 KB a 50 KB), reduciendo el consumo de ancho de banda y tiempo de transferencia en un **99.9%** respecto a la descarga de la escena íntegra.</li>
        </ol>

        <h3 class="section-subtitle">2.6.3. Formalización del Cubo de Datos Espaciotemporal Tensorizado 4D</h3>
        <p>
            Una vez capturados los valores espectrales y forzamientos meteorológicos, la información se estructura en un <strong>tensor continuo cuadridimensional</strong> implementado en <code>data-cube-engine.js</code>, formalizado como:
        </p>

        <div class="formula-card">
            <div class="formula-header">
                <span class="formula-id">Ecuación 15: Tensor Multidimensional del Cubo de Datos AgriTwin</span>
                <span class="formula-tag">DESTINE-TENSOR-4D</span>
            </div>
            <div class="formula-body">
                $$\mathcal{T} \in \mathbb{R}^{S \times D \times T \times V}$$
            </div>
            <div class="formula-details">
                <p><strong>Dimensiones Ortogonales del Cubo Tensorizado:</strong></p>
                <ul>
                    <li>$S \in \mathbb{R}^{N_s}$: <strong>Dimensión Espacial</strong>, correspondiente a la discretización del territorio en Unidades de Respuesta Hidrológica (HRU) o cuarteles productivos y de conservación ($CROP\text{-}AVE\text{-}01$, $CROP\text{-}VIN\text{-}01$, $PRADERA\text{-}PRV$, $TRANQUE\text{-}COLLIGUAY$).</li>
                    <li>$D \in \mathbb{R}^{N_d}$: <strong>Dimensión Estratigráfica Vertical</strong>, compuesta por cinco estratos biofísicos acoplados de la columna vadosa:
                        <br>
                        $D = \{d_0\text{: canopia foliar},\, d_1\text{: raíz somera (0-20 cm)},\, d_2\text{: raíz activa (20-60 cm)},\, d_3\text{: subsuelo (60-100 cm)},\, d_4\text{: acuífero freático}\}$.
                    </li>
                    <li>$T \in \mathbb{R}^{N_t}$: <strong>Dimensión Temporal</strong>, cubriendo el horizonte de predicción táctica y reanálisis ($T_0$ a $T+6$, resolución horaria o diaria).</li>
                    <li>$V \in \mathbb{R}^{N_v}$: <strong>Dimensión de Variables Biofísicas</strong>, que consolida las métricas hidro-agronómicas simuladas:
                        <br>
                        $V = \{\theta\text{ (humedad volumétrica)},\, K_s\text{ (factor de estrés)},\, T\text{ (temperatura)},\, NDVI,\, NDMI,\, I\text{ (riego aplicable)},\, \mathcal{DP}\text{ (drenaje profundo)}\}$.
                    </li>
                </ul>
            </div>
        </div>

        <h3 class="section-subtitle">2.6.4. Corte Dimensional Polytope y Slicing en Complejidad Temporal Constante O(1)</h3>
        <p>
            Al estructurar el gemelo en una cuadrícula tensorial ortogonal, las consultas analíticas del agricultor o del centro de comando C2 se ejecutan como cortes poliédricos directos (<em>feature slicing</em> inspirado en el motor <em>Polytope</em> del ECMWF para Destination Earth), garantizando una complejidad computacional de tiempo constante $O(1)$ sin re-computar mallas ni rasterizar capas:
        </p>

        <p style="text-align:center; margin:16px 0; font-family:'JetBrains Mono',monospace;">
            $$\text{Serie temporal de estrés en cuartel } s_i: \quad \mathcal{S}_{\text{time}} = \mathcal{T}[s_i, d_2, :, v_{K_s}]$$
        </p>
        <p style="text-align:center; margin:16px 0; font-family:'JetBrains Mono',monospace;">
            $$\text{Mapa espacial coroplético de vigor en } T_0: \quad \mathcal{S}_{\text{space}} = \mathcal{T}[:, d_0, t_0, v_{\text{NDVI}}]$$
        </p>
        <p style="text-align:center; margin:16px 0; font-family:'JetBrains Mono',monospace;">
            $$\text{Perfil estratigráfico vadoso en cuartel } s_i: \quad \mathcal{S}_{\text{vadose}} = \mathcal{T}[s_i, :, t_0, v_{\theta}]$$
        </p>

        <h3 class="section-subtitle">2.6.5. Fusión Físico-Satelital y Rendimiento Computacional</h3>
        <p>
            La arquitectura tensorial permite una simbiosis perfecta entre observación satelital y modelación física:
        </p>
        <ul>
            <li><strong>Frontera Superior ($d_0$):</strong> Las bandas espectrales de Sentinel-2 L2A asimiladas vía STAC-COG alimentan la capa de canopia superficial ($d_0$), actualizando la reflectancia, el área foliar ($LAI$) y el coeficiente de cultivo basal ($K_{cb}$).</li>
            <li><strong>Columna Vadosa Inferior ($d_1$ a $d_4$):</strong> Los motores headless puros (<code>soil-water-engine.js</code> y <code>basin-hydrology-engine.js</code>) resuelven la ecuación de balance de masa de Richards-Feddes hacia los estratos radiculares profundos, propagando las tasas de infiltración, evaporación y percolación sin depender de mediciones físicas directas en cada nivel.</li>
            <li><strong>Eficiencia Ultraligera en Memoria:</strong> El tensor 4D completo para un predio agrícola medio (5 cuarteles, 5 estratos, 7 días proyectados y 7 variables) ocupa menos de <strong>50 Kilobytes</strong> en memoria RAM. Esta compresión permite su ejecución nativa e isomórfica tanto en microservicios headless en Node.js como de forma local en el navegador del usuario en áreas rurales sin conectividad constante.</li>
        </ul>
"""

NEW_MD_2_6 = r"""### 2.6. Teledetección Espectral Óptica, Acceso STAC-COG y Cubo de Datos Espaciotemporal Tensorizado 4D
Para garantizar que el gemelo digital prescinda de mallas densas de sensores físicos intra-hilera y supere la «trampa del hardware», se implementó un motor de asimilación espectral multiespectral basado en la constelación Sentinel-2 (MSI) de la Agencia Espacial Europea (ESA), integrado con la arquitectura de cubos de datos multidimensionales inspirada en la iniciativa *Destination Earth* (DestinE / ECMWF / ESA).

#### 2.6.1. Catálogo Espectral de 10 Bandas Terrestres y 8 Índices Biofísicos Normalizados
El sistema asimila continuamente 10 bandas terrestres de Sentinel-2 L2A corregidas atmosféricamente (Bottom-Of-Atmosphere, BOA) a resoluciones de 10 y 20 metros (B02 azul, B03 verde, B04 rojo, B05-B07 Red Edge, B08 NIR ancho, B8A NIR estrecho, B11 SWIR-1 y B12 SWIR-2), sintetizando una batería canónica de 8 índices biofísicos normalizados:
* **NDVI (Rouse et al., 1974):** $(B08 - B04)/(B08 + B04)$ — Vigor fotosintético del dosel y fracción de cobertura verde ($f_{c}$).
* **NDRE (Barnes et al., 2000):** $(B08 - B05)/(B08 + B05)$ — Contenido de clorofila y actividad fotosintética en doseles densos donde el $NDVI$ satura asintóticamente.
* **MCARI (Daughtry et al., 2000):** $[(B05 - B04) - 0.2\,(B05 - B03)] \cdot (B05 / B04)$ — Absorción de clorofila en el borde rojo con mínima interferencia del fondo de suelo.
* **NDWI (Gao, 1996):** $(B08 - B11)/(B08 + B11)$ — Contenido de agua libre en el tejido foliar e hidratación del follaje.
* **NDMI (Hardisky et al., 1983):** $(B08 - B11)/(B08 + B11)$ — Estrés por contenido relativo de agua en el dosel esclerófilo y agrícola.
* **MSI (Hunt & Rock, 1989):** $B11 / B08$ — Índice de estrés por déficit de humedad en hoja.
* **SAVI (Huete, 1988):** $[(B08 - B04)/(B08 + B04 + L)] \cdot (1 + L)$ con factor de ajuste $L = 0.5$ — Corrección de brillo edáfico en etapas con suelo expuesto.
* **NBR (Key & Benson, 2006):** $(B08 - B12)/(B08 + B12)$ — Severidad de combustibilidad pirogénica e índice de desecación para prevención de incendios.

#### 2.6.2. Desarme de la Gravedad de Datos: Protocolo STAC y Peticiones por Rango de Bytes en Cloud Optimized GeoTIFF
El procesamiento convencional de teledetección satelital adolece del fenómeno conocido como *gravedad de los datos* (Data Gravity): cada escena completa de Sentinel-2 L2A posee un peso de 500 MB a 1 GB comprimida (100 × 100 km). Descargar, descomprimir y recortar imágenes completas en servidores dedicados introduce una latencia inaceptable y costes de infraestructura que impiden el despliegue distribuido a bajo coste.

Inspirándose en la capa de datos del lago de datos de Destination Earth (DestinE Data Lake, DEDL), AgriTwin implementa en `stac-cog-client.js` un protocolo de acceso selectivo sin descarga de escenas:
1. **Catálogo STAC Abierto:** Se consultan únicamente los metadatos de las pasadas satelitales vía catálogos STAC (SpatioTemporal Asset Catalog) abiertos (Earth Search / AWS, Copernicus CDSE, Microsoft Planetary Computer), filtrando por el Bounding Box ($BBOX$) exacto de la cuenca o predio y porcentaje de nubosidad.
2. **Acceso Parcial a Cloud Optimized GeoTIFF (COG):** Los archivos están almacenados como COGs remotos organizados en pirámides internas y teselas georreferenciadas con encabezados indexados. El cliente realiza peticiones HTTP con cabecera de rango parcial (`Range: bytes=start-end`).
3. **Cero Huella Local:** Mediante estas peticiones selectivas, el gemelo extrae únicamente los píxeles correspondientes a los cuarteles del predio (un paquete de apenas 15 KB a 50 KB), reduciendo el consumo de ancho de banda y tiempo de transferencia en un **99.9%** respecto a la descarga de la escena íntegra.

#### 2.6.3. Formalización del Cubo de Datos Espaciotemporal Tensorizado 4D
Una vez capturados los valores espectrales y forzamientos meteorológicos, la información se estructura en un **tensor continuo cuadridimensional** implementado en `data-cube-engine.js`, formalizado como:

$$\mathcal{T} \in \mathbb{R}^{S \times D \times T \times V}$$

Donde las cuatro dimensiones ortogonales del cubo tensorizado son:
* $S \in \mathbb{R}^{N_s}$: **Dimensión Espacial**, correspondiente a la discretización del territorio en Unidades de Respuesta Hidrológica (HRU) o cuarteles productivos y de conservación ($CROP\text{-}AVE\text{-}01$, $CROP\text{-}VIN\text{-}01$, $PRADERA\text{-}PRV$, $TRANQUE\text{-}COLLIGUAY$).
* $D \in \mathbb{R}^{N_d}$: **Dimensión Estratigráfica Vertical**, compuesta por cinco estratos biofísicos acoplados de la columna vadosa:
  $$D = \{d_0\text{: canopia foliar},\, d_1\text{: raíz somera (0-20 cm)},\, d_2\text{: raíz activa (20-60 cm)},\, d_3\text{: subsuelo (60-100 cm)},\, d_4\text{: acuífero freático}\}$$
* $T \in \mathbb{R}^{N_t}$: **Dimensión Temporal**, cubriendo el horizonte de predicción táctica y reanálisis ($T_0$ a $T+6$, resolución horaria o diaria).
* $V \in \mathbb{R}^{N_v}$: **Dimensión de Variables Biofísicas**, que consolida las métricas hidro-agronómicas simuladas:
  $$V = \{\theta\text{ (humedad volumétrica)},\, K_s\text{ (factor de estrés)},\, T\text{ (temperatura)},\, NDVI,\, NDMI,\, I\text{ (riego aplicable)},\, \mathcal{DP}\text{ (drenaje profundo)}\}$$

#### 2.6.4. Corte Dimensional Polytope y Slicing en Complejidad Temporal Constante O(1)
Al estructurar el gemelo en una cuadrícula tensorial ortogonal, las consultas analíticas del agricultor o del centro de comando C2 se ejecutan como cortes poliédricos directos (*feature slicing* inspirado en el motor *Polytope* del ECMWF para Destination Earth), garantizando una complejidad computacional de tiempo constante $O(1)$ sin re-computar mallas ni rasterizar capas:

$$\text{Serie temporal de estrés en cuartel } s_i: \quad \mathcal{S}_{\text{time}} = \mathcal{T}[s_i, d_2, :, v_{K_s}]$$

$$\text{Mapa espacial coroplético de vigor en } T_0: \quad \mathcal{S}_{\text{space}} = \mathcal{T}[:, d_0, t_0, v_{\text{NDVI}}]$$

$$\text{Perfil estratigráfico vadoso en cuartel } s_i: \quad \mathcal{S}_{\text{vadose}} = \mathcal{T}[s_i, :, t_0, v_{\theta}]$$

#### 2.6.5. Fusión Físico-Satelital y Rendimiento Computacional
La arquitectura tensorial permite una simbiosis perfecta entre observación satelital y modelación física:
* **Frontera Superior ($d_0$):** Las bandas espectrales de Sentinel-2 L2A asimiladas vía STAC-COG alimentan la capa de canopia superficial ($d_0$), actualizando la reflectancia, el área foliar ($LAI$) y el coeficiente de cultivo basal ($K_{cb}$).
* **Columna Vadosa Inferior ($d_1$ a $d_4$):** Los motores headless puros (`soil-water-engine.js` y `basin-hydrology-engine.js`) resuelven la ecuación de balance de masa de Richards-Feddes hacia los estratos radiculares profundos, propagando las tasas de infiltración, evaporación y percolación sin depender de mediciones físicas directas en cada nivel.
* **Eficiencia Ultraligera en Memoria:** El tensor 4D completo para un predio agrícola medio (5 cuarteles, 5 estratos, 7 días proyectados y 7 variables) ocupa menos de **50 Kilobytes** en memoria RAM. Esta compresión permite su ejecución nativa e isomórfica tanto en microservicios headless en Node.js como de forma local en el navegador del usuario en áreas rurales sin conectividad constante.

"""

def update_file(filepath):
    print(f"\n--- Processing {filepath} ---")
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Update HTML TOC:
    content = re.sub(
        r'<li>2\.6\. Teledetección Espectral Óptica.*?</li>',
        f'<li>{NEW_TITLE}</li>',
        content
    )
    print("Updated HTML TOC item 2.6.")

    # 2. Update Markdown TOC:
    content = re.sub(
        r'\* \[2\.6\. Teledetección Espectral Óptica.*?\]\(.*?\)',
        f'* [{NEW_TITLE}](#26-teledetección-espectral-óptica-acceso-stac-cog-y-cubo-de-datos-espaciotemporal-tensorizado-4d)',
        content
    )
    print("Updated Markdown TOC item 2.6.")

    # 3. Replace Section 2.6 in HTML:
    pattern_html = r'<h2 class="section-title">2\.6\. Teledetección Espectral Óptica.*?</h2>.*?(?=\s*<h2 class="section-title">2\.7\.)'
    m_html = re.search(pattern_html, content, re.DOTALL)
    if m_html:
        content = content[:m_html.start()] + NEW_HTML_2_6 + content[m_html.end():]
        print("Replaced HTML Section 2.6.")
    else:
        print("ERROR: Could not find HTML Section 2.6 insertion point!")
        sys.exit(1)

    # 4. Replace Section 2.6 in Markdown:
    pattern_md = r'### 2\.6\. Teledetección Espectral Óptica.*?.*?(?=\s*---\s*\n+### 2\.7\.|\s*### 2\.7\.)'
    m_md = re.search(pattern_md, content, re.DOTALL)
    if m_md:
        content = content[:m_md.start()] + NEW_MD_2_6 + content[m_md.end():]
        print("Replaced Markdown Section 2.6.")
    else:
        print("ERROR: Could not find Markdown Section 2.6 insertion point!")
        sys.exit(1)

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Successfully updated {filepath}")

def main():
    for f in TARGET_FILES:
        if os.path.exists(f):
            update_file(f)
        else:
            print(f"File not found: {f}")

if __name__ == "__main__":
    main()
