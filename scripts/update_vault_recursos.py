# -*- coding: utf-8 -*-
"""
update_vault_recursos.py
Actualiza index.html según los requerimientos:
1. Agrega botón a la versión imprimible en el header general del Vault (#view-docs).
2. Remueve el botón de la versión imprimible de la cabecera local de Calibración (docs-uq).
3. Inserta una tarjeta hero/banner del Paper Científico Consolidado en Recursos (docs-dossier).
4. Remueve el visor abierto (iframeDossier de 860px) en Recursos, manteniendo solo la tarjeta superior del Dossier Comparativo.
Quedan consolidados: 1) Paper Científico, 2) Pitch Deck para Clientes, 3) Dossier Comparativo.
"""

def update_vault():
    index_path = '/Users/danielsantander/Documents/agritwin-app/index.html'
    with open(index_path, 'r', encoding='utf-8') as f:
        html = f.read()

    # --------------------------------------------------------------------------
    # 1. Header General de todo el Vault (#view-docs): Añadir botón Paper Imprimible
    # --------------------------------------------------------------------------
    old_vault_header = r'''            <!-- Encabezado Vault Elevado -->
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E7DAC6] pb-5">
                <div>
                    <h2 class="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight flex items-center gap-2.5 font-serif">
                        <span>📚</span> Knowledge, Model & Asset Vault
                    </h2>
                    <p class="text-xs sm:text-sm text-stone-600 mt-1 max-w-3xl leading-relaxed">
                        Centro formal de documentación técnica: Arquitectura Multiescala con Diagramas Mermaid interactivos, Motores Algorítmicos Biofísicos ejecutables, Datasets Geoespaciales Vectoriales y Mosaico Catastral Comunitario.
                    </p>
                </div>
            </div>'''

    new_vault_header = r'''            <!-- Encabezado Vault Elevado -->
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E7DAC6] pb-5">
                <div>
                    <h2 class="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight flex items-center gap-2.5 font-serif">
                        <span>📚</span> Knowledge, Model & Asset Vault
                    </h2>
                    <p class="text-xs sm:text-sm text-stone-600 mt-1 max-w-3xl leading-relaxed">
                        Centro formal de documentación técnica: Arquitectura Multiescala con Diagramas Mermaid interactivos, Motores Algorítmicos Biofísicos ejecutables, Datasets Geoespaciales Vectoriales y Mosaico Catastral Comunitario.
                    </p>
                </div>
                <div class="flex items-center gap-2 font-mono text-xs shrink-0 flex-wrap">
                    <a href="docs/PAPER_CIENTIFICO_AGRITWIN_IMPRIMIBLE.html" target="_blank" class="px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer" title="Abrir Monografía Científica Canónica Imprimible (KaTeX • IMRAD • 7 Figuras 300 DPI)">
                        <span>📄</span> <span>Monografía Imprimible (Paper)</span>
                        <span class="text-blue-200">↗</span>
                    </a>
                </div>
            </div>'''

    if old_vault_header in html:
        html = html.replace(old_vault_header, new_vault_header)
        print("1. Botón Paper Imprimible agregado al header de todo el Vault.")
    else:
        print("1. Aviso: Header del Vault no coincidió exactamente.")

    # --------------------------------------------------------------------------
    # 2. Header Local de Calibración (docs-uq): Remover botón de versión imprimible
    # --------------------------------------------------------------------------
    old_uq_buttons = r'''                    <div class="flex items-center gap-2 font-mono text-xs shrink-0 w-full md:w-auto flex-wrap">
                        <a href="docs/PAPER_CIENTIFICO_AGRITWIN_IMPRIMIBLE.html" target="_blank" class="px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all">
                            <span>🖨️</span> <span>Versión Imprimible / PDF</span>
                        </a>
                        <a href="docs/PAPER_CIENTIFICO_AGRITWIN_MARCO_TEORICO_UQ.md" target="_blank" class="px-3.5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all">
                            <span>📄</span> <span>Marco Teórico (.md)</span>
                        </a>
                        <a href="scripts/r_benchmark_cases.R" target="_blank" class="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all" title="Descargar Script en R Reproducible">
                            <span>📊</span> <span>Script R Benchmark</span>
                        </a>
                    </div>'''

    new_uq_buttons = r'''                    <div class="flex items-center gap-2 font-mono text-xs shrink-0 w-full md:w-auto flex-wrap">
                        <a href="docs/PAPER_CIENTIFICO_AGRITWIN_MARCO_TEORICO_UQ.md" target="_blank" class="px-3.5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all">
                            <span>📄</span> <span>Marco Teórico (.md)</span>
                        </a>
                        <a href="scripts/r_benchmark_cases.R" target="_blank" class="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all" title="Descargar Script en R Reproducible">
                            <span>📊</span> <span>Script R Benchmark</span>
                        </a>
                    </div>'''

    if old_uq_buttons in html:
        html = html.replace(old_uq_buttons, new_uq_buttons)
        print("2. Botón imprimible removido de cabecera de docs-uq.")
    else:
        print("2. Aviso: Botones de docs-uq no coincidieron exactamente.")

    # --------------------------------------------------------------------------
    # 3. Remover el iframe abierto del Dossier (iframeDossier de 860px) en Recursos
    # --------------------------------------------------------------------------
    old_iframe_block = r'''                <!-- Visor Interactivo Embebido Directo en el Hub -->
                <div class="rounded-2xl border border-[#E7DAC6] overflow-hidden shadow-sm bg-white" style="height: 860px;">
                    <iframe id="iframeDossier" src="dossier.html?v=3.5" class="w-full h-full border-0" allow="clipboard-write"></iframe>
                </div>'''

    if old_iframe_block in html:
        html = html.replace(old_iframe_block, '')
        print("3. Visor abierto del Dossier (iframe 860px) removido con éxito.")
    else:
        print("3. Aviso: Bloque de iframeDossier no coincidió.")

    # --------------------------------------------------------------------------
    # 4. Insertar Tarjeta Hero del Paper Científico Consolidado en Recursos
    # --------------------------------------------------------------------------
    hero_paper_card = r'''                <!-- 1. Paper Científico Canónico Consolidado (Hero Banner) -->
                <div class="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white border border-blue-500/30 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-5 font-sans">
                    <div class="flex items-start sm:items-center gap-4">
                        <div class="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/40 text-blue-300 flex items-center justify-center text-2xl shadow-inner shrink-0">
                            📄
                        </div>
                        <div class="space-y-1">
                            <div class="flex items-center gap-2 flex-wrap">
                                <span class="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-200 border border-blue-400/30">MONOGRAFÍA CIENTÍFICA IMRAD</span>
                                <span class="text-xs text-blue-300/60">•</span>
                                <span class="text-xs font-mono text-emerald-300 font-bold">Validado Ground-Truth DGA (2.647 días)</span>
                                <span class="text-xs text-blue-300/60">•</span>
                                <span class="text-xs font-mono text-purple-200">14 Ecuaciones KaTeX</span>
                                <span class="text-xs text-blue-300/60">•</span>
                                <span class="text-xs font-mono text-amber-300">7 Figuras 300 DPI</span>
                            </div>
                            <h3 class="text-base sm:text-lg font-bold text-white font-serif">
                                AgriTwin: Gemelo Digital Biofísico Multiescala (Paper Consolidado)
                            </h3>
                            <p class="text-xs text-slate-300 max-w-3xl leading-relaxed">
                                Compendio canónico completo de validación científica: deducción matemática de 5 pasos, análisis de sensibilidad de Sobol, colapso de varianza con el sensor mínimo ($H_3$), y freno pirogénico Keyline ($H_4$) bajo protocolo Klemeš.
                            </p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 font-mono text-xs shrink-0 w-full md:w-auto flex-wrap sm:flex-nowrap">
                        <a href="docs/PAPER_CIENTIFICO_AGRITWIN_IMPRIMIBLE.html" target="_blank" class="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer">
                            <span>🖨️</span> <span>Abrir Paper Imprimible</span>
                            <span>→</span>
                        </a>
                        <a href="docs/PAPER_CIENTIFICO_AGRITWIN_MARCO_TEORICO_UQ.md" target="_blank" class="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all">
                            <span>📄</span> <span>Ver Markdown</span>
                        </a>
                    </div>
                </div>
'''

    # Insertar justo antes del Pitch Deck Maestro en docs-dossier
    target_pitch = '<!-- Pitch Deck Maestro: Presentación Ejecutiva -->'
    if target_pitch in html and 'AgriTwin: Gemelo Digital Biofísico Multiescala (Paper Consolidado)' not in html:
        html = html.replace(target_pitch, hero_paper_card + '\n                ' + target_pitch)
        print("4. Tarjeta Hero del Paper Científico insertada en Recursos.")
    else:
        # Intento con el bloque que contiene 'Pitch Deck Maestro • Visión'
        target_pitch_h3 = 'Pitch Deck Maestro &bull; Visión, Unit Economics &amp; El Ask'
        if target_pitch_h3 in html and 'AgriTwin: Gemelo Digital Biofísico Multiescala (Paper Consolidado)' not in html:
            # Buscar el div contenedor
            pos_h3 = html.find(target_pitch_h3)
            pos_div = html.rfind('<div class="p-4 sm:p-5 rounded-2xl bg-white', 0, pos_h3)
            if pos_div != -1:
                html = html[:pos_div] + hero_paper_card + '\n                ' + html[pos_div:]
                print("4. Tarjeta Hero del Paper Científico insertada antes de Pitch Deck.")

    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(html)

    print("Actualización completada exitosamente.")

if __name__ == '__main__':
    update_vault()
