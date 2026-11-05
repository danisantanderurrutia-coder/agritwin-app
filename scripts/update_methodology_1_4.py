# -*- coding: utf-8 -*-
"""
update_methodology_1_4.py
Actualiza la Sección 1.4 de generate_canonical_paper.py formalizando la
Metodología de Síntesis Adaptativa (el 'Omnitrix Biofísico' / Bricolaje Tecnológico Frugal)
en sus tres estratos reales y sus cuatro pilares arquitectónicos:
1. Jerarquía de Tres Escalas Físicas Acopladas
2. Desacople Estricto de Motores Biofísicos Headless
3. Simulación de Escenarios What-If Contrafácticos y Ramificación Decisional
4. Asimilación Dinámica Continua y Nudging Frugal
"""

import re

def update_1_4():
    path = '/Users/danielsantander/Documents/agritwin-app/scripts/generate_canonical_paper.py'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Actualizar título en índice HTML
    old_toc_html = '<li>1.4. La Metodología Computacional de los Gemelos Digitales de la Tierra (<em>Destination Earth</em>)</li>'
    new_toc_html = '<li>1.4. Metodología de Síntesis Adaptativa: Del Bricolaje Tecnológico Situado al Horizonte de los Gemelos Digitales de la Tierra (<em>Destination Earth</em>)</li>'
    content = content.replace(old_toc_html, new_toc_html)

    # 2. Actualizar título en índice Markdown
    old_toc_md = '[1.4. La Metodología Computacional de los Gemelos Digitales de la Tierra (*Destination Earth*)](#14-la-metodología-computacional-de-los-gemelos-digitales-de-la-tierra-destination-earth)'
    new_toc_md = '[1.4. Metodología de Síntesis Adaptativa: Del Bricolaje Tecnológico Situado al Horizonte de los Gemelos Digitales de la Tierra (*Destination Earth*)](#14-metodología-de-síntesis-adaptativa-del-bricolaje-tecnológico-situado-al-horizonte-de-los-gemelos-digitales-de-la-tierra-destination-earth)'
    content = content.replace(old_toc_md, new_toc_md)

    # 3. Bloque completo HTML de la Sección 1.4
    old_body_html = r'''        <h2 class="section-title">1.4. La Metodología Computacional de los Gemelos Digitales de la Tierra (<em>Destination Earth</em>)</h2>
        <p>
            Para materializar operacionalmente la visión permacultural sin caer en aproximaciones empíricas intuitivas, AgriTwin adopta la <strong>metodología computacional de los Gemelos Digitales de la Tierra</strong> formulada por la iniciativa europea <strong>Destination Earth (DestinE)</strong> (Bauer et al., 2021; ECMWF / ESA):
        </p>
        <ul>
            <li><strong>Jerarquía de Tres Escalas Físicas Acopladas:</strong> Macroescala (forzamiento atmosférico sinóptico ERA5 / Open-Meteo), Mesoescala (hidrología semi-distribuida $SCS\text{-}CN + TWI$, balística de incendios y topoclimatología) y Microescala (balance vertical $SPAC$ y dinámica radicular profunda).</li>
            <li><strong>Desacople Estricto de Motores Headless:</strong> Toda la formulación matemática determinista se codifica en funciones puras y reutilizables, separadas de la interfaz gráfica visual, permitiendo ejecuciones de alta velocidad en servidores headless y en el navegador del agricultor sin latencia.</li>
            <li><strong>Simulación de Escenarios What-If Contrafácticos:</strong> Capacidad de someter el gemelo a bifurcaciones hipotéticas (e.g. rotura de bomba de pozo, ola de calor estival $+42^\circ\text{C}$, vientos Puelche de $70\text{ km/h}$) para evaluar la resiliencia predial antes de que ocurra la catástrofe.</li>
        </ul>'''

    new_body_html = r'''        <h2 class="section-title">1.4. Metodología de Síntesis Adaptativa: Del Bricolaje Tecnológico Situado al Horizonte de los Gemelos Digitales de la Tierra (<em>Destination Earth</em>)</h2>
        <p>
            Una precisión epistemológica fundamental distingue a AgriTwin de las iniciativas del hemisferio norte: el gemelo <strong>no es una derivación ni un clon de software</strong> de megaproyectos supercomputacionales europeos. La iniciativa insignia <em>Destination Earth</em> (DestinE; Bauer et al., 2021; ESA / ECMWF / EUMETSAT) opera sobre infraestructuras petascala de cientos de millones de euros (e.g., clústeres LUMI, Leonardo y MareNostrum 5) diseñadas para la simulación climática planetaria global. En contraste radical, la metodología computacional de AgriTwin responde a una <strong>arquitectura de síntesis adaptativa, ingeniería frugal e innovación situada</strong>, estructurada a través de una genealogía de tres estratos complementarios:
        </p>
        
        <div style="background: #fafaf9; border-left: 4px solid #b45309; padding: 16px 20px; margin: 20px 0; border-radius: 0 8px 8px 0; font-size: 13.5px; line-height: 1.65; color: #334155;">
            <p style="margin-bottom: 10px;">
                <strong>Estrato 1 • Empirismo Territorial y Co-Diseño Frugal (El Núcleo Situado):</strong> 
                El modelo no se concibió en el vacío aséptico de un laboratorio foráneo, sino en la interacción directa con las tensiones biofísicas del secano interior de Chile central: marcada estacionalidad mediterránea, alfisoles y vertisoles graníticos de meteorización profunda, vientos desecantes cálidos del este (viento Puelche), escasez severa de telemetría in-situ y alta dependencia de embalses someros de cosecha de aguas lluvia (tranques de secano). Mediante un proceso continuo de co-diseño iterativo y exploración algorítmica asistido por inteligencia artificial agentica (Antigravity), se estructuraron motores biofísicos ligeros acoplados directamente a los registros hidrométricos oficiales del Banco Nacional de Aguas de la DGA y reanálisis climáticos abiertos.
            </p>
            <p style="margin-bottom: 10px;">
                <strong>Estrato 2 • Benchmarking de la Industria Global y Síntesis Polimórfica (El Paradigma "Omnitrix"):</strong> 
                A partir de una auditoría comparativa sistemática de 11 plataformas líderes globales de AgTech y teledetección (Planet Labs, Climate FieldView, SupPlant, Pachama, Ceres Imaging, Taranis, entre otras; documentadas en el Dossier Técnico de la plataforma), AgriTwin aplicó una lógica de síntesis polimórfica: en lugar de forzar al agricultor a suscribir múltiples silos privativos e incompatibles, el gemelo absorbió y transmutó en un único núcleo de código abierto lo mejor de cada referente: la reflectancia multiespectral de bandas terrestres, la zonificación fenológica estacional, la contabilidad hídrica vadosa y la cuantificación de stocks de carbono edáfico (ISRIC SoilGrids 250 m).
            </p>
            <p style="margin-bottom: 0;">
                <strong>Estrato 3 • El Horizonte Paradigmático de Destination Earth (DestinE):</strong> 
                La doctrina de Destination Earth actúa como <strong>horizonte de referencia epistemológico y metodológico</strong>, no como proveedor de código ejecutable. De DestinE se adopta la visión del continuo biofísico acoplado, la asimilación dinámica continua mediante nudging y la exploración de bifurcaciones contrafácticas, transmutando principios concebidos para supercomputadores hacia una formulación matemática analítica y liviana, capaz de ejecutarse con cero latencia en servidores estándar o en el propio navegador de un canalista o pequeño productor agrícola.
            </p>
        </div>

        <p>
            Esta metodología de síntesis adaptativa se operativiza formalmente a través de <strong>cuatro pilares arquitectónicos esenciales</strong>:
        </p>
        <ul>
            <li><strong>1. Jerarquía de Tres Escalas Físicas Acopladas:</strong> 
                Resolución coherente de la física a través de un tensor multiescala continuo: 
                <em>Macroescala</em> (forzamiento atmosférico sinóptico, radiación neta incidente $R_n$, temperatura y déficit de presión de vapor $VPD$ asimilados desde ERA5-Land y misiones Sentinel-2); 
                <em>Mesoescala</em> (dinámica geomorfológica de subcuenca, escorrentía semi-distribuida $SCS\text{-}CN$, convergencia topográfica $TWI$, propagación pirogénica de Rothermel/Albini y drenaje catabático nocturno de Prandtl-Mahrt); y 
                <em>Microescala</em> (balance vertical en el Continuo Suelo-Planta-Atmósfera $SPAC$, regulación estomática $K_s(\theta)$ y extracción radicular en el perfil de $0\text{--}100\,\text{cm}$).</li>
            <li><strong>2. Desacople Estricto de Motores Biofísicos Headless:</strong> 
                Toda la formulación biofísica determinista se codifica en funciones matemáticas puras (carentes de efectos colaterales y desacopladas de la interfaz de usuario). Esto permite compilar los mismos algoritmos para su ejecución en clústeres backend de alto rendimiento, en canalizadores de APIs geoespaciales o localmente en el cliente web mediante JavaScript determinista sin consumo de red.</li>
            <li><strong>3. Simulación de Escenarios What-If Contrafácticos y Ramificación Decisional:</strong> 
                Capacidad de someter el gemelo a bifurcaciones estocásticas controladas antes de la ocurrencia del evento físico real: 
                (a) rotura o paralización imprevista de motobombas en pozos profundos durante el llenado de grano; 
                (b) intensificación de olas de calor con temperaturas de $+42^\circ\text{C}$ bajo viento Puelche sostenido a $70\,\text{km/h}$; y 
                (c) evaluación ex-ante del impacto hidrológico de obras Keyline (arado subsolador y zanjas de infiltración) sobre la recarga de napas someras y la ralentización de incendios antes de comprometer capital en terreno.</li>
            <li><strong>4. Asimilación Dinámica Continua y Nudging Frugal:</strong> 
                Superación de la «trampa del hardware» mediante una ecuación diferencial con inyección forzante de corrección (Newton Nudging, Ecuación 14). El continuo físico propaga la información en el espacio topográfico, permitiendo que una sola estación meteorológica y una sonda TDR multinivel colapsen el $86.4\%$ de la incertidumbre en toda la zona de influencia de la cuenca.</li>
        </ul>'''

    content = content.replace(old_body_html, new_body_html)

    # 4. Bloque Markdown de la Sección 1.4
    old_body_md = r'''### 1.4. La Metodología Computacional de los Gemelos Digitales de la Tierra (*Destination Earth*)
Para materializar operacionalmente la visión permacultural sin caer en aproximaciones empíricas intuitivas, AgriTwin adopta la **metodología computacional de los Gemelos Digitales de la Tierra** formulada por la iniciativa europea **Destination Earth (DestinE)** (Bauer et al., 2021; ECMWF / ESA):
* **Jerarquía de Tres Escalas Físicas Acopladas:** Macroescala (forzamiento atmosférico sinóptico ERA5 / Open-Meteo), Mesoescala (hidrología semi-distribuida $SCS\text{-}CN + TWI$, balística de incendios y topoclimatología) y Microescala (balance vertical $SPAC$ y dinámica radicular profunda).
* **Desacople Estricto de Motores Headless:** Toda la formulación matemática determinista se codifica en funciones puras y reutilizables, separadas de la interfaz gráfica visual, permitiendo ejecuciones de alta velocidad en servidores headless y en el navegador del agricultor sin latencia.
* **Simulación de Escenarios What-If Contrafácticos:** Capacidad de someter el gemelo a bifurcaciones hipotéticas (e.g. rotura de bomba de pozo, ola de calor estival $+42^\circ\text{C}$, vientos Puelche de $70\text{ km/h}$) para evaluar la resiliencia predial antes de que ocurra la catástrofe.'''

    new_body_md = r'''### 1.4. Metodología de Síntesis Adaptativa: Del Bricolaje Tecnológico Situado al Horizonte de los Gemelos Digitales de la Tierra (*Destination Earth*)
Una precisión epistemológica fundamental distingue a AgriTwin de las iniciativas del hemisferio norte: el gemelo **no es una derivación de software ni un clon de código** de megaproyectos supercomputacionales europeos. La iniciativa insignia *Destination Earth* (DestinE; Bauer et al., 2021; ESA / ECMWF / EUMETSAT) opera sobre infraestructuras petascala de cientos de millones de euros (e.g., clústeres LUMI, Leonardo y MareNostrum 5) diseñadas para la simulación climática planetaria global. En contraste radical, la metodología computacional de AgriTwin responde a una **arquitectura de síntesis adaptativa, ingeniería frugal e innovación situada**, estructurada a través de una genealogía de tres estratos:

1. **Estrato 1 • Empirismo Territorial y Co-Diseño Frugal (El Núcleo Situado):** El modelo no se concibió en el vacío aséptico de un laboratorio foráneo, sino en la interacción directa con las restricciones biofísicas del secano interior de Chile central: marcada estacionalidad mediterránea, alfisoles y vertisoles graníticos de meteorización profunda, vientos desecantes cálidos del este (viento Puelche), escasez severa de telemetría in-situ y alta dependencia de tranques de cosecha de aguas lluvia. Mediante un proceso continuo de co-diseño iterativo asistido por inteligencia artificial agentica (Antigravity), se estructuraron motores biofísicos ligeros acoplados directamente a los aforos oficiales de la Dirección General de Aguas (DGA) y reanálisis climáticos abiertos.
2. **Estrato 2 • Benchmarking de la Industria Global y Síntesis Polimórfica (El Paradigma "Omnitrix"):** A partir de una auditoría comparativa sistemática de 11 plataformas líderes globales de AgTech y teledetección (Planet Labs, Climate FieldView, SupPlant, Pachama, Ceres Imaging, Taranis, entre otras; documentadas en el Dossier Técnico de la plataforma), AgriTwin aplicó una lógica de síntesis polimórfica: en lugar de forzar al agricultor a suscribir múltiples silos privativos, el gemelo absorbió y transmutó en un único núcleo de código abierto lo mejor de cada referente: la reflectancia multiespectral de bandas terrestres, la zonificación fenológica estacional, la contabilidad hídrica vadosa y la cuantificación de stocks de carbono edáfico (ISRIC SoilGrids 250 m).
3. **Estrato 3 • El Horizonte Paradigmático de Destination Earth (DestinE):** La doctrina de Destination Earth actúa como **horizonte de referencia epistemológico y metodológico**, no como proveedor de código ejecutable. De DestinE se adopta la visión del continuo biofísico acoplado, la asimilación dinámica continua mediante nudging y la exploración de bifurcaciones contrafácticas, transmutando principios concebidos para supercomputadores hacia una formulación analítica frugal y liviana, ejecutable con cero latencia en servidores estándar o en el navegador local de un canalista o productor agrícola.

Esta metodología de síntesis adaptativa se operativiza formalmente a través de **cuatro pilares arquitectónicos esenciales**:
* **1. Jerarquía de Tres Escalas Físicas Acopladas:** Macroescala sinóptica (ERA5-Land, GPM IMERG, radiación neta $R_n$ y $VPD$), Mesoescala topográfica ($SCS\text{-}CN$ dinámico, convergencia $TWI$, propagación de fuego de Rothermel/Albini y drenaje catabático de Prandtl-Mahrt) y Microescala edáfica (continuo $SPAC$, regulación estomática $K_s(\theta)$ y balance radicular $0\text{--}100\,\text{cm}$).
* **2. Desacople Estricto de Motores Biofísicos Headless:** Toda la formulación matemática determinista se codifica en funciones puras (carentes de efectos colaterales), desacopladas de la interfaz visual, permitiendo ejecuciones de alta velocidad tanto en servidores backend como en el navegador del agricultor sin latencia ni dependencia de red.
* **3. Simulación de Escenarios What-If Contrafácticos y Ramificación Decisional:** Capacidad de someter el gemelo a bifurcaciones hipotéticas controladas antes de la ocurrencia del evento real: paralización imprevista de bombas en pozo profundo, olas de calor extremas ($+42^\circ\text{C}$ con Puelche a $70\,\text{km/h}$) o evaluación ex-ante de obras Keyline sobre la recarga de napas freáticas y la ralentización de incendios.
* **4. Asimilación Dinámica Continua y Nudging Frugal:** Superación de la «trampa del hardware» mediante una ecuación diferencial con inyección forzante de corrección (Newton Nudging, Ecuación 14), demostrando que una única estación meteorológica y una sonda TDR multinivel colapsan el $86.4\%$ de la incertidumbre epistémica en toda la subcuenca.'''

    content = content.replace(old_body_md, new_body_md)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("generate_canonical_paper.py actualizado exitosamente con la Metodología de Síntesis Adaptativa.")

if __name__ == '__main__':
    update_1_4()
