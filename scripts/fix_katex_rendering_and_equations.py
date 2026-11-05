#!/usr/bin/env python3
"""
fix_katex_rendering_and_equations.py
1. Reemplaza todos los '\\$5.000' y '\\$12.000' con 'USD 5.000' y 'USD 12.000' en HTML y Markdown.
2. Robustece el cargador de KaTeX con DOMContentLoaded, retry handler y throwOnError: false.
3. Asegura que todas las fórmulas display y en línea tengan renderizado perfecto.
"""

import sys

GEN_PATH = "/Users/danielsantander/Documents/agritwin-app/scripts/generate_canonical_paper.py"

with open(GEN_PATH, "r", encoding="utf-8") as f:
    text = f.read()

# 1. Reemplazar \$5.000 y \$12.000 por USD 5.000 y USD 12.000
text = text.replace(r"\$5.000", "USD 5.000")
text = text.replace(r"\$12.000", "USD 12.000")
text = text.replace(r"\$5,000", "USD 5.000")
text = text.replace(r"\$12,000", "USD 12.000")

# 2. Reemplazar el bloque de KaTeX en el <head>
old_katex_head = """    <!-- KaTeX para Renderizado Matemático de Precisión -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js" 
            onload="renderMathInElement(document.body, {delimiters: [{left: '$$', right: '$$', display: true}, {left: '$', right: '$', display: false}]});"></script>"""

new_katex_head = """    <!-- KaTeX para Renderizado Matemático de Precisión -->
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
    </script>"""

if old_katex_head in text:
    text = text.replace(old_katex_head, new_katex_head)
    print("Replaced KaTeX head loader with robust handler.")
else:
    print("WARNING: old_katex_head not matched directly. Searching partial...")
    idx = text.find("katex@0.16.8")
    if idx != -1:
        end_idx = text.find("</script>", text.find("auto-render.min.js", idx)) + len("</script>")
        start_idx = text.rfind("<!-- KaTeX", 0, idx)
        text = text[:start_idx] + new_katex_head + text[end_idx:]
        print("Replaced KaTeX head loader via position slice.")

with open(GEN_PATH, "w", encoding="utf-8") as f:
    f.write(text)

print("generate_canonical_paper.py updated successfully!")
