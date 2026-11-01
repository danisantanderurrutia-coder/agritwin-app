# -*- coding: utf-8 -*-
"""
build_r_script_viewer.py
Lee scripts/r_benchmark_cases.R, genera una versión con resaltado de sintaxis
estilo RStudio / Posit (colores de código interactivos) y la inyecta en index.html
en la sección docs-uq (Calibración, Sensibilidad & UQ).
Incluye:
- Botón de Copiar al Portapapeles con feedback visual
- Botón de Descarga directa de scripts/r_benchmark_cases.R
- Botón de Descarga directa de data/dga_observed_streamflows_2013_2020.csv
- Guía pedagógica visual con tarjetas conceptuales antes del código
"""

import os
import re
import html

def highlight_r_line(line):
    # Si la línea es un comentario completo
    stripped = line.strip()
    if stripped.startswith('#'):
        # Distinguir comentarios de sección versus comentarios normales
        if '===' in stripped or '---' in stripped:
            return f'<span class="text-amber-400 font-bold">{html.escape(line)}</span>'
        elif any(k in stripped for k in ['FIGURA', 'PASO', 'OBJETIVO', 'NOTA', 'ÉXITO']):
            return f'<span class="text-sky-300 font-semibold">{html.escape(line)}</span>'
        else:
            return f'<span class="text-slate-400 italic">{html.escape(line)}</span>'

    # Manejar comentarios al final de la línea
    comment_part = ''
    code_part = line
    if '#' in line:
        parts = line.split('#', 1)
        code_part = parts[0]
        comment_part = '<span class="text-slate-400 italic">#' + html.escape(parts[1]) + '</span>'

    # Escapar código base
    escaped = html.escape(code_part)

    # Resaltar cadenas de texto "..." o '...'
    escaped = re.sub(r'(&quot;.*?&quot;|&#x27;.*?&#x27;|&quot;.*|&#x27;.*|"[^"]*"|\'[^\']*\')',
                     r'<span class="text-emerald-300">\1</span>', escaped)

    # Resaltar palabras clave de R
    keywords = [r'\blibrary\b', r'\bfunction\b', r'\bif\b', r'\belse\b', r'\breturn\b',
                r'\bfor\b', r'\bin\b', r'\bwhile\b', r'\bTRUE\b', r'\bFALSE\b', r'\bNA\b',
                r'\bsuppressPackageStartupMessages\b']
    for kw in keywords:
        escaped = re.sub(kw, r'<span class="text-purple-400 font-semibold">\g<0></span>', escaped)

    # Resaltar operadores y pipes
    escaped = re.sub(r'(&lt;-|-&gt;|&gt;&gt;|%&gt;%|:=|==|!=|&lt;=|&gt;=)',
                     r'<span class="text-pink-400 font-bold">\g<0></span>', escaped)

    # Resaltar funciones comunes
    funcs = [r'\bggplot\b', r'\bgeom_\w+\b', r'\bscale_\w+\b', r'\btheme_\w+\b', r'\blabs\b',
             r'\bggsave\b', r'\bfilter\b', r'\bmutate\b', r'\bpivot_\w+\b', r'\bcalc_\w+\b',
             r'\bread\.csv\b', r'\bwrite\.csv\b', r'\bset\.seed\b', r'\brnorm\b', r'\bpmax\b',
             r'\bas\.Date\b', r'\bas\.numeric\b', r'\bfile\.path\b', r'\bdir\.create\b',
             r'\bcat\b', r'\bprint\b', r'\bsum\b', r'\bmean\b', r'\bsd\b', r'\bsqrt\b',
             r'\bcor\b', r'\bhead\b', r'\btail\b', r'\bdata\.frame\b', r'\bc\b']
    for fn in funcs:
        escaped = re.sub(fn, r'<span class="text-sky-300">\g<0></span>', escaped)

    # Resaltar números
    escaped = re.sub(r'\b(\d+\.?\d*)\b', r'<span class="text-amber-300">\1</span>', escaped)

    return escaped + comment_part

def generate_r_viewer():
    r_path = '/Users/danielsantander/Documents/agritwin-app/scripts/r_benchmark_cases.R'
    with open(r_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    highlighted_lines = []
    for i, l in enumerate(lines):
        line_num = f'<span class="text-slate-600 select-none inline-block w-8 text-right mr-3 text-[10px]">{i+1}</span>'
        h_line = highlight_r_line(l.rstrip('\n'))
        highlighted_lines.append(f'{line_num}{h_line}')

    code_html = '\n'.join(highlighted_lines)

    viewer_component = f'''
                <!-- ============================================================== -->
                <!-- LABORATORIO DE CÓDIGO REPRODUCIBLE EN R (RSTUDIO SYNTAX VIEWER)-->
                <!-- ============================================================== -->
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

    # Función JS para copiar al portapapeles
    js_copy_fn = r'''
<script>
function copyRScriptCode() {
    fetch('scripts/r_benchmark_cases.R')
        .then(response => response.text())
        .then(text => {
            navigator.clipboard.writeText(text).then(() => {
                const btnText = document.getElementById('copyRScriptText');
                if (btnText) {
                    const original = btnText.innerText;
                    btnText.innerText = '¡Copiado al Portapapeles!';
                    btnText.classList.add('text-emerald-400');
                    setTimeout(() => {
                        btnText.innerText = original;
                        btnText.classList.remove('text-emerald-400');
                    }, 2500);
                }
            });
        })
        .catch(err => {
            console.error('Error al leer script R:', err);
        });
}
</script>
'''

    index_path = '/Users/danielsantander/Documents/agritwin-app/index.html'
    with open(index_path, 'r', encoding='utf-8') as f:
        html_content = f.read()

    # Inyectar el visor justo después de la Galería de 7 Figuras en docs-uq
    target_pos = html_content.find('<!-- Subsección 1: Protocolo de Calibración Bi-Etápica -->')
    if target_pos != -1 and 'Laboratorio de Validación Empírica &amp; Sensibilidad en R' not in html_content:
        html_content = html_content[:target_pos] + viewer_component + '\n\n                ' + html_content[target_pos:]
        print("Visor interactivo de código R inyectado en docs-uq.")
    else:
        print("Aviso: target_pos no encontrado o ya inyectado.")

    # Inyectar la función JS antes de </body> si no está
    if 'function copyRScriptCode()' not in html_content:
        html_content = html_content.replace('</body>', js_copy_fn + '\n</body>')
        print("Función JS copyRScriptCode inyectada.")

    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(html_content)

    print("index.html actualizado exitosamente con el laboratorio interactivo en R.")

if __name__ == '__main__':
    generate_r_viewer()
