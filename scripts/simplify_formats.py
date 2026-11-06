#!/usr/bin/env python3
"""
simplify_formats.py
1. Renames format option 'hombros' to 'Moderna' in HTML select.
2. Removes format option 'tech' ('Minimal Tech') from HTML select.
3. Removes [data-format="tech"] block from CSS.
4. Updates JS to validate format strictly to ('hombros' | 'nature').
5. Applies changes to both agritwin-app and agritwin-hub.
"""

import sys
import os
import re

TARGET_FILES = [
    "/Users/danielsantander/Documents/agritwin-app/scripts/generate_canonical_paper.py",
    "/Users/danielsantander/Documents/Agrotech/agritwin-hub/scripts/generate_canonical_paper.py"
]

def update_file(filepath):
    print(f"\n--- Simplifying formats in {filepath} ---")
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Update HTML select options
    old_select_pattern = r'<select id="formatSelect" class="toolbar-select" onchange="changeFormat\(this\.value\)">\s*<option value="hombros"[^>]*>.*?</option>\s*<option value="nature"[^>]*>.*?</option>\s*<option value="tech"[^>]*>.*?</option>\s*</select>'
    new_select = """<select id="formatSelect" class="toolbar-select" onchange="changeFormat(this.value)">
                    <option value="hombros" selected>Moderna</option>
                    <option value="nature">Nature Editorial</option>
                </select>"""

    m_sel = re.search(old_select_pattern, content, re.DOTALL)
    if m_sel:
        content = content[:m_sel.start()] + new_select + content[m_sel.end():]
        print("Updated HTML select: only 'Moderna' and 'Nature Editorial'.")
    else:
        # fallback manual replace
        content = re.sub(
            r'<option value="hombros"[^>]*>.*?</option>',
            '<option value="hombros" selected>Moderna</option>',
            content
        )
        content = re.sub(
            r'<option value="nature"[^>]*>.*?</option>',
            '<option value="nature">Nature Editorial</option>',
            content
        )
        content = re.sub(
            r'\s*<option value="tech"[^>]*>.*?</option>',
            '',
            content
        )
        print("Updated HTML select via fallback.")

    # 2. Remove [data-format="tech"] from CSS
    tech_css_pattern = r'/\*\s*FORMATO 3:\s*MINIMAL TECH.*?\*/\s*\[data-format="tech"\]\s*\{[^}]*\}'
    content = re.sub(tech_css_pattern, '', content, flags=re.DOTALL)
    print("Removed [data-format='tech'] CSS block.")

    # 3. Update JS validation
    old_js_get_format = "var savedFormat = localStorage.getItem('agritwin_format') || 'hombros';"
    new_js_get_format = """var savedFormat = localStorage.getItem('agritwin_format') || 'hombros';
            if (savedFormat !== 'hombros' && savedFormat !== 'nature') {
                savedFormat = 'hombros';
            }"""
    if old_js_get_format in content and new_js_get_format not in content:
        content = content.replace(old_js_get_format, new_js_get_format, 1)
        print("Updated JS to validate format to ('hombros' | 'nature').")

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Successfully simplified formats in {filepath}")

def main():
    for f in TARGET_FILES:
        if os.path.exists(f):
            update_file(f)
        else:
            print(f"File not found: {f}")

if __name__ == "__main__":
    main()
