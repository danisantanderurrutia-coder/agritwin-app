#!/usr/bin/env python3
"""
modernize_paper_aesthetic.py
Upgrades scripts/generate_canonical_paper.py in both:
- /Users/danielsantander/Documents/agritwin-app/scripts/generate_canonical_paper.py
- /Users/danielsantander/Documents/Agrotech/agritwin-hub/scripts/generate_canonical_paper.py

Changes:
1. Injects Google Fonts (Inter, Space Grotesk, Plus Jakarta Sans, JetBrains Mono, Newsreader).
2. Adds Interactive Floating Control Bar (Dark/Light Mode toggle, Layout/Format selector, Print/PDF export).
3. Redesigns the entire CSS with Solarpunk Travertino/Celadon aesthetic from project Hombros:
   - Eliminates the stuffy antique "double border" and condensed serif font.
   - Replaces with modern rounded cards (rounded-3xl, 22px), spacious line-height (1.8), pill badges.
   - Dual theme support: [data-theme="light"] (Solarpunk Travertino #F5F2EB) & [data-theme="dark"] (Cosmos Obsidian #090D16).
   - Format selector: [data-format="hombros"] (Solarpunk Moderno), [data-format="nature"] (Nature Editorial), [data-format="tech"] (Minimal Tech Dossier).
4. Solves PDF print condensation in @media print:
   - Generous margins (22mm 20mm), comfortable readable font size (11pt / 15px), line-height (1.7),
     page-break-inside avoid on formula cards and figures.
"""

import sys
import os
import re

TARGET_FILES = [
    "/Users/danielsantander/Documents/agritwin-app/scripts/generate_canonical_paper.py",
    "/Users/danielsantander/Documents/Agrotech/agritwin-hub/scripts/generate_canonical_paper.py"
]

NEW_FONTS_AND_HEAD = r"""    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Space+Grotesk:wght@500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&display=swap" rel="stylesheet">
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js"></script>
    <script>
        // Tema y Formato interactivo (Persistente en localStorage)
        function initThemeAndFormat() {
            var savedTheme = localStorage.getItem('agritwin_theme') || 'light';
            var savedFormat = localStorage.getItem('agritwin_format') || 'hombros';
            document.documentElement.setAttribute('data-theme', savedTheme);
            document.documentElement.setAttribute('data-format', savedFormat);
            updateControlsUI(savedTheme, savedFormat);
        }

        function toggleTheme() {
            var current = document.documentElement.getAttribute('data-theme') || 'light';
            var next = (current === 'light') ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('agritwin_theme', next);
            updateControlsUI(next, document.documentElement.getAttribute('data-format'));
        }

        function changeFormat(formatKey) {
            document.documentElement.setAttribute('data-format', formatKey);
            localStorage.setItem('agritwin_format', formatKey);
            updateControlsUI(document.documentElement.getAttribute('data-theme'), formatKey);
        }

        function updateControlsUI(theme, format) {
            var btn = document.getElementById('themeToggleBtn');
            var icon = document.getElementById('themeIcon');
            var label = document.getElementById('themeLabel');
            var select = document.getElementById('formatSelect');
            if (icon && label) {
                if (theme === 'dark') {
                    icon.textContent = '☀️';
                    label.textContent = 'Claro';
                } else {
                    icon.textContent = '🌙';
                    label.textContent = 'Oscuro';
                }
            }
            if (select && format) {
                select.value = format;
            }
        }

        document.addEventListener("DOMContentLoaded", function() {
            initThemeAndFormat();
            var retries = 0;
            function initKaTeX() {
                if (typeof renderMathInElement === "function") {
                    renderMathInElement(document.body, {
                        delimiters: [
                            {left: "$$", right: "$$", display: true},
                            {left: "$", right: "$", display: false}
                        ],
                        throwOnError: false,
                        errorColor: "#ef4444"
                    });
                } else if (retries < 50) {
                    retries++;
                    setTimeout(initKaTeX, 60);
                }
            }
            initKaTeX();
        });
    </script>"""

NEW_CSS = r"""    <style>
        /* ═══════════════════════════════════════════════════════════════════
           SISTEMA DE TOKENS DE DISEÑO: HOMBROS SOLARPUNK & COSMOS OBSIDIAN
           ═══════════════════════════════════════════════════════════════════ */
        :root, [data-theme="light"] {
            /* Paleta Travertino, Celadón & Arcilla (Proyecto Hombros) */
            --canvas-bg: #F5F2EB;
            --canvas-gradient: radial-gradient(ellipse 90% 60% at 50% -10%, rgba(125, 178, 178, 0.22) 0%, transparent 60%),
                               radial-gradient(circle 900px at 10% 25%, rgba(200, 109, 81, 0.12) 0%, transparent 55%),
                               radial-gradient(circle 900px at 90% 70%, rgba(72, 112, 117, 0.18) 0%, transparent 60%);
            --card-bg: #FFFFFF;
            --card-secondary: #F0ECE1;
            --text-main: #1E293B;       /* Slate Ink */
            --text-muted: #475569;      /* Slate Muted */
            --text-subtle: #64748B;
            --border-color: #DDD5C5;
            --border-subtle: #EBE5D8;
            --border-focus: #7DB2B2;

            /* Acentos Solarpunk */
            --accent-teal: #376E6F;
            --accent-celadon: #7DB2B2;
            --accent-clay: #C86D51;
            --accent-brass: #D4A373;
            --accent-forest: #16A34A;
            --accent-indigo: #28475A;

            /* Elementos Especiales */
            --formula-bg: #F8FAF9;
            --formula-border: #7DB2B2;
            --formula-header-bg: #EAE6DC;
            --code-bg: #EDE8DC;
            --code-color: #1E293B;
            --table-header-bg: #EDE8DC;
            --table-row-alt: #FAF8F3;
            --callout-bg: #F0FDF4;
            --callout-border: #16A34A;
            --card-shadow: 0 16px 40px -6px rgba(40, 71, 90, 0.08), 0 4px 14px -2px rgba(40, 71, 90, 0.04);
            --header-badge-bg: #E2F4F2;
            --header-badge-text: #376E6F;
            --header-badge-border: #7DB2B2;
        }

        [data-theme="dark"] {
            /* Paleta Cosmos Obsidian & Neón Bio-Digital */
            --canvas-bg: #090D16;
            --canvas-gradient: radial-gradient(ellipse 90% 60% at 50% -10%, rgba(45, 212, 191, 0.12) 0%, transparent 60%),
                               radial-gradient(circle 900px at 10% 25%, rgba(248, 113, 113, 0.08) 0%, transparent 55%),
                               radial-gradient(circle 900px at 90% 70%, rgba(56, 189, 248, 0.10) 0%, transparent 60%);
            --card-bg: #0F172A;
            --card-secondary: #1E293B;
            --text-main: #F8FAFC;
            --text-muted: #94A3B8;
            --text-subtle: #64748B;
            --border-color: #334155;
            --border-subtle: #1E293B;
            --border-focus: #2DD4BF;

            /* Acentos Neón Bio */
            --accent-teal: #2DD4BF;
            --accent-celadon: #5EEAD4;
            --accent-clay: #F87171;
            --accent-brass: #FBBF24;
            --accent-forest: #34D399;
            --accent-indigo: #38BDF8;

            /* Elementos Especiales */
            --formula-bg: #141E33;
            --formula-border: #2DD4BF;
            --formula-header-bg: #1E293B;
            --code-bg: #1E293B;
            --code-color: #E2E8F0;
            --table-header-bg: #1E293B;
            --table-row-alt: #131D2E;
            --callout-bg: #064E3B;
            --callout-border: #34D399;
            --card-shadow: 0 20px 45px -10px rgba(0, 0, 0, 0.65), 0 0 25px rgba(45, 212, 191, 0.05);
            --header-badge-bg: #134E4A;
            --header-badge-text: #5EEAD4;
            --header-badge-border: #2DD4BF;
        }

        /* ═══════════════════════════════════════════════════════════════════
           PRESETS DE FORMATO TIPOGRÁFICO Y DENSIDAD
           ═══════════════════════════════════════════════════════════════════ */
        /* FORMATO 1: HOMBROS SOLARPUNK MODERNO (RECOMENDADO) */
        :root, [data-format="hombros"] {
            --font-body: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            --font-heading: "Plus Jakarta Sans", "Space Grotesk", sans-serif;
            --font-mono: "JetBrains Mono", monospace;
            --body-font-size: 16px;
            --body-line-height: 1.82;
            --card-radius: 24px;
            --card-inner-radius: 16px;
            --max-text-width: 900px;
        }

        /* FORMATO 2: NATURE / FRONTIERS EDITORIAL */
        [data-format="nature"] {
            --font-body: "Newsreader", "Charter", Georgia, serif;
            --font-heading: "Space Grotesk", "Inter", sans-serif;
            --font-mono: "JetBrains Mono", monospace;
            --body-font-size: 16.5px;
            --body-line-height: 1.88;
            --card-radius: 12px;
            --card-inner-radius: 8px;
            --max-text-width: 880px;
        }

        /* FORMATO 3: MINIMAL TECH DOSSIER (OPENAI/DEEPMIND STYLE) */
        [data-format="tech"] {
            --font-body: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
            --font-heading: "Inter", sans-serif;
            --font-mono: "JetBrains Mono", monospace;
            --body-font-size: 15.5px;
            --body-line-height: 1.76;
            --card-radius: 16px;
            --card-inner-radius: 10px;
            --max-text-width: 920px;
        }

        /* ═══════════════════════════════════════════════════════════════════
           ESTILOS GENERALES
           ═══════════════════════════════════════════════════════════════════ */
        * { box-sizing: border-box; margin: 0; padding: 0; }

        html {
            scroll-behavior: smooth;
        }

        body {
            font-family: var(--font-body);
            font-size: var(--body-font-size);
            line-height: var(--body-line-height);
            color: var(--text-main);
            background-color: var(--canvas-bg);
            background-image: var(--canvas-gradient);
            background-attachment: fixed;
            padding: 85px 20px 40px 20px;
            transition: background-color 0.3s ease, color 0.3s ease;
            -webkit-font-smoothing: antialiased;
        }

        /* ═══════════════════════════════════════════════════════════════════
           BARRA DE CONTROL FLOTANTE MODERNA (TOOLBAR)
           ═══════════════════════════════════════════════════════════════════ */
        .floating-toolbar {
            position: fixed;
            top: 16px;
            left: 50%;
            transform: translateX(-50%);
            width: calc(100% - 32px);
            max-width: 960px;
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 9999px;
            padding: 8px 18px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: 0 10px 30px -4px rgba(0, 0, 0, 0.15);
            backdrop-filter: blur(12px);
            z-index: 9999;
            transition: all 0.3s ease;
        }

        .toolbar-brand {
            display: flex;
            align-items: center;
            gap: 8px;
            font-family: var(--font-heading);
            font-weight: 700;
            font-size: 13.5px;
            letter-spacing: -0.01em;
            color: var(--text-main);
        }

        .toolbar-dot {
            width: 8px;
            height: 8px;
            border-radius: 9999px;
            background: var(--accent-forest);
            box-shadow: 0 0 10px var(--accent-forest);
        }

        .toolbar-pill {
            padding: 2px 8px;
            border-radius: 9999px;
            font-size: 10px;
            font-family: var(--font-mono);
            font-weight: 700;
            background: var(--header-badge-bg);
            color: var(--header-badge-text);
            border: 1px solid var(--header-badge-border);
        }

        .toolbar-actions {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .toolbar-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 14px;
            border-radius: 9999px;
            font-family: var(--font-heading);
            font-size: 12px;
            font-weight: 600;
            border: 1px solid var(--border-color);
            background: var(--card-secondary);
            color: var(--text-main);
            cursor: pointer;
            transition: all 0.2s ease;
            text-decoration: none;
        }

        .toolbar-btn:hover {
            border-color: var(--border-focus);
            transform: translateY(-1px);
        }

        .toolbar-btn.btn-primary {
            background: var(--accent-teal);
            color: #ffffff;
            border-color: transparent;
            box-shadow: 0 4px 12px rgba(55, 110, 111, 0.25);
        }

        .toolbar-btn.btn-primary:hover {
            filter: brightness(1.1);
        }

        .format-select-group {
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .toolbar-label {
            font-size: 11.5px;
            font-weight: 600;
            color: var(--text-muted);
            display: none;
        }

        @media (min-width: 768px) {
            .toolbar-label { display: inline-block; }
        }

        .toolbar-select {
            padding: 5px 12px;
            border-radius: 9999px;
            font-family: var(--font-heading);
            font-size: 12px;
            font-weight: 600;
            border: 1px solid var(--border-color);
            background: var(--card-secondary);
            color: var(--text-main);
            outline: none;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .toolbar-select:focus {
            border-color: var(--border-focus);
        }

        /* ═══════════════════════════════════════════════════════════════════
           CONTENEDOR DEL PAPER (CANVAS CENTRAL ESPACIOSO)
           ═══════════════════════════════════════════════════════════════════ */
        .paper-container {
            max-width: var(--max-text-width);
            margin: 0 auto;
            background: var(--card-bg);
            padding: 60px 75px;
            border-radius: var(--card-radius);
            box-shadow: var(--card-shadow);
            border: 1px solid var(--border-color);
            transition: all 0.3s ease;
        }

        @media (max-width: 768px) {
            body { padding: 80px 12px 24px 12px; }
            .paper-container { padding: 35px 22px; }
        }

        /* ═══════════════════════════════════════════════════════════════════
           PORTADA MODERNA ESTILO HOMBROS (MODERN EDITORIAL CARD)
           ═══════════════════════════════════════════════════════════════════ */
        .cover-page {
            border-radius: var(--card-radius);
            padding: 50px 48px;
            margin-bottom: 50px;
            background: var(--card-secondary);
            border: 1px solid var(--border-color);
            box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.05);
            display: flex;
            flex-direction: column;
            gap: 22px;
            position: relative;
            overflow: hidden;
        }

        .cover-page::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 5px;
            background: linear-gradient(90deg, var(--accent-teal), var(--accent-celadon), var(--accent-clay), var(--accent-brass));
        }

        .cover-institution {
            font-family: var(--font-heading);
            font-size: 13px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: var(--accent-teal);
        }

        .cover-series {
            font-size: 13px;
            color: var(--text-muted);
            line-height: 1.5;
            font-weight: 500;
        }

        .cover-badge-container {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 4px;
        }

        .cover-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 12px;
            border-radius: 9999px;
            font-size: 11px;
            font-family: var(--font-mono);
            font-weight: 700;
            background: var(--header-badge-bg);
            color: var(--header-badge-text);
            border: 1px solid var(--header-badge-border);
            text-transform: uppercase;
            letter-spacing: 0.03em;
        }

        .cover-title {
            font-family: var(--font-heading);
            font-size: 28px;
            font-weight: 800;
            line-height: 1.28;
            color: var(--text-main);
            letter-spacing: -0.025em;
            margin-top: 6px;
        }

        @media (min-width: 768px) {
            .cover-title { font-size: 33px; }
        }

        .cover-subtitle {
            font-size: 15.5px;
            line-height: 1.68;
            color: var(--text-muted);
            font-weight: 400;
        }

        .cover-metadata-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 14px;
            margin-top: 14px;
            padding-top: 22px;
            border-top: 1px solid var(--border-color);
        }

        .cover-metadata-item {
            background: var(--card-bg);
            padding: 14px 18px;
            border-radius: var(--card-inner-radius);
            border: 1px solid var(--border-subtle);
            font-size: 13px;
            line-height: 1.55;
            color: var(--text-muted);
        }

        .cover-metadata-item strong {
            display: block;
            font-family: var(--font-heading);
            font-size: 11.5px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--accent-teal);
            margin-bottom: 4px;
        }

        .cover-footer {
            margin-top: 10px;
            font-size: 12px;
            color: var(--text-subtle);
            font-family: var(--font-mono);
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            gap: 10px;
            padding-top: 14px;
            border-top: 1px dashed var(--border-color);
        }

        /* ═══════════════════════════════════════════════════════════════════
           TITULARES Y SECCIONES IMRAD
           ═══════════════════════════════════════════════════════════════════ */
        h1.part-title {
            font-family: var(--font-heading);
            font-size: 24px;
            font-weight: 800;
            color: var(--text-main);
            letter-spacing: -0.02em;
            margin: 60px 0 28px 0;
            padding-bottom: 14px;
            border-bottom: 2px solid var(--border-color);
            display: flex;
            align-items: center;
            gap: 12px;
        }

        h2.section-title {
            font-family: var(--font-heading);
            font-size: 20px;
            font-weight: 700;
            color: var(--text-main);
            letter-spacing: -0.015em;
            margin: 40px 0 16px 0;
        }

        h3.section-subtitle {
            font-family: var(--font-heading);
            font-size: 17px;
            font-weight: 600;
            color: var(--accent-teal);
            margin: 28px 0 12px 0;
        }

        p {
            margin-bottom: 1.45rem;
            color: var(--text-main);
        }

        ul, ol {
            margin: 0 0 1.5rem 1.8rem;
        }

        li {
            margin-bottom: 0.65rem;
            line-height: var(--body-line-height);
        }

        /* ═══════════════════════════════════════════════════════════════════
           CÓDIGO EN LÍNEA Y BLOQUES
           ═══════════════════════════════════════════════════════════════════ */
        code {
            font-family: var(--font-mono);
            font-size: 0.82em;
            background-color: var(--code-bg);
            color: var(--code-color);
            padding: 2.5px 7px;
            border-radius: 6px;
            border: 1px solid var(--border-color);
            vertical-align: 0.5px;
            font-weight: 500;
        }

        pre code {
            font-size: 0.86em;
            background: transparent;
            padding: 0;
            border: none;
            color: inherit;
        }

        /* ═══════════════════════════════════════════════════════════════════
           BLOQUES DE ECUACIONES CIENTÍFICAS (FORMULA CARDS)
           ═══════════════════════════════════════════════════════════════════ */
        .formula-card {
            background: var(--formula-bg);
            border: 1px solid var(--border-color);
            border-left: 4px solid var(--formula-border);
            border-radius: var(--card-inner-radius);
            padding: 24px 26px;
            margin: 28px 0;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
            transition: all 0.2s ease;
        }

        .formula-card:hover {
            border-left-width: 6px;
        }

        .formula-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            padding-bottom: 10px;
            border-bottom: 1px solid var(--border-subtle);
        }

        .formula-id {
            font-family: var(--font-heading);
            font-size: 13.5px;
            font-weight: 700;
            color: var(--accent-teal);
        }

        .formula-tag {
            font-family: var(--font-mono);
            font-size: 11px;
            font-weight: 600;
            background: var(--card-secondary);
            color: var(--text-muted);
            padding: 3px 8px;
            border-radius: 6px;
            border: 1px solid var(--border-subtle);
        }

        .formula-body {
            font-size: 1.15em;
            text-align: center;
            margin: 18px 0;
            overflow-x: auto;
            color: var(--text-main);
        }

        .formula-details {
            font-size: 13.5px;
            line-height: 1.65;
            color: var(--text-muted);
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px dashed var(--border-subtle);
        }

        /* ═══════════════════════════════════════════════════════════════════
           FIGURAS CIENTÍFICAS
           ═══════════════════════════════════════════════════════════════════ */
        .figure-card {
            margin: 32px 0;
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: var(--card-inner-radius);
            overflow: hidden;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
            transition: all 0.2s ease;
        }

        .figure-card img {
            width: 100%;
            height: auto;
            display: block;
            background: #ffffff;
        }

        .figure-caption {
            padding: 16px 20px;
            font-size: 13.5px;
            line-height: 1.65;
            color: var(--text-muted);
            background: var(--card-secondary);
            border-top: 1px solid var(--border-color);
        }

        .figure-caption strong {
            color: var(--text-main);
            font-weight: 700;
        }

        /* ═══════════════════════════════════════════════════════════════════
           TABLAS EMPÍRICAS Y GLOSARIOS
           ═══════════════════════════════════════════════════════════════════ */
        table.data-table, .glossary-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin: 26px 0;
            font-size: 13.5px;
            border-radius: var(--card-inner-radius);
            overflow: hidden;
            border: 1px solid var(--border-color);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
        }

        table.data-table th, .glossary-table th {
            background-color: var(--table-header-bg);
            color: var(--text-main);
            font-family: var(--font-heading);
            font-weight: 700;
            text-align: left;
            padding: 13px 16px;
            border-bottom: 2px solid var(--border-color);
            font-size: 12.5px;
            letter-spacing: 0.02em;
        }

        table.data-table td, .glossary-table td {
            padding: 12px 16px;
            border-bottom: 1px solid var(--border-subtle);
            color: var(--text-main);
            vertical-align: top;
            line-height: 1.55;
        }

        table.data-table tr:nth-child(even), .glossary-table tr:nth-child(even) {
            background-color: var(--table-row-alt);
        }

        table.data-table tr:last-child td, .glossary-table tr:last-child td {
            border-bottom: none;
        }

        /* ═══════════════════════════════════════════════════════════════════
           REGLAS DE IMPRESIÓN Y EXPORTACIÓN A PDF (RESPIRACIÓN Y SIN CONDENSACIÓN)
           ═══════════════════════════════════════════════════════════════════ */
        @media print {
            @page {
                size: A4 portrait;
                margin: 22mm 18mm 24mm 18mm;
            }

            body {
                background: #FFFFFF !important;
                color: #0F172A !important;
                font-size: 11pt !important;
                line-height: 1.68 !important;
                padding: 0 !important;
                font-family: "Inter", -apple-system, sans-serif !important;
            }

            .floating-toolbar, .print-bar, .back-link {
                display: none !important;
            }

            .paper-container {
                max-width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                box-shadow: none !important;
                border: none !important;
                background: transparent !important;
            }

            .cover-page {
                page-break-after: always;
                min-height: 88vh;
                border: 1.5px solid #CBD5E1 !important;
                border-radius: 12px !important;
                padding: 38px !important;
                background: #F8FAFC !important;
                box-shadow: none !important;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
            }

            .cover-title {
                font-size: 24pt !important;
                line-height: 1.25 !important;
                color: #0F172A !important;
            }

            .cover-metadata-item {
                background: #FFFFFF !important;
                border: 1px solid #E2E8F0 !important;
            }

            h1.part-title {
                page-break-before: always;
                margin-top: 24pt !important;
                font-size: 18pt !important;
                border-bottom: 2px solid #CBD5E1 !important;
                color: #0F172A !important;
            }

            h2.section-title {
                break-after: avoid;
                page-break-after: avoid;
                font-size: 14pt !important;
                margin-top: 18pt !important;
                color: #0F172A !important;
            }

            h3.section-subtitle {
                break-after: avoid;
                page-break-after: avoid;
                font-size: 12pt !important;
                color: #1E3A8A !important;
            }

            .formula-card, .figure-card, table.data-table, .glossary-table {
                break-inside: avoid;
                page-break-inside: avoid;
                box-shadow: none !important;
                border: 1px solid #CBD5E1 !important;
            }

            .figure-card img {
                max-height: 380px;
                object-fit: contain;
            }
        }
    </style>"""

TOOLBAR_HTML = r"""    <!-- BARRA DE CONTROL FLOTANTE MODERNA -->
    <nav class="floating-toolbar">
        <div class="toolbar-brand">
            <span class="toolbar-dot"></span>
            <span>AgriTwin Canónico</span>
            <span class="toolbar-pill">TRL 8</span>
        </div>
        
        <div class="toolbar-actions">
            <!-- Selector de Tema (Claro / Oscuro) -->
            <button id="themeToggleBtn" class="toolbar-btn" onclick="toggleTheme()" title="Alternar Modo Claro / Oscuro">
                <span id="themeIcon">🌙</span>
                <span id="themeLabel">Oscuro</span>
            </button>

            <!-- Selector de Formato de Lectura / PDF -->
            <div class="format-select-group">
                <label for="formatSelect" class="toolbar-label">Formato:</label>
                <select id="formatSelect" class="toolbar-select" onchange="changeFormat(this.value)">
                    <option value="hombros" selected>🌿 Hombros Solarpunk</option>
                    <option value="nature">🔬 Nature Editorial</option>
                    <option value="tech">📄 Minimal Tech</option>
                </select>
            </div>

            <!-- Botón de Exportar / Imprimir PDF -->
            <button class="toolbar-btn btn-primary" onclick="window.print()" title="Imprimir o Exportar a PDF">
                <span>🖨️ Imprimir / PDF</span>
            </button>

            <!-- Volver al Vault -->
            <a href="../index.html" class="toolbar-btn" title="Volver al Vault">
                <span>← Vault</span>
            </a>
        </div>
    </nav>"""

def update_file(filepath):
    print(f"\n--- Modernizing {filepath} ---")
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Replace <head> fonts and KaTeX scripts
    head_pattern = r'<script defer src="https://cdn\.jsdelivr\.net/npm/katex@0\.16\.8/dist/katex\.min\.js"></script>.*?initKaTeX\(\);\s*\}\);?\s*</script>'
    m_head = re.search(head_pattern, content, re.DOTALL)
    if m_head:
        content = content[:m_head.start()] + NEW_FONTS_AND_HEAD + content[m_head.end():]
        print("Updated <head> with Google Fonts & Theme/Format JS engine.")
    else:
        print("Warning: head_pattern not found, trying fallback...")
        # fallback replace
        old_head_sub = '<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>'
        if old_head_sub in content:
            pos = content.find(old_head_sub)
            end_pos = content.find('</script>', pos + 50) + 9
            content = content[:pos] + NEW_FONTS_AND_HEAD + content[end_pos:]
            print("Updated <head> via fallback.")

    # 2. Replace CSS block
    css_pattern = r'<style>.*?</style>'
    m_css = re.search(css_pattern, content, re.DOTALL)
    if m_css:
        content = content[:m_css.start()] + NEW_CSS + content[m_css.end():]
        print("Replaced CSS with modern Solarpunk/Hombros token engine.")
    else:
        print("ERROR: Could not find <style> block!")
        sys.exit(1)

    # 3. Replace old top bar with modern Floating Toolbar
    body_pattern = r'<body>\s*<a href="\.\./index\.html" class="back-link">.*?</div>\s*<div class="paper-container">'
    m_body = re.search(body_pattern, content, re.DOTALL)
    if m_body:
        replacement = f"<body>\n\n{TOOLBAR_HTML}\n\n    <div class=\"paper-container\">"
        content = content[:m_body.start()] + replacement + content[m_body.end():]
        print("Replaced old top link with modern Floating Toolbar.")
    else:
        print("Warning: body_pattern not matched directly, checking alternative...")
        if 'class="print-bar"' in content:
            content = re.sub(
                r'<body>\s*<a[^>]*class="back-link"[^>]*>.*?</div>\s*<div class="paper-container">',
                f"<body>\n\n{TOOLBAR_HTML}\n\n    <div class=\"paper-container\">",
                content,
                flags=re.DOTALL
            )
            print("Replaced old top link via regex fallback.")

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Successfully modernized {filepath}")

def main():
    for f in TARGET_FILES:
        if os.path.exists(f):
            update_file(f)
        else:
            print(f"File not found: {f}")

if __name__ == "__main__":
    main()
