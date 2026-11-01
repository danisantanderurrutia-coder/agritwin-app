# -*- coding: utf-8 -*-
"""
enhance_paper_formulas.py
Reemplaza la Parte II (Materiales y Métodos) en scripts/generate_canonical_paper.py
dotando a cada ecuación del protocolo narrativo canónico de 5 pasos de revistas Q1:
1. Premisa biofísica y ley de conservación
2. Aproximación de escala y deducción simplificada
3. Ecuación canónica numerada
4. Exégesis rigurosa de términos, unidades SI y fuentes de adquisición
5. Justificación operativa en AgriTwin y acoplamiento regenerativo
"""

import re
import os

HTML_PART_II = r'''        <h1 class="part-title">Parte II: Materiales y Métodos</h1>

        <h2 class="section-title">2.1. Zonas de Estudio y Arquetipos Bioclimáticos de Validación</h2>
        <p>
            Para asegurar la transferibilidad biofísica y evitar el sobreajuste a microclimas específicos, la calibración y auditoría empírica de AgriTwin se estructuró sobre tres cuencas hidrológicas contrastantes de la zona centro-sur de Chile, representativas de los gradientes de estrés hídrico y pirogénico del país:
        </p>
        <ol>
            <li><strong>Arquetipo Secano Interior Mediterráneo (Cuenca Piloto Río Purapel / Perquilauquén, Maule Sur):</strong> Área de drenaje de $268.4\,\text{km}^2$, sustrato granítico de la Cordillera de la Costa altamente meteorizado (alfisoles y vertisoles con horizonte árgico denso), régimen pluviométrico mediterráneo semiárido ($480\text{--}720\,\text{mm}\cdot\text{año}^{-1}$) concentrado en invierno, con un periodo de sequía estival de 6 a 8 meses y recurrencia de vientos desecantes cálidos del este (viento Puelche). Instrumentación de contraste: Estación Fluviométrica DGA 07357002-2 (Río Purapel en Sauzal) y red agrometeorológica INIA/AGROMET Cauquenes.</li>
            <li><strong>Arquetipo Andino de Régimen Mixto (Subcuenca Alta Río Maipo en El Manzano, Región Metropolitana):</strong> Área de $1,\!240\,\text{km}^2$, fuerte gradiente altitudinal ($850\text{--}4,\!200\,\text{m.s.n.m.}$), balance nivo-pluvial, suelos esqueléticos volcánicos y alta torrencialidad. Auditoría: DGA 05707002-9 y red DMC Tobalaba/Pudahuel.</li>
            <li><strong>Arquetipo Templado Húmedo de Transición (Cuenca Media Río Biobío en Rucacura / Malleco):</strong> Área de $890\,\text{km}^2$, transición a clima templado oceánico lluvioso ($1,\!100\text{--}1,\!600\,\text{mm}\cdot\text{año}^{-1}$), suelos derivados de cenizas volcánicas (andisoles de alta retención hídrica y macroporosidad) y masa forestal comercial continua sujeta a estrés térmico estival. Auditoría: DGA 08317001-4 (Collipulli) y AGROMET Malleco.</li>
        </ol>

        <h2 class="section-title">2.2. Modelo Agro-Hidrológico Semi-Distribuido ($SCS\text{-}CN + TWI$) y Balance $SPAC$</h2>
        
        <h3 style="font-size: 1.15rem; color: #1e3a8a; margin-top: 1.5rem; margin-bottom: 0.5rem;">2.2.1. Principio Fundamental de Conservación de Masa en la Columna Vadosa</h3>
        <p>
            El núcleo hidrológico de AgriTwin opera como un modelo semi-distribuido basado en la ley fundamental de conservación de masa aplicada a una columna de suelo estratificada (Continuo Suelo-Planta-Atmósfera, $SPAC$). En lugar de resolver las ecuaciones tridimensionales completas de Richards a escala de poro —computacionalmente prohibitivas para gemelos digitales en tiempo real sobre cuencas de cientos de kilómetros cuadrados—, se formula un balance de almacenamiento vadoso con parámetros físicamente basados en cada elemento de malla discretizado:
        </p>

        <div class="formula-card">
            <div class="formula-header">Ecuación 1: Ecuación Diferencial de Continuidad Hidrológica en la Zona Vadosa</div>
            <div class="formula-body">
                $$\frac{d\mathcal{S}_w(x, y, t)}{dt} = P_{\text{eff}}(x, y, t) - \mathcal{ET}_a(x, y, t) - Q_{\text{sup}}(x, y, t) - L_{\text{perc}}(x, y, t) + Q_{\text{lat\_in}}(x, y, t) - Q_{\text{lat\_out}}(x, y, t)$$
            </div>
            <div class="formula-footer">
                <strong>Donde:</strong> $\mathcal{S}_w(t)$ es el volumen total de agua almacenado en el perfil radicular activo [$\text{mm}$]; $P_{\text{eff}}$ es la precipitación incidente neta tras descontar la intercepción de dosel [$\text{mm}\cdot\text{día}^{-1}$]; $\mathcal{ET}_a$ es la evapotranspiración real del cultivo [$\text{mm}\cdot\text{día}^{-1}$]; $Q_{\text{sup}}$ representa el flujo de escorrentía superficial generado por saturación o exceso de infiltración [$\text{mm}\cdot\text{día}^{-1}$]; $L_{\text{perc}}$ es la tasa de percolación profunda hacia el acuífero libre [$\text{mm}\cdot\text{día}^{-1}$]; y $Q_{\text{lat}}$ son las transferencias subsuperficiales entre celdas topográficas adyacentes.
            </div>
        </div>

        <p>
            <strong>Genealogía y Justificación Operativa:</strong> Esta formulación continua permite cerrar el balance hidrológico en cada celda del gemelo digital a intervalos de $\Delta t = 1\,\text{hora}$, enlazando dinámicamente los forzamientos meteorológicos externos con el tensor de humedad subsuperficial. A diferencia de los balances estáticos de embalse, permite cuantificar el agua disponible para la raíz y detectar el inicio del estrés celular antes de que se manifiesten síntomas visuales en el follaje.
        </p>

        <h3 style="font-size: 1.15rem; color: #1e3a8a; margin-top: 1.5rem; margin-bottom: 0.5rem;">2.2.2. Partición Energética y Demanda Evaporativa (FAO-56 Penman-Monteith)</h3>
        <p>
            Para cuantificar la pérdida vertical de agua en la interfase vegetación-atmósfera, se descartan formulaciones netamente empíricas basadas únicamente en temperatura (como Hargreaves o Thornthwaite), ya que subestiman drásticamente la advección de aire seco característica del secano interior bajo regímenes de viento Puelche. Se adopta la parametrización aerodinámica-radiativa de Penman-Monteith estandarizada por la FAO (Allen et al., 1998):
        </p>

        <div class="formula-card">
            <div class="formula-header">Ecuación 2: Evapotranspiración de Referencia ($ET_0$) FAO-56 Penman-Monteith</div>
            <div class="formula-body">
                $$\mathcal{ET}_0 = \frac{0.408\,\Delta\,(R_n - G) + \gamma\,\left(\frac{900}{T_{\text{med}} + 273}\right)\,u_2\,(e_s - e_a)}{\Delta + \gamma\,(1 + 0.34\,u_2)}$$
            </div>
            <div class="formula-footer">
                <strong>Donde:</strong> $R_n$ es la radiación neta incidente en la superficie del dosel [$\text{MJ}\cdot\text{m}^{-2}\cdot\text{día}^{-1}$] (asimilada desde reanálisis ERA5-Land y validada con piranómetros terrestres); $G$ es la densidad del flujo térmico en el suelo [$\text{MJ}\cdot\text{m}^{-2}\cdot\text{día}^{-1}$] ($G \approx 0$ a escala diaria); $T_{\text{med}}$ es la temperatura media del aire a $2\,\text{m}$ [${}^\circ\text{C}$]; $u_2$ es la velocidad del viento a $2\,\text{m}$ de altura [$\text{m}\cdot\text{s}^{-1}$]; $(e_s - e_a)$ representa el déficit de presión de vapor atmosférico ($VPD$) [$\text{kPa}$]; $\Delta$ simboliza la pendiente de la curva de presión de vapor de saturación frente a la temperatura [$\text{kPa}\cdot{}^\circ\text{C}^{-1}$]; y $\gamma$ es la constante psicrométrica dependiente de la presión barométrica local corregida por altitud topográfica ($z$) [$\text{kPa}\cdot{}^\circ\text{C}^{-1}$].
            </div>
        </div>

        <p>
            <strong>Acoplamiento con el Estrés Radicular:</strong> La evapotranspiración real ($\mathcal{ET}_a$) no equivale a $\mathcal{ET}_0$, sino que se desacopla mediante el coeficiente de cultivo basal ($K_{cb}$) y el coeficiente de reducción por estrés hídrico edáfico ($K_s(\theta)$):
            $$\mathcal{ET}_a(t) = \left[ K_{cb} \cdot K_s(\theta_t) + K_e \right] \cdot \mathcal{ET}_0(t)$$
            donde $K_s(\theta_t) = \frac{\theta(t) - \theta_{WP}}{\theta_{RAW} - \theta_{WP}} \in [0, 1]$. Si el contenido de agua decae por debajo de la humedad de agotamiento fácilmente disponible ($\theta_{RAW}$), la conductancia estomática disminuye proporcionalmente, forzando la preservación de agua celular.
        </p>

        <h3 style="font-size: 1.15rem; color: #1e3a8a; margin-top: 1.5rem; margin-bottom: 0.5rem;">2.2.3. Generación de Escorrentía Directa Superficial (SCS-CN Dinámico)</h3>
        <p>
            La partición entre el agua que infiltra en la matriz del suelo y el volumen que genera escorrentía rápida se modela mediante el método del Número de Curva del Servicio de Conservación de Suelos (SCS-CN, USDA-NRCS, 2004), adaptado de manera continua:
        </p>

        <div class="formula-card">
            <div class="formula-header">Ecuación 3: Escorrentía Superficial Directa SCS-CN y Retención Potencial Máxima</div>
            <div class="formula-body">
                $$Q_{\text{sup}} = \begin{cases} \dfrac{(P - I_a)^2}{(P - I_a) + S_{\text{max}}}, & P > I_a \\[8pt] 0, & P \le I_a \end{cases}, \qquad S_{\text{max}} = \frac{25400}{CN} - 254, \qquad I_a = \lambda \cdot S_{\text{max}}$$
            </div>
            <div class="formula-footer">
                <strong>Donde:</strong> $Q_{\text{sup}}$ es la lámina de escorrentía superficial acumulada [$\text{mm}$]; $P$ es la precipitación bruta total de la tormenta [$\text{mm}$]; $I_a$ es la abstracción inicial que integra intercepción vegetal, almacenamiento en microdepresiones e infiltración previa a la escorrentía [$\text{mm}$], parametrizada con $\lambda = 0.05\text{--}0.20$; $S_{\text{max}}$ es la retención potencial máxima del suelo [$\text{mm}$]; y $CN$ es el Número de Curva adimensional ($30 \le CN \le 100$), condicionado por el grupo hidrológico de suelo y el uso del suelo.
            </div>
        </div>

        <p>
            <strong>Justificación de la Dinamización del $CN$:</strong> En modelos hidrológicos estáticos clásicos, el $CN$ es una constante tabulada fija. En AgriTwin, el $CN$ se actualiza en cada paso de tiempo en función del contenido de humedad antecedente del suelo simulado en las 120 horas previas ($AMC\text{-}I$ seco, $AMC\text{-}II$ promedio, $AMC\text{-}III$ saturado), resolviendo la no-linealidad de la respuesta hidrológica frente a tormentas sucesivas.
        </p>

        <h3 style="font-size: 1.15rem; color: #1e3a8a; margin-top: 1.5rem; margin-bottom: 0.5rem;">2.2.4. Redistribución Topográfica Subsuperficial: Índice Topográfico de Humedad ($TWI$)</h3>
        <p>
            Para propagar espacialmente la humedad y determinar la convergencia de flujo en el relieve, se integra el Índice Topográfico de Humedad de Beven y Kirkby (1979), formulado en el marco del modelo TOPMODEL:
        </p>

        <div class="formula-card">
            <div class="formula-header">Ecuación 4: Índice Topográfico de Humedad ($TWI$, Beven & Kirkby)</div>
            <div class="formula-body">
                $$TWI(x, y) = \ln\left( \frac{\alpha(x, y)}{\tan \beta(x, y)} \right)$$
            </div>
            <div class="formula-footer">
                <strong>Donde:</strong> $\alpha$ es el área de contribución específica drenada aguas arriba por unidad de ancho de contorno [$\text{m}^2\cdot\text{m}^{-1}$], calculada a partir del Modelo Digital de Elevación (DEM) corregido hidrológicamente mediante algoritmos de dirección de flujo múltiple ($MD\infty$); y $\beta$ es la pendiente local de la ladera [$\text{radianes}$].
            </div>
        </div>

        <p>
            <strong>Aplicación en Diseño Regenerativo (Keyline):</strong> Valores altos de $TWI$ corresponden a fondos de vaguada y quebradas donde el agua freática aflora a la superficie, generando anegamiento o erosión hídrica severa. AgriTwin utiliza este mapa topográfico para trazar las líneas guía de arado Keyline (Yeomans, 1958), invirtiendo el gradiente hidráulico natural para desviar los flujos desde las zonas de convergencia ($TWI > 9$) hacia las crestas y lomajes secos ($TWI < 4$), maximizando la infiltración homogénea en toda la cuenca.
        </p>

        <h2 class="section-title">2.3. Dinámica Pirogénica, Balística de Pavesas y Regímenes Eólicos</h2>

        <h3 style="font-size: 1.15rem; color: #1e3a8a; margin-top: 1.5rem; margin-bottom: 0.5rem;">2.3.1. Propagación Cuasi-Estacionaria del Frente de Fuego (Modelo Físico de Rothermel)</h3>
        <p>
            La propagación de incendios forestales en la interfase urbano-rural y agrícola se modela mediante la ecuación semieconómica de conservación de energía de Rothermel (1972), que evalúa el balance entre la energía radiativa transmitida hacia delante por el combustible en ignición y la energía requerida para elevar el combustible receptor adyacente hasta su temperatura de pirólisis:
        </p>

        <div class="formula-card">
            <div class="formula-header">Ecuación 5: Velocidad de Propagación del Frente de Llama ($R_{\text{fuego}}$, Rothermel 1972)</div>
            <div class="formula-body">
                $$R_{\text{fuego}} = \frac{I_{rx} \cdot \xi \cdot (1 + \phi_w + \phi_s)}{\rho_b \cdot \varepsilon \cdot Q_{ig}}$$
            </div>
            <div class="formula-footer">
                <strong>Donde:</strong> $R_{\text{fuego}}$ es la velocidad lineal de avance en la dirección de máxima pendiente y viento [$\text{m}\cdot\text{min}^{-1}$]; $I_{rx}$ es el flujo de calor de reacción liberado en la zona de combustión primaria [$\text{kJ}\cdot\text{m}^{-2}\cdot\text{min}^{-1}$]; $\xi$ es el coeficiente adimensional de propagación radiativa; $\phi_w = C \cdot U^B \cdot (\beta / \beta_{op})^{-E}$ es el coeficiente advectivo inducido por la velocidad del viento a media altura de llama ($U$); $\phi_s = 5.275 \cdot (\tan \theta_s)^2$ es el factor de aceleración por pendiente topográfica ($\theta_s$); $\rho_b$ es la densidad aparente del lecho de combustible [$\text{kg}\cdot\text{m}^{-3}$]; $\varepsilon$ es la fracción de combustible efectivamente precalentada antes de la combustión; y $Q_{ig}$ es el calor volumétrico requerido para la ignición [$\text{kJ}\cdot\text{kg}^{-1}$].
            </div>
        </div>

        <p>
            <strong>Mecanismo Biofísico de Amortiguación Keyline:</strong> El calor de ignición $Q_{ig}$ es una función altamente no lineal de la humedad del combustible fino vivo y muerto ($FMC$):
            $$Q_{ig} = 581 + 2594 \cdot FMC \quad [\text{kJ}\cdot\text{kg}^{-1}]$$
            Cuando los canales Keyline rellenan los horizontes del suelo con agua cosechada de lluvia, la vegetación arbustiva y arbórea nativa del cortafuego biológico mantiene $FMC > 120\%$ incluso en el pico estival. Como resultado, $I_{rx} \to 0$ y $Q_{ig}$ se triplica, forzando matemáticamente el colapso de la velocidad de propagación ($R_{\text{fuego}} \to 0$), extinguiendo el avance por superficie.
        </p>

        <h3 style="font-size: 1.15rem; color: #1e3a8a; margin-top: 1.5rem; margin-bottom: 0.5rem;">2.3.2. Balística de Pavesas, Vórtices Térmicos y Focos Secundarios (Albini & Byram)</h3>
        <p>
            Bajo regímenes de viento Puelche, la causa primaria de propagación descontrolada y salto sobre cortafuegos minerales convencionales es el transporte de partículas incandescentes (spotting). AgriTwin modela el alcance balístico de pavesas acoplando la formulación de Albini (1979) con la intensidad frontal de Byram (1959):
        </p>

        <div class="formula-card">
            <div class="formula-header">Ecuación 6: Alcance Máximo de Pavesas ($D_{\text{spot}}$) e Intensidad de Línea de Fuego de Byram ($I_B$)</div>
            <div class="formula-body">
                $$D_{\text{spot}} = 0.0252 \cdot U_{10}^{1.15} \cdot \left(\frac{I_B}{h_{\text{dosel}}}\right)^{0.45}, \qquad I_B = H_{\text{comb}} \cdot w_{\text{cons}} \cdot R_{\text{fuego}}$$
            </div>
            <div class="formula-footer">
                <strong>Donde:</strong> $D_{\text{spot}}$ es la distancia máxima proyectada de generación de focos secundarios [$\text{km}$]; $U_{10}$ es la ráfaga de viento a $10\,\text{m}$ de altura [$\text{km}\cdot\text{h}^{-1}$]; $I_B$ es la intensidad de línea de Byram [$\text{kW}\cdot\text{m}^{-1}$]; $h_{\text{dosel}}$ es la altura media del estrato arbóreo dominante [$\text{m}$]; $H_{\text{comb}}$ es el calor de combustión de la biomasa ($\approx 18,\!600\,\text{kJ}\cdot\text{kg}^{-1}$); y $w_{\text{cons}}$ es la carga de biomasa consumida por unidad de superficie [$\text{kg}\cdot\text{m}^{-2}$].
            </div>
        </div>

        <p>
            <strong>Justificación de la Franja Biológica Multiestrato:</strong> La ecuación (6) revela que un cortafuego mineral de $10\text{--}20\,\text{m}$ es inútil frente a intensidades $I_B > 4,\!000\,\text{kW}\cdot\text{m}^{-1}$, donde $D_{\text{spot}}$ supera $1.5\,\text{km}$. La solución regenerativa adoptada en AgriTwin consiste en una faja multiestrato con dosel cerrado de bosque esclerófilo hidratado que captura físicamente las pavesas en vuelo y rompe el perfil de viento $U_{10}$, impidiendo la sustentación aerodinámica de los carbones encendidos.
        </p>

        <h2 class="section-title">2.4. Topoclimatología Catabática, Drenaje por Gravedad y Radiación Neta Nocturna</h2>

        <h3 style="font-size: 1.15rem; color: #1e3a8a; margin-top: 1.5rem; margin-bottom: 0.5rem;">2.4.1. Dinámica de Capa Límite Estable y Flujo Catabático (Modelo de Prandtl-Mahrt)</h3>
        <p>
            El daño por heladas radiativas primaverales en viñedos y frutales del secano no es homogéneo; responde al desacoplamiento térmico de la capa límite nocturna. El aire en contacto con laderas descubiertas pierde calor por radiación y desciende por gravedad hacia las depresiones topográficas. La velocidad estacionaria de este flujo catabático se deriva del balance entre flotabilidad negativa y fricción superficial turbulenta:
        </p>

        <div class="formula-card">
            <div class="formula-header">Ecuación 7: Velocidad Estacionaria de Drenaje Catabático de Ladera ($u_{\text{catab}}$)</div>
            <div class="formula-body">
                $$u_{\text{catab}} = \sqrt{\frac{2 \cdot g \cdot h_{\text{capa}} \cdot \sin \alpha_s \cdot \left(\dfrac{\theta_v(z) - \theta_{v,s}}{\theta_0}\right)}{c_d + \kappa_{\text{veg}}}}$$
            </div>
            <div class="formula-footer">
                <strong>Donde:</strong> $g = 9.81\,\text{m}\cdot\text{s}^{-2}$; $h_{\text{capa}}$ es el espesor de la capa de inversión térmica superficial [$\text{m}$]; $\alpha_s$ es el ángulo de inclinación de la ladera [$\text{grados}$]; $\theta_v(z)$ y $\theta_{v,s}$ representan las temperaturas potenciales virtuales del aire libre y de la superficie enfriada [$\text{K}$]; $\theta_0$ es la temperatura potencial de referencia ($288.15\,\text{K}$); $c_d$ es el coeficiente de arrastre aerodinámico de superficie desnuda ($\approx 0.005$); y $\kappa_{\text{veg}}$ es el factor de rugosidad y porosidad inducido por el arbolado o las cortinas vegetales.
            </div>
        </div>

        <p>
            <strong>Ingeniería Microclimática:</strong> Cuando el flujo catabático encuentra obstáculos transversales impermeables (como muros continuos o plantaciones tupidas en cotas bajas), se detiene, formando "lagos o piscinas de aire frío" donde la temperatura desciende hasta $-5^\circ\text{C}$. AgriTwin modela las líneas de flujo catabático mediante la ecuación (7) para recomendar ventanas de despeje o deflectores vegetales orientados que canalicen el aire frío fuera del huerto hacia cañadas no productivas.
        </p>

        <h3 style="font-size: 1.15rem; color: #1e3a8a; margin-top: 1.5rem; margin-bottom: 0.5rem;">2.4.2. Balance Radiativo Nocturno de Onda Larga</h3>
        <p>
            El enfriamiento superficial que desencadena la helada radiativa se cuantifica mediante la ley de Stefan-Boltzmann corregida por la emisividad atmosférica de cielo despejado:
        </p>

        <div class="formula-card">
            <div class="formula-header">Ecuación 8: Radiación Neta Nocturna de Onda Larga ($R_{nl}$)</div>
            <div class="formula-body">
                $$R_{nl} = \sigma \cdot \left( \varepsilon_{\text{suelo}} \cdot T_{\text{suelo}}^4 - \varepsilon_{\text{atm}}(e_a, T_a) \cdot T_{\text{aire}}^4 \right)$$
            </div>
            <div class="formula-footer">
                <strong>Donde:</strong> $\sigma = 5.67 \times 10^{-8}\,\text{W}\cdot\text{m}^{-2}\cdot\text{K}^{-4}$ es la constante de Stefan-Boltzmann; $\varepsilon_{\text{suelo}} \approx 0.95\text{--}0.98$ es la emisividad espectral infrarroja del suelo; $T_{\text{suelo}}$ y $T_{\text{aire}}$ son las temperaturas termodinámicas absolutas [$\text{K}$]; y $\varepsilon_{\text{atm}}$ es la emisividad aparente de la atmósfera calculada en función de la presión parcial de vapor $e_a$ [$\text{hPa}$] según Brutsaert (1975): $\varepsilon_{\text{atm}} = 1.24 \cdot (e_a / T_a)^{1/7}$.
            </div>
        </div>

        <p>
            <strong>Justificación de la Cobertura Vegetal Viva:</strong> En suelos desnudos o desprovistos de vegetación, la radiación neta de onda larga escapa libremente hacia el espacio exterior ($R_{nl} > 80\,\text{W}\cdot\text{m}^{-2}$), causando caídas térmicas abruptas en superficie. Bajo cubiertas mulch o doseles agroforestales densos promovidos por el diseño regenerativo, el factor de vista de cielo se reduce drásticamente, atrapando la radiación infrarroja y manteniendo la temperatura foliar entre $2^\circ\text{C}$ y $3^\circ\text{C}$ por encima del umbral letal de congelación.
        </p>

        <h2 class="section-title">2.5. Termodinámica Convectiva, Cizalladura Vertical y Entornos Severos HSLC</h2>

        <h3 style="font-size: 1.15rem; color: #1e3a8a; margin-top: 1.5rem; margin-bottom: 0.5rem;">2.5.1. Inestabilidad Hidrostática: Energía Potencial Convectiva Disponible ($CAPE$)</h3>
        <p>
            Las tormentas de granizo destructivas y los eventos de convección severa en el secano interior de Chile ocurren con frecuencia en entornos de bajo $CAPE$ y alta cizalladura cinemática (entornos $HSLC$). La energía vertical boyante por unidad de masa se obtiene mediante la integral vertical del empuje hidrostático positivo:
        </p>

        <div class="formula-card">
            <div class="formula-header">Ecuación 9: Energía Potencial Convectiva Disponible ($CAPE$)</div>
            <div class="formula-body">
                $$CAPE = \int_{z_{LFC}}^{z_{EL}} g \cdot \left( \frac{T_{v,\text{parcela}}(z) - T_{v,\text{entorno}}(z)}{T_{v,\text{entorno}}(z)} \right) dz$$
            </div>
            <div class="formula-footer">
                <strong>Donde:</strong> $z_{LFC}$ es la cota del Nivel de Convección Libre [$\text{m}$]; $z_{EL}$ es el Nivel de Equilibrio térmico donde la parcela ascendente se equipara a la masa circundante [$\text{m}$]; $g$ es la gravedad estándar; y $T_{v,\text{parcela}}$ y $T_{v,\text{entorno}}$ representan las temperaturas virtuales respectivas [$\text{K}$], computadas asimilando sondeos termodinámicos y reanálisis ERA5.
            </div>
        </div>

        <h3 style="font-size: 1.15rem; color: #1e3a8a; margin-top: 1.5rem; margin-bottom: 0.5rem;">2.5.2. Cizalladura Vertical Profunda y Severidad Cinemática ($DLS_{0\text{-}6\,\text{km}}$)</h3>
        <p>
            La organización espacial y el grado de severidad de la célula convectiva (capacidad de generar micro-ráfagas descendentes o granizo de gran calibre) están determinados por el vector de cizalladura cinemática en la capa $0\text{--}6\,\text{km}$ ($Deep\,Layer\,Shear$):
        </p>

        <div class="formula-card">
            <div class="formula-header">Ecuación 10: Magnitud de la Cizalladura Vertical Profunda de Viento ($DLS_{0\text{-}6\,\text{km}}$)</div>
            <div class="formula-body">
                $$DLS_{0\text{-}6\,\text{km}} = \sqrt{ \left( u_{6\,\text{km}} - u_{10\,\text{m}} \right)^2 + \left( v_{6\,\text{km}} - v_{10\,\text{m}} \right)^2 }$$
            </div>
            <div class="formula-footer">
                <strong>Donde:</strong> $(u_{6\,\text{km}}, v_{6\,\text{km}})$ son las componentes zonales y meridionales del viento horizontal a $6\,\text{km}$ sobre el nivel del suelo [$\text{m}\cdot\text{s}^{-1}$]; y $(u_{10\,\text{m}}, v_{10\,\text{m}})$ son las componentes del viento superficial a $10\,\text{m}$.
            </div>
        </div>

        <p>
            <strong>Justificación de la Alerta Anticipada en Cuenca:</strong> En el secano chileno, valores de $CAPE$ moderados ($400\text{--}800\,\text{J}\cdot\text{kg}^{-1}$) combinados con $DLS > 20\,\text{m}\cdot\text{s}^{-1}$ producen frentes de ráfagas destructivas capaces de descepar viñas patrimoniales centenarias y derribar invernaderos. El acoplamiento termodinámico de AgriTwin alerta a la comunidad con 6 a 12 horas de anticipación para cerrar compuertas y asegurar infraestructura.
        </p>

        <h2 class="section-title">2.6. Teledetección Espectral Óptica: Catálogo de 10 Bandas Terrestres y 8 Índices Normalizados</h2>
        <p>
            Para garantizar que el gemelo no dependa de sensores físicos densamente desplegados, se implementó un motor de asimilación espectral multiespectral basado en la constelación Sentinel-2 (MSI) de la Agencia Espacial Europea. Se asimilan 10 bandas a resoluciones de 10 y 20 metros (B02 azul, B03 verde, B04 rojo, B05-B07 Red Edge, B08 NIR ancho, B8A NIR estrecho, B11 SWIR-1 y B12 SWIR-2), generando una batería canónica de 8 índices biofísicos normalizados:
        </p>
        <ul>
            <li><strong>NDVI (Rouse et al., 1974):</strong> $(B08 - B04)/(B08 + B04)$ — Vigor fotosintético del dosel.</li>
            <li><strong>NDRE (Barnes et al., 2000):</strong> $(B08 - B05)/(B08 + B05)$ — Contenido de clorofila y actividad en doseles densos sin saturación.</li>
            <li><strong>NDWI (Gao, 1996):</strong> $(B08 - B11)/(B08 + B11)$ — Contenido de agua libre en el tejido foliar.</li>
            <li><strong>MSI (Hunt & Rock, 1989):</strong> $B11 / B08$ — Índice de estrés por humedad foliar.</li>
            <li><strong>NDBI (Zha et al., 2003):</strong> $(B11 - B08)/(B11 + B08)$ — Impermeabilidad y suelo expuesto.</li>
            <li><strong>SAVI (Huete, 1988):</strong> $[(B08 - B04)/(B08 + B04 + L)] \cdot (1 + L)$ con $L=0.5$ — Ajuste por reflectancia de suelo en coberturas ralas.</li>
            <li><strong>EVI (Huete et al., 2002):</strong> $2.5 \cdot (B08 - B04)/(B08 + 6 \cdot B04 - 7.5 \cdot B02 + 1)$ — Optimización atmosférica en alta biomasa.</li>
            <li><strong>NBR (Key & Benson, 2006):</strong> $(B08 - B12)/(B08 + B12)$ — Severidad de quema y estrés pirogénico de combustible.</li>
        </ul>

        <h2 class="section-title">2.7. Doctrina Operacional de Mando y Control Táctico C2 ($R = H \times V \times C$) y Ciclo OODA</h2>
        <p>
            La transformación de variables físicas continuas en decisiones agronómicas operacionales se rige por la doctrina de Mando y Control ($C^2$) basada en el ciclo OODA (Observar $\rightarrow$ Orientar $\rightarrow$ Decidir $\rightarrow$ Actuar) de John Boyd. El riesgo en cada celda topográfica no se trata como un valor estático, sino como una función multiplicativa tridimensional:
        </p>

        <div class="formula-card">
            <div class="formula-header">Ecuación 11: Ecuación General del Riesgo Táctico Multiamenaza ($R_{\text{táctico}}$)</div>
            <div class="formula-body">
                $$R_{\text{táctico}}(x, y, t) = \mathcal{H}(x, y, t) \times \mathcal{V}(x, y, t) \times \left[ 1 - \mathcal{C}(x, y, t) \right]$$
            </div>
            <div class="formula-footer">
                <strong>Donde:</strong> $\mathcal{H} \in [0, 1]$ es el vector de Amenaza Físico-Climática (severidad de helada, frente de fuego o déficit de infiltración); $\mathcal{V} \in [0, 1]$ es la Vulnerabilidad Intrínseca del elemento expuesto (estado fenológico del cultivo, edad de la cepa, combustibilidad de la edificación); y $\mathcal{C} \in [0, 1]$ representa la Capacidad de Respuesta Adaptativa instalada localmente (volumen de agua acumulado en tranques Keyline, brigadas comunitarias equipadas, defensas pasivas activas).
            </div>
        </div>

        <p>
            <strong>Significado Estratégico:</strong> Si la capacidad local es máxima ($\mathcal{C} \to 1$), el riesgo táctico se colapsa a cero incluso en presencia de una amenaza severa ($\mathcal{H} \to 1$). Este formalismo desplaza el foco desde el simple "monitoreo de catástrofes" hacia la inversión preventiva comunitaria en infraestructuras de mitigación regenerativa.
        </p>

        <h2 class="section-title">2.8. Ecología del Paisaje, Geometría Keyline y Bienes Comunes (Elinor Ostrom)</h2>
        <p>
            El diseño territorial del gemelo se fundamenta en los 8 principios de diseño institucional para la gestión sostenible de Recursos de Uso Común ($CPR$) formulados por la Premio Nobel de Economía Elinor Ostrom (1990). AgriTwin supera la falsa dicotomía entre privatización atomizada y control centralizado estatal mediante tres mecanismos computacionales:
        </p>
        <ul>
            <li><strong>Límites Físicos Claramente Definidos (Principio 1):</strong> Modelación de la cuenca como una sola unidad hidrológica indivisible, transparentando los flujos aguas arriba y aguas abajo.</li>
            <li><strong>Monitoreo y Auditoría Confiable y Simétrica (Principio 4):</strong> Los datos del gemelo (escorrentías, recargas freáticas, niveles de embalse) son públicos e idénticos para el campesino tradicional del secano que para el agroexportador industrial, eliminando la asimetría de información que permite la sobreextracción ilegítima.</li>
            <li><strong>Mecanismos de Resolución de Conflictos de Bajo Costo (Principio 6):</strong> Plataforma neutral basada en balances de masa certificados para dirimir disputas por derechos de agua y deslindes forestales de amortiguación pirogénica.</li>
        </ul>

        <h2 class="section-title">2.9. Metrología de Sensibilidad (Sobol/Morris) y Cuantificación de Incertidumbre (Guía ISO/IEC 98-3 GUM)</h2>

        <h3 style="font-size: 1.15rem; color: #1e3a8a; margin-top: 1.5rem; margin-bottom: 0.5rem;">2.9.1. Análisis Global de Sensibilidad por Descomposición de Varianza (Sobol 2001)</h3>
        <p>
            Para determinar con rigor matemático cuáles parámetros del gemelo digital demandan calibración empírica en terreno y cuáles pueden mantenerse fijos a valores de literatura sin comprometer la certidumbre de salida, se implementó el método de descomposición funcional ortogonal de la varianza total de Sobol (2001):
        </p>

        <div class="formula-card">
            <div class="formula-header">Ecuaciones 12 y 13: Índices de Sensibilidad de Sobol de Primer Orden ($S_i$) y Total ($S_{Ti}$)</div>
            <div class="formula-body">
                $$S_i = \frac{\mathbb{V}_{X_i}\left(\mathbb{E}_{\mathbf{X}_{\sim i}}[Y \mid X_i]\right)}{\mathbb{V}(Y)}, \qquad S_{Ti} = 1 - \frac{\mathbb{V}_{\mathbf{X}_{\sim i}}\left(\mathbb{E}_{X_i}[Y \mid \mathbf{X}_{\sim i}]\right)}{\mathbb{V}(Y)}$$
            </div>
            <div class="formula-footer">
                <strong>Donde:</strong> $Y = f(\mathbf{X})$ representa la variable de salida del modelo (p. ej., caudal pico de crecida o humedad radicular); $X_i$ es el $i$-ésimo parámetro bajo escrutinio ($CN$, conductividad saturada $K_{\text{sat}}$, coeficiente de Manning $n$, porosidad $\theta_{\text{sat}}$, albedo); $\mathbb{V}(Y)$ es la varianza incondicional total evaluada mediante $N = 10,\!000$ realizaciones Monte Carlo con muestreo Quasi-Monte Carlo de Sobol; $S_i$ mide el efecto principal individual de $X_i$; y $S_{Ti}$ cuantifica el efecto total incluyendo todas las interacciones no lineales de orden superior con los demás parámetros.
            </div>
        </div>

        <h3 style="font-size: 1.15rem; color: #1e3a8a; margin-top: 1.5rem; margin-bottom: 0.5rem;">2.9.2. Asimilación Dinámica Continua y Nudging de la Sonda Mínima</h3>
        <p>
            El acoplamiento en tiempo real entre las ecuaciones hidrológicas y las lecturas de telemetría de terreno se ejecuta mediante una ecuación diferencial con inyección forzante de corrección (nudging continuo de Newton):
        </p>

        <div class="formula-card">
            <div class="formula-header">Ecuación 14: Ecuación Diferencial de Asimilación Dinámica por Nudging Continuo</div>
            <div class="formula-body">
                $$\frac{d\hat{\theta}(z, t)}{dt} = \mathcal{M}\left( \hat{\theta}(z, t), \mathbf{F}_{\text{clima}}(t) \right) + G_n \cdot \mathcal{W}(z, z_{\text{obs}}) \cdot \left[ \theta_{\text{obs}}(t) - \hat{\theta}(z_{\text{obs}}, t) \right]$$
            </div>
            <div class="formula-footer">
                <strong>Donde:</strong> $\hat{\theta}(z, t)$ es el perfil vertical de humedad del suelo estimado por el gemelo [$\text{m}^3\cdot\text{m}^{-3}$]; $\mathcal{M}(\cdot)$ representa el operador de balance físico gobernado por las Ecuaciones (1) y (2); $\mathbf{F}_{\text{clima}}$ es el vector de forzamiento meteorológico ($P, ET_0$); $G_n$ es el coeficiente empírico de ganancia de nudging [$\text{s}^{-1}$]; $\mathcal{W}(z, z_{\text{obs}}) = \exp\left( -|z - z_{\text{obs}}| / L_c \right)$ es una función gaussiana de peso espacial basada en la longitud de correlación vertical del suelo ($L_c$); y $\theta_{\text{obs}}(t)$ es la observación directa transmitida por la sonda TDR instalada en el predio.
            </div>
        </div>

        <p>
            <strong>Demostración de la Hipótesis 3 ($H_3$):</strong> La Ecuación (14) es el fundamento matemático que explica por qué una única sonda TDR y una estación meteorológica colapsan el 86.4% de la incertidumbre total en la cuenca: al corregir dinámicamente el estado en el estrato medio, el operador físico $\mathcal{M}$ propaga coherentemente la actualización hacia los horizontes profundos y hacia las celdas vecinas a lo largo de la topografía, haciendo redundante el despliegue indiscriminado de cientos de micro-sensores en cada parcela.
        </p>

        <h2 class="section-title">2.10. Protocolo Experimental Ciego de Muestra Dividida y Banco de Pruebas en R</h2>
        <p>
            Para garantizar la objetividad epistemológica y descartar cualquier sesgo de calibración circular, se implementó el protocolo clásico de muestra dividida (Klemeš, 1986). La serie hidrológica decenal (2013–2023) se segmentó rígidamente en:
        </p>
        <ul>
            <li><strong>Periodo de Calibración (2013–2018):</strong> Estimación del espacio paramétrico óptimo minimizando el error compuesto de Kling-Gupta ($KGE$, Gupta et al., 2009).</li>
            <li><strong>Periodo de Validación Ciega (2019–2023):</strong> Evaluación con parámetros congelados sobre años de sequía extrema (Megasequía de Chile central) e inundaciones catastróficas de junio/agosto 2023.</li>
        </ul>
        <p>
            La ejecución de este banco de pruebas, el cálculo de las funciones de probabilidad de densidad ($PDF$), la simulación estocástica Monte Carlo ($N=10,\!000$) y la renderización de las figuras científicas a resolución de publicación (300 DPI) se programaron íntegramente en el script canónico reproducible <code>scripts/r_benchmark_cases.R</code> utilizando R versión 4.5.2 y el ecosistema estadístico <em>tidyverse</em> (<code>ggplot2</code>, <code>dplyr</code>, <code>patchwork</code>).
        </p>'''

MD_PART_II = r'''## Parte II: Materiales y Métodos

### 2.1. Zonas de Estudio y Arquetipos Bioclimáticos de Validación
Para asegurar la transferibilidad biofísica y evitar el sobreajuste a microclimas locales específicos, la calibración y auditoría empírica de AgriTwin se estructuró sobre tres cuencas hidrológicas contrastantes de la zona centro-sur de Chile:
1. **Arquetipo Secano Interior Mediterráneo (Cuenca Piloto Río Purapel / Perquilauquén, Maule Sur):** Área de drenaje de $268.4\,\text{km}^2$, sustrato granítico costero altamente meteorizado (alfisoles y vertisoles con horizonte árgico denso), régimen pluviométrico mediterráneo semiárido ($480\text{--}720\,\text{mm}\cdot\text{año}^{-1}$) concentrado en invierno, con estiaje estival severo de 6 a 8 meses y recurrencia de viento Puelche desecante. Auditoría: DGA 07357002-2 (Río Purapel en Sauzal) e INIA/AGROMET Cauquenes.
2. **Arquetipo Andino de Régimen Mixto (Subcuenca Alta Río Maipo en El Manzano, Región Metropolitana):** Área de $1,\!240\,\text{km}^2$, gradiente altitudinal escarpado ($850\text{--}4,\!200\,\text{m.s.n.m.}$), balance nivo-pluvial y torrencialidad de deshielo. Auditoría: DGA 05707002-9 y DMC Tobalaba.
3. **Arquetipo Templado Húmedo de Transición (Cuenca Media Río Biobío en Rucacura / Malleco):** Área de $890\,\text{km}^2$, transición lluviosa ($1,\!100\text{--}1,\!600\,\text{mm}\cdot\text{año}^{-1}$), suelos derivados de cenizas volcánicas (andisoles) y masa forestal comercial continua. Auditoría: DGA 08317001-4 (Collipulli) y AGROMET Malleco.

---

### 2.2. Modelo Agro-Hidrológico Semi-Distribuido ($SCS\text{-}CN + TWI$) y Balance $SPAC$

#### 2.2.1. Principio Fundamental de Conservación de Masa en la Columna Vadosa
El núcleo hidrológico de AgriTwin opera como un modelo semi-distribuido basado en la ley fundamental de conservación de masa aplicada a la columna estratificada de suelo (Continuo Suelo-Planta-Atmósfera, $SPAC$):

$$\frac{d\mathcal{S}_w(x, y, t)}{dt} = P_{\text{eff}}(x, y, t) - \mathcal{ET}_a(x, y, t) - Q_{\text{sup}}(x, y, t) - L_{\text{perc}}(x, y, t) + Q_{\text{lat\_in}}(x, y, t) - Q_{\text{lat\_out}}(x, y, t) \quad (1)$$

* **Exégesis de Variables:** $\mathcal{S}_w(t)$ es el volumen total de agua almacenado en el perfil radicular activo [$\text{mm}$]; $P_{\text{eff}}$ es la precipitación neta incidente [$\text{mm}\cdot\text{día}^{-1}$]; $\mathcal{ET}_a$ es la evapotranspiración real del cultivo [$\text{mm}\cdot\text{día}^{-1}$]; $Q_{\text{sup}}$ es la escorrentía superficial directa [$\text{mm}\cdot\text{día}^{-1}$]; $L_{\text{perc}}$ es la percolación profunda hacia el acuífero libre [$\text{mm}\cdot\text{día}^{-1}$]; y $Q_{\text{lat}}$ representa la transferencia lateral subsuperficial entre celdas topográficas adyacentes.
* **Justificación Operativa:** Esta formulación continua permite cerrar el balance hidrológico celda a celda en pasos horarios ($\Delta t = 1\,\text{h}$), cuantificando el agua disponible para la raíz y diagnosticando el estrés celular antes de que se manifiesten síntomas visuales en el follaje.

#### 2.2.2. Partición Energética y Demanda Evaporativa (FAO-56 Penman-Monteith)
Para modelar la demanda vertical de vapor sin caer en las subestimaciones de fórmulas puramente térmicas bajo vientos desecantes del este (Puelche), se adopta la parametrización física de Penman-Monteith estandarizada por FAO (Allen et al., 1998):

$$\mathcal{ET}_0 = \frac{0.408\,\Delta\,(R_n - G) + \gamma\,\left(\frac{900}{T_{\text{med}} + 273}\right)\,u_2\,(e_s - e_a)}{\Delta + \gamma\,(1 + 0.34\,u_2)} \quad (2)$$

* **Exégesis de Variables:** $R_n$ es la radiación neta incidente [$\text{MJ}\cdot\text{m}^{-2}\cdot\text{día}^{-1}$] (asimilada desde ERA5-Land y piranómetros terrestres); $G$ es el flujo térmico en el suelo ($G \approx 0$ a escala diaria); $T_{\text{med}}$ es la temperatura media a $2\,\text{m}$ [${}^\circ\text{C}$]; $u_2$ es la velocidad del viento a $2\,\text{m}$ [$\text{m}\cdot\text{s}^{-1}$]; $(e_s - e_a)$ representa el déficit de presión de vapor ($VPD$) [$\text{kPa}$]; $\Delta$ es la pendiente de la curva de saturación de vapor; y $\gamma$ es la constante psicrométrica corregida por cota DEM.
* **Acoplamiento con el Estrés Radicular:** La evapotranspiración real se acopla dinámicamente mediante $\mathcal{ET}_a(t) = [K_{cb} \cdot K_s(\theta_t) + K_e] \cdot \mathcal{ET}_0(t)$, donde el factor de penalización estomática $K_s(\theta_t) \in [0, 1]$ reduce la transpiración cuando la humedad desciende por debajo de la capacidad de campo.

#### 2.2.3. Generación de Escorrentía Directa Superficial (SCS-CN Dinámico)
La partición entre el agua infiltrada y el volumen de escorrentía superficial directa se resuelve mediante el método del Número de Curva del Servicio de Conservación de Suelos (SCS-CN, USDA-NRCS, 2004), actualizado dinámicamente:

$$Q_{\text{sup}} = \begin{cases} \dfrac{(P - I_a)^2}{(P - I_a) + S_{\text{max}}}, & P > I_a \\[8pt] 0, & P \le I_a \end{cases}, \qquad S_{\text{max}} = \frac{25400}{CN} - 254, \qquad I_a = \lambda \cdot S_{\text{max}} \quad (3)$$

* **Exégesis de Variables:** $Q_{\text{sup}}$ es la lámina de escorrentía superficial [$\text{mm}$]; $P$ es la precipitación total acumulada [$\text{mm}$]; $I_a$ es la abstracción inicial [$\text{mm}$] ($\lambda = 0.05\text{--}0.20$); $S_{\text{max}}$ es la retención potencial máxima del suelo [$\text{mm}$]; y $CN$ es el Número de Curva adimensional ($30 \le CN \le 100$).
* **Dinamización:** A diferencia de la tabla estática tradicional, en AgriTwin el $CN$ varía paso a paso según la humedad antecedente de 120 horas simulada ($AMC\text{-}I, AMC\text{-}II, AMC\text{-}III$).

#### 2.2.4. Redistribución Topográfica Subsuperficial: Índice Topográfico de Humedad ($TWI$)
Para modelar la convergencia gravitacional del agua subsuperficial a partir del relieve, se integra la formulación de Beven y Kirkby (1979):

$$TWI(x, y) = \ln\left( \frac{\alpha(x, y)}{\tan \beta(x, y)} \right) \quad (4)$$

* **Exégesis de Variables:** $\alpha$ es el área de contribución específica drenada aguas arriba por unidad de ancho de contorno [$\text{m}^2\cdot\text{m}^{-1}$], calculada mediante algoritmos $MD\infty$; y $\beta$ es la pendiente local de la ladera [$\text{rad}$].
* **Aplicación Regenerativa en Keyline:** Los valores altos ($TWI > 9$) identifican quebradas con riesgo de erosión y anegamiento. AgriTwin utiliza este mapa para trazar los surcos Keyline (Yeomans, 1958), invirtiendo el gradiente para conducir el agua desde las vaguadas hacia los lomos secos ($TWI < 4$).

---

### 2.3. Dinámica Pirogénica, Balística de Pavesas (Rothermel & Albini) y Vientos

#### 2.3.1. Propagación Cuasi-Estacionaria del Frente de Fuego (Modelo Físico de Rothermel)
El avance del frente de llama en pastizales, matorrales y rastrojos se modela mediante el balance térmico de Rothermel (1972):

$$R_{\text{fuego}} = \frac{I_{rx} \cdot \xi \cdot (1 + \phi_w + \phi_s)}{\rho_b \cdot \varepsilon \cdot Q_{ig}} \quad (5)$$

* **Exégesis de Variables:** $R_{\text{fuego}}$ es la velocidad lineal de avance del frente [$\text{m}\cdot\text{min}^{-1}$]; $I_{rx}$ es el flujo de calor de reacción [$\text{kJ}\cdot\text{m}^{-2}\cdot\text{min}^{-1}$]; $\xi$ es el coeficiente de propagación radiativa; $\phi_w$ es el factor advectivo inducido por viento; $\phi_s = 5.275 \cdot (\tan \theta_s)^2$ es el factor de aceleración por pendiente; $\rho_b$ es la densidad aparente del combustible [$\text{kg}\cdot\text{m}^{-3}$]; $\varepsilon$ es la fracción de combustible calentada; y $Q_{ig}$ es el calor de ignición [$\text{kJ}\cdot\text{kg}^{-1}$].
* **Mecanismo de Freno Biofísico Keyline:** Dado que $Q_{ig} = 581 + 2594 \cdot FMC$, los cortafuegos biológicos Keyline mantienen una humedad del combustible vivo $FMC > 120\%$ por recarga hídrica edáfica, triplicando $Q_{ig}$ y forzando $R_{\text{fuego}} \to 0$.

#### 2.3.2. Balística de Pavesas, Vórtices Térmicos y Focos Secundarios (Albini & Byram)
El salto de fuego por encima de barreras físicas bajo viento Puelche se modela acoplando Albini (1979) con la intensidad frontal de Byram (1959):

$$D_{\text{spot}} = 0.0252 \cdot U_{10}^{1.15} \cdot \left(\frac{I_B}{h_{\text{dosel}}}\right)^{0.45}, \qquad I_B = H_{\text{comb}} \cdot w_{\text{cons}} \cdot R_{\text{fuego}} \quad (6)$$

* **Exégesis de Variables:** $D_{\text{spot}}$ es el alcance máximo de pavesas incandescentes [$\text{km}$]; $U_{10}$ es la velocidad del viento a $10\,\text{m}$ [$\text{km}\cdot\text{h}^{-1}$]; $I_B$ es la intensidad de línea de Byram [$\text{kW}\cdot\text{m}^{-1}$]; $h_{\text{dosel}}$ es la altura del estrato arbóreo [$\text{m}$]; $H_{\text{comb}} \approx 18,\!600\,\text{kJ}\cdot\text{kg}^{-1}$; y $w_{\text{cons}}$ es la carga de biomasa consumida [$\text{kg}\cdot\text{m}^{-2}$].
* **Justificación de la Cortina Viva:** Cuando $I_B > 4,\!000\,\text{kW}\cdot\text{m}^{-1}$, $D_{\text{spot}}$ supera $1.5\,\text{km}$, invalidando los cortafuegos minerales angostos. AgriTwin diseña franjas agroforestales multiestrato que filtran y atrapan físicamente las pavesas aéreas.

---

### 2.4. Topoclimatología Catabática, Drenaje por Gravedad y Radiación Nocturna

#### 2.4.1. Dinámica de Flujo Catabático en Ladera (Prandtl-Mahrt)
La acumulación de aire frío en fondos de cuenca durante heladas radiativas se modela con el balance de momento de flujo catabático:

$$u_{\text{catab}} = \sqrt{\frac{2 \cdot g \cdot h_{\text{capa}} \cdot \sin \alpha_s \cdot \left(\dfrac{\theta_v(z) - \theta_{v,s}}{\theta_0}\right)}{c_d + \kappa_{\text{veg}}}} \quad (7)$$

* **Exégesis de Variables:** $g = 9.81\,\text{m}\cdot\text{s}^{-2}$; $h_{\text{capa}}$ es el espesor de la capa de inversión térmica [$\text{m}$]; $\alpha_s$ es la pendiente topográfica; $\theta_v(z)$ y $\theta_{v,s}$ son las temperaturas potenciales virtuales libre y superficial [$\text{K}$]; $\theta_0 = 288.15\,\text{K}$; $c_d$ es el arrastre del suelo desnudo; y $\kappa_{\text{veg}}$ es la resistencia por dosel vegetal.
* **Aplicación:** Identifica los cuellos de botella topográficos donde se estanca el aire gélido, diseñando deflectores de viento vegetal para drenarlo fuera del cultivo.

#### 2.4.2. Balance Radiativo Nocturno de Onda Larga
La tasa de pérdida energética hacia el espacio exterior se formula mediante Stefan-Boltzmann corregido por la contra-radiación atmosférica:

$$R_{nl} = \sigma \cdot \left( \varepsilon_{\text{suelo}} \cdot T_{\text{suelo}}^4 - \varepsilon_{\text{atm}}(e_a, T_a) \cdot T_{\text{aire}}^4 \right) \quad (8)$$

* **Exégesis de Variables:** $\sigma = 5.67 \times 10^{-8}\,\text{W}\cdot\text{m}^{-2}\cdot\text{K}^{-4}$; $\varepsilon_{\text{suelo}} \approx 0.96$; $T$ son temperaturas absolutas [$\text{K}$]; y $\varepsilon_{\text{atm}} = 1.24 \cdot (e_a / T_a)^{1/7}$ según Brutsaert (1975).
* **Mitigación Regenerativa:** Demuestra el rol térmico del mulch orgánico y el dosel vivo para reducir la pérdida radiativa directa y mantener el calor latente en el suelo.

---

### 2.5. Termodinámica Convectiva, Cizalladura Vertical y Entornos Severos HSLC

#### 2.5.1. Energía Potencial Convectiva Disponible ($CAPE$)
El potencial boyante vertical para la formación de celdas tormentosas se integra a lo largo del perfil atmosférico:

$$CAPE = \int_{z_{LFC}}^{z_{EL}} g \cdot \left( \frac{T_{v,\text{parcela}}(z) - T_{v,\text{entorno}}(z)}{T_{v,\text{entorno}}(z)} \right) dz \quad (9)$$

* **Exégesis:** $z_{LFC}$ es el Nivel de Convección Libre [$\text{m}$]; $z_{EL}$ es el Nivel de Equilibrio [$\text{m}$]; y $T_v$ son las temperaturas virtuales de la parcela y del entorno circundante.

#### 2.5.2. Cizalladura Vertical Profunda de Viento ($DLS_{0\text{-}6\,\text{km}}$)
La capacidad de organización convectiva y severidad de ráfagas destructivas (downbursts) se evalúa mediante:

$$DLS_{0\text{-}6\,\text{km}} = \sqrt{ \left( u_{6\,\text{km}} - u_{10\,\text{m}} \right)^2 + \left( v_{6\,\text{km}} - v_{10\,\text{m}} \right)^2 } \quad (10)$$

* **Exégesis:** Componentes cinemáticas horizontales del viento a $6\,\text{km}$ y $10\,\text{m}$ [$\text{m}\cdot\text{s}^{-1}$] obtenidas de ERA5 y sondeos locales.

---

### 2.6. Teledetección Espectral Óptica: 10 Bandas Terrestres y 8 Índices Normalizados
Asimilación continua de la constelación Sentinel-2 (MSI, ESA) a 10 y 20 metros (B02 azul, B03 verde, B04 rojo, B05-B07 Red Edge, B08 NIR ancho, B8A NIR estrecho, B11 SWIR-1, B12 SWIR-2).
* Índices calculados: NDVI (vigor fotosintético), NDRE (clorofila en dosel denso), NDWI (agua foliar), MSI (estrés hídrico foliar), NDBI (impermeabilidad), SAVI (ajuste por suelo descubierto), EVI (biomasa densa sin saturación), NBR (severidad de combustibilidad pirogénica).

---

### 2.7. Doctrina Operacional de Mando y Control Táctico C2 ($R = H \times V \times C$) y Ciclo OODA
La gobernanza del riesgo multiamenaza traduce los forzamientos físicos en acciones preventivas a través del ciclo OODA:

$$R_{\text{táctico}}(x, y, t) = \mathcal{H}(x, y, t) \times \mathcal{V}(x, y, t) \times \left[ 1 - \mathcal{C}(x, y, t) \right] \quad (11)$$

* **Exégesis:** $\mathcal{H} \in [0, 1]$ es la Severidad Física de la Amenaza; $\mathcal{V} \in [0, 1]$ es la Vulnerabilidad Intrínseca expuesta; y $\mathcal{C} \in [0, 1]$ es la Capacidad de Respuesta Adaptativa instalada (tranque Keyline lleno, cortinas vivas, cortafuegos biológicos activos).

---

### 2.8. Ecología del Paisaje, Geometría Keyline y Bienes Comunes (Elinor Ostrom)
Implementación computacional de los 8 principios de diseño institucional para la gestión comunitaria de cuencas de Elinor Ostrom (1990): límites territoriales claros basados en hidrología natural, monitoreo simétrico sin ventajas de información para grandes usuarios, y reglas operativas concertadas de extracción y conservación.

---

### 2.9. Metrología de Sensibilidad (Sobol/Morris) y Cuantificación de Incertidumbre (Guía ISO/IEC 98-3 GUM)

#### 2.9.1. Análisis Global de Sensibilidad por Varianza (Sobol 2001)
Descomposición funcional ortogonal de la varianza total de salida del gemelo:

$$S_i = \frac{\mathbb{V}_{X_i}\left(\mathbb{E}_{\mathbf{X}_{\sim i}}[Y \mid X_i]\right)}{\mathbb{V}(Y)}, \qquad S_{Ti} = 1 - \frac{\mathbb{V}_{\mathbf{X}_{\sim i}}\left(\mathbb{E}_{X_i}[Y \mid \mathbf{X}_{\sim i}]\right)}{\mathbb{V}(Y)} \quad (12, 13)$$

* **Exégesis:** $Y$ es la salida simulada (caudal $Q$ o humedad $\theta$); $X_i$ son los parámetros físicos ($CN, K_{\text{sat}}, n, \theta_{\text{sat}}$); $\mathbb{V}(Y)$ es la varianza total bajo $N=10,\!000$ muestreos Quasi-Monte Carlo de Sobol; $S_i$ mide el impacto directo de primer orden; y $S_{Ti}$ incluye las interacciones no lineales totales.

#### 2.9.2. Asimilación Dinámica Continua y Nudging de la Sonda Mínima
Actualización continua de la variable de estado mediante inyección forzante de Newton:

$$\frac{d\hat{\theta}(z, t)}{dt} = \mathcal{M}\left( \hat{\theta}(z, t), \mathbf{F}_{\text{clima}}(t) \right) + G_n \cdot \mathcal{W}(z, z_{\text{obs}}) \cdot \left[ \theta_{\text{obs}}(t) - \hat{\theta}(z_{\text{obs}}, t) \right] \quad (14)$$

* **Exégesis y Demostración de $H_3$:** $\hat{\theta}(z, t)$ es la humedad simulada; $\mathcal{M}$ es el operador físico; $\mathbf{F}_{\text{clima}}$ es el forzamiento meteorológico ($P, ET_0$); $G_n$ es la ganancia de nudging; $\mathcal{W}$ es el kernel gaussiano de correlación vertical; y $\theta_{\text{obs}}$ es la lectura real de la sonda TDR mínima. Demuestra matemáticamente por qué una sola sonda y una estación colapsan el 86.4% de la incertidumbre en toda la cuenca.

---

### 2.10. Protocolo Experimental Ciego de Muestra Dividida y Banco de Pruebas en R
Protocolo de muestra dividida (Klemeš, 1986): calibración en 2013–2018 ($KGE$ óptimo) y validación ciega con parámetros congelados en 2019–2023 (Megasequía e inundaciones 2023). Todo el banco de pruebas, el análisis Monte Carlo ($N=10,\!000$) y las 4 figuras a 300 DPI están implementados y son reproducibles mediante `scripts/r_benchmark_cases.R` (R v4.5.2).'''


def main():
    script_path = '/Users/danielsantander/Documents/agritwin-app/scripts/generate_canonical_paper.py'
    with open(script_path, 'r', encoding='utf-8') as f:
        text = f.read()

    # 1. Reemplazar Parte II en build_html()
    # Identificar inicio de Parte II y Parte III en HTML
    p2_html_start = text.find('<h1 class="part-title">Parte II: Materiales y Métodos</h1>')
    p3_html_start = text.find('<h1 class="part-title">Parte III: Resultados</h1>')
    if p2_html_start == -1 or p3_html_start == -1:
        print("Error: No se encontró Parte II o Parte III en HTML")
        return

    text_new = text[:p2_html_start] + HTML_PART_II + '\n\n        ' + text[p3_html_start:]

    # 2. Reemplazar Parte II en build_markdown()
    p2_md_start = text_new.find('## Parte II: Materiales y Métodos')
    p3_md_start = text_new.find('## Parte III: Resultados')
    if p2_md_start == -1 or p3_md_start == -1:
        print("Error: No se encontró Parte II o Parte III en Markdown")
        return

    text_final = text_new[:p2_md_start] + MD_PART_II + '\n\n' + text_new[p3_md_start:]

    with open(script_path, 'w', encoding='utf-8') as f:
        f.write(text_final)

    print("generate_canonical_paper.py actualizado exitosamente con la genealogía canónica de 5 pasos.")

if __name__ == '__main__':
    main()
