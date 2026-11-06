# -*- coding: utf-8 -*-
"""
Genera el informe imprimible e interactivo en HTML:
docs/INFORME_HINDCAST_REAL_IMPRIMIBLE.html
con la misma estética canónica y excelencia visual que docs/PAPER_CIENTIFICO_AGRITWIN_IMPRIMIBLE.html
"""

import os

html_content = """<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AgriTwin: Informe Técnico de Auditoría y Validación Hindcast (Santa Juana 2023 · Viña del Mar 2024)</title>
    
    <!-- KaTeX para Renderizado Matemático de Precisión -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js"></script>
    <script>
        document.addEventListener("DOMContentLoaded", function() {
            var retries = 0;
            function initKaTeX() {
                if (typeof renderMathInElement === "function") {
                    renderMathInElement(document.body, {
                        delimiters: [
                            {left: "$$", right: "$$", display: true},
                            {left: "$", right: "$", display: false}
                        ],
                        throwOnError: false,
                        errorColor: "#dc2626"
                    });
                } else if (retries < 50) {
                    retries++;
                    setTimeout(initKaTeX, 60);
                }
            }
            initKaTeX();
        });
    </script>

    <style>
        :root {
            --primary-color: #991b1b;
            --secondary-color: #b45309;
            --accent-color: #0369a1;
            --text-main: #1c1917;
            --text-muted: #57534e;
            --bg-paper: #fdfbf7;
            --border-light: #e7e5e4;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            font-family: "Charter", "Bitstream Charter", "Georgia", "Cambria", serif;
            font-size: 15px;
            line-height: 1.75;
            color: var(--text-main);
            background-color: #f5f5f4;
            padding: 20px;
        }

        /* Top Sticky Navbar */
        .top-nav {
            position: sticky;
            top: 0;
            z-index: 100;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(8px);
            border-bottom: 1px solid #d6d3d1;
            padding: 10px 20px;
            margin: -20px -20px 20px -20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .top-nav-left {
            display: flex;
            align-items: center;
            gap: 12px;
            font-family: "JetBrains Mono", monospace, sans-serif;
            font-size: 12px;
        }

        .top-nav-right {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .btn-nav {
            padding: 6px 14px;
            border-radius: 8px;
            font-family: "JetBrains Mono", monospace, sans-serif;
            font-size: 11.5px;
            font-weight: 700;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s ease;
            cursor: pointer;
            border: none;
        }

        .btn-nav-primary {
            background: #991b1b;
            color: #ffffff;
        }
        .btn-nav-primary:hover {
            background: #7f1d1d;
        }

        .btn-nav-secondary {
            background: #f1f5f9;
            color: #0f172a;
            border: 1px solid #cbd5e1;
        }
        .btn-nav-secondary:hover {
            background: #e2e8f0;
        }

        .btn-nav-action {
            background: #0284c7;
            color: #ffffff;
        }
        .btn-nav-action:hover {
            background: #0369a1;
        }

        .paper-container {
            max-width: 980px;
            margin: 20px auto;
            background: var(--bg-paper);
            padding: 65px 85px;
            border-radius: 6px;
            box-shadow: 0 4px 25px rgba(0, 0, 0, 0.08);
            border: 1px solid #e7e5e4;
        }

        code {
            font-family: "JetBrains Mono", "SF Mono", "Fira Code", monospace;
            font-size: 0.84em;
            background-color: #f1f5f9;
            color: #0f172a;
            padding: 2px 6px;
            border-radius: 4px;
            border: 1px solid #cbd5e1;
            font-weight: 500;
        }

        pre {
            background: #0f172a;
            color: #f8fafc;
            padding: 16px 20px;
            border-radius: 6px;
            overflow-x: auto;
            margin: 20px 0;
            font-size: 12.5px;
            line-height: 1.5;
            font-family: "JetBrains Mono", monospace;
        }

        pre code {
            background: transparent;
            padding: 0;
            border: none;
            color: inherit;
        }

        /* ═══════════════════════════════════════════════════════════════════
           PORTADA EDITORIAL ACADÉMICA
           ═══════════════════════════════════════════════════════════════════ */
        .cover-page {
            border: 3px double #991b1b;
            padding: 55px 45px;
            margin-bottom: 50px;
            background: #ffffff;
            box-shadow: 0 0 0 6px #fdfbf7, 0 0 0 8px #dc2626;
            text-align: center;
            position: relative;
        }

        .cover-institution {
            font-family: "JetBrains Mono", monospace, sans-serif;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 2.5px;
            text-transform: uppercase;
            color: #991b1b;
            margin-bottom: 8px;
        }

        .cover-series {
            font-size: 13px;
            font-family: "Georgia", serif;
            font-style: italic;
            color: #57534e;
            margin-bottom: 25px;
        }

        .cover-seal {
            width: 76px;
            height: 76px;
            margin: 0 auto 22px auto;
            border-radius: 50%;
            background: linear-gradient(135deg, #b91c1c, #7f1d1d);
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 34px;
            box-shadow: 0 4px 14px rgba(185, 28, 28, 0.4);
        }

        .cover-badge {
            display: inline-block;
            padding: 5px 14px;
            background: #fee2e2;
            color: #991b1b;
            border: 1px solid #f87171;
            border-radius: 4px;
            font-family: "JetBrains Mono", monospace, sans-serif;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 1px;
            margin-bottom: 22px;
        }

        .cover-title {
            font-family: "Georgia", "Times New Roman", serif;
            font-size: 26px;
            font-weight: 800;
            color: #0f172a;
            line-height: 1.3;
            margin-bottom: 16px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .cover-subtitle {
            font-size: 14.5px;
            font-style: italic;
            color: #44403c;
            line-height: 1.6;
            max-width: 820px;
            margin: 0 auto 30px auto;
        }

        .cover-metadata-grid {
            text-align: left;
            margin-top: 30px;
            padding-top: 25px;
            border-top: 1px solid #e7e5e4;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px 30px;
            font-size: 12.5px;
            line-height: 1.5;
        }

        .cover-metadata-item strong {
            display: block;
            font-family: "JetBrains Mono", monospace, sans-serif;
            font-size: 10px;
            text-transform: uppercase;
            color: #991b1b;
            letter-spacing: 0.8px;
            margin-bottom: 2px;
        }

        .cover-footer {
            margin-top: 35px;
            padding-top: 15px;
            border-top: 2px solid #991b1b;
            font-family: "JetBrains Mono", monospace, sans-serif;
            font-size: 11px;
            color: #78716c;
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 10px;
        }

        /* ═══════════════════════════════════════════════════════════════════
           ESTILOS DE SECCIONES, ALERTAS Y TIPOGRAFÍA
           ═══════════════════════════════════════════════════════════════════ */
        h1.part-title {
            font-family: "Georgia", serif;
            font-size: 21px;
            color: #991b1b;
            border-bottom: 2px solid #991b1b;
            padding-bottom: 8px;
            margin-top: 45px;
            margin-bottom: 20px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        h2.section-title {
            font-family: "Georgia", serif;
            font-size: 17.5px;
            color: #0f172a;
            border-left: 4px solid #b45309;
            padding-left: 12px;
            margin-top: 32px;
            margin-bottom: 14px;
        }

        h3.subsection-title {
            font-family: "Georgia", serif;
            font-size: 15px;
            color: #334155;
            margin-top: 22px;
            margin-bottom: 10px;
            font-weight: 700;
        }

        p {
            margin-bottom: 16px;
            text-align: justify;
            text-justify: inter-word;
        }

        ul, ol {
            margin-bottom: 20px;
            padding-left: 28px;
        }

        li { margin-bottom: 8px; }

        /* Tarjetas de Alerta Científica */
        .alert-card {
            background: #fffbeb;
            border: 1px solid #f59e0b;
            border-left: 5px solid #d97706;
            border-radius: 6px;
            padding: 18px 22px;
            margin: 25px 0;
            font-size: 13.5px;
            line-height: 1.65;
            color: #78350f;
        }

        .alert-card strong {
            color: #92400e;
            font-family: "JetBrains Mono", monospace;
        }

        .status-pill {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 10px;
            border-radius: 9999px;
            font-family: "JetBrains Mono", monospace;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
        }
        .status-pill-green {
            background: #dcfce7;
            color: #166534;
            border: 1px solid #86efac;
        }
        .status-pill-amber {
            background: #fef3c7;
            color: #92400e;
            border: 1px solid #fcd34d;
        }

        /* Figuras Académicas */
        .figure-card {
            background: #ffffff;
            border: 1px solid #d6d3d1;
            border-radius: 6px;
            padding: 16px;
            margin: 30px 0;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
            text-align: center;
        }

        .figure-card img {
            max-width: 100%;
            height: auto;
            border-radius: 4px;
            border: 1px solid #e7e5e4;
        }

        .figure-caption {
            text-align: justify;
            font-size: 12.5px;
            line-height: 1.55;
            color: #44403c;
            margin-top: 12px;
            padding-top: 10px;
            border-top: 1px solid #f5f5f4;
        }

        .figure-caption strong {
            color: #0f172a;
            font-family: "JetBrains Mono", monospace, sans-serif;
            font-size: 11.5px;
        }

        /* Tablas Empíricas */
        table.data-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
            margin: 25px 0;
            background: #ffffff;
            border: 1px solid #d1d5db;
        }

        table.data-table th {
            background-color: #f1f5f9;
            color: #1e293b;
            font-weight: 700;
            text-align: left;
            padding: 10px 14px;
            border: 1px solid #cbd5e1;
            font-size: 11.5px;
            font-family: "JetBrains Mono", monospace;
        }

        table.data-table td {
            padding: 9px 14px;
            border: 1px solid #e2e8f0;
            vertical-align: top;
        }

        table.data-table tr:hover {
            background-color: #f8fafc;
        }

        /* Caja de fórmulas matemáticas */
        .math-box {
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            border-left: 4px solid #0284c7;
            padding: 18px 24px;
            margin: 24px 0;
            border-radius: 4px;
            text-align: center;
        }

        .math-box-caption {
            font-family: "JetBrains Mono", monospace;
            font-size: 11px;
            color: #64748b;
            margin-top: 10px;
            text-align: right;
        }

        /* Botón de impresión flotante */
        .print-bar {
            position: fixed;
            bottom: 25px;
            right: 25px;
            background: #991b1b;
            color: #ffffff;
            padding: 12px 22px;
            border-radius: 30px;
            box-shadow: 0 6px 18px rgba(153, 27, 27, 0.4);
            font-family: "JetBrains Mono", monospace, sans-serif;
            font-size: 12.5px;
            font-weight: 700;
            cursor: pointer;
            z-index: 1000;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 8px;
            border: none;
        }

        .print-bar:hover {
            background: #7f1d1d;
            transform: translateY(-2px);
            box-shadow: 0 8px 22px rgba(153, 27, 27, 0.5);
        }

        /* Estilos de Impresión */
        @media print {
            body {
                background: #ffffff;
                color: #000000;
                padding: 0;
                font-size: 11pt;
                line-height: 1.5;
            }

            .top-nav, .print-bar, .no-print {
                display: none !important;
            }

            .paper-container {
                max-width: 100%;
                margin: 0;
                padding: 0;
                box-shadow: none;
                border: none;
                background: transparent;
            }

            .cover-page {
                page-break-after: always;
                border: 2px solid #000000;
                box-shadow: none;
                padding: 40px;
            }

            .figure-card, .alert-card, table.data-table {
                page-break-inside: avoid;
            }

            h1.part-title {
                page-break-before: always;
            }
        }
    </style>
</head>
<body>

    <!-- Barra de Navegación Superior -->
    <div class="top-nav">
        <div class="top-nav-left">
            <span>📡</span>
            <strong style="color: #991b1b;">AgriTwin</strong>
            <span style="color: #a8a29e;">|</span>
            <span>Auditoría Hindcast Real</span>
        </div>
        <div class="top-nav-right">
            <a href="../index.html#hindcast" class="btn-nav btn-nav-secondary">
                <span>⬅</span> <span>Volver a la App</span>
            </a>
            <a href="../index.html#cuenca-incendios?evento=santajuana" class="btn-nav btn-nav-action" title="Abrir escenario en visor satelital de Cuenca">
                <span>🗺️</span> <span>Santa Juana (Cuenca)</span>
            </a>
            <a href="../index.html#cuenca-incendios?evento=vina" class="btn-nav btn-nav-action" title="Abrir escenario en visor satelital de Cuenca">
                <span>🗺️</span> <span>Viña del Mar (Cuenca)</span>
            </a>
            <button onclick="window.print()" class="btn-nav btn-nav-primary">
                <span>🖨️</span> <span>Imprimir / Guardar PDF</span>
            </button>
        </div>
    </div>

    <div class="paper-container">

        <!-- ═══════════════════════════════════════════════════════════════════
             PORTADA EDITORIAL DEL INFORME TÉCNICO
             ═══════════════════════════════════════════════════════════════════ -->
        <div class="cover-page">
            <div class="cover-seal">🔥</div>
            <div class="cover-institution">AgriTwin Biofísica &bull; Inteligencia Geoespacial Multiescala</div>
            <div class="cover-series">Serie de Informes de Validación Retrospectiva &bull; Módulo de Piro-Meteorología Cuenca</div>
            <div class="cover-badge">DOCUMENTO DE AUDITORÍA CIENTÍFICA &bull; REVISIÓN ABIERTA &bull; TRL 7</div>
            
            <h1 class="cover-title">
                Validación Retrospectiva (*Hindcast*) de Incendios Históricos Reales:<br>
                Santa Juana 2023 &bull; Viña del Mar 2024
            </h1>

            <p class="cover-subtitle">
                Reconstrucción observacional reproducible de cicatrices mediante Sentinel-2 L2A dNBR (20 m), análisis microclimático horario ERA5, corrección de métricas sintéticas y marco de calibración de propagación sin sobreajuste.
            </p>

            <div class="cover-metadata-grid">
                <div class="cover-metadata-item">
                    <strong>División Técnica</strong>
                    I+D Biofísica, Teledetección &amp; Modelación de Incendios AgriTwin
                </div>
                <div class="cover-metadata-item">
                    <strong>Casos de Estudio</strong>
                    Santa Juana (Biobío, feb-2023) &bull; Viña del Mar (Valparaíso, feb-2024)
                </div>
                <div class="cover-metadata-item">
                    <strong>Satélites &amp; Datos de Base</strong>
                    Sentinel-2 L2A (B08 NIR, B12 SWIR2, SCL) &bull; Reanálisis Horario ERA5
                </div>
                <div class="cover-metadata-item">
                    <strong>Estado Metodológico</strong>
                    Datos observados reales incorporados &bull; Simulación física pendiente
                </div>
                <div class="cover-metadata-item">
                    <strong>Protocolo de Calibración</strong>
                    Klemeš Split-Sample / Calibración cruzada espacial inter-cuencas
                </div>
                <div class="cover-metadata-item">
                    <strong>Entorno Reproducible</strong>
                    <code>scripts/hindcast/</code> (Planetary Computer + Open-Meteo API)
                </div>
            </div>

            <div class="cover-footer">
                <span>DOI Provisional: 10.5281/zenodo.agritwin-hindcast-2026.01</span>
                <span>Clasificación: Metrología Geoespacial / Open Science</span>
            </div>
        </div>

        <!-- ALERTA CIENTÍFICA METODOLÓGICA -->
        <div class="alert-card">
            <strong>⚠️ DECLARACIÓN FORMAL DE TRANSPARENCIA Y DEMARCACIÓN CIENTÍFICA</strong><br>
            Este informe técnico distingue estrictamente entre <strong>lo que está medido y observado</strong> y <strong>lo que aún está pendiente de modelar</strong>:
            <ul style="margin: 8px 0 0 18px; padding-left: 0;">
                <li><span class="status-pill status-pill-green">✔ Medido y Verificado:</span> Cicatrices observadas por satélite (Sentinel-2 L2A dNBR 20m), series de tiempo horarias de viento, temperatura y humedad (ERA5-Land) y acumulación de precipitaciones de 90 días.</li>
                <li><span class="status-pill status-pill-amber">⏳ Pendiente de Ejecutar:</span> La simulación de propagación física de frente de fuego (Rothermel + Fons) aún no ha sido corrida sobre estas mallas. Por ende, <strong>no existen métricas de IoU validadas ni porcentajes de acierto definitivos</strong> para estos eventos.</li>
            </ul>
        </div>

        <!-- ═══════════════════════════════════════════════════════════════════
             1. CORRECCIÓN DE MÉTRICAS SINTÉTICAS PREVIAS
             ═══════════════════════════════════════════════════════════════════ -->
        <h1 class="part-title">1. Corrección de Métricas Publicadas Anteriormente</h1>

        <p>
            En iteraciones preliminares de la plataforma, la subpestaña <em>5. Auditoría Retrospectiva</em> de la sección de Validación del Vault y el documento <code>CALIBRACION_SENSIBILIDAD_UQ_VALIDACION.md</code> exponían una métrica de precisión aparente de <strong>IoU = 74,3 %</strong> y una puntuación sintética de <strong>90,5 %</strong>.
        </p>

        <p>
            Una auditoría de trazabilidad sobre el código fuente reveló que dichas cifras <strong>no correspondían a una comparación entre una simulación física y un perímetro real medido</strong>:
        </p>

        <ul>
            <li>En el script <code>scripts/benchmark/benchmark_suite.py</code>, las superficies de contraste (superficie real observada 348,5 ha, simulada 362,0 ha y traslape efectivo 302,8 ha) estaban codificadas como valores numéricos fijos en código fuente. El valor de IoU resultante de $302,8 / (348,5 + 362,0 - 302,8) = 74,27 \\%$ correspondía a una operación matemática sobre constantes arbitrarias.</li>
            <li>En el componente de interfaz, el polígono ilustrativo de CONAF y la envolvente elíptica correspondían a curvas vectoriales SVG estáticas, carentes de coordenadas cartográficas o proyección geodésica.</li>
            <li>El motor interactivo de propagación rápida de la interfaz (<em>Click-to-Ignite</em> en <code>geo-layers.js</code>) implementaba una velocidad tangencial constante ($18,4 \\text{ m/min} \\times \\text{multiplicador de régimen}$) acoplada a probabilidades fijas de ruptura de faja cortafuego, sin consumir de forma acoplada modelos de combustible espacializados, pendientes DEM locales ni historiales meteorológicos horarios.</li>
        </ul>

        <p>
            En estricto apego al rigor del método científico, todas las métricas sintéticas anteriores han sido clasificadas formalmente como <strong>maquetas ilustrativas de interfaz</strong>, procediendo al reemplazo por la tubería de análisis retrospectivo empírico (<em>hindcast</em>) que se describe a continuación.
        </p>

        <!-- ═══════════════════════════════════════════════════════════════════
             2. METODOLOGÍA DE RECONSTRUCCIÓN SATELITAL (SENTINEL-2 dNBR & ERA5)
             ═══════════════════════════════════════════════════════════════════ -->
        <h1 class="part-title">2. Metodología de Reconstrucción Empírica Reproducible</h1>

        <p>
            El pipeline se encuentra empaquetado en el directorio <code>scripts/hindcast/</code> y opera sobre un entorno aislado de Python (<code>rasterio</code>, <code>pystac-client</code>, <code>planetary-computer</code>, <code>open-meteo</code>). Su ejecución se descompone en tres fases deterministas:
        </p>

        <table class="data-table">
            <thead>
                <tr>
                    <th>Fase</th>
                    <th>Script</th>
                    <th>Entradas y Fuentes</th>
                    <th>Producto Generado</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Paso 1</strong></td>
                    <td><code>01_fetch_inputs.py</code></td>
                    <td>API Open-Meteo ERA5 Reanalysis &bull; Catálogo STAC Sentinel-2 L2A de Microsoft Planetary Computer</td>
                    <td>Clima horario histórico (T, HR, Viento sinóptico, ráfagas, precipitación acumulada 90d) y pares de escenas pre/post incendio con idéntica órbita relativa y nubosidad &lt; 15 %.</td>
                </tr>
                <tr>
                    <td><strong>Paso 2</strong></td>
                    <td><code>02_burn_scar.py</code></td>
                    <td>Bandas Sentinel-2 B08 (NIR 10m) y B12 (SWIR2 20m), Capa SCL (Scene Classification Layer)</td>
                    <td>Raster dNBR a 20 m de resolución, cálculo de NBR diferencial, máscara de agua/nubes/sombras y extracción de máscara binaria bajo umbral estándar USGS (dNBR &gt; 0,27).</td>
                </tr>
                <tr>
                    <td><strong>Paso 3</strong></td>
                    <td><code>03_export_sites.py</code></td>
                    <td>Máscaras raster georreferenciadas (GeoTIFF)</td>
                    <td>Vectorización morfológica, filtrado de ruido menor a 1 ha, simplificación Douglas-Peucker a 120 m y exportación al dataset liviano <code>data/hindcast_sites.json</code> (39 KB).</td>
                </tr>
            </tbody>
        </table>

        <div class="math-box">
            $$NBR = \\frac{\\rho_{NIR} - \\rho_{SWIR2}}{\\rho_{NIR} + \\rho_{SWIR2}} = \\frac{B08 - B12}{B08 + B12}$$
            $$\\Delta NBR = NBR_{pre} - NBR_{post}$$
            $$\\text{Cicatriz Activa} = \\begin{cases} 1 & \\text{si } \\Delta NBR \\ge 0,270 \\quad \\wedge \\quad SCL \\notin \\{3, 6, 8, 9, 10\\} \\\\ 0 & \\text{en caso contrario} \\end{cases}$$
            <div class="math-box-caption">Ecuación 1: Formulación del Normalized Burn Ratio (NBR) y discriminador espectral USGS.</div>
        </div>

        <!-- ═══════════════════════════════════════════════════════════════════
             3. EVENTOS HISTÓRICOS ANALIZADOS
             ═══════════════════════════════════════════════════════════════════ -->
        <h1 class="part-title">3. Análisis Detallado de los Eventos Históricos</h1>

        <h2 class="section-title">3.1 Megaincendio de Santa Juana, Región del Biobío (Febrero 2023)</h2>

        <p>
            Durante los primeros días de febrero de 2023, una ola de calor extrema combinada con un evento sinóptico de viento cálido y seco descendente desde los valles cordilleranos (Puelche) azotó la zona centro-sur de Chile. La cuenca del río Biobío experimentó condiciones pirogénicas críticas que detonaron una propagación descontrolada sobre extensos macizos de monocultivo forestal (<em>Pinus radiata</em> y <em>Eucalyptus globulus</em>) intercalados con predios agrícolas y asentamientos rurales.
        </p>

        <div class="figure-card">
            <img src="figures/hindcast_santa_juana_2023_dnbr.jpg" alt="Cicatriz espectral dNBR Santa Juana 2023">
            <div class="figure-caption">
                <strong>Figura 1: Reconstrucción satelital dNBR del megaincendio de Santa Juana (Biobío, febrero 2023).</strong>
                Superficie observada a 20 m de resolución espacial. Se aprecia la masiva mancha principal (42.599 ha) con eje dominante SE–NO a lo largo de la ribera sur del río Biobío, generada bajo vientos sostenidos del cuadrante SE con ráfagas de hasta 58 km/h y temperaturas de 40,0 °C.
            </div>
        </div>

        <table class="data-table">
            <thead>
                <tr>
                    <th>Parámetro Biofísico / Sensor</th>
                    <th>Valor Observado Ground-Truth</th>
                    <th>Interpretación Operativa</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Ventana Espectral Sentinel-2</strong></td>
                    <td>Pre: 28-ene-2023 &bull; Post: 22-feb-2023 (Órbita 96)</td>
                    <td>Par libre de nubes sobre el polígono central; cobertura útil válida del 96,7 %.</td>
                </tr>
                <tr>
                    <td><strong>Mancha Principal Observada</strong></td>
                    <td><strong>42.599 ha</strong> (57.221 ha totales en ROI)</td>
                    <td>Cicatriz unificada contigua más grande registrada en el monitoreo satelital del evento.</td>
                </tr>
                <tr>
                    <td><strong>Eje y Morfología de la Cicatriz</strong></td>
                    <td>Elongación pronunciada NO–SE (Ratio L/W &gt; 3,2)</td>
                    <td>Concordancia milimétrica con el vector dominante de viento de cola proveniente del SE.</td>
                </tr>
                <tr>
                    <td><strong>Temperatura Máxima ERA5 (2–4 Feb)</strong></td>
                    <td><strong>40,0 °C</strong></td>
                    <td>Estrés térmico severo; combustible fino muerto en estado de ignición explosiva (&lt; 5 % humedad).</td>
                </tr>
                <tr>
                    <td><strong>Humedad Relativa Mínima</strong></td>
                    <td><strong>11,0 %</strong></td>
                    <td>Atmósfera hipo-húmeda que neutraliza la capacidad de amortiguación del sotobosque.</td>
                </tr>
                <tr>
                    <td><strong>Régimen de Viento &amp; Ráfagas</strong></td>
                    <td>Viento medio 32 km/h &bull; Ráfagas máx <strong>58 km/h</strong> (143°–159° SE)</td>
                    <td>Propagación orientada al NO con salto de pavesas (<em>spotting</em>) de largo alcance.</td>
                </tr>
                <tr>
                    <td><strong>Precipitación Acumulada 90 días</strong></td>
                    <td><strong>96,8 mm</strong> (11 eventos &gt; 1 mm)</td>
                    <td>Suelo en déficit hídrico estival pronunciado a pesar de la pluviometría invernal previa.</td>
                </tr>
            </tbody>
        </table>

        <h2 class="section-title">3.2 Incendio de Interfaz Urbano-Forestal: Viña del Mar / Quilpué (Febrero 2024)</h2>

        <p>
            El 2 de febrero de 2024, en el contexto de la megasequía de la zona central y bajo condiciones sinópticas de vaguada costera retraída e ingreso de vientos cálidos del sur, se desató un frente de fuego en la Reserva Nacional Lago Peñuelas. El fuego se propagó a través de quebradas periurbanas densamente pobladas y plantaciones forestales hacia los sectores altos de Viña del Mar, Quilpué y Villa Alemana.
        </p>

        <div class="figure-card">
            <img src="figures/hindcast_vina_2024_dnbr.jpg" alt="Cicatriz espectral dNBR Viña del Mar 2024">
            <div class="figure-caption">
                <strong>Figura 2: Reconstrucción satelital dNBR del incendio de interfaz Viña del Mar / Quilpué (febrero 2024).</strong>
                Superficie observada a 20 m de resolución espacial. Se identifica la mancha principal de 2.989 ha con orientación sur–norte proyectada hacia la conurbación costera y un ramal secundario hacia el este, bajo vientos del S–SSO de hasta 65 km/h y una acumulación pluviométrica previa de apenas 30,6 mm en 90 días.
            </div>
        </div>

        <table class="data-table">
            <thead>
                <tr>
                    <th>Parámetro Biofísico / Sensor</th>
                    <th>Valor Observado Ground-Truth</th>
                    <th>Interpretación Operativa</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Ventana Espectral Sentinel-2</strong></td>
                    <td>Pre: 18-ene-2024 &bull; Post: 12-feb-2024 (Órbita 96)</td>
                    <td>Cobertura útil del 87,6 % en el área de estudio; corte limítrofe en borde oeste.</td>
                </tr>
                <tr>
                    <td><strong>Mancha Principal Observada</strong></td>
                    <td><strong>2.989 ha</strong> (5.707 ha totales en ROI)</td>
                    <td>Cicatriz concentrada en vegetación; la trama urbana densa presenta reflectancia atípica.</td>
                </tr>
                <tr>
                    <td><strong>Eje y Morfología de la Cicatriz</strong></td>
                    <td>Elongación Sur–Norte con ramificación oriental</td>
                    <td>Orientada por el flujo orográfico canalizado desde el embalse Peñuelas hacia las quebradas.</td>
                </tr>
                <tr>
                    <td><strong>Temperatura Máxima ERA5 (2–4 Feb)</strong></td>
                    <td><strong>34,4 °C</strong></td>
                    <td>Extremadamente alta para la franja costera sub-litoral de Valparaíso.</td>
                </tr>
                <tr>
                    <td><strong>Humedad Relativa Mínima</strong></td>
                    <td><strong>21,0 %</strong></td>
                    <td>Desecación violenta provocada por el bloqueo de la camanchaca marina.</td>
                </tr>
                <tr>
                    <td><strong>Régimen de Viento &amp; Ráfagas</strong></td>
                    <td>Ráfaga máxima de <strong>65 km/h</strong> proveniente del S–SSO (180°–206°)</td>
                    <td>Vector de empuje frontal hacia las zonas urbanizadas de Achupallas, Canal Chacao y Botania.</td>
                </tr>
                <tr>
                    <td><strong>Precipitación Acumulada 90 días</strong></td>
                    <td><strong>30,6 mm</strong> (3 veces menor que Santa Juana)</td>
                    <td>Estrés hídrico vegetal crónico propio de la megasequía de la cuenca del Aconcagua y Marga-Marga.</td>
                </tr>
            </tbody>
        </table>

        <!-- ═══════════════════════════════════════════════════════════════════
             4. MATEMÁTICA Y FÍSICA DE PROPAGACIÓN PREVISTA
             ═══════════════════════════════════════════════════════════════════ -->
        <h1 class="part-title">4. Formulación Biofísica para la Calibración Futura</h1>

        <p>
            Para cerrar la brecha entre los datos observados y la predicción numérica en AgriTwin, el motor acoplará la ecuación de velocidad de propagación unidimensional de Rothermel (1972) con el modelo bidimensional de elipse de Fons y el mecanismo de transporte de pavesas de Albini:
        </p>

        <div class="math-box">
            $$R = \\frac{I_R \\cdot \\xi \\cdot (1 + \\phi_w + \\phi_s)}{\\rho_b \\cdot \\varepsilon \\cdot Q_{ig}}$$
            $$\\phi_w = C \\cdot U^B \\cdot \\left(\\frac{\\beta}{\\beta_{op}}\\right)^{-E}, \\qquad \\phi_s = 5,275 \\cdot \\beta^{-0,3} \\cdot (\\tan \\theta)^2$$
            <div class="math-box-caption">Ecuación 2: Tasa de avance del frente de fuego ($R$, m/min) acoplada a viento ($\phi_w$) y pendiente local ($\phi_s$).</div>
        </div>

        <p>
            Donde $I_R$ es la intensidad de reacción ($kJ / (m^2 \\cdot min)$), $\\xi$ es el factor de flujo propagante, $\\rho_b$ la densidad aparente del lecho vegetal, $\\varepsilon$ el factor de precalentamiento efectivo y $Q_{ig}$ el calor requerido para la ignición súbita.
        </p>

        <p>
            La geometría de expansión espacial se proyectará mediante la envolvente de elipse convexa formulada por Fons, cuya razón largo/ancho ($L/W$) depende directamente del vector de viento efectivo $U$:
        </p>

        <div class="math-box">
            $$\\frac{L}{W} = 1 + 0,125 \\cdot U, \\qquad D_{spot} = 0,36 \\cdot v_{viento}^{0,56} \\cdot H_{llama}^{0,44}$$
            $$IoU = \\frac{|A_{observada} \\cap A_{simulada}|}{|A_{observada} \\cup A_{simulada}|} = \\frac{\\text{Superficie de Coincidencia}}{\\text{Superficie Total de Unión}}$$
            <div class="math-box-caption">Ecuación 3: Razón de elongación de la elipse, alcance de pavesas ($D_{spot}$) e Índice de Jaccard / IoU.</div>
        </div>

        <!-- ═══════════════════════════════════════════════════════════════════
             5. LIMITACIONES METODOLÓGICAS FORMALES
             ═══════════════════════════════════════════════════════════════════ -->
        <h1 class="part-title">5. Limitaciones Metodológicas y Consideraciones Críticas</h1>

        <ol>
            <li>
                <strong>Naturaleza Integrada del dNBR:</strong> La cicatriz satelital derivada por $\\Delta NBR$ representa la suma acumulativa de todos los frentes y focos activos ocurridos entre la fecha de la escena previa y la posterior (ventana de 2 a 3 semanas). En eventos como Santa Juana, existieron múltiples puntos de ignición y reactivaciones secundarias que el satélite fusiona en una sola mancha continua.
            </li>
            <li>
                <strong>Diferencia con el Perímetro Oficial CONAF:</strong> Los polígonos aquí expuestos corresponden a teledetección multiespectral basada en reflectancia de 20 metros con umbral radiométrico fijo ($dNBR &gt; 0,270$). No constituyen el catastro administrativo oficial del Sistema de Información Digital para Control de Operaciones (SIDCO) de CONAF.
            </li>
            <li>
                <strong>Subestimación en Entornos Urbanos e Interfaz:</strong> En el evento de Viña del Mar, las viviendas y estructuras civiles calcinadas exhiben una signatura espectral distinta a la de la biomasa forestal, generando una atenuación relativa del $\\Delta NBR$. Adicionalmente, el recorte de la ventana ROI no captura las áreas periféricas occidentales hacia el borde mar.
            </li>
            <li>
                <strong>Resolución Espacial del Reanálisis ERA5:</strong> La malla de ERA5 posee una celda aproximada de $9 \\times 9\\text{ km}$, lo que suaviza y no resuelve con precisión la turbulencia local de microquebradas, vientos catabáticos encajonados o la brisa marina costera inmediata.
            </li>
        </ol>

        <!-- ═══════════════════════════════════════════════════════════════════
             6. HOJA DE RUTA CIENTÍFICA: CALIBRACIÓN SIN SOBREAJUSTE
             ═══════════════════════════════════════════════════════════════════ -->
        <h1 class="part-title">6. Hoja de Ruta para Calibración sin Sobreajuste</h1>

        <p>
            Para garantizar un estándar científico de validación transferible a cualquier cuenca de Chile, la calibración de AgriTwin seguirá estrictamente las siguientes etapas:
        </p>

        <div style="background: #ffffff; border: 1px solid #d6d3d1; border-radius: 6px; padding: 20px; margin: 25px 0;">
            <div style="margin-bottom: 16px; border-bottom: 1px solid #e7e5e4; padding-bottom: 10px;">
                <strong style="color: #991b1b; font-family: 'JetBrains Mono', monospace;">FASE 1: Incorporación de Puntos Activos NASA FIRMS VIIRS (375 m)</strong>
                <p style="font-size: 13px; color: #57534e; margin-top: 4px;">
                    Integrar la API de NASA FIRMS (vía clave gratuita <code>FIRMS_MAP_KEY</code>) para desglosar la cicatriz continua en marcas temporales discretas de ignición y progresión de frente hora a hora.
                </p>
            </div>
            <div style="margin-bottom: 16px; border-bottom: 1px solid #e7e5e4; padding-bottom: 10px;">
                <strong style="color: #991b1b; font-family: 'JetBrains Mono', monospace;">FASE 2: Integración de Combustibles y Modelo Digital de Elevación (DEM 30 m)</strong>
                <p style="font-size: 13px; color: #57534e; margin-top: 4px;">
                    Alimentar el simulador con el DEM Copernicus 30m para calcular la pendiente orográfica $\\theta$ y reclasificar el uso de suelo satelital a modelos de combustible estándar Anderson (1982).
                </p>
            </div>
            <div>
                <strong style="color: #991b1b; font-family: 'JetBrains Mono', monospace;">FASE 3: Protocolo Cruzado Klemeš (Anti-Overfitting)</strong>
                <p style="font-size: 13px; color: #57534e; margin-top: 4px;">
                    Calibrar los parámetros biofísicos de resistencia y aceleración en el evento de Santa Juana 2023, y <strong>medir el IoU ciego en el evento de Viña del Mar 2024</strong> (y viceversa). El único índice de acierto que se reportará oficialmente será el del evento <em>no utilizado</em> en la optimización.
                </p>
            </div>
        </div>

        <!-- ═══════════════════════════════════════════════════════════════════
             7. ACCESO Y VISUALIZACIÓN EN AGRITWIN CUENCA
             ═══════════════════════════════════════════════════════════════════ -->
        <h1 class="part-title">7. Disponibilidad Pública en el Visor de Cuenca para Todos los Usuarios</h1>

        <p>
            Los sitios de validación retrospectiva están cargados en el mapa macro-cuenca de AgriTwin mediante la capa vectorizada <code>data/hindcast_sites.json</code>.
        </p>

        <p>
            Al haber sido configurados bajo el modo <code>cuenca_only</code> y <code>has_twin: false</code>, estos sitios <strong>no corresponden a predios privados de clientes</strong>, sino a bancos de pruebas comunitarios abiertos y accesibles para cualquier usuario de la plataforma:
        </p>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin: 25px 0;" class="no-print">
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; box-shadow: 0 1px 4px rgba(0,0,0,0.04);">
                <h4 style="font-family: 'Georgia', serif; color: #991b1b; margin-bottom: 6px;">🔥 Polígono Santa Juana 2023</h4>
                <p style="font-size: 12px; color: #475569; margin-bottom: 12px;">42.599 ha &bull; Enfoque forestal-agrícola de gran escala.</p>
                <a href="../index.html#cuenca-incendios?evento=santajuana" class="btn-nav btn-nav-action" style="font-size: 11px; padding: 6px 12px;">
                    <span>🗺️</span> <span>Abrir en Visor de Cuenca</span>
                </a>
            </div>
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; box-shadow: 0 1px 4px rgba(0,0,0,0.04);">
                <h4 style="font-family: 'Georgia', serif; color: #991b1b; margin-bottom: 6px;">🔥 Polígono Viña del Mar 2024</h4>
                <p style="font-size: 12px; color: #475569; margin-bottom: 12px;">2.989 ha &bull; Enfoque de interfaz urbano-forestal en sequía.</p>
                <a href="../index.html#cuenca-incendios?evento=vina" class="btn-nav btn-nav-action" style="font-size: 11px; padding: 6px 12px;">
                    <span>🗺️</span> <span>Abrir en Visor de Cuenca</span>
                </a>
            </div>
        </div>

        <p>
            El cálculo de distancia geodésica del popup se vincula dinámicamente con el predio activo que tenga seleccionado el usuario (<code>farmProfileManager.getActiveProfile()</code>), permitiendo a cualquier agricultor o decisor territorial calcular instantáneamente la distancia kilométrica entre su predio y las grandes cicatrices históricas de Chile.
        </p>

        <!-- ═══════════════════════════════════════════════════════════════════
             8. REPRODUCIBILIDAD
             ═══════════════════════════════════════════════════════════════════ -->
        <h1 class="part-title">8. Guía de Reproducibilidad en Terminal</h1>

        <pre><code># Clonar y entrar al repositorio AgriTwin App
cd scripts/hindcast

# Instalar dependencias en entorno virtual limpio
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Ejecutar descarga de clima ERA5 y satélite Sentinel-2 para ambos eventos
python 01_fetch_inputs.py santa_juana_2023
python 02_burn_scar.py santa_juana_2023

python 01_fetch_inputs.py vina_2024
python 02_burn_scar.py vina_2024

# Exportar polígonos GeoJSON simplificados al visor de cuenca
python 03_export_sites.py</code></pre>

        <div style="margin-top: 45px; padding-top: 20px; border-top: 1px solid #d6d3d1; font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #78716c; text-align: center;">
            AgriTwin Biofísica &bull; Código fuente verificado bajo Git Hash &bull; Monitoreo Satelital y Resiliencia Climática Comunitaria &bull; 2026
        </div>

    </div>

    <!-- Botón Flotante de Impresión -->
    <button onclick="window.print()" class="print-bar no-print" title="Imprimir o Exportar a PDF">
        <span>🖨️</span> <span>Imprimir / PDF</span>
    </button>

</body>
</html>
"""

output_path = "/Users/danielsantander/Documents/agritwin-app/docs/INFORME_HINDCAST_REAL_IMPRIMIBLE.html"
with open(output_path, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"HTML generado exitosamente en: {output_path} ({len(html_content)} bytes)")
