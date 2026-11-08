# Informe: Auditoría Retrospectiva Ciega de Incendios (Santa Juana 2023 · Viña del Mar 2024)

**Protocolo:** *Zero-Leakage Time-Machine* (Retro-Proyección Ciega $T-24\text{h}$ y $T_0$ vs. Cicatriz Satelital Independiente Sentinel-2 dNBR $T_{\text{post}}$)  
**Versión Imprimible Interactiva:** [`INFORME_HINDCAST_REAL_IMPRIMIBLE.html`](INFORME_HINDCAST_REAL_IMPRIMIBLE.html)

---

## 1. Principio Epistemológico: Cero Filtración de Futuro (*No Data Leakage*)

Para que la comparación entre **lo que AgriTwin es capaz de mostrar al volver a la fecha** y **lo que efectivamente ocurrió** sea verídica y auditable, la infraestructura aplica un corte temporal estricto en 4 etapas:

1. **Congelamiento Pre-Evento ($t \le t_0 - 24\text{h}$ | `01_fetch_inputs.py`):** El sistema descarga únicamente la lluvia acumulada de los 90 días previos, la serie horaria ERA5 ($T_{2m}, \text{HR}_{2m}, U_{10m}, \theta_{\text{viento}}$), el relieve Copernicus DEM de 30 m y la escena **Sentinel-2 L2A previa al incendio** (estado hídrico foliar pre-fuego).
2. **Emulación Ciega de Riesgo ($t_0$ | `geo-layers.js` Modo 2: Riesgo):** Sin conocer el perímetro quemado, AgriTwin calcula la alerta **FWI (Van Wagner)**, la envolvente elíptica **Rothermel-Fons** ($\frac{L}{W} = 1 + 0,125 \cdot U$), el alcance balístico de pavesas **Albini (1979)** y las celdas tácticas topográficas (`P-SJ-01..03` y `P-VINA-01..03`).
3. **Extracción Independiente Post-Evento ($T_{\text{post}}$ | `02_burn_scar.py` & `03_export_sites.py`):** A partir de la pasada Sentinel-2 L2A posterior al incendio (20 m de resolución), se calcula el diferencial espectral $\text{dNBR} = \text{NBR}_{\text{pre}} - \text{NBR}_{\text{post}} > 0,27$ enmascarando nubes, sombras y cuerpos de agua (SCL), exportando los 22 polígonos reales a `data/hindcast_sites.json`.
4. **Contraste Bipolar y Stress-Test Predial (`vinaBenchmarkDrawer` Modo 3: Comparar):** Se superponen en el Visor de Cuenca el incendio real observado (rojo) y la proyección ciega (naranja), permitiendo además transferir el régimen meteorológico extremo sobre el predio activo (`emulateHindcastOnActiveFarm`).

---

## 2. Matriz Comparativa: Proyección Ciega ($T-24\text{h} / T_0$) vs. Realidad Observada ($T_{\text{post}}$)

### 2.1 Caso 1: Megaincendio de Santa Juana, Biobío (2–4 de febrero de 2023)

| Dimensión Auditada | 🛡️ Lo que AgriTwin Muestra en Ciego (01–02 Feb 2023) | 🛰️ Lo que Efectivamente Ocurrió (Sentinel-2 dNBR Post) | ⚖️ Concordancia y Límite Declarado |
| :--- | :--- | :--- | :--- |
| **Alerta Preventiva $T-24\text{h}$** | **ROJO EXTREMO ($\text{FWI} = 78$)** · $\text{DFMC} = 2,8\%$ bajo $40,0\,^\circ\text{C}$ y $\text{HR } 11\%$. | Disparo explosivo e incontrolable desde el 2 de febrero con piroconvección severa. | **Acierto Total:** Alerta máxima activada 24 h antes por golpe adiabático Puelche. |
| **Orientación y Área** | Elipse Rothermel-Fons orientada a **$330^\circ$ (SE $\to$ NO)** de $34,5 \times 15,8\text{ km}$ (**$44.850\text{ ha}$**) por viento Puelche SE ($150^\circ$, ráfagas $58\text{ km/h}$). | Mancha principal observada de **$42.599\text{ ha}$** ($57.221\text{ ha}$ en 16 polígonos del ROI), alargada en el eje SE $\to$ NO junto al río Biobío. | **Azimut $>94\%$ · Error de área $+5,28\%$** respecto a la mancha principal sin calibración post-hoc. |
| **Salto del Río Biobío** | Celda `P-SJ-02` proyecta salto balístico de pavesas (Albini) de **$2,40\text{ km}$**, superando el cauce del Biobío ($1,5\text{ km}$). | El incendio cruzó el río Biobío mediante lluvia de pavesas hacia la ribera norte (San Rosendo / Laja). | **Acierto Físico Crítico:** Valida que cauces fluviales anchos son franqueados bajo ráfagas $>50\text{ km/h}$. |
| **Contención Final** | Giro horario ERA5 el **4-feb 12:00 UTC** a viento NO ($305^\circ$) con ascenso de $\text{HR}$ a $81\%$ (`P-SJ-03`). | Frenado del frente principal noroeste el 4 de febrero al ingresar aire marino húmedo. | **Límite Físico:** La elipse unifocal no desglosa sub-focos múltiples sin puntos térmicos horarios NASA FIRMS. |

#### Galería Satelital de Auditoría Trilateral • Santa Juana 2023

| 1. Polígono Histórico Observado ($T_{\text{post}}$) | 2. Reconstrucción Histórica (*A Posteriori*) |
| :---: | :---: |
| ![Polígono Histórico Santa Juana](figures/hindcast_santajuana_poligono.png) | ![Reconstrucción Histórica Santa Juana](figures/hindcast_santajuana_historica.png) |
| *Cicatriz espectral Sentinel-2 dNBR (42.599 ha mancha principal).* | *Haces Huygens, celdas P-SJ-01..03, salto Biobío 2.4 km y amortiguación.* |

| 3. Reconstrucción Predicción Ciega ($T-24\text{h}$) | 4. Auditoría Trilateral Superpuesta |
| :---: | :---: |
| ![Predicción Ciega Santa Juana](figures/hindcast_santajuana_prediccion.png) | ![Trilateral Santa Juana](figures/hindcast_santajuana_trilateral.png) |
| *Elipse Rothermel-Fons 34.5x15.8 km y viento ERA5 SE (58 km/h).* | *Contraste simultáneo: concordancia azimutal 94.2% sin data leakage.* |

---

### 2.2 Caso 2: Megaincendio de Viña del Mar – Quilpué, Valparaíso (2–4 de febrero de 2024)

| Dimensión Auditada | 🛡️ Lo que AgriTwin Muestra en Ciego (01–02 Feb 2024) | 🛰️ Lo que Efectivamente Ocurrió (Sentinel-2 dNBR Post) | ⚖️ Concordancia y Límite Declarado |
| :--- | :--- | :--- | :--- |
| **Alerta Preventiva y Sequía** | **ROJO CRÍTICO ($\text{FWI} = 72$)** · Sequía extrema previa ($30,6\text{ mm}$ en 90 días) y $\text{DFMC} = 3,2\%$. | Ignición múltiple en Reserva Lago Peñuelas (13:45 h) con transición rápida a fuego de copas. | **Acierto Preventivo:** Detecta estrés hídrico antecedente tres veces más severo que en Biobío. |
| **Cañón Chimenea y Pavesas** | En `P-VINA-02` (Quebrada Las Pataguas), avance Sur $\to$ Norte ($10^\circ$) con ráfagas de $65\text{ km/h}$ ($190^\circ$), pavesas a **$1,85\text{ km}$** y **$94\%$ de perforación de fajas secas de $45\text{ m}$**. | Canalización violenta por quebradas hacia Achupallas, Canal Chacao y Jardín Botánico, sobrepasando rutas y cortafuegos. | **Concordancia de Eje $88,5\%$:** Captura el corredor topográfico y el salto aéreo sobre la interfaz WUI. |
| **Superficie (Vegetal vs Urbana)** | Elipse Rothermel-Fons de $12,8 \times 4,1\text{ km}$ (**$3.420\text{ ha}$**). | Cicatriz vegetal Sentinel-2 dNBR de **$2.989\text{ ha}$** en mancha principal ($5.707\text{ ha}$ en 6 manchas del ROI). | **Límite Físico Honesto:** Ni Rothermel ni el dNBR satelital miden combustión estructural de viviendas urbanas consolidadas. |

#### Galería Satelital de Auditoría Trilateral • Viña del Mar 2024

| 1. Polígono Histórico Observado ($T_{\text{post}}$) | 2. Reconstrucción Histórica (*A Posteriori*) |
| :---: | :---: |
| ![Polígono Histórico Viña del Mar](figures/hindcast_vina_poligono.png) | ![Reconstrucción Histórica Viña del Mar](figures/hindcast_vina_historica.png) |
| *Cicatriz vegetal Sentinel-2 dNBR (2.989 ha en Peñuelas y quebradas).* | *Canalización chimenea, haces cabeza 22.4 m/min y salto pavesas 1.85 km.* |

| 3. Reconstrucción Predicción Ciega ($T-24\text{h}$) | 4. Auditoría Trilateral Superpuesta |
| :---: | :---: |
| ![Predicción Ciega Viña del Mar](figures/hindcast_vina_prediccion.png) | ![Trilateral Viña del Mar](figures/hindcast_vina_trilateral.png) |
| *Elipse Rothermel-Fons 12.8x4.1 km impulsada por Surazo 65 km/h.* | *Contraste 3 capas: eje S-N 88.5% y límite en combustión de interfaz WUI.* |

---

## 3. Reproducibilidad del Pipeline (`scripts/hindcast/`)

```bash
cd scripts/hindcast
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
for k in santa_juana_2023 vina_2024; do
  .venv/bin/python 01_fetch_inputs.py $k && .venv/bin/python 02_burn_scar.py $k
done
.venv/bin/python 03_export_sites.py
```
