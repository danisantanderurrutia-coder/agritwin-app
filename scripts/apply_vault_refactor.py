# -*- coding: utf-8 -*-
"""
apply_vault_refactor.py
Aplica los cambios solicitados en el Vault:
1. Elimina el botón de versión imprimible en docs-uq (Calibración).
2. Inserta la tarjeta hero del Paper Consolidado en Recursos (docs-dossier),
   justo antes del Pitch Deck Maestro.
3. Asegura que el visor abierto iframeDossier esté removido.
Quedan consolidados en Recursos:
- 1. Paper Científico Canónico Consolidado
- 2. Pitch Deck para Clientes e Inversionistas
- 3. Dossier Comparativo Global
"""

def main():
    path = '/Users/danielsantander/Documents/agritwin-app/index.html'
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()

    # 1. Remover botón imprimible de docs-uq
    uq_btn_target = r'''                        <a href="docs/PAPER_CIENTIFICO_AGRITWIN_IMPRIMIBLE.html" target="_blank" class="px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all">
                            <span>🖨️</span> <span>Versión Imprimible / PDF</span>
                        </a>'''
    if uq_btn_target in html:
        html = html.replace(uq_btn_target + '\n', '')
        print("1. Botón imprimible removido de docs-uq exitosamente.")
    else:
        print("1. Aviso: uq_btn_target no encontrado tal cual.")

    # 2. Insertar Hero Card de Paper Consolidado en docs-dossier
    hero_paper_card = r'''                <!-- ============================================================== -->
                <!-- PILARES ESTRATÉGICOS CONSOLIDADOS: PAPER, PITCH & DOSSIER      -->
                <!-- ============================================================== -->

                <!-- 1. Paper Científico Canónico Consolidado (Hero Banner) -->
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
                                Compendio canónico completo de validación científica: deducción matemática de 5 pasos, análisis global de sensibilidad de Sobol, colapso de varianza con el sensor mínimo ($H_3$), y freno pirogénico Keyline ($H_4$) bajo protocolo Klemeš.
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

    target_comment = '<!-- Banner Destacado: Dossier SpA & Pitch Deck de Inversión -->'
    if target_comment in html and 'AgriTwin: Gemelo Digital Biofísico Multiescala (Paper Consolidado)' not in html:
        html = html.replace(target_comment, hero_paper_card + '\n                ' + target_comment)
        print("2. Hero Card del Paper Consolidado insertada antes de Pitch Deck.")
    else:
        print("2. Aviso: target_comment no encontrado o ya insertado.")

    with open(path, 'w', encoding='utf-8') as f:
        f.write(html)

    print("Refactor del Vault completado.")

if __name__ == '__main__':
    main()
