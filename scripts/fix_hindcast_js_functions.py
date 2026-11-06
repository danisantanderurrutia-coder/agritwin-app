# -*- coding: utf-8 -*-
"""
fix_hindcast_js_functions.py
Inyecta de forma garantizada y limpia las funciones JS:
  - window.switchHindcastView
  - window.setHindcastStep
  - Enriquecimiento de IDs en el SVG para reactividad visual completa.
Tanto en:
  1. /Users/danielsantander/Documents/Agrotech/agritwin/index.html
  2. /Users/danielsantander/Documents/agritwin-app/index.html
"""

import sys
import os

JS_CODE = r'''
        // ═══════════════════════════════════════════════════════════════════
        // MÓDULO 5: AUDITORÍA RETROSPECTIVA HINDCAST (INTERACTIVIDAD COMPLETA)
        // ═══════════════════════════════════════════════════════════════════
        window.switchHindcastView = function(viewId) {
            console.log('[Hindcast] Conmutando a vista:', viewId);
            document.querySelectorAll('.hindcast-subpanel').forEach(p => p.classList.add('hidden'));
            
            document.querySelectorAll('.hindcast-nav-btn').forEach(btn => {
                btn.classList.remove('active', 'bg-rose-600', 'text-white', 'border-rose-500');
                btn.classList.add('bg-white/10', 'text-slate-300', 'border-white/10');
            });

            const targetPanel = document.getElementById('hindcastView-' + viewId);
            if (targetPanel) {
                targetPanel.classList.remove('hidden');
            }

            const targetBtn = document.getElementById(viewId === 'modo-b' ? 'hindcastBtn-b' : (viewId === 'modo-a' ? 'hindcastBtn-a' : 'hindcastBtn-c'));
            if (targetBtn) {
                targetBtn.classList.remove('bg-white/10', 'text-slate-300', 'border-white/10');
                targetBtn.classList.add('active', 'bg-rose-600', 'text-white', 'border-rose-500');
            }
        };

        window.setHindcastStep = function(step) {
            console.log('[Hindcast] Ejecutando paso de tiempo:', step);
            document.querySelectorAll('.hindcast-step-btn').forEach(b => {
                b.classList.remove('active', 'bg-rose-600', 'text-white', 'border-rose-500', 'shadow-sm');
                b.classList.add('bg-slate-800', 'text-slate-300', 'border-white/5');
            });
            const activeBtn = document.getElementById('hindcastStepBtn-' + step);
            if (activeBtn) {
                activeBtn.classList.remove('bg-slate-800', 'text-slate-300', 'border-white/5');
                activeBtn.classList.add('active', 'bg-rose-600', 'text-white', 'border-rose-500', 'shadow-sm');
            }

            const phaseLabel = document.getElementById('hindcast-current-phase-label');
            const fwiVal = document.getElementById('hindcast-fwi-val');
            const fwiBar = document.getElementById('hindcast-fwi-bar');
            const fwiBadge = document.getElementById('hindcast-fwi-badge');
            const windVal = document.getElementById('hindcast-wind-val');
            const rateVal = document.getElementById('hindcast-rate-val');
            const distVal = document.getElementById('hindcast-dist-val');
            const etaVal = document.getElementById('hindcast-eta-val');

            // Elementos dinámicos del SVG cartográfico
            const svgEllipse = document.getElementById('hindcast-svg-sim-ellipse');
            const svgConaf = document.getElementById('hindcast-svg-real-conaf');
            const svgIgnition = document.getElementById('hindcast-svg-ignition');
            const svgSpotting = document.getElementById('hindcast-svg-spotting');
            const svgFirms = document.getElementById('hindcast-svg-firms-points');

            if (step === 1) { // T - 24h: Previo
                if (phaseLabel) phaseLabel.innerText = "Fase 1: T - 24h (Desecación de Biomasa Previa • Viento Puelche 28 km/h)";
                if (fwiVal) fwiVal.innerText = "42";
                if (fwiBar) fwiBar.style.width = "45%";
                if (fwiBadge) {
                    fwiBadge.className = "text-[10px] text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/60 font-bold text-center";
                    fwiBadge.innerText = "⚠️ ALERTA AMARILLA PREVENTIVA (Riesgo FWI Elevado)";
                }
                if (windVal) windVal.innerText = "28.5 km/h";
                if (rateVal) rateVal.innerText = "0.0 m/min";
                if (distVal) distVal.innerText = "Sin Foco Activo";
                if (etaVal) etaVal.innerText = "Monitoreo Preventivo";

                // SVG: Sin fuego aún
                if (svgEllipse) svgEllipse.setAttribute('opacity', '0.05');
                if (svgConaf) svgConaf.setAttribute('opacity', '0.05');
                if (svgIgnition) svgIgnition.setAttribute('opacity', '0.2');
                if (svgSpotting) svgSpotting.setAttribute('opacity', '0.0');
                if (svgFirms) svgFirms.setAttribute('opacity', '0.0');

            } else if (step === 2) { // T0: Ignición
                if (phaseLabel) phaseLabel.innerText = "Fase 2: T0 (Ignición Inicial 13:45h • Ladera Sur • Cerro Pelado)";
                if (fwiVal) fwiVal.innerText = "68";
                if (fwiBar) fwiBar.style.width = "72%";
                if (fwiBadge) {
                    fwiBadge.className = "text-[10px] text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800/60 font-bold text-center";
                    fwiBadge.innerText = "🚨 PELIGRO EXTREMO (Regla 30-30-30)";
                }
                if (windVal) windVal.innerText = "40.2 km/h";
                if (rateVal) rateVal.innerText = "6.5 m/min";
                if (distVal) distVal.innerText = "4.2 km al Este";
                if (etaVal) etaVal.innerText = "2 h 15 min";

                // SVG: Punto de ignición activo
                if (svgEllipse) {
                    svgEllipse.setAttribute('opacity', '0.35');
                    svgEllipse.setAttribute('rx', '45');
                    svgEllipse.setAttribute('ry', '22');
                    svgEllipse.setAttribute('cx', '430');
                    svgEllipse.setAttribute('cy', '125');
                }
                if (svgConaf) svgConaf.setAttribute('opacity', '0.3');
                if (svgIgnition) svgIgnition.setAttribute('opacity', '1.0');
                if (svgSpotting) svgSpotting.setAttribute('opacity', '0.0');
                if (svgFirms) svgFirms.setAttribute('opacity', '0.3');

            } else if (step === 3) { // T + 2h: Carrera convectiva
                if (phaseLabel) phaseLabel.innerText = "Fase 3: T + 2h (Carrera Convectiva Ladera Arriba • 15.6 m/min)";
                if (fwiVal) fwiVal.innerText = "74";
                if (fwiBar) fwiBar.style.width = "82%";
                if (fwiBadge) {
                    fwiBadge.className = "text-[10px] text-red-300 bg-red-950 px-2 py-0.5 rounded border border-red-700 font-bold text-center animate-pulse";
                    fwiBadge.innerText = "🔥 EMERGENCIA MÁXIMA (Frente de Llama Activo)";
                }
                if (windVal) windVal.innerText = "44.0 km/h";
                if (rateVal) rateVal.innerText = "15.6 m/min";
                if (distVal) distVal.innerText = "2.4 km al Este";
                if (etaVal) etaVal.innerText = "1 h 18 min";

                // SVG: Expansión de la envolvente
                if (svgEllipse) {
                    svgEllipse.setAttribute('opacity', '0.75');
                    svgEllipse.setAttribute('rx', '95');
                    svgEllipse.setAttribute('ry', '48');
                    svgEllipse.setAttribute('cx', '385');
                    svgEllipse.setAttribute('cy', '145');
                }
                if (svgConaf) svgConaf.setAttribute('opacity', '0.6');
                if (svgIgnition) svgIgnition.setAttribute('opacity', '0.8');
                if (svgSpotting) svgSpotting.setAttribute('opacity', '0.4');
                if (svgFirms) svgFirms.setAttribute('opacity', '0.8');

            } else if (step === 4) { // T + 6h: Pavesas Albini
                if (phaseLabel) phaseLabel.innerText = "Fase 4: T + 6h (Salto de Pavesas Convectivas Albini 580m sobre Estero)";
                if (fwiVal) fwiVal.innerText = "65";
                if (fwiBar) fwiBar.style.width = "70%";
                if (fwiBadge) {
                    fwiBadge.className = "text-[10px] text-rose-300 bg-rose-950 px-2 py-0.5 rounded border border-rose-700 font-bold text-center";
                    fwiBadge.innerText = "🚨 SALTO DE BARRERAS (Pavesas 580m)";
                }
                if (windVal) windVal.innerText = "38.5 km/h";
                if (rateVal) rateVal.innerText = "12.2 m/min";
                if (distVal) distVal.innerText = "0.8 km (Borde Faja)";
                if (etaVal) etaVal.innerText = "32 minutos";

                // SVG: Mancha completa con salto de pavesas
                if (svgEllipse) {
                    svgEllipse.setAttribute('opacity', '0.85');
                    svgEllipse.setAttribute('rx', '115');
                    svgEllipse.setAttribute('ry', '58');
                    svgEllipse.setAttribute('cx', '365');
                    svgEllipse.setAttribute('cy', '155');
                }
                if (svgConaf) svgConaf.setAttribute('opacity', '0.85');
                if (svgIgnition) svgIgnition.setAttribute('opacity', '0.6');
                if (svgSpotting) svgSpotting.setAttribute('opacity', '1.0');
                if (svgFirms) svgFirms.setAttribute('opacity', '1.0');

            } else if (step === 5) { // T + 12h: Contención en Faja
                if (phaseLabel) phaseLabel.innerText = "Fase 5: T + 12h (Colapso y Contención en Faja Cortafuegos 45m Fundo Meniel)";
                if (fwiVal) fwiVal.innerText = "28";
                if (fwiBar) fwiBar.style.width = "30%";
                if (fwiBadge) {
                    fwiBadge.className = "text-[10px] text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-700 font-bold text-center";
                    fwiBadge.innerText = "🛡️ FRENTE ATENUADO 92% (Faja Cortafuegos Keyline)";
                }
                if (windVal) windVal.innerText = "16.0 km/h (Brisa Marina)";
                if (rateVal) rateVal.innerText = "1.2 m/min";
                if (distVal) distVal.innerText = "Contenido en Faja";
                if (etaVal) etaVal.innerText = "Extinguido / Seguro";

                // SVG: Fuego contenido y extinguido
                if (svgEllipse) {
                    svgEllipse.setAttribute('opacity', '0.45');
                    svgEllipse.setAttribute('rx', '115');
                    svgEllipse.setAttribute('ry', '58');
                    svgEllipse.setAttribute('cx', '365');
                    svgEllipse.setAttribute('cy', '155');
                }
                if (svgConaf) svgConaf.setAttribute('opacity', '0.85');
                if (svgIgnition) svgIgnition.setAttribute('opacity', '0.3');
                if (svgSpotting) svgSpotting.setAttribute('opacity', '0.2');
                if (svgFirms) svgFirms.setAttribute('opacity', '0.5');
            }
        };
'''

def process_file(file_path):
    print(f"\nProcesando: {file_path}")
    if not os.path.exists(file_path):
        print(f"❌ Error: Archivo no encontrado: {file_path}")
        return False

    with open(file_path, 'r', encoding='utf-8') as f:
        html = f.read()

    # 1. Asegurar IDs en los elementos SVG para que reaccionen a setHindcastStep
    svg_replacements = [
        # Elipse simulada
        (r'<ellipse cx="365" cy="155" rx="115" ry="58"', r'<ellipse id="hindcast-svg-sim-ellipse" cx="365" cy="155" rx="115" ry="58"'),
        # Polígono CONAF
        (r'<path d="M 455 110', r'<path id="hindcast-svg-real-conaf" d="M 455 110'),
        # Pavesas
        (r'<path d="M 310 165 Q 260 150, 230 175"', r'<path id="hindcast-svg-spotting" d="M 310 165 Q 260 150, 230 175"'),
        # Punto de ignición
        (r'<g transform="translate(450, 115)">', r'<g id="hindcast-svg-ignition" transform="translate(450, 115)">'),
    ]

    for old_str, new_str in svg_replacements:
        if old_str in html and new_str not in html:
            html = html.replace(old_str, new_str)
            print(f"  ✓ ID agregado a elemento SVG: {new_str[:40]}...")

    # FIRMS puntos térmicos
    firms_target = r'''                                            <!-- Puntos Térmicos Satelitales NASA FIRMS (VIIRS 375m) -->
                                            <circle cx="340" cy="120" r="4.5" fill="#fbbf24" stroke="#dc2626" stroke-width="1.5" />'''
    firms_wrapped = r'''                                            <!-- Puntos Térmicos Satelitales NASA FIRMS (VIIRS 375m) -->
                                            <g id="hindcast-svg-firms-points">
                                            <circle cx="340" cy="120" r="4.5" fill="#fbbf24" stroke="#dc2626" stroke-width="1.5" />'''
    if firms_target in html and '<g id="hindcast-svg-firms-points">' not in html:
        html = html.replace(firms_target, firms_wrapped)
        # cerrar el g
        close_needle = r'''                                            <circle cx="310" cy="165" r="5" fill="#f59e0b" stroke="#b91c1c" stroke-width="1.5">
                                                <animate attributeName="r" values="3.5;6;3.5" dur="2s" repeatCount="indefinite" />
                                            </circle>'''
        if close_needle in html:
            html = html.replace(close_needle, close_needle + "\n                                            </g>")
            print("  ✓ Agrupado de FIRMS points realizado.")

    # 2. Inyectar funciones JS
    # Ubicar antes de "window.switchUqTab = function"
    uq_needle = "window.switchUqTab = function"
    if "window.switchHindcastView = function" not in html:
        if uq_needle in html:
            html = html.replace(uq_needle, JS_CODE.strip() + "\n\n        " + uq_needle)
            print("  ✓ Funciones JS inyectadas antes de switchUqTab.")
        else:
            print("  ⚠️ No se encontró needle switchUqTab.")
    else:
        print("  ℹ️ switchHindcastView ya estaba presente. Reemplazando con la versión interactiva completa.")
        # Reemplazar bloque viejo si existía
        start_idx = html.find("// Subnavegación del Módulo Hindcast")
        if start_idx != -1:
            end_idx = html.find(uq_needle, start_idx)
            if end_idx != -1:
                html = html[:start_idx] + JS_CODE.strip() + "\n\n        " + html[end_idx:]
                print("  ✓ Bloque JS anterior actualizado.")

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(html)
    print("  ✅ Archivo guardado exitosamente.")
    return True

def main():
    paths = [
        "/Users/danielsantander/Documents/Agrotech/agritwin/index.html",
        "/Users/danielsantander/Documents/agritwin-app/index.html"
    ]
    for p in paths:
        process_file(p)

if __name__ == '__main__':
    main()
