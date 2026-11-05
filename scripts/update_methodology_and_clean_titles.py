#!/usr/bin/env python3
"""
update_methodology_and_clean_titles.py
Modifica scripts/generate_canonical_paper.py con sustituciones directas y seguras.
"""

import sys

GEN_PATH = "/Users/danielsantander/Documents/agritwin-app/scripts/generate_canonical_paper.py"

with open(GEN_PATH, "r", encoding="utf-8") as f:
    text = f.read()

# ─── 1. ELIMINACIÓN DE PARÉNTESIS EN TÍTULOS Y SUBTÍTULOS ────────────────────

replacements = [
    # 1.4
    (
        "1.4. Metodología de Síntesis Adaptativa: Del Bricolaje Tecnológico Situado al Horizonte de los Gemelos Digitales de la Tierra (<em>Destination Earth</em>)",
        "1.4. Metodología de Síntesis Adaptativa: Del Bricolaje Tecnológico Situado al Horizonte de los Gemelos Digitales de la Tierra Destination Earth"
    ),
    (
        "1.4. Metodología de Síntesis Adaptativa: Del Bricolaje Tecnológico Situado al Horizonte de los Gemelos Digitales de la Tierra (*Destination Earth*)",
        "1.4. Metodología de Síntesis Adaptativa: Del Bricolaje Tecnológico Situado al Horizonte de los Gemelos Digitales de la Tierra Destination Earth"
    ),
    (
        "1.4. Metodología de Síntesis Adaptativa: Del Bricolaje Tecnológico Situado al Horizonte de los Gemelos Digitales de la Tierra (Destination Earth)",
        "1.4. Metodología de Síntesis Adaptativa: Del Bricolaje Tecnológico Situado al Horizonte de los Gemelos Digitales de la Tierra Destination Earth"
    ),
    # 1.5
    (
        "1.5. El Sistema Canónico de Cuatro Hipótesis Científicas ($H_1, H_2, H_3, H_4$)",
        "1.5. El Sistema Canónico de Cuatro Hipótesis Científicas H1, H2, H3, H4"
    ),
    # 2.1 TOC
    (
        "2.1. Zonas de Estudio y los Tres Arquetipos Territoriales de Validación (Maule Sur, Maipo, Biobío)",
        "2.1. Zonas de Estudio y los Tres Arquetipos Territoriales de Validación: Maule Sur, Maipo y Biobío"
    ),
    # 2.2 Header and TOC
    (
        "2.2. Modelo Agro-Hidrológico Semi-Distribuido ($SCS\\text{-}CN + TWI$) y Balance Radicular $SPAC$ (incluye 2.2.5 ISRIC SoilGrids 250 m &amp; Stocks $\\text{SOCS}$)",
        "2.2. Arquitectura de Motores Desacoplados y Modelo Agro-Hidrológico Semi-Distribuido SCS-CN con TWI y Balance SPAC"
    ),
    (
        "2.2. Modelo Agro-Hidrológico Semi-Distribuido ($SCS\\text{-}CN + TWI$) y Balance $SPAC$",
        "2.2. Arquitectura de Motores Desacoplados y Modelo Agro-Hidrológico Semi-Distribuido SCS-CN con TWI y Balance SPAC"
    ),
    (
        "[2.2. Modelo Agro-Hidrológico Semi-Distribuido ($SCS\\text{-}CN + TWI$) y Balance $SPAC$](#22-modelo-agro-hidrológico-semi-distribuido-scscn--twi-y-balance-spac)",
        "[2.2. Arquitectura de Motores Desacoplados y Modelo Agro-Hidrológico Semi-Distribuido SCS-CN con TWI y Balance SPAC](#22-arquitectura-de-motores-desacoplados-y-modelo-agro-hidrológico-semi-distribuido-scs-cn-con-twi-y-balance-spac)"
    ),
    # Subsections 2.2
    (
        "2.2.2. Partición Energética y Demanda Evaporativa (FAO-56 Penman-Monteith)",
        "2.2.3. Partición Energética y Demanda Evaporativa según FAO-56 Penman-Monteith"
    ),
    (
        "2.2.3. Generación de Escorrentía Directa Superficial (SCS-CN Dinámico)",
        "2.2.4. Generación de Escorrentía Directa Superficial mediante SCS-CN Dinámico"
    ),
    (
        "2.2.4. Redistribución Topográfica Subsuperficial: Índice Topográfico de Humedad ($TWI$)",
        "2.2.5. Redistribución Topográfica Subsuperficial e Índice Topográfico de Humedad TWI"
    ),
    (
        "2.2.5. Línea de Base Edafológica Macro-Territorial (ISRIC SoilGrids 2.0 a 250 m) y Estimación de Stocks de Carbono Orgánico (SOCS)",
        "2.2.6. Línea de Base Edafológica Macro-Territorial ISRIC SoilGrids 2.0 a 250 m y Estimación de Stocks de Carbono Orgánico SOCS"
    ),
    # 2.3
    (
        "2.3. Dinámica Pirogénica, Balística de Pavesas (Rothermel &amp; Albini) y Regímenes Eólicos",
        "2.3. Dinámica Pirogénica, Balística de Pavesas Rothermel y Albini con Regímenes Eólicos"
    ),
    (
        "2.3. Dinámica Pirogénica, Balística de Pavesas (Rothermel & Albini) y Vientos",
        "2.3. Dinámica Pirogénica, Balística de Pavesas Rothermel y Albini con Regímenes de Viento"
    ),
    (
        "[2.3. Dinámica Pirogénica, Balística de Pavesas (Rothermel & Albini) y Vientos](#23-dinámica-pirogénica-balística-de-pavesas-rothermel--albini-y-vientos)",
        "[2.3. Dinámica Pirogénica, Balística de Pavesas Rothermel y Albini con Regímenes de Viento](#23-dinámica-pirogénica-balística-de-pavesas-rothermel-y-albini-con-regímenes-de-viento)"
    ),
    (
        "2.3.1. Propagación Cuasi-Estacionaria del Frente de Fuego (Modelo Físico de Rothermel)",
        "2.3.1. Propagación Cuasi-Estacionaria del Frente de Fuego según Modelo Físico de Rothermel"
    ),
    (
        "2.3.2. Balística de Pavesas, Vórtices Térmicos y Focos Secundarios (Albini &amp; Byram)",
        "2.3.2. Balística de Pavesas, Vórtices Térmicos y Focos Secundarios según Albini y Byram"
    ),
    (
        "2.3.2. Balística de Pavesas, Vórtices Térmicos y Focos Secundarios (Albini & Byram)",
        "2.3.2. Balística de Pavesas, Vórtices Térmicos y Focos Secundarios según Albini y Byram"
    ),
    # 2.4
    (
        "2.4.1. Dinámica de Capa Límite Estable y Flujo Catabático (Modelo de Prandtl-Mahrt)",
        "2.4.1. Dinámica de Capa Límite Estable y Flujo Catabático según Modelo de Prandtl-Mahrt"
    ),
    (
        "2.4.1. Dinámica de Flujo Catabático en Ladera (Prandtl-Mahrt)",
        "2.4.1. Dinámica de Capa Límite Estable y Flujo Catabático según Modelo de Prandtl-Mahrt"
    ),
    # 2.5
    (
        "2.5.1. Inestabilidad Hidrostática: Energía Potencial Convectiva Disponible ($CAPE$)",
        "2.5.1. Inestabilidad Hidrostática y Energía Potencial Convectiva Disponible CAPE"
    ),
    (
        "2.5.1. Energía Potencial Convectiva Disponible ($CAPE$)",
        "2.5.1. Inestabilidad Hidrostática y Energía Potencial Convectiva Disponible CAPE"
    ),
    (
        "2.5.2. Cizalladura Vertical Profunda y Severidad Cinemática ($DLS_{0\\text{-}6\\,\\text{km}}$)",
        "2.5.2. Cizalladura Vertical Profunda y Severidad Cinemática DLS 0 a 6 km"
    ),
    (
        "2.5.2. Cizalladura Vertical Profunda de Viento ($DLS_{0\\text{-}6\\,\\text{km}}$)",
        "2.5.2. Cizalladura Vertical Profunda y Severidad Cinemática DLS 0 a 6 km"
    ),
    # 2.7
    (
        "2.7. Doctrina Operacional de Mando y Control Táctico C2 ($R = H \\times V \\times C$) y Ciclo OODA",
        "2.7. Doctrina Operacional de Mando y Control Táctico C2 y Ciclo OODA"
    ),
    (
        "2.7. Doctrina Operacional de Mando y Control Táctico C2 ($R = H \\times V \\times C$)",
        "2.7. Doctrina Operacional de Mando y Control Táctico C2 y Ciclo OODA"
    ),
    (
        "[2.7. Doctrina Operacional de Mando y Control Táctico C2 ($R = H \\times V \\times C$)](#27-doctrina-operacional-de-mando-y-control-táctico-c2-r--h-times-v-times-c)",
        "[2.7. Doctrina Operacional de Mando y Control Táctico C2 y Ciclo OODA](#27-doctrina-operacional-de-mando-y-control-táctico-c2-y-ciclo-ooda)"
    ),
    # 2.8
    (
        "2.8. Ecología del Paisaje, Geometría Keyline y Bienes Comunes (Elinor Ostrom)",
        "2.8. Ecología del Paisaje, Geometría Keyline y Gobernanza de Bienes Comunes según Elinor Ostrom"
    ),
    (
        "[2.8. Ecología del Paisaje, Geometría Keyline y Bienes Comunes (Elinor Ostrom)](#28-ecología-del-paisaje-geometría-keyline-y-bienes-comunes-elinor-ostrom)",
        "[2.8. Ecología del Paisaje, Geometría Keyline y Gobernanza de Bienes Comunes según Elinor Ostrom](#28-ecología-del-paisaje-geometría-keyline-y-gobernanza-de-bienes-comunes-según-elinor-ostrom)"
    ),
    # 2.9
    (
        "2.9. Metrología de Sensibilidad (Sobol/Morris) y Cuantificación de Incertidumbre (Guía ISO/IEC 98-3 GUM)",
        "2.9. Metrología de Sensibilidad Sobol y Morris con Cuantificación de Incertidumbre según Guía ISO-IEC 98-3 GUM"
    ),
    (
        "2.9. Metrología de Sensibilidad (Sobol/Morris) y Cuantificación de Incertidumbre (GUM)",
        "2.9. Metrología de Sensibilidad Sobol y Morris con Cuantificación de Incertidumbre según Guía ISO-IEC 98-3 GUM"
    ),
    (
        "[2.9. Metrología de Sensibilidad (Sobol/Morris) y Cuantificación de Incertidumbre (GUM)](#29-metrología-de-sensibilidad-sobolmorris-y-cuantificación-de-incertidumbre-gum)",
        "[2.9. Metrología de Sensibilidad Sobol y Morris con Cuantificación de Incertidumbre según Guía ISO-IEC 98-3 GUM](#29-metrología-de-sensibilidad-sobol-y-morris-con-cuantificación-de-incertidumbre-según-guía-iso-iec-98-3-gum)"
    ),
    (
        "2.9.1. Análisis Global de Sensibilidad por Descomposición de Varianza (Sobol 2001)",
        "2.9.1. Análisis Global de Sensibilidad por Descomposición de Varianza según Sobol"
    ),
    (
        "2.9.1. Análisis Global de Sensibilidad por Varianza (Sobol 2001)",
        "2.9.1. Análisis Global de Sensibilidad por Descomposición de Varianza según Sobol"
    ),
    # 2.10
    (
        "2.10. Protocolo Experimental Ciego de Muestra Dividida (<em>Split-Sample Test</em>) y Banco de Pruebas en R",
        "2.10. Protocolo Experimental Ciego de Muestra Dividida Split-Sample Test y Banco de Pruebas en R"
    ),
    # 3.1
    (
        "3.1. Evaluación Empírica Multi-Sitio y Auditoría Ground-Truth (TRL 7/8)",
        "3.1. Evaluación Empírica Multi-Sitio y Auditoría Ground-Truth TRL 7 y 8"
    ),
    (
        "[3.1. Evaluación Empírica Multi-Sitio y Auditoría Ground-Truth (TRL 7/8)](#31-evaluación-empírica-multi-sitio-y-auditoría-ground-truth-trl-78)",
        "[3.1. Evaluación Empírica Multi-Sitio y Auditoría Ground-Truth TRL 7 y 8](#31-evaluación-empírica-multi-sitio-y-auditoría-ground-truth-trl-7-y-8)"
    ),
    # 3.2
    (
        "3.2. Contrastación Cuantitativa de la Hipótesis 1 ($H_1$): Acoplamiento Multiescala vs. Parcela Desacoplada",
        "3.2. Contrastación Cuantitativa de la Hipótesis 1 H1: Acoplamiento Multiescala vs. Parcela Desacoplada"
    ),
    (
        "3.2. Contrastación de la Hipótesis 1 ($H_1$): La Escala de Cuenca Salva al Predio",
        "3.2. Contrastación de la Hipótesis 1 H1: La Escala de Cuenca Salva al Predio"
    ),
    (
        "3.2. Contrastación Cuantitativa de la Hipótesis 1 ($H_1$)",
        "3.2. Contrastación Cuantitativa de la Hipótesis 1 H1"
    ),
    (
        "[3.2. Contrastación Cuantitativa de la Hipótesis 1 ($H_1$)](#32-contrastación-cuantitativa-de-la-hipótesis-1-h_1)",
        "[3.2. Contrastación Cuantitativa de la Hipótesis 1 H1](#32-contrastación-cuantitativa-de-la-hipótesis-1-h1)"
    ),
    # 3.3
    (
        "3.3. Contrastación Cuantitativa de la Hipótesis 2 ($H_2$): Desempeño Espectral de 10 Bandas e Inferencia Radicular",
        "3.3. Contrastación Cuantitativa de la Hipótesis 2 H2: Desempeño Espectral de 10 Bandas e Inferencia Radicular"
    ),
    (
        "3.3. Contrastación de la Hipótesis 2 ($H_2$): Inferencia de Raíz Profunda superando la Ceguera Satelital",
        "3.3. Contrastación de la Hipótesis 2 H2: Inferencia de Raíz Profunda superando la Ceguera Satelital"
    ),
    (
        "3.3. Contrastación Cuantitativa de la Hipótesis 2 ($H_2$)",
        "3.3. Contrastación Cuantitativa de la Hipótesis 2 H2"
    ),
    (
        "[3.3. Contrastación Cuantitativa de la Hipótesis 2 ($H_2$)](#33-contrastación-cuantitativa-de-la-hipótesis-2-h_2)",
        "[3.3. Contrastación Cuantitativa de la Hipótesis 2 H2](#33-contrastación-cuantitativa-de-la-hipótesis-2-h2)"
    ),
    # 3.4
    (
        "3.4. Contrastación Cuantitativa de la Hipótesis 3 ($H_3$): Colapso de Varianza con el Sensor Crítico Mínimo",
        "3.4. Contrastación Cuantitativa de la Hipótesis 3 H3: Colapso de Varianza con el Sensor Crítico Mínimo"
    ),
    (
        "3.4. Contrastación de la Hipótesis 3 ($H_3$): Suficiencia del Sensor Mínimo (Fin de la «Trampa del Hardware»)",
        "3.4. Contrastación de la Hipótesis 3 H3: Suficiencia del Sensor Mínimo y Superación de la Trampa del Hardware"
    ),
    (
        "3.4. Contrastación Cuantitativa de la Hipótesis 3 ($H_3$)",
        "3.4. Contrastación Cuantitativa de la Hipótesis 3 H3"
    ),
    (
        "[3.4. Contrastación Cuantitativa de la Hipótesis 3 ($H_3$)](#34-contrastación-cuantitativa-de-la-hipótesis-3-h_3)",
        "[3.4. Contrastación Cuantitativa de la Hipótesis 3 H3](#34-contrastación-cuantitativa-de-la-hipótesis-3-h3)"
    ),
    # 3.5
    (
        "3.5. Contrastación Cuantitativa de la Hipótesis 4 ($H_4$): Amortiguación Pirogénica bajo Diseño Keyline",
        "3.5. Contrastación Cuantitativa de la Hipótesis 4 H4: Amortiguación Pirogénica bajo Diseño Keyline"
    ),
    (
        "3.5. Contrastación de la Hipótesis 4 ($H_4$): El Paisaje Diseñado como Escudo Biológico contra Incendios",
        "3.5. Contrastación de la Hipótesis 4 H4: El Paisaje Diseñado como Escudo Biológico contra Incendios"
    ),
    (
        "3.5. Contrastación Cuantitativa de la Hipótesis 4 ($H_4$)",
        "3.5. Contrastación Cuantitativa de la Hipótesis 4 H4"
    ),
    (
        "[3.5. Contrastación Cuantitativa de la Hipótesis 4 ($H_4$)](#35-contrastación-cuantitativa-de-la-hipótesis-4-h_4)",
        "[3.5. Contrastación Cuantitativa de la Hipótesis 4 H4](#35-contrastación-cuantitativa-de-la-hipótesis-4-h4)"
    ),
    # 3.6
    (
        "3.6. Figuras y Gráficos Canónicos del Banco de Pruebas en R (Figuras 1, 2, 3 y 4)",
        "3.6. Figuras y Gráficos Canónicos del Banco de Pruebas en R: Figuras 1, 2, 3 y 4"
    ),
    (
        "3.6. Figuras y Gráficos Canónicos del Banco de Pruebas en R (Figuras 1 a 4)",
        "3.6. Figuras y Gráficos Canónicos del Banco de Pruebas en R: Figuras 1 a 4"
    ),
    (
        "[3.6. Figuras y Gráficos Canónicos del Banco de Pruebas en R (Figuras 1 a 4)](#36-figuras-y-gráficos-canónicos-del-banco-de-pruebas-en-r)",
        "[3.6. Figuras y Gráficos Canónicos del Banco de Pruebas en R: Figuras 1 a 4](#36-figuras-y-gráficos-canónicos-del-banco-de-pruebas-en-r-figuras-1-a-4)"
    ),
    # References TOC
    (
        "PARTE VI: REFERENCIAS BIBLIOGRÁFICAS CANÓNICAS (Norma APA 7ma con DOIs)",
        "PARTE VI: REFERENCIAS BIBLIOGRÁFICAS CANÓNICAS: Norma APA 7ma con DOIs"
    )
]

for old_str, new_str in replacements:
    text = text.replace(old_str, new_str)

# ─── 2. SECCIÓN 2.2 EN HTML: INSERTAR 2.2.1 Y ROBUSTECER 2.2.2 ───────────────

html_target = """        <h2 class="section-title">2.2. Arquitectura de Motores Desacoplados y Modelo Agro-Hidrológico Semi-Distribuido SCS-CN con TWI y Balance SPAC</h2>
        
        <h3 style="font-size: 1.15rem; color: #1e3a8a; margin-top: 1.5rem; margin-bottom: 0.5rem;">2.2.1. Principio Fundamental de Conservación de Masa en la Columna Vadosa</h3>
        <p>
            El núcleo hidrológico de AgriTwin opera como un modelo semi-distribuido basado en la ley fundamental de conservación de masa aplicada a una columna de suelo estratificada (Continuo Suelo-Planta-Atmósfera, $SPAC$). En lugar de resolver las ecuaciones tridimensionales completas de Richards a escala de poro —computacionalmente prohibitivas para gemelos digitales en tiempo real sobre cuencas de cientos de kilómetros cuadrados—, se formula un balance de almacenamiento vadoso con parámetros físicamente basados en cada elemento de malla discretizado:
        </p>"""

html_replacement = """        <h2 class="section-title">2.2. Arquitectura de Motores Desacoplados y Modelo Agro-Hidrológico Semi-Distribuido SCS-CN con TWI y Balance SPAC</h2>
        
        <h3 style="font-size: 1.15rem; color: #1e3a8a; margin-top: 1.5rem; margin-bottom: 0.5rem;">2.2.1. Arquitectura de Motores Headless Isomórficos, Jerarquía de Tres Escalas y Ramificación Contrafáctica What-If</h3>
        <p style="text-align: justify; margin-bottom: 12px;">
            Para sortear las severas restricciones de conectividad y capacidad de cómputo del agro rural chileno sin sacrificar el rigor de la física continua, AgriTwin implementa un <strong>desacople estricto entre motores biofísicos headless y las interfaces de visualización</strong>. Toda la lógica determinista se codifica en funciones matemáticas puras (carentes de estado mutable o dependencias del DOM, Three.js o Leaflet) mediante JavaScript/Node.js isomórfico (<code>js/engines/soil-water-engine.js</code>, <code>basin-hydrology-engine.js</code> y <code>data-cube-engine.js</code>). Esta propiedad permite que los motores corran indistintamente en servidores backend, en nodos de borde o directamente en el navegador web del usuario a una velocidad inferior a 5 milisegundos por ciclo anual simulado.
        </p>
        <p style="text-align: justify; margin-bottom: 12px;">
            El gemelo opera a través de una <strong>jerarquía biofísica de tres escalas espaciales acopladas</strong> mediante transferencia direccional de condiciones de contorno:
        </p>
        <ul style="margin-left: 20px; margin-bottom: 15px; line-height: 1.55; text-align: justify;">
            <li><strong>Macroescala de Cuenca (Forzamiento Sinóptico y Cordillera):</strong> El motor <code>basin-hydrology-engine.js</code> parametriza la cabecera andina del Río Longaví y el Embalse Bullileo ($110\,\text{Hm}^3$) a partir de reanálisis ERA5-Land y precipitaciones satelitales GPM IMERG, modelando $1.220\,\text{km}^2$ con un tiempo de concentración de 14 horas hacia los valles regados.</li>
            <li><strong>Mesoescala de Distribución y Vectores Multiamenaza:</strong> Modela las reglas institucionales de la Junta de Vigilancia del Río Longaví para los aforos de compuertas DGA (entrega al $100\%$ sobre $12\,\text{m}^3/\text{s}$, $75\%$ en estiaje y $45\%$ en estiaje severo), alimentando la contabilidad del Tranque Keyline de $18.500\,\text{m}^3$, mientras que <code>js/hub/geo-layers.js</code> proyecta frentes de fuego acoplados al viento Puelche y drenajes catabáticos nocturnos de ladera.</li>
            <li><strong>Microescala Vadosa y Fisiológica ($SPAC$):</strong> El motor <code>soil-water-engine.js</code> simula la columna estratificada de suelo ($0\text{--}100\,\text{cm}$) resolviendo la tasa de transpiración, la ascensión capilar y el estrés hídrico de raíces celda a celda.</li>
        </ul>
        <p style="text-align: justify; margin-bottom: 15px;">
            Asimismo, el motor implementa nativamente la <strong>ramificación de escenarios contrafácticos What-If</strong> (función <code>simulateScenarios</code>): a partir de un snapshot inmutable en $T_0$, el gemelo clona el estado biofísico y genera múltiples trayectorias simultáneas (olas de calor con viento Puelche a $70\,\text{km/h}$, paralización de pozos profundos o turnos restrictivos DGA al $45\%$) sin mutar la serie histórica observada, asistido por un cliente satelital de acceso directo STAC/COG (<code>stac-cog-client.js</code>) que extrae bandas Sentinel-2 mediante <em>HTTP Range Requests</em> sin requerir servidores intermedios de descarga.
        </p>

        <h3 style="font-size: 1.15rem; color: #1e3a8a; margin-top: 1.5rem; margin-bottom: 0.5rem;">2.2.2. Principio Fundamental de Conservación de Masa en la Columna Vadosa</h3>
        <p style="text-align: justify; margin-bottom: 15px;">
            El núcleo hidrológico de la microescala vadosa de AgriTwin opera como un modelo semi-distribuido basado en la ley fundamental de conservación de masa aplicada a la columna estratificada de suelo (Continuo Suelo-Planta-Atmósfera, $SPAC$). Esta formulación tiene una sólida genealogía teórica: deriva de la integración vertical de la ecuación diferencial general de flujo capilar en medios porosos de <strong>Richards (1931)</strong> sobre la profundidad radicular activa $[0, Z_r]$:
            $$\frac{\partial \theta}{\partial t} = \frac{\partial}{\partial z} \left[ K(\theta) \left( \frac{\partial \psi}{\partial z} + 1 \right) \right] - S(z, t)$$
            Su parametrización integral en reservorios multicapa discretizados (<em>bucket models</em>) fue formalizada en la física de suelos y la agrohidrología por <strong>Feddes, Kowalik y Neuman (1978)</strong> y por el modelo agrohidrológico de referencia SWAP (<em>Soil-Water-Atmosphere-Plant</em>; van Dam et al., 1997), consolidada a escala de cuenca por <strong>Brutsaert (2005)</strong> y estandarizada en la ingeniería de riego por las directrices de la <strong>FAO-56</strong> (Allen, Pereira, Raes y Smith, 1998). En AgriTwin, esta ley física governa la función pura <code>step(prevState, forcing, capacity)</code> en <code>js/engines/soil-water-engine.js</code>:
        </p>"""

if html_target in text:
    text = text.replace(html_target, html_replacement)
    print("HTML Section 2.2 updated successfully.")
else:
    print("ERROR: html_target not matched.")
    sys.exit(1)

# ─── 3. SECCIÓN 2.2 EN MARKDOWN: INSERTAR 2.2.1 Y ROBUSTECER 2.2.2 ────────────

md_target = """### 2.2. Arquitectura de Motores Desacoplados y Modelo Agro-Hidrológico Semi-Distribuido SCS-CN con TWI y Balance SPAC

#### 2.2.1. Principio Fundamental de Conservación de Masa en la Columna Vadosa
El núcleo hidrológico de AgriTwin opera como un modelo semi-distribuido basado en la ley fundamental de conservación de masa aplicada a la columna estratificada de suelo (Continuo Suelo-Planta-Atmósfera, $SPAC$):"""

md_replacement = """### 2.2. Arquitectura de Motores Desacoplados y Modelo Agro-Hidrológico Semi-Distribuido SCS-CN con TWI y Balance SPAC

#### 2.2.1. Arquitectura de Motores Headless Isomórficos, Jerarquía de Tres Escalas y Ramificación Contrafáctica What-If
Para responder a las restricciones de conectividad y capacidad de cómputo del agro rural chileno sin sacrificar el rigor de la física continua, AgriTwin implementa un **desacople estricto entre motores biofísicos headless y las interfaces de visualización**. Toda la lógica determinista se codifica en funciones matemáticas puras (carentes de estado mutable o dependencias del DOM, Three.js o Leaflet) mediante JavaScript/Node.js isomórfico (`js/engines/soil-water-engine.js`, `basin-hydrology-engine.js` y `data-cube-engine.js`). Esta propiedad permite que los motores corran indistintamente en servidores backend, en nodos locales o directamente en el navegador web del usuario a una velocidad inferior a 5 milisegundos por ciclo anual simulado.

El gemelo opera a través de una **jerarquía biofísica de tres escalas espaciales acopladas** mediante transferencia direccional de condiciones de contorno:
* **Macroescala de Cuenca (Forzamiento Sinóptico y Cordillera):** El motor `basin-hydrology-engine.js` parametriza la cabecera andina del Río Longaví y el Embalse Bullileo ($110\,\text{Hm}^3$) a partir de reanálisis ERA5-Land y precipitaciones satelitales GPM IMERG, modelando $1.220\,\text{km}^2$ con un tiempo de concentración de 14 horas hacia los valles regados.
* **Mesoescala de Distribución y Vectores Multiamenaza:** Modela las reglas institucionales de la Junta de Vigilancia del Río Longaví para los aforos de compuertas DGA (entrega al $100\%$ sobre $12\,\text{m}^3/\text{s}$, $75\%$ en estiaje y $45\%$ en estiaje severo), alimentando la contabilidad del Tranque Keyline de $18.500\,\text{m}^3$, mientras que `js/hub/geo-layers.js` proyecta frentes de fuego acoplados al viento Puelche y drenajes catabáticos nocturnos de ladera.
* **Microescala Vadosa y Fisiológica ($SPAC$):** El motor `soil-water-engine.js` simula la columna estratificada de suelo ($0\text{--}100\,\text{cm}$) resolviendo la tasa de transpiración, la ascensión capilar y el estrés hídrico de raíces celda a celda.

Asimismo, el motor implementa nativamente la **ramificación de escenarios contrafácticos What-If** (función `simulateScenarios`): a partir de un snapshot inmutable en $T_0$, el gemelo clona el estado biofísico y genera múltiples trayectorias simultáneas (olas de calor con viento Puelche a $70\,\text{km/h}$, paralización de pozos profundos o turnos restrictivos DGA al $45\%$) sin mutar la serie histórica observada, asistido por un cliente satelital de acceso directo STAC/COG (`stac-cog-client.js`) que extrae bandas Sentinel-2 mediante *HTTP Range Requests* sin requerir servidores intermedios de descarga.

#### 2.2.2. Principio Fundamental de Conservación de Masa en la Columna Vadosa
El núcleo hidrológico de la microescala vadosa de AgriTwin opera como un modelo semi-distribuido basado en la ley fundamental de conservación de masa aplicada a la columna estratificada de suelo (Continuo Suelo-Planta-Atmósfera, $SPAC$). Esta formulación tiene una sólida genealogía teórica: deriva de la integración vertical de la ecuación diferencial general de flujo capilar en medios porosos de **Richards (1931)** sobre la profundidad radicular activa $[0, Z_r]$:
$$\frac{\partial \theta}{\partial t} = \frac{\partial}{\partial z} \left[ K(\theta) \left( \frac{\partial \psi}{\partial z} + 1 \right) \right] - S(z, t)$$
Su parametrización integral en reservorios multicapa discretizados (*bucket models*) fue formalizada en la física de suelos y la agrohidrología por **Feddes, Kowalik y Neuman (1978)** y por el modelo agrohidrológico de referencia SWAP (*Soil-Water-Atmosphere-Plant*; van Dam et al., 1997), consolidada a escala de cuenca por **Brutsaert (2005)** y estandarizada en la ingeniería de riego por las directrices de la **FAO-56** (Allen, Pereira, Raes y Smith, 1998). En AgriTwin, esta ley física governa la función pura `step(prevState, forcing, capacity)` en `js/engines/soil-water-engine.js`:"""

if md_target in text:
    text = text.replace(md_target, md_replacement)
    print("MD Section 2.2 updated successfully.")
else:
    print("ERROR: md_target not matched.")
    sys.exit(1)

# ─── 4. AGREGAR REFERENCIAS BIBLIOGRÁFICAS FALTANTES ────────────────────────

html_ref_byram = "            <li><strong>Byram, G. M. (1959).</strong> Combustion of forest fuels. In: Davis, K. P. (Ed.), <em>Forest Fire: Control and Use</em>. McGraw-Hill, New York, pp. 61–89.</li>"
html_new_byram = """            <li><strong>Brutsaert, W. (2005).</strong> <em>Hydrology: An Introduction</em>. Cambridge University Press, Cambridge, UK. DOI: <a href="https://doi.org/10.1017/CBO9780511808470" target="_blank">10.1017/CBO9780511808470</a></li>
            <li><strong>Byram, G. M. (1959).</strong> Combustion of forest fuels. In: Davis, K. P. (Ed.), <em>Forest Fire: Control and Use</em>. McGraw-Hill, New York, pp. 61–89.</li>
            <li><strong>Feddes, R. A., Kowalik, P. J., &amp; Neuman, S. P. (1978).</strong> <em>Simulation of Field Water Use and Crop Yield</em>. Simulation Monographs, PUDOC, Wageningen, Países Bajos.</li>"""

if html_ref_byram in text:
    text = text.replace(html_ref_byram, html_new_byram)
    print("Added Brutsaert & Feddes to HTML.")

html_ref_rothermel = "            <li><strong>Rothermel, R. C. (1972).</strong> <em>A mathematical model for predicting fire spread in wildland fuels</em>. USDA Forest Service Research Paper INT-115, Intermountain Forest and Range Experiment Station, Ogden, Utah.</li>"
html_new_rothermel = """            <li><strong>Richards, L. A. (1931).</strong> Capillary conduction of liquids through porous mediums. <em>Physics</em>, 1(5), 318–333. DOI: <a href="https://doi.org/10.1063/1.1745010" target="_blank">10.1063/1.1745010</a></li>
            <li><strong>Rothermel, R. C. (1972).</strong> <em>A mathematical model for predicting fire spread in wildland fuels</em>. USDA Forest Service Research Paper INT-115, Intermountain Forest and Range Experiment Station, Ogden, Utah.</li>"""

if html_ref_rothermel in text:
    text = text.replace(html_ref_rothermel, html_new_rothermel)
    print("Added Richards to HTML.")

html_ref_yeomans = "            <li><strong>Yeomans, P. A. (1958).</strong> <em>The Challenge of Landscape: The Development and Practice of Keyline</em>. Keyline Publishing Pty. Ltd., Sydney, Australia.</li>"
html_new_yeomans = """            <li><strong>van Dam, J. C., Huygen, J., Wesseling, J. G., Feddes, R. A., Kabat, P., van Walsum, P. E. V., Groenendijk, P., &amp; van Diepen, C. A. (1997).</strong> <em>Theory of SWAP version 2.0: Simulation of water flow, solute transport and plant growth in the Soil-Water-Atmosphere-Plant environment</em>. Department of Water Resources, Wageningen Agricultural University, Report 71.</li>
            <li><strong>Yeomans, P. A. (1958).</strong> <em>The Challenge of Landscape: The Development and Practice of Keyline</em>. Keyline Publishing Pty. Ltd., Sydney, Australia.</li>"""

if html_ref_yeomans in text:
    text = text.replace(html_ref_yeomans, html_new_yeomans)
    print("Added van Dam to HTML.")

# Markdown references:
md_ref_byram = "8. **Byram, G. M. (1959).** Combustion of forest fuels. In: Davis, K. P. (Ed.), *Forest Fire: Control and Use*. McGraw-Hill, New York, pp. 61–89."
md_new_byram = """8. **Brutsaert, W. (2005).** *Hydrology: An Introduction*. Cambridge University Press, Cambridge, UK. DOI: [10.1017/CBO9780511808470](https://doi.org/10.1017/CBO9780511808470)
9. **Byram, G. M. (1959).** Combustion of forest fuels. In: Davis, K. P. (Ed.), *Forest Fire: Control and Use*. McGraw-Hill, New York, pp. 61–89.
10. **Feddes, R. A., Kowalik, P. J., & Neuman, S. P. (1978).** *Simulation of Field Water Use and Crop Yield*. Simulation Monographs, PUDOC, Wageningen, Países Bajos."""

if md_ref_byram in text:
    text = text.replace(md_ref_byram, md_new_byram)
    print("Added Brutsaert & Feddes to MD.")

md_ref_rothermel = "20. **Rothermel, R. C. (1972).**"
md_new_rothermel = """22. **Richards, L. A. (1931).** Capillary conduction of liquids through porous mediums. *Physics*, 1(5), 318–333. DOI: [10.1063/1.1745010](https://doi.org/10.1063/1.1745010)
23. **Rothermel, R. C. (1972).**"""

if md_ref_rothermel in text:
    text = text.replace(md_ref_rothermel, md_new_rothermel)
    print("Added Richards to MD.")

md_ref_yeomans = "25. **Yeomans, P. A. (1958).**"
md_new_yeomans = """28. **van Dam, J. C., Huygen, J., Wesseling, J. G., Feddes, R. A., Kabat, P., van Walsum, P. E. V., Groenendijk, P., & van Diepen, C. A. (1997).** *Theory of SWAP version 2.0: Simulation of water flow, solute transport and plant growth in the Soil-Water-Atmosphere-Plant environment*. Department of Water Resources, Wageningen Agricultural University, Report 71.
29. **Yeomans, P. A. (1958).**"""

if md_ref_yeomans in text:
    text = text.replace(md_ref_yeomans, md_new_yeomans)
    print("Added van Dam to MD.")

with open(GEN_PATH, "w", encoding="utf-8") as f:
    f.write(text)

print("generate_canonical_paper.py updated successfully!")
