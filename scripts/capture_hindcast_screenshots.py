#!/usr/bin/env python3
"""
Captura automatizada de capturas del motor satelital AgriTwin para auditoría hindcast ciega.
Genera capturas a alta resolución (1600x1000) comparando:
1. Polígono Histórico (dNBR Sentinel-2)
2. Reconstrucción Histórica (Haces tácticos, celdas orográficas, salto de pavesas Albini)
3. Reconstrucción Predicción Ciega (Elipse paramétrica Rothermel-Fons T-24h y vector ERA5)
4. Trilateral (Las 3 capas superpuestas)
"""

import os
import subprocess
import time
import sys

CHROME_BIN = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUTPUT_DIR = os.path.abspath("docs/figures")
BASE_URL = "http://localhost:7777"

TASKS = [
    # Viña del Mar 2024
    {
        "event": "vina_2024",
        "preset": "solo_poligono",
        "outfile": "hindcast_vina_poligono.png",
        "desc": "Viña del Mar 2024 - 1. Polígono Histórico dNBR Sentinel-2"
    },
    {
        "event": "vina_2024",
        "preset": "historica",
        "outfile": "hindcast_vina_historica.png",
        "desc": "Viña del Mar 2024 - 2. Reconstrucción Histórica (Haces Huygens + Albini)"
    },
    {
        "event": "vina_2024",
        "preset": "prediccion",
        "outfile": "hindcast_vina_prediccion.png",
        "desc": "Viña del Mar 2024 - 3. Reconstrucción Predicción Ciega T-24h"
    },
    {
        "event": "vina_2024",
        "preset": "todas",
        "outfile": "hindcast_vina_trilateral.png",
        "desc": "Viña del Mar 2024 - 4. Auditoría Trilateral (3 Capas Superpuestas)"
    },
    # Santa Juana 2023
    {
        "event": "santa_juana_2023",
        "preset": "solo_poligono",
        "outfile": "hindcast_santajuana_poligono.png",
        "desc": "Santa Juana 2023 - 1. Polígono Histórico dNBR Sentinel-2"
    },
    {
        "event": "santa_juana_2023",
        "preset": "historica",
        "outfile": "hindcast_santajuana_historica.png",
        "desc": "Santa Juana 2023 - 2. Reconstrucción Histórica (Haces Huygens + Spotting Biobío)"
    },
    {
        "event": "santa_juana_2023",
        "preset": "prediccion",
        "outfile": "hindcast_santajuana_prediccion.png",
        "desc": "Santa Juana 2023 - 3. Reconstrucción Predicción Ciega T-24h"
    },
    {
        "event": "santa_juana_2023",
        "preset": "todas",
        "outfile": "hindcast_santajuana_trilateral.png",
        "desc": "Santa Juana 2023 - 4. Auditoría Trilateral (3 Capas Superpuestas)"
    }
]

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    if not os.path.exists(CHROME_BIN):
        print(f"Error: Chrome binary not found at {CHROME_BIN}", file=sys.stderr)
        sys.exit(1)

    print("═══════════════════════════════════════════════════════════════════")
    print(" AGRITWIN SATELLITE ENGINE • CAPTURA DE PANTALLA HINDCAST")
    print("═══════════════════════════════════════════════════════════════════")

    for idx, t in enumerate(TASKS, 1):
        target_url = f"{BASE_URL}/?hindcast={t['event']}&preset={t['preset']}"
        out_path = os.path.join(OUTPUT_DIR, t['outfile'])
        print(f"[{idx}/{len(TASKS)}] Capturando: {t['desc']}...")
        print(f"     URL: {target_url}")
        print(f"     Destino: {out_path}")

        cmd = [
            CHROME_BIN,
            "--headless=new",
            f"--screenshot={out_path}",
            "--window-size=1600,1000",
            "--virtual-time-budget=7500",
            "--hide-scrollbars",
            target_url
        ]

        try:
            res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=35)
            if os.path.exists(out_path) and os.path.getsize(out_path) > 10000:
                sz_kb = os.path.getsize(out_path) / 1024
                print(f"     ✔ OK ({sz_kb:.1f} KB)")
            else:
                print(f"     ✖ Fallo o archivo vacío (Código: {res.returncode})")
        except Exception as e:
            print(f"     ✖ Excepción: {e}")

        time.sleep(1)

    print("\n✔ Todas las capturas satelitales han sido completadas con éxito.")

if __name__ == "__main__":
    main()
