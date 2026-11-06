# -*- coding: utf-8 -*-
"""
01_fetch_inputs.py  (hindcast real)
Para un evento descarga los insumos observados y fija las escenas a usar:
  1. Clima horario ERA5 (Open-Meteo Historical).
  2. Lluvia diaria de los 90 dias previos (sequedad acumulada).
  3. Seleccion automatica de escenas Sentinel-2 L2A pre/post incendio
     (Planetary Computer STAC): misma orbita relativa, mayor cobertura del ROI
     (union de tiles) y menor nubosidad.
Salida en cache/<evento>/: era5_hourly.json, era5_precip_90d.json, scenes.json

Uso: .venv/bin/python 01_fetch_inputs.py santa_juana_2023
"""
import json
import os
import sys
from collections import defaultdict
from datetime import date, timedelta

import requests
from pystac_client import Client
from shapely.geometry import box, shape
from shapely.ops import unary_union

from events import EVENTS

HERE = os.path.dirname(os.path.abspath(__file__))
STAC = "https://planetarycomputer.microsoft.com/api/stac/v1"


def fetch_era5(ev, out_dir):
    hourly = ("temperature_2m,relative_humidity_2m,wind_speed_10m,"
              "wind_direction_10m,wind_gusts_10m,precipitation")
    url = ("https://archive-api.open-meteo.com/v1/archive"
           f"?latitude={ev['lat']}&longitude={ev['lon']}"
           f"&start_date={ev['wx_start']}&end_date={ev['wx_end']}"
           f"&hourly={hourly}&timezone=UTC&wind_speed_unit=kmh")
    r = requests.get(url, timeout=60)
    r.raise_for_status()
    with open(os.path.join(out_dir, "era5_hourly.json"), "w") as f:
        json.dump(r.json(), f)
    d1 = date.fromisoformat(ev["wx_start"])
    d0 = d1 - timedelta(days=90)
    url2 = ("https://archive-api.open-meteo.com/v1/archive"
            f"?latitude={ev['lat']}&longitude={ev['lon']}"
            f"&start_date={d0}&end_date={d1}&daily=precipitation_sum&timezone=UTC")
    r2 = requests.get(url2, timeout=60)
    r2.raise_for_status()
    with open(os.path.join(out_dir, "era5_precip_90d.json"), "w") as f:
        json.dump(r2.json(), f)
    tot = sum(v or 0 for v in r2.json()["daily"]["precipitation_sum"])
    print(f"ERA5: {len(r.json()['hourly']['time'])} h ; lluvia 90 d previos: {tot:.1f} mm")


def groups_for(cat, roi, window, cloud_max=40):
    """Agrupa escenas por (orbita, fecha) y calcula cobertura del ROI y nubosidad."""
    roi_poly = box(*roi)
    items = list(cat.search(collections=["sentinel-2-l2a"], bbox=roi,
                            datetime=f"{window[0]}/{window[1]}",
                            query={"eo:cloud_cover": {"lt": cloud_max}}).items())
    g = defaultdict(list)
    for it in items:
        key = (it.properties.get("sat:relative_orbit"), it.datetime.date().isoformat())
        g[key].append(it)
    out = []
    for (orbit, d), its in g.items():
        by_tile = {}
        for it in its:  # una escena por tile (la procesada mas reciente)
            t = it.properties.get("s2:mgrs_tile")
            if t not in by_tile or it.id > by_tile[t].id:
                by_tile[t] = it
        its = list(by_tile.values())
        cov = unary_union([shape(i.geometry) for i in its]).intersection(roi_poly).area / roi_poly.area * 100
        cloud = sum(i.properties.get("eo:cloud_cover", 0) for i in its) / len(its)
        out.append({"orbit": orbit, "date": d, "coverage": cov, "cloud": cloud,
                    "ids": sorted(i.id for i in its)})
    return out


def pick_scenes(ev, out_dir):
    cat = Client.open(STAC)
    pre = groups_for(cat, ev["roi"], ev["pre"])
    post = groups_for(cat, ev["roi"], ev["post"])
    best = None
    for p in pre:
        for q in post:
            if q["orbit"] != p["orbit"]:
                continue
            ok = p["coverage"] >= 85 and q["coverage"] >= 85
            # preferir cobertura completa, poca nube, pre cercano al evento y post temprano
            score = (1000 if ok else 0) + p["coverage"] + q["coverage"] \
                - 2 * (p["cloud"] + q["cloud"]) \
                + (date.fromisoformat(p["date"]) - date.fromisoformat(ev["pre"][0])).days * 0.5 \
                - (date.fromisoformat(q["date"]) - date.fromisoformat(ev["post"][0])).days * 0.5
            if best is None or score > best[0]:
                best = (score, p, q)
    _, p, q = best
    with open(os.path.join(out_dir, "scenes.json"), "w") as f:
        json.dump({"pre": p, "post": q}, f, indent=1)
    print(f"PRE  {p['date']} orbita {p['orbit']} cobertura {p['coverage']:.0f}% nubes {p['cloud']:.1f}% ({len(p['ids'])} tiles)")
    print(f"POST {q['date']} orbita {q['orbit']} cobertura {q['coverage']:.0f}% nubes {q['cloud']:.1f}% ({len(q['ids'])} tiles)")


def main():
    key = sys.argv[1]
    ev = EVENTS[key]
    out_dir = os.path.join(HERE, "cache", key)
    os.makedirs(out_dir, exist_ok=True)
    print(f"== {ev['label']} ==")
    fetch_era5(ev, out_dir)
    pick_scenes(ev, out_dir)


if __name__ == "__main__":
    main()
