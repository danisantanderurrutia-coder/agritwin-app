#!/usr/bin/env python3
"""
Captura automatizada de capturas del motor satelital AgriTwin para el benchmark de megainundaciones.
Genera 12 capturas a alta resolución (1600x1000) para los 3 sitios de megainundación:
1. Licantén / Río Mataquito 2023
2. Río Longaví / Meniel & Retiro 2023
3. Río Ancoa / Linares Precordillera 2023
Para cada sitio:
- Polígono SAR Sentinel-1
- Reconstrucción Histórica (Celdas, aforos DGA, corrientes)
- Reconstrucción Predicción Ciega (HAND / Saint-Venant 2D)
- Trilateral (Superposición completa)
"""

import os
import subprocess
import time
import sys

CHROME_BIN = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUTPUT_DIR = os.path.abspath("docs/figures")
BASE_URL = "http://localhost:7777"

TASKS = [
    # 1. Licantén / Río Mataquito 2023
    {
        "event": "licanten_2023",
        "preset": "solo_sar",
        "outfile": "hindcast_flood_licanten_poligono.png",
        "desc": "Licantén 2023 - 1. Polígono SAR Sentinel-1 (Backscatter < -18 dB)"
    },
    {
        "event": "licanten_2023",
        "preset": "historica",
        "outfile": "hindcast_flood_licanten_historica.png",
        "desc": "Licantén 2023 - 2. Reconstrucción Histórica Táctica (DGA + Celdas F-LIC + Hospital)"
    },
    {
        "event": "licanten_2023",
        "preset": "prediccion",
        "outfile": "hindcast_flood_licanten_prediccion.png",
        "desc": "Licantén 2023 - 3. Reconstrucción Predicción Ciega T-48h (HAND / Saint-Venant 2D)"
    },
    {
        "event": "licanten_2023",
        "preset": "todas",
        "outfile": "hindcast_flood_licanten_trilateral.png",
        "desc": "Licantén 2023 - 4. Auditoría Trilateral (3 Capas Superpuestas)"
    },

    # 2. Río Longaví / Meniel & Retiro 2023
    {
        "event": "longavi_2023",
        "preset": "solo_sar",
        "outfile": "hindcast_flood_longavi_poligono.png",
        "desc": "Longaví 2023 - 1. Polígono SAR Sentinel-1 (Backscatter < -18 dB)"
    },
    {
        "event": "longavi_2023",
        "preset": "historica",
        "outfile": "hindcast_flood_longavi_historica.png",
        "desc": "Longaví 2023 - 2. Reconstrucción Histórica Táctica (Vegas Meniel + Keyline Buffer)"
    },
    {
        "event": "longavi_2023",
        "preset": "prediccion",
        "outfile": "hindcast_flood_longavi_prediccion.png",
        "desc": "Longaví 2023 - 3. Reconstrucción Predicción Ciega T-48h (HAND / Saint-Venant 2D)"
    },
    {
        "event": "longavi_2023",
        "preset": "todas",
        "outfile": "hindcast_flood_longavi_trilateral.png",
        "desc": "Longaví 2023 - 4. Auditoría Trilateral (3 Capas Superpuestas)"
    },

    # 3. Río Ancoa / Linares Precordillera 2023
    {
        "event": "ancoa_2023",
        "preset": "solo_sar",
        "outfile": "hindcast_flood_ancoa_poligono.png",
        "desc": "Ancoa 2023 - 1. Polígono SAR Sentinel-1 (Backscatter < -18 dB)"
    },
    {
        "event": "ancoa_2023",
        "preset": "historica",
        "outfile": "hindcast_flood_ancoa_historica.png",
        "desc": "Ancoa 2023 - 2. Reconstrucción Histórica Táctica (Cañón Torrencial + Colapso Puente Tres Arcos)"
    },
    {
        "event": "ancoa_2023",
        "preset": "prediccion",
        "outfile": "hindcast_flood_ancoa_prediccion.png",
        "desc": "Ancoa 2023 - 3. Reconstrucción Predicción Ciega T-48h (HAND / Saint-Venant 2D + Rain-on-Snow)"
    },
    {
        "event": "ancoa_2023",
        "preset": "todas",
        "outfile": "hindcast_flood_ancoa_trilateral.png",
        "desc": "Ancoa 2023 - 4. Auditoría Trilateral (3 Capas Superpuestas)"
    }
]

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    if not os.path.exists(CHROME_BIN):
        print(f"Error: Chrome binary not found at {CHROME_BIN}", file=sys.stderr)
        sys.exit(1)

    print("═══════════════════════════════════════════════════════════════════")
    print(" AGRITWIN SATELLITE ENGINE • CAPTURA DE PANTALLA MEGAINUNDACIONES")
    print("═══════════════════════════════════════════════════════════════════")

    for idx, t in enumerate(TASKS, 1):
        target_url = f"{BASE_URL}/?flood={t['event']}&preset={t['preset']}&minimize=1"
        out_path = os.path.join(OUTPUT_DIR, t['outfile'])
        print(f"[{idx}/{len(TASKS)}] Capturando: {t['desc']}...")
        print(f"     URL: {target_url}")
        print(f"     Destino: {out_path}")

        cmd = [
            CHROME_BIN,
            "--headless=new",
            f"--screenshot={out_path}",
            "--window-size=1600,1000",
            "--virtual-time-budget=12000",
            "--hide-scrollbars",
            target_url
        ]

        try:
            res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=30)
            if os.path.exists(out_path):
                sz = os.path.getsize(out_path)
                print(f"     ✔ OK: {sz:,} bytes guardados.")
            else:
                print(f"     ✖ Fallo al generar captura: {out_path}")
                if res.stderr:
                    print(f"     Stderr: {res.stderr[:200]}")
        except Exception as e:
            print(f"     ✖ Excepción: {e}")

        time.sleep(1)

    print("\n¡Proceso de captura finalizado!")

if __name__ == "__main__":
    main()
