# -*- coding: utf-8 -*-
"""
02_burn_scar.py  (Fase 0 del hindcast real)
Cicatriz de quemado OBSERVADA por satelite (dNBR, Sentinel-2 L2A) como verdad
de terreno independiente del modelo mientras no se use el perimetro oficial CONAF.

  NBR  = (B08 - B12) / (B08 + B12)
  dNBR = NBR_pre - NBR_post          (umbral USGS: >0.27 severidad baja-moderada)

Mosaico de varios tiles de la MISMA orbita (misma geometria de vista) sobre una
malla comun de 20 m en el CRS UTM de la escena.

Salida en cache/<evento>/ : burn_scar.npz, burn_components.json, burn_scar.png

Uso: .venv/bin/python 02_burn_scar.py santa_juana_2023
"""
import json
import os
import sys

import numpy as np
import planetary_computer as pc
import rasterio
from pyproj import Transformer
from pystac_client import Client
from rasterio.enums import Resampling
from rasterio.transform import from_origin
from rasterio.windows import from_bounds
from scipy import ndimage as ndi

from events import EVENTS

HERE = os.path.dirname(os.path.abspath(__file__))
RES = 20.0  # m

def common_grid(roi, crs):
    tr = Transformer.from_crs("EPSG:4326", crs, always_xy=True)
    xs, ys = zip(*[tr.transform(lon, lat) for lon in (roi[0], roi[2]) for lat in (roi[1], roi[3])])
    x0 = np.floor(min(xs) / RES) * RES
    x1 = np.ceil(max(xs) / RES) * RES
    y0 = np.floor(min(ys) / RES) * RES
    y1 = np.ceil(max(ys) / RES) * RES
    w = int((x1 - x0) / RES)
    h = int((y1 - y0) / RES)
    return from_origin(x0, y1, RES, RES), h, w


def read_on_grid(item, band, grid_tf, h, w, resamp=Resampling.nearest):
    """Lee una banda sobre la malla comun (boundless; fuera de escena -> 0)."""
    with rasterio.open(item.assets[band].href) as ds:
        win = from_bounds(grid_tf.c, grid_tf.f + grid_tf.e * h,
                          grid_tf.c + grid_tf.a * w, grid_tf.f, ds.transform)
        arr = ds.read(1, window=win, out_shape=(h, w), boundless=True,
                      fill_value=0, resampling=resamp)
    return arr.astype("float32")


def nbr_one(item, grid_tf, h, w):
    b12 = read_on_grid(item, "B12", grid_tf, h, w)
    b08 = read_on_grid(item, "B08", grid_tf, h, w)
    scl = read_on_grid(item, "SCL", grid_tf, h, w)
    nodata = (b12 == 0) & (b08 == 0)
    off = -1000.0  # baseline >= 04.00 (todo 2022+)
    b08 = (b08 + off) / 10000.0
    b12 = (b12 + off) / 10000.0
    nbr = (b08 - b12) / np.maximum(b08 + b12, 1e-6)
    bad = nodata | np.isin(scl, [0, 1, 3, 8, 9, 10, 11])
    water = scl == 6
    return nbr, bad, water


def mosaic(items, grid_tf, h, w):
    nbr = np.full((h, w), np.nan, dtype="float32")
    bad = np.ones((h, w), dtype=bool)
    water = np.zeros((h, w), dtype=bool)
    for it in items:  # el primero tiene prioridad; los siguientes rellenan huecos
        n, b, wt = nbr_one(it, grid_tf, h, w)
        fill = bad & ~b
        nbr[fill] = n[fill]
        water |= (wt & fill)
        bad[fill] = False
    return nbr, bad, water


def main():
    key = sys.argv[1] if len(sys.argv) > 1 else "santa_juana_2023"
    cfg = dict(EVENTS[key])
    out = os.path.join(HERE, "cache", key)
    os.makedirs(out, exist_ok=True)
    with open(os.path.join(out, "scenes.json")) as f:
        sc = json.load(f)
    cfg["pre"], cfg["post"] = sc["pre"]["ids"], sc["post"]["ids"]
    pre_date, post_date = sc["pre"]["date"], sc["post"]["date"]

    cat = Client.open("https://planetarycomputer.microsoft.com/api/stac/v1", modifier=pc.sign_inplace)
    col = cat.get_collection("sentinel-2-l2a")
    pre_items = [col.get_item(i) for i in cfg["pre"]]
    post_items = [col.get_item(i) for i in cfg["post"]]
    with rasterio.open(pre_items[0].assets["B12"].href) as ds:
        crs = ds.crs
    grid_tf, h, w = common_grid(cfg["roi"], crs)
    print(f"CRS {crs}  malla {h}x{w} px de {RES:.0f} m  ({h*RES/1000:.0f} x {w*RES/1000:.0f} km)")

    nbr_pre, bad_pre, water_pre = mosaic(pre_items, grid_tf, h, w)
    nbr_post, bad_post, water_post = mosaic(post_items, grid_tf, h, w)
    bad = bad_pre | bad_post | water_pre | water_post
    cover = 100 * (1 - bad.mean())
    print(f"Cobertura util (sin nubes/agua/sin dato): {cover:.1f}% del ROI")

    dnbr = nbr_pre - nbr_post
    dnbr[bad] = np.nan
    mask = (dnbr > cfg["dnbr_thr"]) & ~bad
    mask = ndi.binary_opening(mask, structure=np.ones((3, 3)))
    px_ha = RES * RES / 10000.0

    lab, n = ndi.label(mask)
    sizes = ndi.sum(mask, lab, index=range(1, n + 1)) * px_ha
    order = np.argsort(-sizes)
    to_ll = Transformer.from_crs(crs, "EPSG:4326", always_xy=True)
    print(f"Area total dNBR>{cfg['dnbr_thr']}: {mask.sum()*px_ha:,.0f} ha ; componentes: {n}")
    comps = []
    for rank, idx in enumerate(order[:12], 1):
        cid = idx + 1
        rr, cc = np.where(lab == cid)
        x = grid_tf.c + (cc.mean() + 0.5) * grid_tf.a
        y = grid_tf.f + (rr.mean() + 0.5) * grid_tf.e
        lon, lat = to_ll.transform(x, y)
        comps.append({"rank": rank, "id": int(cid), "ha": float(sizes[idx]), "lon": lon, "lat": lat})
        print(f"  #{rank:2d}: {sizes[idx]:9,.0f} ha  centroide lon {lon:.3f} lat {lat:.3f}")

    np.savez_compressed(os.path.join(out, "burn_scar.npz"), dnbr=dnbr.astype("float32"),
                        mask=mask, lab=lab.astype("int32"),
                        transform=np.array(grid_tf)[:6], crs=str(crs), px_ha=px_ha)
    with open(os.path.join(out, "burn_components.json"), "w") as f:
        json.dump(comps, f, indent=1)
    with open(os.path.join(out, "burn_summary.json"), "w") as f:
        json.dump({"event": key, "pre": pre_date, "post": post_date, "thr": cfg["dnbr_thr"],
                   "usable_coverage_pct": round(float(cover), 1),
                   "total_ha": round(float(mask.sum() * px_ha)),
                   "largest_ha": round(float(sizes[order[0]])) if n else 0,
                   "largest_lon": comps[0]["lon"] if comps else None,
                   "largest_lat": comps[0]["lat"] if comps else None}, f, indent=1)

    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    fig, ax = plt.subplots(1, 2, figsize=(15, 8))
    ax[0].imshow(np.where(bad, np.nan, nbr_pre), cmap="RdYlGn", vmin=-0.2, vmax=0.8)
    ax[0].set_title(f"NBR previo ({pre_date})")
    im = ax[1].imshow(dnbr, cmap="inferno", vmin=0, vmax=1)
    ax[1].contour(mask, levels=[0.5], colors="cyan", linewidths=0.4)
    ax[1].set_title(f"dNBR (post {post_date}) y mascara >{cfg['dnbr_thr']}")
    plt.colorbar(im, ax=ax[1], shrink=0.7)
    for a in ax:
        a.set_xticks([]); a.set_yticks([])
    plt.tight_layout()
    plt.savefig(os.path.join(out, "burn_scar.png"), dpi=100)
    print("PNG:", os.path.join(out, "burn_scar.png"))


if __name__ == "__main__":
    main()
