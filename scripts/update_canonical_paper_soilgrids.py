# -*- coding: utf-8 -*-
"""
Actualizador canónico de PAPER_CIENTIFICO_AGRITWIN con la Sección 2.2.5:
Línea de Base Edafológica Macro-Territorial (ISRIC SoilGrids 2.0 a 250m) y Estimación de Stocks de Carbono (SOCS)
"""

import os
import re

SCRIPT_PATH = "/Users/danielsantander/Documents/Agrotech/agritwin-hub/scripts/generate_canonical_paper.py"

with open(SCRIPT_PATH, "r", encoding="utf-8") as f:
    code = f.read()

# 1. Actualizar los paths de salida para escribir a ambos repositorios
old_paths = '''HTML_PATH = "/Users/danielsantander/Documents/agritwin-app/docs/PAPER_CIENTIFICO_AGRITWIN_IMPRIMIBLE.html"
MD_PATH = "/Users/danielsantander/Documents/agritwin-app/docs/PAPER_CIENTIFICO_AGRITWIN_MARCO_TEORICO_UQ.md"'''

new_paths = '''HTML_PATHS = [
    "/Users/danielsantander/Documents/Agrotech/agritwin-hub/docs/PAPER_CIENTIFICO_AGRITWIN_IMPRIMIBLE.html",
    "/Users/danielsantander/Documents/agritwin-app/docs/PAPER_CIENTIFICO_AGRITWIN_IMPRIMIBLE.html"
]
MD_PATHS = [
    "/Users/danielsantander/Documents/Agrotech/agritwin-hub/docs/PAPER_CIENTIFICO_AGRITWIN_MARCO_TEORICO_UQ.md",
    "/Users/danielsantander/Documents/agritwin-app/docs/PAPER_CIENTIFICO_AGRITWIN_MARCO_TEORICO_UQ.md"
]'''

code = code.replace(old_paths, new_paths)

# 2. Reemplazar la escritura final para iterar sobre los paths
old_write = '''if __name__ == "__main__":
    print("Escribiendo archivo HTML...")
    with open(HTML_PATH, "w", encoding="utf-8") as f:
        f.write(build_html())
    print("HTML generado exitosamente en:", HTML_PATH)

    print("Escribiendo archivo Markdown...")
    with open(MD_PATH, "w", encoding="utf-8") as f:
        f.write(build_markdown())
    print("Markdown generado exitosamente en:", MD_PATH)'''

new_write = '''if __name__ == "__main__":
    html_content = build_html()
    for hp in HTML_PATHS:
        os.makedirs(os.path.dirname(hp), exist_ok=True)
        with open(hp, "w", encoding="utf-8") as f:
            f.write(html_content)
        print("HTML generado exitosamente en:", hp)

    md_content = build_markdown()
    for mp in MD_PATHS:
        os.makedirs(os.path.dirname(mp), exist_ok=True)
        with open(mp, "w", encoding="utf-8") as f:
            f.write(md_content)
        print("Markdown generado exitosamente en:", mp)'''

code = code.replace(old_write, new_write)

# 3. En build_html(): Agregar término SoilGrids al glosario HTML
old_glossary_html = '''                <tr>
                    <td class="term">Índices Espectrales</td>
                    <td><strong>$NDVI, NDRE, MCARI, NDWI, NDMI, SAVI, NBR, BSI, SOC$:</strong> Métricas ópticas normalizadas para discriminar vigor fotosintético, clorofila, agua en dosel, agua superficial, estrés hídrico, suelo desnudo y carbono orgánico.</td>
                    <td>Adimensional</td>
                </tr>'''

new_glossary_html = '''                <tr>
                    <td class="term">Índices Espectrales</td>
                    <td><strong>$NDVI, NDRE, MCARI, NDWI, NDMI, SAVI, NBR, BSI, SOC$:</strong> Métricas ópticas normalizadas para discriminar vigor fotosintético, clorofila, agua en dosel, agua superficial, estrés hídrico, suelo desnudo y carbono orgánico.</td>
                    <td>Adimensional</td>
                </tr>
                <tr>
                    <td class="term">ISRIC SoilGrids / $\\text{SOCS}$</td>
                    <td><strong>Línea de Base Edafológica Global (250 m):</strong> ISRIC SoilGrids 2.0; $\\text{SOC}$ (Carbono Orgánico del Suelo, $\\text{g/kg}$); $\\text{BDOD}$ (Densidad aparente de tierra fina, $\\text{g/cm}^3$); $\\text{CRF}$ (Fragmentos gruesos, $\\%$); $\\text{SOCS}$ (Stock de carbono en $0\\text{--}5\\,\\text{cm}$, $\\text{t C/ha}$); y secuestro estequiométrico $\\text{CO}_2\\text{e}$ ($44/12$). Ingesta directa en R vía <code>geodata::soil_world(var="soc", depth=5)</code> y API REST.</td>
                    <td>$\\text{g/kg}, \\text{g/cm}^3, \\%, \\text{t C/ha}$</td>
                </tr>'''

code = code.replace(old_glossary_html, new_glossary_html)

# 4. En build_html(): ToC
old_toc_html = '''                <li>2.2. Modelo Agro-Hidrológico Semi-Distribuido ($SCS\\text{-}CN + TWI$) y Balance Radicular $SPAC$</li>'''
new_toc_html = '''                <li>2.2. Modelo Agro-Hidrológico Semi-Distribuido ($SCS\\text{-}CN + TWI$) y Balance Radicular $SPAC$ (incluye 2.2.5 ISRIC SoilGrids 250 m &amp; Stocks $\\text{SOCS}$)</li>'''
code = code.replace(old_toc_html, new_toc_html)

# 5. En build_html(): Insertar Sección 2.2.5 antes de 2.3
target_before_23_html = '''        <h2 class="section-title">2.3. Dinámica Pirogénica, Balística de Pavesas y Regímenes Eólicos</h2>'''

section_225_html = '''        <h3 style="font-size: 1.15rem; color: #1e3a8a; margin-top: 1.5rem; margin-bottom: 0.5rem;">2.2.5. Línea de Base Edafológica Macro-Territorial (ISRIC SoilGrids 2.0 a 250 m) y Estimación de Stocks de Carbono Orgánico (SOCS)</h3>
        <p>
            Para parametrizar las propiedades hidrofísicas y biogeoquímicas de la zona vadosa a escala de cuenca sin incurrir en la prohibitiva densidad de calicatas presenciales, AgriTwin acopla la base global de datos edafológicos grillados <strong>ISRIC SoilGrids 2.0</strong> (Poggio et al., 2021) a una resolución espacial de 250 metros. Este sistema genera predicciones espaciales continuas mediante bosques aleatorios cuantílicos (<em>Quantile Regression Forests</em>) entrenados con más de 240,000 perfiles edafológicos estandarizados del repositorio global WoSIS acoplados a covariables bioclimáticas y geomorfológicas derivadas de MODIS y DEM.
        </p>
        <p>
            A partir de los horizontes superficiales ($0\\text{--}5\\,\\text{cm}$), se extraen simultáneamente la concentración de carbono orgánico ($\\text{SOC}$, $\\text{dg}\\cdot\\text{kg}^{-1}$), la densidad aparente del suelo seco en terrón/tierra fina ($\\text{BDOD}$, $\\text{cg}\\cdot\\text{cm}^{-3}$) y la fracción volumétrica de fragmentos gruesos ($\\text{CRF}$, $\\text{cm}^3 / 100\\,\\text{cm}^3$ o $\\%$). El stock areal de carbono orgánico del suelo ($\\text{SOCS}$) se cuantifica siguiendo la función de pedotransferencia estandarizada por IPCC y Batjes (1996):
        </p>

        <div class="formula-card">
            <div class="formula-header">Ecuación 5: Stock de Carbono Orgánico del Suelo en el Horizonte Superior ($\\text{SOCS}_{0\\text{-}5\\,\\text{cm}}$, Batjes 1996 &amp; Poggio et al. 2021)</div>
            <div class="formula-body">
                $$\\text{SOCS}_{0\\text{-}5\\,\\text{cm}} = \\text{SOC} \\times \\text{BDOD} \\times \\left(1 - \\frac{\\text{CRF}}{100}\\right) \\times \\Delta z \\times 0.1 \\quad \\left[\\frac{\\text{t C}}{\\text{ha}}\\right]$$
            </div>
            <div class="formula-footer">
                <strong>Donde:</strong> $\\text{SOC}$ es la concentración de carbono orgánico en la fracción de tierra fina ($< 2\\,\\text{mm}$) [$\\text{g}\\cdot\\text{kg}^{-1}$]; $\\text{BDOD}$ es la densidad aparente seca de la fracción fina [$\\text{g}\\cdot\\text{cm}^{-3}$]; $\\text{CRF}$ es el porcentaje volumétrico de gravas y fragmentos rocosos mayores a $2\\,\\text{mm}$ [$\\%$]; $\\Delta z = 5\\,\\text{cm}$ es el espesor del estrato analizado; y $0.1$ es el factor de conversión estequiométrico dimensional ($\\text{g}\\cdot\\text{cm}^{-2} \\to \\text{t C}\\cdot\\text{ha}^{-1}$).
            </div>
        </div>

        <p>
            El carbono elemental fijado en la matriz coloidal del suelo se traduce a su equivalente en dióxido de carbono capturado ($\\text{Stock CO}_2\\text{e}$) aplicando la razón estequiométrica entre los pesos moleculares del $\\text{CO}_2$ ($44.01\\,\\text{g}\\cdot\\text{mol}^{-1}$) y del carbono ($12.011\\,\\text{g}\\cdot\\text{mol}^{-1}$):
        </p>

        <div class="formula-card">
            <div class="formula-header">Ecuación 6: Equivalencia Estequiométrica de Captura y Almacenamiento de $\\text{CO}_2\\text{e}$</div>
            <div class="formula-body">
                $$\\text{Stock CO}_2\\text{e} = \\text{SOCS} \\times \\frac{M_{\\text{CO}_2}}{M_{\\text{C}}} = \\text{SOCS} \\times \\frac{44.01}{12.011} \\approx \\text{SOCS} \\times 3.667 \\quad \\left[\\frac{\\text{t CO}_2\\text{e}}{\\text{ha}}\\right]$$
            </div>
            <div class="formula-footer">
                <strong>Aplicación Operativa:</strong> Provee el activo auditable para proyectos de bonos de carbono por manejo agroecológico, siembra de suelo mediante arado Keyline y adición de enmiendas orgánicas bioestabilizadas.
            </div>
        </div>

        <p>
            <strong>Acoplamiento Hidrofísico y Pedotransferencia con el Balance $SPAC$:</strong> La línea de base de SoilGrids no solo sirve a fines biogeoquímicos; sus variables texturales (arena, limo, arcilla) y contenido de $\\text{SOC}$ se acoplan directamente a las funciones de pedotransferencia de Saxton y Rawls (2006) para computar la capacidad de campo ($\\theta_{FC}$), el punto de marchitez permanente ($\\theta_{WP}$), el agua disponible para la planta ($AWC = \\theta_{FC} - \\theta_{WP}$) y la conductividad hidráulica saturada ($K_{sat}$). Estos parámetros inicializan directamente el modelo de balance de masa en la columna vadosa (Ecuación 1) y el número de curva base ($CN$, Ecuación 3), eliminando supuestos arbitrarios a nivel de microcuenca.
        </p>

        <p>
            <strong>Acoplamiento Multiescala y Downscaling Espectral ($250\\,\\text{m} \\to 10\\,\\text{m}$):</strong> Mientras la grilla de $250\\,\\text{m}$ de SoilGrids establece la envolvente regional macro-territorial (~6.25 hectáreas por celda), la variabilidad intra-cuartel a $10\\,\\text{m}$ se resuelve integrando las bandas de infrarrojo de onda corta ($B_{11}$ y $B_{12}$) y el Índice de Suelo Desnudo ($BSI$, Castaldi et al., 2018) de Sentinel-2 L2A durante períodos de ventana inter-cultivo, asimilando además los registros en tiempo real de sondas de capacitancia KioT FDR instaladas en los nodos centinela.
        </p>

        <p>
            <strong>Ingesta Computacional y Reproducibilidad en R:</strong> La pipeline de datos se encuentra codificada de forma abierta en el repositorio (<code>scripts/isric_soilgrids_soc.R</code>). Implementa dos canales ortogonales de extracción: (1) descarga raster global automatizada mediante el paquete <code>geodata</code> en R (<code>geodata::soil_world(var = "soc", depth = 5)</code>), y (2) cliente ligero de consulta de micro-polígonos y puntos contra la API REST v2.0 de ISRIC (<code>https://rest.isric.org/soilgrids/v2.0/properties/query</code>), garantizando independencia total de infraestructura propietaria.
        </p>

''' + target_before_23_html

code = code.replace(target_before_23_html, section_225_html)

# Renumerar fórmulas en HTML
code = code.replace('<div class="formula-header">Ecuación 5: Velocidad de Propagación del Frente de Llama', '<div class="formula-header">Ecuación 7: Velocidad de Propagación del Frente de Llama')
code = code.replace('<div class="formula-header">Ecuación 6: Alcance Máximo de Pavesas', '<div class="formula-header">Ecuación 8: Alcance Máximo de Pavesas')
code = code.replace('<div class="formula-header">Ecuación 7: Velocidad Estacionaria de Drenaje Catabático', '<div class="formula-header">Ecuación 9: Velocidad Estacionaria de Drenaje Catabático')
code = code.replace('<div class="formula-header">Ecuación 8: Radiación Neta Nocturna de Onda Larga', '<div class="formula-header">Ecuación 10: Radiación Neta Nocturna de Onda Larga')
code = code.replace('<div class="formula-header">Ecuación 9: Energía Potencial Convectiva Disponible', '<div class="formula-header">Ecuación 11: Energía Potencial Convectiva Disponible')
code = code.replace('<div class="formula-header">Ecuación 10: Magnitud de la Cizalladura Vertical Profunda', '<div class="formula-header">Ecuación 12: Magnitud de la Cizalladura Vertical Profunda')
code = code.replace('<div class="formula-header">Ecuación 11: Ecuación General del Riesgo Táctico Multiamenaza', '<div class="formula-header">Ecuación 13: Ecuación General del Riesgo Táctico Multiamenaza')
code = code.replace('<div class="formula-header">Ecuaciones 12 y 13: Índices de Sensibilidad de Sobol', '<div class="formula-header">Ecuaciones 14 y 15: Índices de Sensibilidad de Sobol')
code = code.replace('<div class="formula-header">Ecuación 14: Ecuación Diferencial de Asimilación Dinámica', '<div class="formula-header">Ecuación 16: Ecuación Diferencial de Asimilación Dinámica')

# Agregar referencias bibliográficas en HTML
target_bib_html = '''        <p class="reference-item"><strong>1. Albini, F. A. (1979).</strong>'''
new_bib_html = '''        <p class="reference-item"><strong>1. Batjes, N. H. (1996).</strong> Total carbon and nitrogen in the soils of the world. <em>European Journal of Soil Science</em>, 47(2), 151–163. DOI: <a href="https://doi.org/10.1111/j.1365-2389.1996.tb01386.x" target="_blank">10.1111/j.1365-2389.1996.tb01386.x</a></p>
        <p class="reference-item"><strong>2. Albini, F. A. (1979).</strong>'''
code = code.replace(target_bib_html, new_bib_html)

target_bib_poggio_html = '''        <p class="reference-item"><strong>17. Ostrom, E. (1990).</strong>'''
new_bib_poggio_html = '''        <p class="reference-item"><strong>17. Ostrom, E. (1990).</strong> Governing the Commons: The Evolution of Institutions for Collective Action. Cambridge University Press, Cambridge, UK. DOI: <a href="https://doi.org/10.1017/CBO9780511807763" target="_blank">10.1017/CBO9780511807763</a></p>
        <p class="reference-item"><strong>18. Poggio, L., de Sousa, L. M., Batjes, N. H., Heuvelink, G. B., Kempen, B., Ribeiro, E., &amp; Rossiter, D. (2021).</strong> SoilGrids 2.0: producing soil information for the globe with quantified spatial uncertainty. <em>SOIL</em>, 7(1), 217–240. DOI: <a href="https://doi.org/10.5194/soil-7-217-2021" target="_blank">10.5194/soil-7-217-2021</a></p>
        <p class="reference-item"><strong>19. Saxton, K. E., &amp; Rawls, W. J. (2006).</strong> Soil water characteristic estimates by texture and organic matter for hydrologic solutions. <em>Soil Science Society of America Journal</em>, 70(5), 1569–1578. DOI: <a href="https://doi.org/10.2136/sssaj2005.0117" target="_blank">10.2136/sssaj2005.0117</a></p>'''
# Reemplazar con cuidado
code = code.replace('''        <p class="reference-item"><strong>17. Ostrom, E. (1990).</strong> *Governing the Commons: The Evolution of Institutions for Collective Action*. Cambridge University Press, Cambridge, UK. DOI: <a href="https://doi.org/10.1017/CBO9780511807763" target="_blank">10.1017/CBO9780511807763</a></p>''', new_bib_poggio_html)

# 6. En build_markdown(): Glosario markdown
old_glossary_md = '''| **Índices Espectrales** | **$NDVI, NDRE, MCARI, NDWI, NDMI, SAVI, NBR, BSI, SOC$:** Vigor foliar, clorofila, agua foliar, agua superficial, estrés y carbono. | Adimensional |'''
new_glossary_md = '''| **Índices Espectrales** | **$NDVI, NDRE, MCARI, NDWI, NDMI, SAVI, NBR, BSI, SOC$:** Vigor foliar, clorofila, agua foliar, agua superficial, estrés y carbono. | Adimensional |
| **ISRIC SoilGrids / $\\text{SOCS}$** | **Línea de Base Edafológica Global (250 m):** ISRIC SoilGrids 2.0; $\\text{SOC}$ ($\\text{g/kg}$); $\\text{BDOD}$ ($\\text{g/cm}^3$); $\\text{CRF}$ ($\\%$); $\\text{SOCS}$ en $0\\text{--}5\\,\\text{cm}$ ($\\text{t C/ha}$); y secuestro estequiométrico $\\text{CO}_2\\text{e}$ ($44/12$). R: `geodata::soil_world(var="soc", depth=5)` y REST API. | $\\text{g/kg}, \\text{g/cm}^3, \\%, \\text{t C/ha}$ |'''
code = code.replace(old_glossary_md, new_glossary_md)

# 7. En build_markdown(): ToC
old_toc_md = '''  * [2.2. Modelo Agro-Hidrológico Semi-Distribuido ($SCS\\text{-}CN + TWI$) y Balance $SPAC$](#22-modelo-agro-hidrológico-semi-distribuido-scscn--twi-y-balance-spac)'''
new_toc_md = '''  * [2.2. Modelo Agro-Hidrológico Semi-Distribuido ($SCS\\text{-}CN + TWI$) y Balance $SPAC$](#22-modelo-agro-hidrológico-semi-distribuido-scscn--twi-y-balance-spac)
    * [2.2.5. Línea de Base Edafológica Macro-Territorial (ISRIC SoilGrids 2.0 a 250 m) y Estimación de Stocks de Carbono Orgánico (SOCS)](#225-línea-de-base-edafológica-macro-territorial-isric-soilgrids-20-a-250-m-y-estimación-de-stocks-de-carbono-orgánico-socs)'''
code = code.replace(old_toc_md, new_toc_md)

# 8. En build_markdown(): Insertar subsección 2.2.5 antes de 2.3
target_before_23_md = '''---

### 2.3. Dinámica Pirogénica, Balística de Pavesas (Rothermel & Albini) y Vientos'''

section_225_md = '''#### 2.2.5. Línea de Base Edafológica Macro-Territorial (ISRIC SoilGrids 2.0 a 250 m) y Estimación de Stocks de Carbono Orgánico (SOCS)
Para parametrizar las propiedades hidrofísicas y biogeoquímicas de la zona vadosa a escala de cuenca sin incurrir en la prohibitiva densidad de calicatas presenciales, AgriTwin acopla la base global de datos edafológicos grillados **ISRIC SoilGrids 2.0** (Poggio et al., 2021) a 250 metros de resolución espacial. Este sistema modela la distribución tridimensional de propiedades edáficas mediante bosques aleatorios cuantílicos (*Quantile Regression Forests*) calibrados sobre más de 240,000 perfiles estandarizados del repositorio global WoSIS acoplados a covariables bioclimáticas y geomorfológicas derivadas de MODIS y DEM.

A partir de los horizontes superficiales ($0\\text{--}5\\,\\text{cm}$), se extraen simultáneamente la concentración de carbono orgánico ($\\text{SOC}$, $\\text{dg}\\cdot\\text{kg}^{-1}$), la densidad aparente del suelo seco en terrón/tierra fina ($\\text{BDOD}$, $\\text{cg}\\cdot\\text{cm}^{-3}$) y la fracción volumétrica de fragmentos gruesos ($\\text{CRF}$, $\\text{cm}^3 / 100\\,\\text{cm}^3$ o $\\%$). El stock areal de carbono orgánico del suelo ($\\text{SOCS}$) se cuantifica siguiendo la formulación de pedotransferencia estandarizada por IPCC y Batjes (1996):

$$\\text{SOCS}_{0\\text{-}5\\,\\text{cm}} = \\text{SOC} \\times \\text{BDOD} \\times \\left(1 - \\frac{\\text{CRF}}{100}\\right) \\times \\Delta z \\times 0.1 \\quad (5)$$

* **Exégesis de Variables:** $\\text{SOC}$ es el carbono orgánico en la fracción de tierra fina ($< 2\\,\\text{mm}$) [$\\text{g}\\cdot\\text{kg}^{-1}$]; $\\text{BDOD}$ es la densidad aparente seca de la fracción fina [$\\text{g}\\cdot\\text{cm}^{-3}$]; $\\text{CRF}$ es la fracción volumétrica de fragmentos gruesos ($> 2\\,\\text{mm}$) [$\\%$]; $\\Delta z = 5\\,\\text{cm}$ es el espesor del estrato analizado; y $0.1$ es el factor de conversión estequiométrica dimensional ($\\text{g}\\cdot\\text{cm}^{-2} \\to \\text{t C}\\cdot\\text{ha}^{-1}$).

El secuestro neto equivalente de dióxido de carbono ($\\text{Stock CO}_2\\text{e}$) se deduce por balance molecular estequiométrico:

$$\\text{Stock CO}_2\\text{e} = \\text{SOCS} \\times \\frac{M_{\\text{CO}_2}}{M_{\\text{C}}} = \\text{SOCS} \\times \\frac{44.01}{12.011} \\approx \\text{SOCS} \\times 3.667 \\quad (6)$$

* **Acoplamiento con la Retención Hídrica ($SPAC$):** Las covariables texturales de SoilGrids (arena, limo, arcilla) y $\\text{SOC}$ alimentan las funciones de pedotransferencia de Saxton y Rawls (2006) para computar la capacidad de campo ($\\theta_{FC}$), punto de marchitez permanente ($\\theta_{WP}$), agua disponible para la planta ($AWC = \\theta_{FC} - \\theta_{WP}$) y conductividad hidráulica saturada ($K_{sat}$). Estos parámetros inicializan directamente el modelo de balance de masa en la columna vadosa (Ecuación 1) y el número de curva base ($CN$, Ecuación 3), eliminando supuestos arbitrarios a nivel de microcuenca.
* **Downscaling Multiescala ($250\\,\\text{m} \\to 10\\,\\text{m}$):** La macro-grilla regional de 250 m se refina a nivel intra-cuartel ($10\\,\\text{m}$) mediante el Índice de Suelo Desnudo ($BSI$) y reflectancias de infrarrojo de onda corta ($B_{11}, B_{12}$) de Sentinel-2 L2A (Castaldi et al., 2018) durante ventanas inter-cultivo, asimilando además lecturas in-situ de sondas KioT FDR instaladas en los nodos centinela.
* **Reproducibilidad Computacional en R:** La pipeline se encuentra codificada de forma abierta en `scripts/isric_soilgrids_soc.R`, soportando tanto la descarga raster masiva mediante el paquete R `geodata::soil_world(var = "soc", depth = 5)` como consultas puntuales y micro-polígonos vía la API REST v2.0 de ISRIC.

---

### 2.3. Dinámica Pirogénica, Balística de Pavesas (Rothermel & Albini) y Vientos'''

code = code.replace(target_before_23_md, section_225_md)

# Renumerar ecuaciones en markdown
code = code.replace(r'Q_{ig}} \quad (5)', r'Q_{ig}} \quad (7)')
code = code.replace(r'R_{\text{fuego}} \quad (6)', r'R_{\text{fuego}} \quad (8)')
code = code.replace(r'\kappa_{\text{veg}}}} \quad (7)', r'\kappa_{\text{veg}}}} \quad (9)')
code = code.replace(r'T_{\text{aire}}^4 \right) \quad (8)', r'T_{\text{aire}}^4 \right) \quad (10)')
code = code.replace(r'dz \quad (9)', r'dz \quad (11)')
code = code.replace(r'\right)^2 } \quad (10)', r'\right)^2 } \quad (12)')
code = code.replace(r'\mathcal{C}(x, y, t) \right] \quad (11)', r'\mathcal{C}(x, y, t) \right] \quad (13)')
code = code.replace(r'\mathbf{X}_{\sim i}]\right)}{\mathbb{V}(Y)} \quad (12, 13)', r'\mathbf{X}_{\sim i}]\right)}{\mathbb{V}(Y)} \quad (14, 15)')
code = code.replace(r'\hat{\theta}(z_{\text{obs}}, t) \right] \quad (14)', r'\hat{\theta}(z_{\text{obs}}, t) \right] \quad (16)')

# Agregar referencias bibliográficas en markdown
target_bib_md = '''1. **Albini, F. A. (1979).**'''
new_bib_md = '''1. **Batjes, N. H. (1996).** Total carbon and nitrogen in the soils of the world. *European Journal of Soil Science*, 47(2), 151–163. DOI: [10.1111/j.1365-2389.1996.tb01386.x](https://doi.org/10.1111/j.1365-2389.1996.tb01386.x)
2. **Albini, F. A. (1979).**'''
code = code.replace(target_bib_md, new_bib_md)

target_bib_poggio_md = '''17. **Ostrom, E. (1990).** *Governing the Commons: The Evolution of Institutions for Collective Action*. Cambridge University Press, Cambridge, UK. DOI: [10.1017/CBO9780511807763](https://doi.org/10.1017/CBO9780511807763)'''
new_bib_poggio_md = '''17. **Ostrom, E. (1990).** *Governing the Commons: The Evolution of Institutions for Collective Action*. Cambridge University Press, Cambridge, UK. DOI: [10.1017/CBO9780511807763](https://doi.org/10.1017/CBO9780511807763)
18. **Poggio, L., de Sousa, L. M., Batjes, N. H., Heuvelink, G. B., Kempen, B., Ribeiro, E., & Rossiter, D. (2021).** SoilGrids 2.0: producing soil information for the globe with quantified spatial uncertainty. *SOIL*, 7(1), 217–240. DOI: [10.5194/soil-7-217-2021](https://doi.org/10.5194/soil-7-217-2021)
19. **Saxton, K. E., & Rawls, W. J. (2006).** Soil water characteristic estimates by texture and organic matter for hydrologic solutions. *Soil Science Society of America Journal*, 70(5), 1569–1578. DOI: [10.2136/sssaj2005.0117](https://doi.org/10.2136/sssaj2005.0117)'''
code = code.replace(target_bib_md, new_bib_md)
code = code.replace(target_bib_poggio_md, new_bib_poggio_md)

with open(SCRIPT_PATH, "w", encoding="utf-8") as f:
    f.write(code)

print("generate_canonical_paper.py actualizado correctamente.")
