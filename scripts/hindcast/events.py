# -*- coding: utf-8 -*-
"""
events.py - Definicion de eventos de validacion retrospectiva (hindcast).
Un evento = ventana de busqueda + ROI. Ningun dato de resultado vive aqui.
La ignicion exacta se fijara con NASA FIRMS (requiere FIRMS_MAP_KEY); las
coordenadas 'lat/lon' solo centran la consulta de clima.
"""

EVENTS = {
    "santa_juana_2023": {
        "label": "Santa Juana, Biobío · feb 2023",
        "short": "Santa Juana 2023",
        "lat": -37.17, "lon": -72.94,
        "roi": [-73.10, -37.50, -72.55, -37.00],      # O, S, E, N
        "wx_start": "2023-01-25", "wx_end": "2023-02-08",
        "peak_days": ["2023-02-02", "2023-02-03", "2023-02-04"],
        "pre": ("2023-01-10", "2023-02-01"),
        "post": ("2023-02-08", "2023-03-10"),
        "dnbr_thr": 0.27,
        "setting": "Plantaciones forestales y matorral, relieve de cordillera de la Costa",
    },
    "vina_2024": {
        "label": "Viña del Mar / Quilpué / Villa Alemana, Valparaíso · feb 2024",
        "short": "Viña del Mar 2024",
        "lat": -33.08, "lon": -71.47,
        "roi": [-71.65, -33.20, -71.25, -32.90],
        "wx_start": "2024-01-25", "wx_end": "2024-02-08",
        "peak_days": ["2024-02-02", "2024-02-03", "2024-02-04"],
        "pre": ("2024-01-10", "2024-02-01"),
        "post": ("2024-02-08", "2024-03-10"),
        "dnbr_thr": 0.27,
        "setting": "Interfaz urbano-forestal: eucalipto, matorral esclerófilo y viviendas",
    },
}
