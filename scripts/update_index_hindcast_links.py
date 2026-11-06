# -*- coding: utf-8 -*-
with open('/Users/danielsantander/Documents/agritwin-app/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Vault Header (around line 7400)
target1 = '''                <div class="flex items-center gap-2 font-mono text-xs shrink-0 flex-wrap">
                    <a href="docs/PAPER_CIENTIFICO_AGRITWIN_IMPRIMIBLE.html" target="_blank" class="px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer" title="Abrir Monografía Científica Canónica Imprimible (KaTeX • IMRAD • 7 Figuras 300 DPI)">
                        <span>📄</span> <span>Monografía Imprimible (Paper)</span>
                        <span class="text-blue-200">↗</span>
                    </a>
                </div>'''

replacement1 = '''                <div class="flex items-center gap-2 font-mono text-xs shrink-0 flex-wrap">
                    <a href="docs/INFORME_HINDCAST_REAL_IMPRIMIBLE.html" target="_blank" class="px-3.5 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer" title="Abrir Informe Técnico Hindcast Imprimible (Santa Juana & Viña del Mar)">
                        <span>🔥</span> <span>Informe Hindcast (HTML)</span>
                        <span class="text-rose-200">↗</span>
                    </a>
                    <a href="docs/PAPER_CIENTIFICO_AGRITWIN_IMPRIMIBLE.html" target="_blank" class="px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer" title="Abrir Monografía Científica Canónica Imprimible (KaTeX • IMRAD • 7 Figuras 300 DPI)">
                        <span>📄</span> <span>Monografía Imprimible (Paper)</span>
                        <span class="text-blue-200">↗</span>
                    </a>
                </div>'''

# 2. Add Hindcast Strategic Card in docs-dossier (after Paper Card)
target2 = '''                        <a href="docs/PAPER_CIENTIFICO_AGRITWIN_MARCO_TEORICO_UQ.md" target="_blank" class="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all">
                            <span>📄</span> <span>Ver Markdown</span>
                        </a>
                    </div>
                </div>

                <!-- Banner Destacado: Dossier SpA & Pitch Deck de Inversión -->'''

replacement2 = '''                        <a href="docs/PAPER_CIENTIFICO_AGRITWIN_MARCO_TEORICO_UQ.md" target="_blank" class="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all">
                            <span>📄</span> <span>Ver Markdown</span>
                        </a>
                    </div>
                </div>

                <!-- Banner Destacado: Auditoría Retrospectiva de Incendios (Hindcast) -->
                <div class="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-stone-900 via-rose-950 to-stone-900 border border-rose-500/40 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-white">
                    <div class="flex items-start sm:items-center gap-3.5">
                        <div class="w-12 h-12 rounded-2xl bg-rose-600/30 border border-rose-400/40 flex items-center justify-center text-2xl shadow-inner shrink-0">
                            🔥
                        </div>
                        <div class="space-y-1">
                            <div class="flex items-center gap-2 flex-wrap">
                                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">AUDITORÍA RETROSPECTIVA HINDCAST</span>
                                <span class="text-xs text-rose-300/60">•</span>
                                <span class="text-xs font-mono text-emerald-300 font-bold">Sentinel-2 dNBR (20m) &bull; ERA5 Horario</span>
                                <span class="text-xs text-rose-300/60">•</span>
                                <span class="text-xs font-mono text-amber-300">Santa Juana 2023 &bull; Viña del Mar 2024</span>
                            </div>
                            <h3 class="text-base sm:text-lg font-bold text-white font-serif">
                                Auditoría Retrospectiva de Incendios: Santa Juana 2023 &amp; Viña del Mar 2024
                            </h3>
                            <p class="text-xs text-slate-300 max-w-3xl leading-relaxed">
                                Reconstrucción observacional reproducible de cicatrices satelitales (42.599 ha y 2.989 ha), ráfagas ERA5 (58–65 km/h), corrección de métricas sintéticas y marco de calibración inter-cuencas sin sobreajuste. Disponible como banco de prueba público en modo Cuenca para todos los usuarios.
                            </p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 font-mono text-xs shrink-0 w-full md:w-auto flex-wrap sm:flex-nowrap">
                        <a href="docs/INFORME_HINDCAST_REAL_IMPRIMIBLE.html" target="_blank" class="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer" title="Abrir Informe Técnico Imprimible e Interactivo (KaTeX • Figuras • Tablas)">
                            <span>🖨️</span> <span>Abrir Informe Imprimible</span>
                            <span>→</span>
                        </a>
                        <a href="docs/INFORME_HINDCAST_REAL_SANTA_JUANA_VINA.md" target="_blank" class="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all">
                            <span>📄</span> <span>Ver Markdown</span>
                        </a>
                    </div>
                </div>

                <!-- Banner Destacado: Dossier SpA & Pitch Deck de Inversión -->'''

# 3. Update uq-content-hindcast status box (around line 10660)
target3 = '''                        <div class="flex items-center gap-2 flex-wrap text-[11px]">
                            <a href="docs/INFORME_HINDCAST_REAL_SANTA_JUANA_VINA.md" target="_blank" class="px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-mono font-bold">📄 Informe completo (.md)</a>
                            <span class="text-stone-600">Polígonos = cicatriz dNBR, no perímetro oficial CONAF · Sitios solo modo Cuenca, sin gemelo predial.</span>
                        </div>'''

replacement3 = '''                        <div class="flex items-center gap-2 flex-wrap text-[11px]">
                            <a href="docs/INFORME_HINDCAST_REAL_IMPRIMIBLE.html" target="_blank" class="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-mono font-bold flex items-center gap-1.5 shadow-sm">
                                <span>🖨️</span> <span>Abrir Informe Imprimible (HTML)</span>
                                <span class="text-rose-200">↗</span>
                            </a>
                            <a href="docs/INFORME_HINDCAST_REAL_SANTA_JUANA_VINA.md" target="_blank" class="px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-mono font-bold">📄 Informe completo (.md)</a>
                            <span class="text-stone-600">Polígonos = cicatriz dNBR, no perímetro oficial CONAF · Sitios solo modo Cuenca, sin gemelo predial.</span>
                        </div>'''

assert target1 in content, "target1 not found"
assert target2 in content, "target2 not found"
assert target3 in content, "target3 not found"

content = content.replace(target1, replacement1, 1)
content = content.replace(target2, replacement2, 1)
content = content.replace(target3, replacement3, 1)

with open('/Users/danielsantander/Documents/agritwin-app/index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("index.html actualizado exitosamente!")
