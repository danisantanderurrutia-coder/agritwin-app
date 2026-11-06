# -*- coding: utf-8 -*-
"""
03_export_sites.py
Exporta las cicatrices de quemado observadas (dNBR) como poligonos simplificados
para el visor de Cuenca: ../../data/hindcast_sites.json (GeoJSON + metadatos).

Son SITIOS DE VALIDACION de modo cuenca: no son predios con gemelo digital.
Solo se exportan componentes grandes (>= MIN_HA) y se simplifican para que el
archivo sea liviano. No contiene resultados de simulacion.

Uso: .venv/bin/python 03_export_sites.py
"""
import json
import os

import numpy as np
from pyproj import Transformer
from rasterio import features
from rasterio.transform import Affine
from shapely.geometry import Polygon, mapping, shape
from shapely.ops import transform as shp_transform

from events import EVENTS

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.abspath(os.path.join(HERE, "..", "..", "data", "hindcast_sites.json"))
MIN_HA = 150.0
SIMPLIFY_M = 120.0
CLOSE_M = 60.0


def era5_summary(key, ev):
    d = json.load(open(os.path.join(HERE, "cache", key, "era5_hourly.json")))["hourly"]
    p = json.load(open(os.path.join(HERE, "cache", key, "era5_precip_90d.json")))["daily"]
    idx = [i for i, t in enumerate(d["time"]) if t[:10] in ev["peak_days"]]
    return {
        "dias": ev["peak_days"],
        "temp_max_c": round(max(d["temperature_2m"][i] for i in idx), 1),
        "hr_min_pct": round(min(d["relative_humidity_2m"][i] for i in idx)),
        "racha_max_kmh": round(max(d["wind_gusts_10m"][i] for i in idx)),
        "lluvia_90d_mm": round(sum(v or 0 for v in p["precipitation_sum"]), 1),
        "fuente": "ERA5 vía Open-Meteo (≈9 km)",
    }


def main():
    fc = {"type": "FeatureCollection", "features": [], "meta": {
        "descripcion": "Sitios de validación retrospectiva (solo modo cuenca, sin gemelo predial). "
                       "Polígonos = cicatriz observada por dNBR Sentinel-2, NO perímetro oficial CONAF.",
        "modelo_ejecutado": False}}
    for key, ev in EVENTS.items():
        cdir = os.path.join(HERE, "cache", key)
        if not os.path.exists(os.path.join(cdir, "burn_scar.npz")):
            continue
        z = np.load(os.path.join(cdir, "burn_scar.npz"))
        summ = json.load(open(os.path.join(cdir, "burn_summary.json")))
        tf = Affine(*z["transform"])
        lab = z["lab"]
        px_ha = float(z["px_ha"])
        to_ll = Transformer.from_crs(str(z["crs"]), "EPSG:4326", always_xy=True).transform
        ids, counts = np.unique(lab[lab > 0], return_counts=True)
        keep = [(int(i), c * px_ha) for i, c in zip(ids, counts) if c * px_ha >= MIN_HA]
        keep.sort(key=lambda x: -x[1])
        wx = era5_summary(key, ev)
        for rank, (cid, ha) in enumerate(keep, 1):
            m = (lab == cid).astype("uint8")
            geoms = [shape(g) for g, v in features.shapes(m, mask=m.astype(bool), transform=tf) if v == 1]
            poly = max(geoms, key=lambda g: g.area)
            poly = poly.buffer(CLOSE_M).buffer(-CLOSE_M)          # cierre morfologico
            if poly.geom_type == "MultiPolygon":
                poly = max(poly.geoms, key=lambda g: g.area)
            poly = Polygon(poly.exterior).simplify(SIMPLIFY_M)    # sin huecos interiores
            poly_ll = shp_transform(to_ll, poly)
            c = poly_ll.centroid
            fc["features"].append({
                "type": "Feature",
                "properties": {
                    "id": f"HC_{key.upper()}_{rank}",
                    "kind": "sitio_validacion",
                    "mode": "cuenca_only",
                    "has_twin": False,
                    "event": key,
                    "name": f"{ev['short']} · mancha {rank}" if rank > 1 else f"{ev['short']} · mancha principal",
                    "label": ev["label"],
                    "setting": ev["setting"],
                    "area_ha": round(ha),
                    "area_source": f"dNBR>{ev['dnbr_thr']} Sentinel-2 ({summ['pre']} → {summ['post']})",
                    "centroid": [round(c.x, 4), round(c.y, 4)],
                    "weather": wx,
                    "usable_coverage_pct": summ["usable_coverage_pct"],
                    "validated": False,
                },
                "geometry": json.loads(json.dumps(mapping(poly_ll), default=lambda o: o), parse_float=lambda x: round(float(x), 5)),
            })
        print(f"{key}: {len(keep)} manchas >= {MIN_HA:.0f} ha exportadas")
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w") as f:
        json.dump(fc, f, ensure_ascii=False, separators=(",", ":"))
    print(f"-> {OUT}  ({os.path.getsize(OUT)/1024:.0f} KB, {len(fc['features'])} polígonos)")


if __name__ == "__main__":
    main()
