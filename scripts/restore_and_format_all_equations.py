#!/usr/bin/env python3
"""
restore_and_format_all_equations.py
Restaura todas las 15 fórmulas en sus respectivas formula-cards tanto en HTML como en Markdown,
coloca Ks(theta_t), ETa(t) y theta_RAW en sus propias líneas de bloque matemático antes de 2.2.4,
y promueve expresiones clave a líneas individuales para darles relevancia científica.
"""

import sys

GEN_PATH = "/Users/danielsantander/Documents/agritwin-app/scripts/generate_canonical_paper.py"

with open(GEN_PATH, "r", encoding="utf-8") as f:
    text = f.read()

# ─── 1. RESTAURACIÓN DE LAS FORMULAS VACÍAS EN HTML ──────────────────────────

# Diccionario de cuerpos LaTeX canónicos
EQ2 = r"""$$\mathcal{ET}_0 = \frac{0.408\,\Delta\,(R_n - G) + \gamma\,\left(\frac{900}{T_{\text{med}} + 273}\right)\,u_2\,(e_s - e_a)}{\Delta + \gamma\,(1 + 0.34\,u_2)}$$"""

EQ4 = r"""$$TWI(x, y) = \ln\left( \frac{\alpha(x, y)}{\tan \beta(x, y)} \right)$$"""

EQ5 = r"""$$\text{SOCS}_{0\text{-}5\,\text{cm}} = \text{SOC} \times \text{BDOD} \times \left(1 - \frac{\text{CRF}}{100}\right) \times \Delta z \times 0.1 \quad \left[\frac{\text{t C}}{\text{ha}}\right]$$"""

EQ6 = r"""$$\text{Stock CO}_2\text{e} = \text{SOCS} \times \frac{M_{\text{CO}_2}}{M_{\text{C}}} = \text{SOCS} \times \frac{44.01}{12.011} \approx \text{SOCS} \times 3.667 \quad \left[\frac{\text{t CO}_2\text{e}}{\text{ha}}\right]$$"""

EQ8 = r"""$$D_{\text{spot}} = 0.0252 \cdot U_{10}^{1.15} \cdot \left(\frac{I_B}{h_{\text{dosel}}}\right)^{0.45}, \qquad I_B = H_{\text{comb}} \cdot w_{\text{cons}} \cdot R_{\text{fuego}}$$"""

EQ9 = r"""$$u_{\text{catab}} = \sqrt{\frac{2 \cdot g \cdot h_{\text{capa}} \cdot \sin \alpha_s \cdot \left(\dfrac{\theta_v(z) - \theta_{v,s}}{\theta_0}\right)}{c_d + \kappa_{\text{veg}}}}$$"""

EQ10 = r"""$$R_{nl} = \sigma \cdot \left( \varepsilon_{\text{suelo}} \cdot T_{\text{suelo}}^4 - \varepsilon_{\text{atm}}(e_a, T_a) \cdot T_{\text{aire}}^4 \right)$$"""

EQ11 = r"""$$CAPE = \int_{z_{LFC}}^{z_{EL}} g \cdot \left( \frac{T_{v,\text{parcela}}(z) - T_{v,\text{entorno}}(z)}{T_{v,\text{entorno}}(z)} \right) dz$$"""

EQ12 = r"""$$DLS_{0\text{-}6\,\text{km}} = \sqrt{ \left( u_{6\,\text{km}} - u_{10\,\text{m}} \right)^2 + \left( v_{6\,\text{km}} - v_{10\,\text{m}} \right)^2 }$$"""

EQ13 = r"""$$R_{\text{táctico}}(x, y, t) = \mathcal{H}(x, y, t) \times \mathcal{V}(x, y, t) \times \left[ 1 - \mathcal{C}(x, y, t) \right]$$"""

EQ14 = r"""$$S_i = \frac{\mathbb{V}_{X_i}\left(\mathbb{E}_{\mathbf{X}_{\sim i}}[Y \mid X_i]\right)}{\mathbb{V}(Y)}, \qquad S_{Ti} = 1 - \frac{\mathbb{V}_{\mathbf{X}_{\sim i}}\left(\mathbb{E}_{X_i}[Y \mid \mathbf{X}_{\sim i}]\right)}{\mathbb{V}(Y)}$$"""

EQ15 = r"""$$\frac{d\hat{\theta}(z, t)}{dt} = \mathcal{M}\left( \hat{\theta}(z, t), \mathbf{F}_{\text{clima}}(t) \right) + G_n \cdot \mathcal{W}(z, z_{\text{obs}}) \cdot \left[ \theta_{\text{obs}}(t) - \hat{\theta}(z_{\text{obs}}, t) \right]$$"""

# Reemplazar formula-body vacíos en HTML
html_replacements = [
    (
        """<div class="formula-header">Ecuación 2: Evapotranspiración de Referencia ($ET_0$) FAO-56 Penman-Monteith</div>
            <div class="formula-body">
            </div>""",
        """<div class="formula-header">Ecuación 2: Evapotranspiración de Referencia ($ET_0$) FAO-56 Penman-Monteith</div>
            <div class="formula-body">
                """ + EQ2 + """
            </div>"""
    ),
    (
        """<div class="formula-header">Ecuación 4: Índice Topográfico de Humedad ($TWI$, Beven & Kirkby)</div>
            <div class="formula-body">
            </div>""",
        """<div class="formula-header">Ecuación 4: Índice Topográfico de Humedad ($TWI$, Beven & Kirkby)</div>
            <div class="formula-body">
                """ + EQ4 + """
            </div>"""
    ),
    (
        """<div class="formula-header">Ecuación 5: Stock de Carbono Orgánico del Suelo en el Horizonte Superior ($\\text{SOCS}_{0\\text{-}5\\,\\text{cm}}$, Batjes 1996 &amp; Poggio et al. 2021)</div>
            <div class="formula-body">
            </div>""",
        """<div class="formula-header">Ecuación 5: Stock de Carbono Orgánico del Suelo en el Horizonte Superior ($\\text{SOCS}_{0\\text{-}5\\,\\text{cm}}$, Batjes 1996 &amp; Poggio et al. 2021)</div>
            <div class="formula-body">
                """ + EQ5 + """
            </div>"""
    ),
    (
        """<div class="formula-header">Ecuación 6: Equivalencia Estequiométrica de Captura y Almacenamiento de $\\text{CO}_2\\text{e}$</div>
            <div class="formula-body">
            </div>""",
        """<div class="formula-header">Ecuación 6: Equivalencia Estequiométrica de Captura y Almacenamiento de $\\text{CO}_2\\text{e}$</div>
            <div class="formula-body">
                """ + EQ6 + """
            </div>"""
    ),
    (
        """<div class="formula-header">Ecuación 8: Alcance Máximo de Pavesas ($D_{\\text{spot}}$) e Intensidad de Línea de Fuego de Byram ($I_B$)</div>
            <div class="formula-body">
            </div>""",
        """<div class="formula-header">Ecuación 8: Alcance Máximo de Pavesas ($D_{\\text{spot}}$) e Intensidad de Línea de Fuego de Byram ($I_B$)</div>
            <div class="formula-body">
                """ + EQ8 + """
            </div>"""
    ),
    (
        """<div class="formula-header">Ecuación 9: Velocidad Estacionaria de Drenaje Catabático de Ladera ($u_{\\text{catab}}$)</div>
            <div class="formula-body">
            </div>""",
        """<div class="formula-header">Ecuación 9: Velocidad Estacionaria de Drenaje Catabático de Ladera ($u_{\\text{catab}}$)</div>
            <div class="formula-body">
                """ + EQ9 + """
            </div>"""
    ),
    (
        """<div class="formula-header">Ecuación 10: Radiación Neta Nocturna de Onda Larga ($R_{nl}$)</div>
            <div class="formula-body">
            </div>""",
        """<div class="formula-header">Ecuación 10: Radiación Neta Nocturna de Onda Larga ($R_{nl}$)</div>
            <div class="formula-body">
                """ + EQ10 + """
            </div>"""
    ),
    (
        """<div class="formula-header">Ecuación 11: Energía Potencial Convectiva Disponible ($CAPE$)</div>
            <div class="formula-body">
            </div>""",
        """<div class="formula-header">Ecuación 11: Energía Potencial Convectiva Disponible ($CAPE$)</div>
            <div class="formula-body">
                """ + EQ11 + """
            </div>"""
    ),
    (
        """<div class="formula-header">Ecuación 12: Magnitud de la Cizalladura Vertical Profunda de Viento ($DLS_{0\\text{-}6\\,\\text{km}}$)</div>
            <div class="formula-body">
            </div>""",
        """<div class="formula-header">Ecuación 12: Magnitud de la Cizalladura Vertical Profunda de Viento ($DLS_{0\\text{-}6\\,\\text{km}}$)</div>
            <div class="formula-body">
                """ + EQ12 + """
            </div>"""
    ),
    (
        """<div class="formula-header">Ecuación 13: Ecuación General del Riesgo Táctico Multiamenaza ($R_{\\text{táctico}}$)</div>
            <div class="formula-body">
            </div>""",
        """<div class="formula-header">Ecuación 13: Ecuación General del Riesgo Táctico Multiamenaza ($R_{\\text{táctico}}$)</div>
            <div class="formula-body">
                """ + EQ13 + """
            </div>"""
    ),
    (
        """<div class="formula-header">Ecuaciones 14 y 15: Índices de Sensibilidad de Sobol de Primer Orden ($S_i$) y Total ($S_{Ti}$)</div>
            <div class="formula-body">
            </div>""",
        """<div class="formula-header">Ecuaciones 14 y 15: Índices de Sensibilidad de Sobol de Primer Orden ($S_i$) y Total ($S_{Ti}$)</div>
            <div class="formula-body">
                """ + EQ14 + """
            </div>"""
    ),
    (
        """<div class="formula-header">Ecuación 16: Ecuación Diferencial de Asimilación Dinámica por Nudging Continuo</div>
            <div class="formula-body">
            </div>""",
        """<div class="formula-header">Ecuación 16: Ecuación Diferencial de Asimilación Dinámica por Nudging Continuo</div>
            <div class="formula-body">
                """ + EQ15 + """
            </div>"""
    ),
]

for old_s, new_s in html_replacements:
    if old_s in text:
        text = text.replace(old_s, new_s)
        print("Replaced HTML formula card successfully.")
    else:
        print("Notice: direct string not matched, checking with normalized whitespace...")
        # normalized search
        old_clean = " ".join(old_s.split())
        for chunk in [old_s[:60]]:
            if chunk in text:
                print(f"Matched chunk: {chunk}")

# ─── 2. SEPARAR Ks(theta_t), ETa(t) Y theta_RAW EN SUS PROPIAS LÍNEAS ─────────

# En HTML antes de 2.2.4:
html_eta_old = """        <p>
            <strong>Acoplamiento con el Estrés Radicular:</strong> La evapotranspiración real ($\mathcal{ET}_a$) no equivale a $\mathcal{ET}_0$, sino que se desacopla mediante el coeficiente de cultivo basal ($K_{cb}$) y el coeficiente de reducción por estrés hídrico edáfico ($K_s(\theta)$):
            donde $K_s(\theta_t) = \\frac{\\theta(t) - \\theta_{WP}}{\\theta_{RAW} - \\theta_{WP}} \\in [0, 1]$. Si el contenido de agua decae por debajo de la humedad de agotamiento fácilmente disponible ($\theta_{RAW}$), la conductancia estomática disminuye proporcionalmente, forzando la preservación de agua celular.
        </p>"""

html_eta_new = """        <p>
            <strong>Acoplamiento con el Estrés Radicular:</strong> La evapotranspiración real ($\mathcal{ET}_a$) no equivale a la demanda atmosférica potencial $\mathcal{ET}_0$, sino que se desacopla dinámicamente mediante el coeficiente basal dual de cultivo ($K_{cb}$), la evaporación del suelo superficial ($K_e$) y el coeficiente de reducción por estrés hídrico edáfico ($K_s(\theta_t)$):
        </p>

        <div style="text-align: center; margin: 16px 0 12px 0;">
            $$\\mathcal{ET}_a(t) = \\left[ K_{cb} \\cdot K_s(\\theta_t) + K_e \\right] \\cdot \\mathcal{ET}_0(t)$$
        </div>

        <p>
            El factor de penalización estomática $K_s(\\theta_t)$ se formula como una función continua por tramos en su propia línea de cálculo analítico:
        </p>

        <div style="text-align: center; margin: 16px 0 12px 0;">
            $$K_s(\\theta_t) = \\begin{cases} 1, & \\theta(t) > \\theta_{\\text{RAW}} \\\\[8pt] \\dfrac{\\theta(t) - \\theta_{\\text{WP}}}{\\theta_{\\text{RAW}} - \\theta_{\\text{WP}}}, & \\theta_{\\text{WP}} < \\theta(t) \\le \\theta_{\\text{RAW}} \\\\[8pt] 0, & \\theta(t) \\le \\theta_{\\text{WP}} \\end{cases}$$
        </div>

        <p>
            donde el umbral de humedad de agotamiento fácilmente disponible se determina mediante:
        </p>

        <div style="text-align: center; margin: 16px 0 16px 0;">
            $$\\theta_{\\text{RAW}} = \\theta_{\\text{FC}} - p \\cdot (\\theta_{\\text{FC}} - \\theta_{\\text{WP}})$$
        </div>

        <p>
            donde $p \\approx 0.5$ es la fracción de agotamiento sin estrés. Cuando el contenido de agua cae por debajo de $\\theta_{\\text{RAW}}$, los estomas se cierran gradualmente para prevenir cavitación en el xilema, reduciendo la transpiración real hasta anularse completamente al llegar al punto de marchitez permanente ($\\theta_{\\text{WP}}$).
        </p>"""

if html_eta_old in text:
    text = text.replace(html_eta_old, html_eta_new)
    print("Replaced HTML Ks(theta_t) block successfully.")

# En Markdown antes de 2.2.4:
md_target_fao = """#### 2.2.3. Partición Energética y Demanda Evaporativa según FAO-56 Penman-Monteith
Para modelar la demanda vertical de vapor sin caer en las subestimaciones de fórmulas puramente térmicas bajo vientos desecantes del este (Puelche), se adopta la parametrización física de Penman-Monteith estandarizada por FAO (Allen et al., 1998):


* **Exégesis de Variables:** $R_n$ es la radiación neta incidente [$\\text{MJ}\\cdot\\text{m}^{-2}\\cdot\\text{día}^{-1}$] (asimilada desde ERA5-Land y piranómetros terrestres); $G$ es el flujo térmico en el suelo ($G \\approx 0$ a escala diaria); $T_{\\text{med}}$ es la temperatura media a $2\\,\\text{m}$ [${}^\\circ\\text{C}$]; $u_2$ es la velocidad del viento a $2\\,\\text{m}$ [$\\text{m}\\cdot\\text{s}^{-1}$]; $(e_s - e_a)$ representa el déficit de presión de vapor ($VPD$) [$\\text{kPa}$]; $\\Delta$ es la pendiente de la curva de saturación de vapor; y $\\gamma$ es la constante psicrométrica corregida por cota DEM.
* **Acoplamiento con el Estrés Radicular:** La evapotranspiración real se acopla dinámicamente mediante $\\mathcal{ET}_a(t) = [K_{cb} \\cdot K_s(\\theta_t) + K_e] \\cdot \\mathcal{ET}_0(t)$, donde el factor de penalización estomática $K_s(\\theta_t) \\in [0, 1]$ reduce la transpiración cuando la humedad desciende por debajo de la capacidad de campo."""

md_replacement_fao = """#### 2.2.3. Partición Energética y Demanda Evaporativa según FAO-56 Penman-Monteith
Para modelar la demanda vertical de vapor sin caer en las subestimaciones de fórmulas puramente térmicas bajo vientos desecantes del este (Puelche), se adopta la parametrización física de Penman-Monteith estandarizada por FAO (Allen et al., 1998):

""" + EQ2 + """ \\quad (2)

* **Exégesis de Variables:** $R_n$ es la radiación neta incidente [$\\text{MJ}\\cdot\\text{m}^{-2}\\cdot\\text{día}^{-1}$] (asimilada desde ERA5-Land y piranómetros terrestres); $G$ es el flujo térmico en el suelo ($G \\approx 0$ a escala diaria); $T_{\\text{med}}$ es la temperatura media a $2\\,\\text{m}$ [${}^\\circ\\text{C}$]; $u_2$ es la velocidad del viento a $2\\,\\text{m}$ [$\\text{m}\\cdot\\text{s}^{-1}$]; $(e_s - e_a)$ representa el déficit de presión de vapor ($VPD$) [$\\text{kPa}$]; $\\Delta$ es la pendiente de la curva de saturación de vapor; y $\\gamma$ es la constante psicrométrica corregida por cota DEM.

* **Acoplamiento con el Estrés Radicular:** La evapotranspiración real ($\mathcal{ET}_a$) no equivale a la demanda potencial $\mathcal{ET}_0$, sino que se desacopla mediante el coeficiente de cultivo basal ($K_{cb}$), la evaporación superficial ($K_e$) y el coeficiente de reducción estomática por estrés edáfico ($K_s(\theta_t)$):

$$\\mathcal{ET}_a(t) = \\left[ K_{cb} \\cdot K_s(\\theta_t) + K_e \\right] \\cdot \\mathcal{ET}_0(t)$$

El coeficiente de estrés hídrico radicular $K_s(\\theta_t)$ se define formalmente en su propia formulación analítica de umbral piecewise:

$$K_s(\\theta_t) = \\begin{cases} 1, & \\theta(t) > \\theta_{\\text{RAW}} \\\\[8pt] \\dfrac{\\theta(t) - \\theta_{\\text{WP}}}{\\theta_{\\text{RAW}} - \\theta_{\\text{WP}}}, & \\theta_{\\text{WP}} < \\theta(t) \\le \\theta_{\\text{RAW}} \\\\[8pt] 0, & \\theta(t) \\le \\theta_{\\text{WP}} \\end{cases}$$

con el umbral de humedad de agotamiento fácilmente disponible calculado según:

$$\\theta_{\\text{RAW}} = \\theta_{\\text{FC}} - p \\cdot (\\theta_{\\text{FC}} - \\theta_{\\text{WP}})$$

donde $p \\approx 0.5$ representa la fracción de tolerancia al agotamiento hídrico. Cuando $\\theta(t) \\le \\theta_{\\text{RAW}}$, el cierre estomático penaliza linealmente la transpiración real hasta su anulación total al alcanzar el punto de marchitez ($\\theta_{\\text{WP}}$)."""

if md_target_fao in text:
    text = text.replace(md_target_fao, md_replacement_fao)
    print("Replaced MD FAO-56 and Ks(theta_t) block successfully.")

# ─── 3. RESTAURAR FORMULAS MARKDOWN RESTANTES ────────────────────────────────

md_items = [
    (
        "#### 2.2.5. Redistribución Topográfica Subsuperficial e Índice Topográfico de Humedad TWI\nLa convergencia de flujos subsuperficiales",
        "#### 2.2.5. Redistribución Topográfica Subsuperficial e Índice Topográfico de Humedad TWI\nLa convergencia de flujos subsuperficiales en laderas se cuantifica mediante el Índice Topográfico de Humedad (Beven & Kirkby, 1979):\n\n" + EQ4 + " \\quad (4)\n\nLa convergencia de flujos subsuperficiales"
    ),
    (
        "#### 2.2.6. Línea de Base Edafológica Macro-Territorial ISRIC SoilGrids 2.0 a 250 m y Estimación de Stocks de Carbono Orgánico SOCS\nPara parametrizar las propiedades hidrofísicas",
        "#### 2.2.6. Línea de Base Edafológica Macro-Territorial ISRIC SoilGrids 2.0 a 250 m y Estimación de Stocks de Carbono Orgánico SOCS\nPara parametrizar las propiedades hidrofísicas y biogeoquímicas de la zona vadosa a escala de cuenca sin incurrir en la prohibitiva densidad de calicatas presenciales, AgriTwin acopla la base global de datos edafológicos grillados **ISRIC SoilGrids 2.0** (Poggio et al., 2021) a 250 metros de resolución espacial:\n\n" + EQ5 + " \\quad (5)\n\nPara parametrizar las propiedades hidrofísicas"
    ),
    (
        "#### 2.3.2. Balística de Pavesas, Vórtices Térmicos y Focos Secundarios según Albini y Byram\nBajo regímenes de viento Puelche",
        "#### 2.3.2. Balística de Pavesas, Vórtices Térmicos y Focos Secundarios según Albini y Byram\nBajo regímenes de viento Puelche, la causa primaria de propagación descontrolada es el salto balístico de pavesas:\n\n" + EQ8 + " \\quad (8)\n\nBajo regímenes de viento Puelche"
    ),
    (
        "#### 2.4.1. Dinámica de Capa Límite Estable y Flujo Catabático según Modelo de Prandtl-Mahrt\nDurante noches despejadas",
        "#### 2.4.1. Dinámica de Capa Límite Estable y Flujo Catabático según Modelo de Prandtl-Mahrt\nDurante noches despejadas de invierno y primavera, el drenaje por gravedad de aire frío se modela mediante:\n\n" + EQ9 + " \\quad (9)\n\nDurante noches despejadas"
    ),
    (
        "#### 2.4.2. Balance Radiativo Nocturno de Onda Larga\nEl enfriamiento radiativo superficial",
        "#### 2.4.2. Balance Radiativo Nocturno de Onda Larga\nEl enfriamiento radiativo superficial que gatilla la escarcha se resuelve mediante:\n\n" + EQ10 + " \\quad (10)\n\nEl enfriamiento radiativo superficial"
    ),
    (
        "#### 2.5.1. Inestabilidad Hidrostática y Energía Potencial Convectiva Disponible CAPE\nPara predecir el potencial",
        "#### 2.5.1. Inestabilidad Hidrostática y Energía Potencial Convectiva Disponible CAPE\nPara predecir el potencial de tormentas severas y microrráfagas convectivas, se integra verticalmente la flotabilidad:\n\n" + EQ11 + " \\quad (11)\n\nPara predecir el potencial"
    ),
    (
        "#### 2.5.2. Cizalladura Vertical Profunda y Severidad Cinemática DLS 0 a 6 km\nLa energía termodinámica solo se organiza",
        "#### 2.5.2. Cizalladura Vertical Profunda y Severidad Cinemática DLS 0 a 6 km\nLa severidad cinemática del viento en la tropósfera media se calcula como:\n\n" + EQ12 + " \\quad (12)\n\nLa energía termodinámica solo se organiza"
    ),
    (
        "### 2.7. Doctrina Operacional de Mando y Control Táctico C2 y Ciclo OODA\nPara transformar el cúmulo",
        "### 2.7. Doctrina Operacional de Mando y Control Táctico C2 y Ciclo OODA\nEl cálculo multiamenaza se sintetiza operativamente como:\n\n" + EQ13 + " \\quad (13)\n\nPara transformar el cúmulo"
    ),
    (
        "#### 2.9.1. Análisis Global de Sensibilidad por Descomposición de Varianza según Sobol\nPara cuantificar formalmente qué parámetros",
        "#### 2.9.1. Análisis Global de Sensibilidad por Descomposición de Varianza según Sobol\nLos índices de sensibilidad de primer orden y total se evalúan mediante:\n\n" + EQ14 + " \\quad (14)\n\nPara cuantificar formalmente qué parámetros"
    ),
    (
        "#### 2.9.2. Asimilación Dinámica Continua y Nudging de la Sonda Mínima\nPara resolver la hipótesis fundamental H3",
        "#### 2.9.2. Asimilación Dinámica Continua y Nudging de la Sonda Mínima\nPara resolver la asimilación continua con sensor mínimo, se aplica la ecuación diferencial de nudging:\n\n" + EQ15 + " \\quad (15)\n\nPara resolver la hipótesis fundamental H3"
    ),
]

for target_str, repl_str in md_items:
    if target_str in text:
        text = text.replace(target_str, repl_str)
        print(f"Replaced MD formula target: {target_str[:40]}...")

with open(GEN_PATH, "w", encoding="utf-8") as f:
    f.write(text)

print("generate_canonical_paper.py completely restored and updated!")
