# -*- coding: utf-8 -*-
"""
set_paper_authorship.py
Agrega formalmente la autoría de Daniel Santander Urrutia en:
1. Portada del Paper HTML (bloque heráldico de autoría + metadatos + citación sugerida)
2. Encabezado del Paper Markdown (autor principal, afiliación, correspondencia y cita canónica)
3. Tarjeta Hero del Paper en Recursos (index.html)
"""

import os
import re

def update_paper_authorship():
    gen_path = '/Users/danielsantander/Documents/agritwin-app/scripts/generate_canonical_paper.py'
    with open(gen_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Bloque de autoría en la portada HTML
    old_cover_sub = r'''            <div class="cover-subtitle">
                De la atomización parcelaria al continuo territorial: Integración de Agro-Hidrología semi-distribuida, Balística de Incendios, Topoclimatología Catabática, Teledetección de 10 Bandas, Geometría Keyline y Metrología ISO/IEC Guide 98-3 (GUM) en el Maule Sur, Chile
            </div>

            <div class="cover-metadata-grid">'''

    new_cover_sub = r'''            <div class="cover-subtitle">
                De la atomización parcelaria al continuo territorial: Integración de Agro-Hidrología semi-distribuida, Balística de Incendios, Topoclimatología Catabática, Teledetección de 10 Bandas, Geometría Keyline y Metrología ISO/IEC Guide 98-3 (GUM) en el Maule Sur, Chile
            </div>

            <!-- Bloque Canónico de Autoría -->
            <div class="cover-author-block" style="margin: 26px auto 28px auto; padding: 20px 28px; background: #fafaf9; border: 1.5px solid #d6d3d1; border-radius: 10px; max-width: 680px; box-shadow: 0 2px 5px rgba(0,0,0,0.04);">
                <div style="font-size: 11px; font-family: 'JetBrains Mono', monospace; text-transform: uppercase; letter-spacing: 2px; color: #b45309; font-weight: 700; margin-bottom: 5px;">
                    Autor Principal &amp; Investigador Responsable
                </div>
                <div style="font-size: 25px; font-weight: 800; color: #1c1917; font-family: 'Georgia', serif; letter-spacing: 0.3px;">
                    Daniel Santander Urrutia
                </div>
                <div style="font-size: 13px; color: #44403c; font-family: 'Georgia', serif; font-style: italic; margin-top: 4px;">
                    AgriTwin &amp; Agrotech Lab Chile • Centro de Biofísica Territorial y Modelación Ambiental
                </div>
                <div style="font-size: 11px; color: #78716c; font-family: 'JetBrains Mono', monospace; margin-top: 6px;">
                    Correspondencia: daniel@agritwin.cl • Región del Maule / Santiago, Chile
                </div>
            </div>

            <div class="cover-metadata-grid">
                <div class="cover-metadata-item">
                    <strong>Autoría &amp; Dirección Científica</strong>
                    Daniel Santander Urrutia (Investigador Líder • AgriTwin / Agrotech Lab)
                </div>'''

    if old_cover_sub in content:
        content = content.replace(old_cover_sub, new_cover_sub)
        print("1. Bloque de autoría HTML insertado en portada.")
    else:
        print("1. Aviso: old_cover_sub no coincidió exactamente.")

    # 2. Autoría en Markdown
    old_md_top = r'''def build_markdown():
    return r''' + "'''" + r'''# AgriTwin: Un Gemelo Digital Biofísico Multiescala para la Resiliencia Hídrica, la Gestión Multiamenaza y el Diseño Regenerativo de Cuenca

**Compendio Científico Canónico de Validación TRL 4 (In-Silico DGA Ground-Truth) • Ruta Operacional TRL 7 (Estructura IMRAD)**

---

* **Iniciativa de Investigación:** AgriTwin & Agrotech Lab Chile'''

    new_md_top = r'''def build_markdown():
    return r''' + "'''" + r'''# AgriTwin: Un Gemelo Digital Biofísico Multiescala para la Resiliencia Hídrica, la Gestión Multiamenaza y el Diseño Regenerativo de Cuenca

**Compendio Científico Canónico de Validación TRL 4 (In-Silico DGA Ground-Truth) • Ruta Operacional TRL 7 (Estructura IMRAD)**

---

* **Autor Principal & Investigador Responsable:** Daniel Santander Urrutia (AgriTwin & Agrotech Lab Chile)
* **Correspondencia Científica:** daniel@agritwin.cl • Región del Maule / Santiago, Chile
* **Iniciativa de Investigación:** AgriTwin & Agrotech Lab Chile
* **Cita Sugerida:** Santander Urrutia, D. (2026). *AgriTwin: Un Gemelo Digital Biofísico Multiescala para la Resiliencia Hídrica, la Gestión Multiamenaza y el Diseño Regenerativo de Cuenca*. Serie Técnica Monográfica Agrotech Lab Chile. DOI: 10.5281/zenodo.agritwin.2026.'''

    if old_md_top in content:
        content = content.replace(old_md_top, new_md_top)
        print("2. Autoría Markdown agregada exitosamente.")
    else:
        print("2. Aviso: old_md_top no coincidió exactamente.")

    with open(gen_path, 'w', encoding='utf-8') as f:
        f.write(content)

    # 3. Actualizar index.html (Hero card en Recursos)
    index_path = '/Users/danielsantander/Documents/agritwin-app/index.html'
    with open(index_path, 'r', encoding='utf-8') as f:
        html = f.read()

    old_hero_badge = r'''<span class="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-200 border border-blue-400/30">MONOGRAFÍA CIENTÍFICA IMRAD</span>'''
    new_hero_badge = r'''<span class="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-200 border border-blue-400/30">MONOGRAFÍA CIENTÍFICA IMRAD</span>
                                <span class="text-xs text-blue-300/60">•</span>
                                <span class="text-xs font-mono text-amber-300 font-bold">Autor: Daniel Santander Urrutia</span>'''

    if old_hero_badge in html and 'Autor: Daniel Santander Urrutia' not in html:
        html = html.replace(old_hero_badge, new_hero_badge)
        print("3. Badge de autoría agregado a Hero Card en index.html.")
        with open(index_path, 'w', encoding='utf-8') as f:
            f.write(html)
    else:
        print("3. Aviso: Badge de Hero Card no modificado o ya presente.")

if __name__ == '__main__':
    update_paper_authorship()
