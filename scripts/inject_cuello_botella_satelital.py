#!/usr/bin/env python3
"""
inject_cuello_botella_satelital.py
Adds explicit framing of:
"El Problema: El Cuello de Botella Satelital Convencional"
and its architectural resolution via Destination Earth (STAC + COG) in:
- scripts/generate_canonical_paper.py (both repos: agritwin-app and agritwin-hub)
- Section 2.6.2 subtitle and body
- Section 1.4 mentions where stac-cog-client.js is introduced
- HTML and Markdown TOCs
"""

import sys
import os
import re

TARGET_FILES = [
    "/Users/danielsantander/Documents/agritwin-app/scripts/generate_canonical_paper.py",
    "/Users/danielsantander/Documents/Agrotech/agritwin-hub/scripts/generate_canonical_paper.py"
]

NEW_SUBTITLE = "2.6.2. El Problema: El Cuello de Botella Satelital Convencional y su Superación mediante STAC y COG"

HTML_2_6_2 = r"""        <h3 class="section-subtitle">2.6.2. El Problema: El Cuello de Botella Satelital Convencional y su Superación mediante STAC y COG</h3>
        <p>
            <strong>El Problema: El Cuello de Botella Satelital Convencional y la «Gravedad de los Datos»</strong><br>
            El procesamiento convencional de teledetección satelital en la agricultura de precisión tropieza invariablemente con el fenómeno de la <em>gravedad de los datos</em> (Data Gravity): cada escena completa de Sentinel-2 L2A (100 × 100 km) posee un peso de <strong>500 MB a 1 GB comprimida</strong> (13 bandas espectrales a resoluciones de 10 a 60 metros). Para una explotación agrícola de tamaño medio (25 a 100 hectáreas en el secano o valle central), el polígono predial representa <strong>menos del 0.01%</strong> de la superficie de la escena. En el flujo tradicional de ingeniería, el servidor debe descargar la escena íntegra de 1 GB, descomprimirla, reproyectarla y recortar el área de interés en un servidor centralizado. Esta dependencia crea el denominado «cuello de botella satelital convencional», caracterizado por una latencia inaceptable, costes recurrentes de almacenamiento y procesamiento en la nube, y una barrera infranqueable para productores rurales que carecen de conectividad de alta velocidad.
        </p>
        <p>
            <strong>La Solución: Desarme de la Gravedad de Datos mediante Arquitectura Destination Earth, Catálogos STAC y Peticiones Parciales COG</strong><br>
            Inspirándose en la capa de datos del lago de datos de Destination Earth (DestinE Data Lake, DEDL) de la Unión Europea (ESA / ECMWF / EUMETSAT), AgriTwin implementa en el motor desacoplado <code>stac-cog-client.js</code> un protocolo de acceso selectivo que suprime por completo la descarga de escenas raster:
        </p>
        <ol>
            <li><strong>Indexación Ligera mediante Catálogos STAC Abiertos:</strong> El cliente consulta únicamente los metadatos de las órbitas mediante catálogos abiertos STAC (SpatioTemporal Asset Catalog) como Earth Search (AWS), Copernicus CDSE y Microsoft Planetary Computer, filtrando en milisegundos por la ventana geográfica exacta del predio ($BBOX$) y el porcentaje de nubosidad, sin manipular píxeles.</li>
            <li><strong>Acceso Quirúrgico a Cloud Optimized GeoTIFF (COG) mediante HTTP Range Requests:</strong> Las imágenes satelitales en los repositorios de DestinE y Copernicus se almacenan como COGs estructurados en teselas internas georreferenciadas y pirámides de resolución con encabezados indexados. El motor de AgriTwin calcula los desplazamientos en bytes del BBOX predial y emite peticiones HTTP parciales con la cabecera <code>Range: bytes=inicio-fin</code>:
                <br>
                <code style="display:block; margin:8px 0; padding:8px 12px; background:#f1f5f9; border-radius:4px; font-size:0.82em;">GET /sentinel-s2-l2a-cogs/18/H/YD/.../B04.tif HTTP/1.1<br>Range: bytes=4194304-4325376</code>
            </li>
            <li><strong>Cero Huella Local y Reducción del 99.9% de Tráfico:</strong> En lugar de transferir un archivo de 1 GB, el cliente descarga exclusivamente el micro-bloque de píxeles correspondiente a los cuarteles del predio (un paquete comprimido de apenas <strong>15 KB a 50 KB</strong>). El cuello de botella satelital queda completamente desarmado, permitiendo actualizar la condición espectral de los cultivos en tiempo real incluso desde un teléfono móvil en terreno con enlace 3G rural.</li>
        </ol>
"""

MD_2_6_2 = r"""#### 2.6.2. El Problema: El Cuello de Botella Satelital Convencional y su Superación mediante STAC y COG
**El Problema: El Cuello de Botella Satelital Convencional y la «Gravedad de los Datos»**  
El procesamiento convencional de teledetección satelital en la agricultura de precisión tropieza invariablemente con el fenómeno de la *gravedad de los datos* (Data Gravity): cada escena completa de Sentinel-2 L2A (100 × 100 km) posee un peso de **500 MB a 1 GB comprimida** (13 bandas espectrales a resoluciones de 10 a 60 metros). Para una explotación agrícola de tamaño medio (25 a 100 hectáreas en el secano o valle central), el polígono predial representa **menos del 0.01%** de la superficie de la escena. En el flujo tradicional de ingeniería, el servidor debe descargar la escena íntegra de 1 GB, descomprimirla, reproyectarla y recortar el área de interés en un servidor centralizado. Esta dependencia crea el denominado «cuello de botella satelital convencional», caracterizado por una latencia inaceptable, costes recurrentes de almacenamiento y procesamiento en la nube, y una barrera infranqueable para productores rurales que carecen de conectividad de alta velocidad.

**La Solución: Desarme de la Gravedad de Datos mediante Arquitectura Destination Earth, Catálogos STAC y Peticiones Parciales COG**  
Inspirándose en la capa de datos del lago de datos de Destination Earth (DestinE Data Lake, DEDL) de la Unión Europea (ESA / ECMWF / EUMETSAT), AgriTwin implementa en el motor desacoplado `stac-cog-client.js` un protocolo de acceso selectivo que suprime por completo la descarga de escenas raster:
1. **Indexación Ligera mediante Catálogos STAC Abiertos:** El cliente consulta únicamente los metadatos de las órbitas mediante catálogos abiertos STAC (SpatioTemporal Asset Catalog) como Earth Search (AWS), Copernicus CDSE y Microsoft Planetary Computer, filtrando en milisegundos por la ventana geográfica exacta del predio ($BBOX$) y el porcentaje de nubosidad, sin manipular píxeles.
2. **Acceso Quirúrgico a Cloud Optimized GeoTIFF (COG) mediante HTTP Range Requests:** Las imágenes satelitales en los repositorios de DestinE y Copernicus se almacenan como COGs estructurados en teselas internas georreferenciadas y pirámides de resolución con encabezados indexados. El motor de AgriTwin calcula los desplazamientos en bytes del BBOX predial y emite peticiones HTTP parciales con la cabecera `Range: bytes=inicio-fin`.
3. **Cero Huella Local y Reducción del 99.9% de Tráfico:** En lugar de transferir un archivo de 1 GB, el cliente descarga exclusivamente el micro-bloque de píxeles correspondiente a los cuarteles del predio (un paquete comprimido de apenas **15 KB a 50 KB**). El cuello de botella satelital queda completamente desarmado, permitiendo actualizar la condición espectral de los cultivos en tiempo real incluso desde un teléfono móvil en terreno con enlace 3G rural.
"""

def update_file(filepath):
    print(f"\n--- Processing {filepath} ---")
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Update Section 2.6.2 in HTML:
    pattern_html_262 = r'<h3 class="section-subtitle">2\.6\.2\..*?</h3>.*?(?=\s*<h3 class="section-subtitle">2\.6\.3\.)'
    m_html = re.search(pattern_html_262, content, re.DOTALL)
    if m_html:
        content = content[:m_html.start()] + HTML_2_6_2 + content[m_html.end():]
        print("Updated HTML Section 2.6.2.")
    else:
        print("ERROR: Could not find HTML Section 2.6.2!")
        sys.exit(1)

    # 2. Update Section 2.6.2 in Markdown:
    pattern_md_262 = r'#### 2\.6\.2\..*?.*?(?=\s*#### 2\.6\.3\.)'
    m_md = re.search(pattern_md_262, content, re.DOTALL)
    if m_md:
        content = content[:m_md.start()] + MD_2_6_2 + content[m_md.end():]
        print("Updated Markdown Section 2.6.2.")
    else:
        print("ERROR: Could not find Markdown Section 2.6.2!")
        sys.exit(1)

    # 3. Add explicit mention in Section 1.4 (Arquitectura Headless) where stac-cog-client.js is introduced:
    old_mention_html = '<code>stac-cog-client.js</code>: Ingesta serverless de reflectancia satelital Sentinel-2 L2A'
    new_mention_html = '<code>stac-cog-client.js</code>: Ingesta serverless de reflectancia satelital Sentinel-2 L2A (superando el cuello de botella satelital convencional mediante peticiones por rango de bytes a Cloud Optimized GeoTIFF)'
    if old_mention_html in content:
        content = content.replace(old_mention_html, new_mention_html)
        print("Updated mention in Section 1.4 HTML.")

    old_mention_md = '`stac-cog-client.js`: Ingesta serverless de reflectancia satelital Sentinel-2 L2A'
    new_mention_md = '`stac-cog-client.js`: Ingesta serverless de reflectancia satelital Sentinel-2 L2A (superando el cuello de botella satelital convencional mediante peticiones por rango de bytes a Cloud Optimized GeoTIFF)'
    if old_mention_md in content:
        content = content.replace(old_mention_md, new_mention_md)
        print("Updated mention in Section 1.4 Markdown.")

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
