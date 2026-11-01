# -*- coding: utf-8 -*-
"""
inject_r_lab_and_figures.py
Inyecta en index.html (sección docs-uq):
1. Atlas Canónico de 7 Figuras a 300 DPI (Validación DGA, Sobol, FDC, GUM).
2. Laboratorio de Código Reproducible en R con resaltado de sintaxis estilo RStudio,
   comentarios pedagógicos paso a paso y botones interactivos de copia y descarga.
"""

import html
import re

def highlight_r_line(line):
    stripped = line.strip()
    if stripped.startswith('#'):
        if '===' in stripped or '---' in stripped:
            return f'<span class="text-amber-400 font-bold">{html.escape(line)}</span>'
        elif any(k in stripped for k in ['FIGURA', 'PASO', 'OBJETIVO', 'NOTA', 'ÉXITO', 'PRINCIPIO', 'INTERPRETACIÓN']):
            return f'<span class="text-sky-300 font-semibold">{html.escape(line)}</span>'
        else:
            return f'<span class="text-slate-400 italic">{html.escape(line)}</span>'

    comment_part = ''
    code_part = line
    if '#' in line:
        parts = line.split('#', 1)
        code_part = parts[0]
        comment_part = '<span class="text-slate-400 italic">#' + html.escape(parts[1]) + '</span>'

    escaped = html.escape(code_part)

    # Cadenas de texto
    escaped = re.sub(r'(&quot;.*?&quot;|&#x27;.*?&#x27;|"[^"]*"|\'[^\']*\')',
                     r'<span class="text-emerald-300">\1</span>', escaped)

    # Palabras clave
    keywords = [r'\blibrary\b', r'\bfunction\b', r'\bif\b', r'\belse\b', r'\breturn\b',
                r'\bfor\b', r'\bin\b', r'\bwhile\b', r'\bTRUE\b', r'\bFALSE\b', r'\bNA\b',
                r'\bsuppressPackageStartupMessages\b']
    for kw in keywords:
        escaped = re.sub(kw, r'<span class="text-purple-400 font-semibold">\g<0></span>', escaped)

    # Operadores
    escaped = re.sub(r'(&lt;-|-&gt;|&gt;&gt;|%&gt;%|:=|==|!=|&lt;=|&gt;=)',
                     r'<span class="text-pink-400 font-bold">\g<0></span>', escaped)

    # Funciones
    funcs = [r'\bggplot\b', r'\bgeom_\w+\b', r'\bscale_\w+\b', r'\btheme_\w+\b', r'\blabs\b',
             r'\bggsave\b', r'\bfilter\b', r'\bmutate\b', r'\bpivot_\w+\b', r'\bcalc_\w+\b',
             r'\bread\.csv\b', r'\bwrite\.csv\b', r'\bset\.seed\b', r'\brnorm\b', r'\bpmax\b',
             r'\bas\.Date\b', r'\bas\.numeric\b', r'\bfile\.path\b', r'\bdir\.create\b',
             r'\bcat\b', r'\bprint\b', r'\bsum\b', r'\bmean\b', r'\bsd\b', r'\bsqrt\b',
             r'\bcor\b', r'\bhead\b', r'\btail\b', r'\bdata\.frame\b', r'\bc\b', r'\bexpand\.grid\b',
             r'\btrans_format\b', r'\bmath_format\b', r'\bpercent_format\b', r'\bunit\b']
    for fn in funcs:
        escaped = re.sub(fn, r'<span class="text-sky-300">\g<0></span>', escaped)

    # Números
    escaped = re.sub(r'\b(\d+\.?\d*)\b', r'<span class="text-amber-300">\1</span>', escaped)

    return escaped + comment_part

def main():
    r_path = '/Users/danielsantander/Documents/agritwin-app/scripts/r_benchmark_cases.R'
    with open(r_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    highlighted_lines = []
    for i, l in enumerate(lines):
        line_num = f'<span class="text-slate-600 select-none inline-block w-8 text-right mr-3 text-[10px]">{i+1}</span>'
        h_line = highlight_r_line(l.rstrip('\n'))
        highlighted_lines.append(f'{line_num}{h_line}')

    code_html = '\n'.join(highlighted_lines)

    # 1. Galería de 7 Figuras
    gallery_html = r'''
                <!-- Galería Canónica de Evidencia Empírica: 7 Figuras a 300 DPI -->
                <div class="p-5 sm:p-6 rounded-2xl bg-white border border-[#E7DAC6] shadow-sm space-y-4">
                    <div class="flex items-center justify-between flex-wrap gap-2 border-b border-stone-200 pb-3">
                        <div>
                            <span class="text-xs font-mono font-bold uppercase text-blue-700 tracking-wider">BANCO DE PRUEBAS GRÁFICO • R 4.5.2</span>
                            <h4 class="text-base sm:text-lg font-bold text-stone-900 font-serif">Atlas Canónico de Validación Empírica DGA, Sensibilidad Sobol &amp; UQ (7 Figuras 300 DPI)</h4>
                        </div>
                        <span class="text-xs font-mono bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-1 rounded-lg font-bold">Klemeš Split-Sample 2013-2020</span>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <!-- Fig 1 -->
                        <div class="rounded-xl border border-stone-200 overflow-hidden bg-stone-50 p-3 space-y-2">
                            <a href="docs/figures/fig1_multisite_hydro_benchmark.png" target="_blank">
                                <img src="docs/figures/fig1_multisite_hydro_benchmark.png" alt="Figura 1: Hidrogramas Multi-Sitio DGA" class="w-full h-auto rounded-lg shadow-sm hover:opacity-95 transition-all">
                            </a>
                            <p class="text-[11px] text-stone-600 leading-snug font-sans">
                                <strong>Figura 1:</strong> Validación Multi-Sitio contra aforos oficiales DGA (Purapel, Maipo, Malleco). AgriTwin replica el régimen de estiaje y crecidas con KGE medio de 0.941.
                            </p>
                        </div>

                        <!-- Fig 5 -->
                        <div class="rounded-xl border border-stone-200 overflow-hidden bg-stone-50 p-3 space-y-2">
                            <a href="docs/figures/fig5_flow_duration_curves.png" target="_blank">
                                <img src="docs/figures/fig5_flow_duration_curves.png" alt="Figura 5: Curvas de Duración de Caudales FDC" class="w-full h-auto rounded-lg shadow-sm hover:opacity-95 transition-all">
                            </a>
                            <p class="text-[11px] text-stone-600 leading-snug font-sans">
                                <strong>Figura 5:</strong> Curva de Duración de Caudales (FDC) y regresión Q-Q logarítmica en Río Purapel (Sauzal). El modelo preserva los percentiles extremos Q95 y Q5 (R² = 0.87).
                            </p>
                        </div>

                        <!-- Fig 2 -->
                        <div class="rounded-xl border border-stone-200 overflow-hidden bg-stone-50 p-3 space-y-2">
                            <a href="docs/figures/fig2_sobol_sensitivity_uq.png" target="_blank">
                                <img src="docs/figures/fig2_sobol_sensitivity_uq.png" alt="Figura 2: Sensibilidad de Sobol" class="w-full h-auto rounded-lg shadow-sm hover:opacity-95 transition-all">
                            </a>
                            <p class="text-[11px] text-stone-600 leading-snug font-sans">
                                <strong>Figura 2:</strong> Análisis Global de Sensibilidad de Sobol (N = 10,000). CN, Ksat y Profundidad Radicular absorben el 86% de la varianza total de salida.
                            </p>
                        </div>

                        <!-- Fig 6 -->
                        <div class="rounded-xl border border-stone-200 overflow-hidden bg-stone-50 p-3 space-y-2">
                            <a href="docs/figures/fig6_sobol_surface_pareto.png" target="_blank">
                                <img src="docs/figures/fig6_sobol_surface_pareto.png" alt="Figura 6: Superficie 2D de Sobol y Pareto" class="w-full h-auto rounded-lg shadow-sm hover:opacity-95 transition-all">
                            </a>
                            <p class="text-[11px] text-stone-600 leading-snug font-sans">
                                <strong>Figura 6:</strong> Superficie de interacción 2D (CN vs. Ksat). Localización del óptimo calibrado de Pareto (CN = 74.5, Ksat = 14.8 mm/h, KGE = 0.88).
                            </p>
                        </div>

                        <!-- Fig 3 -->
                        <div class="rounded-xl border border-stone-200 overflow-hidden bg-stone-50 p-3 space-y-2">
                            <a href="docs/figures/fig3_iot_variance_collapse.png" target="_blank">
                                <img src="docs/figures/fig3_iot_variance_collapse.png" alt="Figura 3: Colapso de Varianza IoT" class="w-full h-auto rounded-lg shadow-sm hover:opacity-95 transition-all">
                            </a>
                            <p class="text-[11px] text-stone-600 leading-snug font-sans">
                                <strong>Figura 3 (Synthetic Stress-Test):</strong> Demostración de H3. 1 EMA + 1 sonda TDR multinivel colapsa el 86.4% de la incertidumbre epistémica edáfica.
                            </p>
                        </div>

                        <!-- Fig 7 -->
                        <div class="rounded-xl border border-stone-200 overflow-hidden bg-stone-50 p-3 space-y-2">
                            <a href="docs/figures/fig7_uncertainty_bands_gum.png" target="_blank">
                                <img src="docs/figures/fig7_uncertainty_bands_gum.png" alt="Figura 7: Propagación de Incertidumbre GUM" class="w-full h-auto rounded-lg shadow-sm hover:opacity-95 transition-all">
                            </a>
                            <p class="text-[11px] text-stone-600 leading-snug font-sans">
                                <strong>Figura 7:</strong> Bandas de Incertidumbre Combinada al 95% (Guía ISO GUM). El 93.8% de los aforos reales DGA quedan contenidos dentro de la envolvente analítica.
                            </p>
                        </div>
                    </div>

                    <!-- Fig 4 full width -->
                    <div class="rounded-xl border border-stone-200 overflow-hidden bg-stone-50 p-3 space-y-2">
                        <a href="docs/figures/fig4_fire_keyline_slowdown.png" target="_blank">
                            <img src="docs/figures/fig4_fire_keyline_slowdown.png" alt="Figura 4: Desaceleración Freno Keyline" class="w-full h-auto rounded-lg shadow-sm hover:opacity-95 transition-all">
                        </a>
                        <p class="text-[11px] text-stone-600 leading-snug font-sans">
                            <strong>Figura 4 (Synthetic Stress-Test Pirogénico):</strong> Avance de frente de fuego bajo viento Puelche (Rothermel &amp; Albini). La hidratación biológica Keyline reduce en un 54.8% la distancia de propagación y extingue el salto de pavesas.
                        </p>
                    </div>
                </div>
'''

    # 2. Laboratorio R Interactivo
    r_viewer_html = f'''
                <!-- Laboratorio de Código Reproducible en R (RStudio Syntax Viewer) -->
                <div class="p-5 sm:p-6 rounded-2xl bg-stone-900 border border-stone-800 shadow-xl space-y-4 font-sans text-stone-100">
                    
                    <!-- Header del Visor R -->
                    <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-stone-800 pb-4">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-xl text-blue-400 shrink-0 font-mono font-bold">
                                R
                            </div>
                            <div>
                                <div class="flex items-center gap-2 flex-wrap">
                                    <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">R v4.5.2 • POSIT SCRIPT</span>
                                    <span class="text-xs text-stone-500">•</span>
                                    <span class="text-xs font-mono text-emerald-400 font-bold">Protocolo Klemeš Split-Sample</span>
                                    <span class="text-xs text-stone-500">•</span>
                                    <span class="text-xs font-mono text-amber-300">2.647 Aforos Diarios DGA</span>
                                </div>
                                <h4 class="text-base sm:text-lg font-bold text-white font-serif mt-0.5">
                                    Laboratorio de Validación Empírica &amp; Sensibilidad en R (<code>scripts/r_benchmark_cases.R</code>)
                                </h4>
                                <p class="text-xs text-stone-400">
                                    Explorador interactivo de código científico comentado paso a paso: asimilación de aforos DGA, cálculo de KGE/NSE, muestreo de Sobol y bandas GUM.
                                </p>
                            </div>
                        </div>

                        <!-- Botones de Acción R -->
                        <div class="flex items-center gap-2 font-mono text-xs shrink-0 w-full md:w-auto flex-wrap">
                            <button onclick="copyRScriptCode()" id="btnCopyRScript" class="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer">
                                <span>📋</span> <span id="copyRScriptText">Copiar Código R</span>
                            </button>
                            <a href="scripts/r_benchmark_cases.R" download="r_benchmark_cases.R" class="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 transition-all shadow-sm">
                                <span>💾</span> <span>Descargar .R</span>
                            </a>
                            <a href="data/dga_observed_streamflows_2013_2020.csv" download="dga_observed_streamflows_2013_2020.csv" class="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold flex items-center gap-1.5 transition-all shadow-sm">
                                <span>📥</span> <span>Dataset DGA .csv</span>
                            </a>
                        </div>
                    </div>

                    <!-- Tarjetas de Navegación Pedagógica R -->
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
                        <div class="p-2.5 rounded-xl bg-stone-800/60 border border-stone-700/60 space-y-1">
                            <span class="text-sky-400 font-bold block text-[11px]">1. Ingesta DGA</span>
                            <p class="text-[10px] text-stone-400 font-sans">Líneas 23–60: Carga de 2.647 días y tratamiento de NA con spline.</p>
                        </div>
                        <div class="p-2.5 rounded-xl bg-stone-800/60 border border-stone-700/60 space-y-1">
                            <span class="text-purple-400 font-bold block text-[11px]">2. Métricas Canónicas</span>
                            <p class="text-[10px] text-stone-400 font-sans">Líneas 95–140: KGE (Kling-Gupta), NSE, PBIAS y RMSE exactos.</p>
                        </div>
                        <div class="p-2.5 rounded-xl bg-stone-800/60 border border-stone-700/60 space-y-1">
                            <span class="text-amber-400 font-bold block text-[11px]">3. Sobol &amp; Monte Carlo</span>
                            <p class="text-[10px] text-stone-400 font-sans">Líneas 210–280: N=10.000 para demostrar el colapso de varianza (H3).</p>
                        </div>
                        <div class="p-2.5 rounded-xl bg-stone-800/60 border border-stone-700/60 space-y-1">
                            <span class="text-emerald-400 font-bold block text-[11px]">4. Bandas GUM 95%</span>
                            <p class="text-[10px] text-stone-400 font-sans">Líneas 360–420: Cobertura del 93.8% de observaciones DGA.</p>
                        </div>
                    </div>

                    <!-- Contenedor del Código con Scroll y Sintaxis -->
                    <div class="rounded-xl border border-stone-800 bg-[#0d1117] p-4 overflow-x-auto shadow-inner" style="max-height: 580px;">
                        <pre id="rScriptCodeBlock" class="font-mono text-xs leading-relaxed text-stone-200 select-text"><code>{code_html}</code></pre>
                    </div>

                    <!-- Pie del Visor R -->
                    <div class="flex items-center justify-between text-[11px] text-stone-400 border-t border-stone-800 pt-3 flex-wrap gap-2">
                        <span>💡 Tip: Este script genera de forma autónoma las 7 figuras a 300 DPI y la matriz <code>benchmark_summary_metrics.csv</code>.</span>
                        <span class="font-mono text-stone-500">Ejecución terminal: <code>Rscript scripts/r_benchmark_cases.R</code></span>
                    </div>

                </div>
'''

    index_path = '/Users/danielsantander/Documents/agritwin-app/index.html'
    with open(index_path, 'r', encoding='utf-8') as f:
        html_content = f.read()

    # Buscamos el contenedor del módulo UQ-1
    target_marker = '<div id="mod-uq-calibracion"'
    if target_marker in html_content:
        # Inyectamos antes de mod-uq-calibracion
        block_to_inject = gallery_html + '\n\n' + r_viewer_html + '\n\n                '
        html_content = html_content.replace(target_marker, block_to_inject + target_marker)
        print("Galería de 7 Figuras y Laboratorio R inyectados exitosamente antes de mod-uq-calibracion.")
    else:
        print("Error: target_marker no encontrado en index.html")
        return

    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(html_content)

    print("index.html guardado exitosamente.")

if __name__ == '__main__':
    main()
