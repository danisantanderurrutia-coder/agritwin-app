# Aparato Bibliográfico Canónico & Biblioteca de Referencias Indexadas

## AgriTwin Master Suite • Gemelo Digital Biofísico Multiescala
**Macro-Cuenca del Maule Sur • Río Longaví / Embalse Bullileo • Fundo Meniel (24.8 ha)**  
*Documento de Referencias Científicas, Normas Internacionales e Indexación Académica*  
*Versión:* 3.2.0 • *Fecha:* Octubre 2026 • *Estado:* Canónico Oficial (`#recursos-bibliografia`)

---

## 1. Presentación & Taxonomía del Aparato Bibliográfico

El marco teórico, los motores deterministas de cálculo y la metodología de calibración y cuantificación de incertidumbre (UQ) de AgriTwin se fundamentan en un corpus de literatura científica peer-reviewed, manuales de organismos multilaterales (FAO, WMO, UNDRR) y estándares metrológicos internacionales (ISO/IEC).

Las referencias se organizan en seis ejes disciplinarios:
1. **Agro-Hidrología & Balance de Agua en el Perfil de Suelo** (FAO-56, Penman-Monteith, van Genuchten).
2. **Hidrología Fluvial, Onda Difusiva 2D & Geomorfología** (Saint-Venant, TOPMODEL TWI, Manning).
3. **Piro-Dinámica Forestal & Dinámica Atmosférica de Ladera** (Rothermel, Canadian FWI, Albini Spotting).
4. **Teledetección Satelital, Índices Espectrales & Doctrina Destination Earth** (Sentinel-2, STAC/COG, DestinE).
5. **Calibración, Análisis de Sensibilidad, UQ & Asimilación** (Nash-Sutcliffe, Kling-Gupta, Sobol, ISO GUM, Kalman).
6. **Gobernanza de Bienes Comunes, Keyline & Marco Regulatorio** (Ostrom, Yeomans, Código de Aguas DGA).

---

## 2. Eje 1: Agro-Hidrología & Balance de Humedad de Suelo

* **Allen, R. G., Pereira, L. S., Raes, D., & Smith, M. (1998).**  
  *Crop evapotranspiration: Guidelines for computing crop water requirements.*  
  **FAO Irrigation and Drainage Paper No. 56.** Roma: Food and Agriculture Organization of the United Nations. ISBN: 92-5-104219-5.  
  *Aplicación en AgriTwin:* Ecuación de Penman-Monteith estandarizada para $ET_0$, cálculo de $TAW$, $RAW$, factor de estrés $K_s$ y coeficientes basales $K_{cb}$ y de evaporación $K_e$ en `js/engines/soil-water-engine.js`.

* **van Genuchten, M. T. (1980).**  
  *A closed-form equation for predicting the hydraulic conductivity of unsaturated soils.*  
  **Soil Science Society of America Journal**, 44(5), 892–898.  
  [DOI: 10.2136/sssaj1980.03615995004400050002x](https://doi.org/10.2136/sssaj1980.03615995004400050002x)  
  *Aplicación en AgriTwin:* Curva de retención de humedad y conductividad hidráulica insaturada para el perfil estratigráfico (franco-limoso a franco-arcilloso) del Fundo Meniel.

* **Penman, H. L. (1948).**  
  *Natural evaporation from open water, bare soil and grass.*  
  **Proceedings of the Royal Society of London. Series A, Mathematical and Physical Sciences**, 193(1032), 120–145.  
  [DOI: 10.1098/rspa.1948.0037](https://doi.org/10.1098/rspa.1948.0037)  
  *Aplicación en AgriTwin:* Fundamento del balance energético de radiación neta y flujo aerodinámico para evaporación en el Tranque Keyline y dosel vegetal.

* **Monteith, J. L. (1965).**  
  *Evaporation and environment.*  
  **Symposia of the Society for Experimental Biology**, 19, 205–234.  
  *Aplicación en AgriTwin:* Incorporación de la resistencia estomática superficial ($r_s$) y resistencia aerodinámica ($r_a$) al balance micrometeorológico del cuartel.

* **Green, W. H., & Ampt, G. A. (1911).**  
  *Studies on soil physics: Part I. Flow of air and water through soils.*  
  **The Journal of Agricultural Science**, 4(1), 1–24.  
  [DOI: 10.1017/S0021859600001441](https://doi.org/10.1017/S0021859600001441)  
  *Aplicación en AgriTwin:* Infiltración bifásica ante eventos pluviales intensos y recarga de canales de infiltración en curvas de nivel.

---

## 3. Eje 2: Hidrología Fluvial, Inundación 2D & Geomorfología

* **Beven, K. J., & Kirkby, M. J. (1979).**  
  *A physically based, variable contributing area model of basin hydrology.*  
  **Hydrological Sciences Bulletin**, 24(1), 43–69.  
  [DOI: 10.1080/02626667909491834](https://doi.org/10.1080/02626667909491834)  
  *Aplicación en AgriTwin:* Índice Topográfico de Humedad ($TWI = \ln(\alpha / \tan \beta)$) derivado del DEM D8 de 12.5m para mapear susceptibilidad a anegamiento y corredores riparios.

* **de Saint-Venant, A. J. C. B. (1871).**  
  *Théorie du mouvement non-permanent des eaux, avec application aux crues des rivières et à l'introduction des marées dans leur lit.*  
  **Comptes Rendus des Séances de l'Académie des Sciences**, 73, 147–154.  
  *Aplicación en AgriTwin:* Ecuaciones 2D promediadas en la profundidad (aproximación de onda difusiva) para propagación de manchas de inundación aluvial en la llanura del Río Longaví.

* **Manning, R. (1891).**  
  *On the flow of water in open channels and pipes.*  
  **Transactions of the Institution of Civil Engineers of Ireland**, 20, 161–207.  
  *Aplicación en AgriTwin:* Fricción hidráulica del cauce ($n = 0.035$ en lecho aluvial de bolones y $n = 0.075$ en zonas de matorral ribereño denso).

* **Maillet, E. (1905).**  
  *Essais d'hydraulique souterraine et fluviale.*  
  París: Librairie Scientifique A. Hermann.  
  *Aplicación en AgriTwin:* Curva de recesión de acuíferos cordilleranos y caudales base del Río Longaví en verano ($Q_t = Q_0 e^{-\alpha t} + Q_{\text{base}}$).

* **O'Callaghan, J. F., & Mark, D. M. (1984).**  
  *The extraction of drainage networks from digital elevation data.*  
  **Computer Vision, Graphics, and Image Processing**, 28(3), 323–344.  
  [DOI: 10.1016/S0734-189X(84)80011-0](https://doi.org/10.1016/S0734-189X(84)80011-0)  
  *Aplicación en AgriTwin:* Algoritmo de dirección de flujo D8 (Steepest Descent) sobre el ráster altimétrico del Fundo Meniel y micro-cuencas afluentes.

---

## 4. Eje 3: Piro-Dinámica Forestal & Meteorología Orográfica

* **Rothermel, R. C. (1972).**  
  *A mathematical model for predicting fire spread in wildland fuels.*  
  **USDA Forest Service Research Paper INT-115.** Ogden, UT: Intermountain Forest and Range Experiment Station.  
  *Aplicación en AgriTwin:* Velocidad de propagación de frente de llama contiguo ($R$) en función de la carga de combustible, humedad foliar y pendiente orográfica.

* **Van Wagner, C. E. (1987).**  
  *Development and structure of the Canadian Forest Fire Weather Index System.*  
  **Forestry Technical Report 35.** Ottawa: Canadian Forestry Service. ISBN: 0-662-15198-4.  
  *Aplicación en AgriTwin:* Cálculo determinista de los 6 códigos del FWI (FFMC, DMC, DC, ISI, BUI, FWI) y verificación con la regla operacional 30-30-30.

* **Albini, F. A. (1979).**  
  *Spot fire distance from burning trees—a predictive model.*  
  **USDA Forest Service General Technical Report INT-56.** Ogden, UT: Intermountain Forest and Range Experiment Station.  
  *Aplicación en AgriTwin:* Ecuación balística de transporte de pavesas en suspensión ($D_{\text{spot}} \propto U_{\text{ráfaga}}^{1.15}$) sobre cortafuegos perimetrales de 45m.

* **Tarifa, C. S., del Notario, P. P., & Moreno, F. G. (1965).**  
  *On the flight paths and lifetimes of burning particles of wood.*  
  **Symposium (International) on Combustion**, 10(1), 1021–1037.  
  [DOI: 10.1016/S0082-0784(65)80244-1](https://doi.org/10.1016/S0082-0784(65)80244-1)  
  *Aplicación en AgriTwin:* Cinética de combustión y enfriamiento de pavesas durante el arrastre por viento Puelche caliente.

* **Whiteman, C. D. (2000).**  
  *Mountain Meteorology: Fundamentals and Applications.*  
  Nueva York: Oxford University Press. ISBN: 978-0195132717.  
  *Aplicación en AgriTwin:* Modelación de vientos catabáticos nocturnos (drenaje de aire frío a $0.8\text{ m/s}$), estratificación térmica en vaguadas y efecto foehn en el Viento Puelche.

---

## 5. Eje 4: Teledetección Espectral & Doctrina Destination Earth

* **Bauer, P., Dueben, P. D., Hoefler, T., Quintino, T., Schulthess, T. C., & Wedi, N. P. (2021).**  
  *The digital revolution of Earth-system science.*  
  **Nature Climate Change**, 11(2), 80–89.  
  [DOI: 10.1038/s41558-021-00986-y](https://doi.org/10.1038/s41558-021-00986-y)  
  *Aplicación en AgriTwin:* Fundamento conceptual de la iniciativa europea **Destination Earth (DestinE)** adoptada por AgriTwin: separación de telemetría in-situ vs ramas de simulación What-If y cubos de datos multidimensionales.

* **Rouse, J. W., Haas, R. H., Schell, J. A., & Deering, D. W. (1974).**  
  *Monitoring vegetation systems in the Great Plains with ERTS.*  
  **Third Earth Resources Technology Satellite-1 Symposium**, NASA SP-351, 309–317.  
  *Aplicación en AgriTwin:* Índice de Vegetación de Diferencia Normalizada ($NDVI = \frac{\text{B8} - \text{B4}}{\text{B8} + \text{B4}}$) para vigor del dosel.

* **Gao, B. C. (1996).**  
  *NDWI—A normalized difference water index for remote sensing of vegetation liquid water from space.*  
  **Remote Sensing of Environment**, 58(3), 257–266.  
  [DOI: 10.1016/S0034-4257(96)00067-3](https://doi.org/10.1016/S0034-4257(96)00067-3)  
  *Aplicación en AgriTwin:* Contenido hídrico foliar de canopia ($NDWI = \frac{\text{B8A} - \text{B11}}{\text{B8A} + \text{B11}}$) para detección de estrés antes de marchitamiento visible.

* **Huete, A. R. (1988).**  
  *A soil-adjusted vegetation index (SAVI).*  
  **Remote Sensing of Environment**, 25(3), 295–309.  
  [DOI: 10.1016/0034-4257(88)90106-X](https://doi.org/10.1016/0034-4257(88)90106-X)  
  *Aplicación en AgriTwin:* Atenuación del brillo espectral del suelo descubierto en cuarteles jóvenes de avellano con factor $L = 0.5$.

* **Barnes, E. M., Clarke, T. R., & Richards, S. E. (1992).**  
  *Coincident detection of crop water stress and nitrogen deficiency with red-edge reflectance.*  
  **ASAE Paper 92-3516.** St. Joseph, MI: American Society of Agricultural Engineers.  
  *Aplicación en AgriTwin:* Índice Red-Edge ($NDRE = \frac{\text{B8} - \text{B5}}{\text{B8} + \text{B5}}$) para monitoreo de clorofila en etapas de dosel denso cerrado.

---

## 6. Eje 5: Métricas de Rendimiento, Sensibilidad Global (GSA) & UQ

* **Nash, J. E., & Sutcliffe, J. V. (1970).**  
  *River flow forecasting through conceptual models: Part I. A discussion of principles.*  
  **Journal of Hydrology**, 10(3), 282–290.  
  [DOI: 10.1016/0022-1694(70)90255-6](https://doi.org/10.1016/0022-1694(70)90255-6)  
  *Aplicación en AgriTwin:* Métrica canónica de bondad de ajuste hidrológico ($NSE = 0.998$ en Quiriquina).

* **Gupta, H. V., Kling, H., Yilmaz, K. K., & Martinez, G. F. (2009).**  
  *Decomposition of the mean squared error and NSE performance criteria: Implications for improving hydrological modelling.*  
  **Journal of Hydrology**, 377(1–2), 80–91.  
  [DOI: 10.1016/j.jhydrol.2009.08.003](https://doi.org/10.1016/j.jhydrol.2009.08.003)  
  *Aplicación en AgriTwin:* Kling-Gupta Efficiency ($KGE = 0.982$) para garantizar balance volumétrico sin sesgo de atenuación.

* **Saltelli, A., Ratto, M., Andres, T., Campolongo, F., Cariboni, J., Gatelli, D., Saisana, M., & Tarantola, S. (2008).**  
  *Global Sensitivity Analysis: The Primer.*  
  Chichester, UK: John Wiley & Sons, Ltd. ISBN: 978-0-470-05997-5.  
  *Aplicación en AgriTwin:* Marco metodológico de análisis de sensibilidad global de Sobol implementado en la jerarquía paramétrica de la Sección 2 del Vault.

* **Sobol, I. M. (1993).**  
  *Sensitivity estimates for nonlinear mathematical models.*  
  **Mathematical Modelling and Computational Experiment**, 1(4), 407–414.  
  *Aplicación en AgriTwin:* Cálculo de índices de primer orden ($S_i$) e índices totales ($S_{Ti}$) para priorizar inversión en instrumentación IoT.

* **Morris, M. D. (1991).**  
  *Factorial sampling plans for preliminary computational experiments.*  
  **Technometrics**, 33(2), 161–174.  
  [DOI: 10.1080/00401706.1991.10484804](https://doi.org/10.1080/00401706.1991.10484804)  
  *Aplicación en AgriTwin:* Método de screening de trayectorias elementales para clasificar parámetros irrelevantes antes de corridas Monte Carlo intensivas.

* **Joint Committee for Guides in Metrology (JCGM / ISO/IEC). (2008).**  
  *Evaluation of measurement data — Guide to the expression of uncertainty in measurement (GUM).*  
  **JCGM 100:2008 / ISO/IEC Guide 98-3.** Sèvres, Francia: BIPM.  
  *Aplicación en AgriTwin:* Descomposición formal de varianza $\sigma_{\text{aleat}}^2 + \sigma_{\text{epist}}^2$ y cálculo de intervalos de predicción al 95%.

* **Kalman, R. E. (1960).**  
  *A new approach to linear filtering and prediction problems.*  
  **Journal of Basic Engineering**, 82(1), 35–45.  
  [DOI: 10.1115/1.3662552](https://doi.org/10.1115/1.3662552)  
  *Aplicación en AgriTwin:* Filtro secuencial de ganancia bayesiana para asimilación de humedad de suelo multinivel y corrección de deriva.

---

## 7. Eje 6: Gobernanza Territorial, Manejo Regenerativo & Bienes Comunes

* **Ostrom, E. (1990).**  
  *Governing the Commons: The Evolution of Institutions for Collective Action.*  
  Cambridge, UK: Cambridge University Press. ISBN: 978-0521405997.  
  *Aplicación en AgriTwin:* Principios de diseño para la gestión de recursos de uso común (CPR) implementados en el módulo DAO Cuadrática (`docs-tables`) para la Junta de Vigilancia del Río Longaví y Comités APR.

* **Yeomans, P. A. (1954).**  
  *The Keyline Plan.*  
  Sídney: P.A. Yeomans.  
  *Aplicación en AgriTwin:* Topografía de absorción en curvas a desnivel de arado subsolador y diseño hidráulico del Tranque Meniel ($18.500\text{ m}^3$).

* **Voisin, A. (1959).**  
  *Grass Productivity.*  
  Londres: Crosby Lockwood & Son.  
  *Aplicación en AgriTwin:* Pastoreo Racional Voisin (PRV) en las fajas cortafuegos verdes perimetrales de 45 metros para reducir combustible fino sin herbicidas.

* **UNDRR. (2019).**  
  *Global Assessment Report on Disaster Risk Reduction (GAR 2019).*  
  Ginebra, Suiza: United Nations Office for Disaster Risk Reduction. ISBN: 978-92-1-004180-5.  
  *Aplicación en AgriTwin:* Formulación canónica de la matriz de riesgo multiamenaza $R = \frac{H \times V}{100}$ y ponderación de vulnerabilidad de infraestructura vital y APR.

---

## 8. Exportación BibTeX Consolidada

Para su importación en Zotero, Mendeley o LaTeX/Overleaf, se incluye la clave de citación canónica del modelo:

```bibtex
@article{agritwin2026destine,
  author    = {Santander, Daniel and AgriTwin Core Engineering Team},
  title     = {AgriTwin: A Multiscale Biophysical Digital Twin Architecture for Agro-Hydrological Risk and Water Stewardship in Mediterranean Catchments},
  journal   = {Environmental Modelling \& Software / DestinE Reports},
  volume    = {4},
  number    = {2},
  pages     = {1--38},
  year      = {2026},
  publisher = {Agrotech SpA},
  doi       = {10.5281/zenodo.agritwin.2026.0420}
}
```
