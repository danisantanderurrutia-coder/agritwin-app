#!/usr/bin/env python3
"""
fix_text_alignment.py
Fixes text alignment inconsistency across the paper:
1. Removes all inline 'text-align: justify' hardcoded into Sections 2.2.1 and 2.2.2.
2. Implements a unified, consistent alignment rule in CSS:
   - Sets uniform alignment across all paragraphs, lists, and subtitles.
   - Adds [data-align="left"] (default for modern Hombros style) and [data-align="justify"] (for full editorial justification).
3. Adds an interactive Alignment Toggle button in the Floating Toolbar:
   - Allows the user to toggle between "Alineación Izquierda" and "Texto Justificado" with 1 click,
     persisted in localStorage.
4. Applies changes to both agritwin-app and agritwin-hub.
"""

import sys
import os
import re

TARGET_FILES = [
    "/Users/danielsantander/Documents/agritwin-app/scripts/generate_canonical_paper.py",
    "/Users/danielsantander/Documents/Agrotech/agritwin-hub/scripts/generate_canonical_paper.py"
]

def update_file(filepath):
    print(f"\n--- Harmonizing alignment in {filepath} ---")
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Strip all inline text-align: justify
    count_stripped = 0
    def clean_style(match):
        nonlocal count_stripped
        count_stripped += 1
        style_str = match.group(1)
        # remove text-align:\s*justify;?
        cleaned = re.sub(r'text-align:\s*justify;?\s*', '', style_str).strip()
        if cleaned:
            return f'style="{cleaned}"'
        else:
            return '' # remove empty style attribute

    content, n = re.subn(r'style="([^"]*text-align:\s*justify[^"]*)"', clean_style, content)
    print(f"Cleaned {n} inline text-align: justify occurrences.")

    # 2. Add alignment toggle to JS in <head>
    old_init_js = "function initThemeAndFormat() {"
    new_init_js = """function initThemeAndFormat() {
            var savedTheme = localStorage.getItem('agritwin_theme') || 'light';
            var savedFormat = localStorage.getItem('agritwin_format') || 'hombros';
            var savedAlign = localStorage.getItem('agritwin_align') || 'left';
            document.documentElement.setAttribute('data-theme', savedTheme);
            document.documentElement.setAttribute('data-format', savedFormat);
            document.documentElement.setAttribute('data-align', savedAlign);
            updateControlsUI(savedTheme, savedFormat, savedAlign);
        }

        function toggleAlign() {
            var current = document.documentElement.getAttribute('data-align') || 'left';
            var next = (current === 'left') ? 'justify' : 'left';
            document.documentElement.setAttribute('data-align', next);
            localStorage.setItem('agritwin_align', next);
            updateControlsUI(
                document.documentElement.getAttribute('data-theme'),
                document.documentElement.getAttribute('data-format'),
                next
            );
        }"""

    if old_init_js in content:
        content = content.replace(old_init_js, new_init_js, 1)
        print("Updated initThemeAndFormat JS with toggleAlign.")

    # Update updateControlsUI
    old_ctrl_ui = "function updateControlsUI(theme, format) {"
    new_ctrl_ui = """function updateControlsUI(theme, format, align) {
            align = align || document.documentElement.getAttribute('data-align') || 'left';
            var alignBtn = document.getElementById('alignToggleBtn');
            var alignIcon = document.getElementById('alignIcon');
            var alignLabel = document.getElementById('alignLabel');
            if (alignIcon && alignLabel) {
                if (align === 'justify') {
                    alignIcon.textContent = '≡';
                    alignLabel.textContent = 'Justificado';
                } else {
                    alignIcon.textContent = '≣';
                    alignLabel.textContent = 'Izquierda';
                }
            }"""

    if old_ctrl_ui in content:
        content = content.replace(old_ctrl_ui, new_ctrl_ui, 1)
        print("Updated updateControlsUI JS signature and elements.")

    # 3. Add alignment CSS rules
    alignment_css = """
        /* ═══════════════════════════════════════════════════════════════════
           REGLAS DE ALINEACIÓN DE TEXTO UNIFORMES
           ═══════════════════════════════════════════════════════════════════ */
        p, li, .cover-subtitle {
            text-align: left;
            text-wrap: pretty;
        }

        [data-align="justify"] p, [data-align="justify"] li, [data-align="justify"] .cover-subtitle {
            text-align: justify !important;
            text-justify: inter-word;
            hyphens: auto;
        }

        [data-align="left"] p, [data-align="left"] li, [data-align="left"] .cover-subtitle {
            text-align: left !important;
            text-wrap: pretty;
        }
    """

    if "/* REGLAS DE ALINEACIÓN DE TEXTO UNIFORMES */" not in content:
        content = content.replace("p {\n            margin-bottom: 1.45rem;\n            color: var(--text-main);\n        }", alignment_css + "\n        p {\n            margin-bottom: 1.45rem;\n            color: var(--text-main);\n        }")
        print("Injected global uniform alignment CSS rules.")

    # 4. Add Align button to Floating Toolbar HTML
    old_toolbar_buttons = """<!-- Selector de Tema (Claro / Oscuro) -->
            <button id="themeToggleBtn" class="toolbar-btn" onclick="toggleTheme()" title="Alternar Modo Claro / Oscuro">
                <span id="themeIcon">🌙</span>
                <span id="themeLabel">Oscuro</span>
            </button>"""

    new_toolbar_buttons = """<!-- Selector de Tema (Claro / Oscuro) -->
            <button id="themeToggleBtn" class="toolbar-btn" onclick="toggleTheme()" title="Alternar Modo Claro / Oscuro">
                <span id="themeIcon">🌙</span>
                <span id="themeLabel">Oscuro</span>
            </button>

            <!-- Selector de Alineación (Izquierda / Justificado) -->
            <button id="alignToggleBtn" class="toolbar-btn" onclick="toggleAlign()" title="Alternar Alineación Izquierda / Justificado">
                <span id="alignIcon">≣</span>
                <span id="alignLabel">Izquierda</span>
            </button>"""

    if old_toolbar_buttons in content:
        content = content.replace(old_toolbar_buttons, new_toolbar_buttons, 1)
        print("Added alignToggleBtn to Floating Toolbar.")

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Successfully harmonized alignment in {filepath}")

def main():
    for f in TARGET_FILES:
        if os.path.exists(f):
            update_file(f)
        else:
            print(f"File not found: {f}")

if __name__ == "__main__":
    main()
