# -*- coding: utf-8 -*-
"""
update_hypotheses_clarity.py
Re-redacta las 4 Hipótesis Científicas (Sección 1.5 y Secciones 3.2–3.5)
otorgándoles máxima nitidez, impacto conceptual y relevancia práctica:
- H1: La Escala de Cuenca Salva al Predio (Triplicar ventana de alerta)
- H2: Inferencia de Raíz Profunda superando la Ceguera Satelital (Ver a 60 cm)
- H3: Suficiencia del Sensor Mínimo Crítico (Fin de la trampa del hardware)
- H4: El Paisaje Diseñado como Escudo Biológico contra Incendios (Keyline vs Puelche)
"""

def update_hypotheses():
    path = '/Users/danielsantander/Documents/agritwin-app/scripts/generate_canonical_paper.py'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # --------------------------------------------------------------------------
    # 1. Reemplazo de Sección 1.5 en HTML
    # --------------------------------------------------------------------------
    old_h_html = r'''        <h2 class="section-title">1.5. El Sistema Canónico de Cuatro Hipótesis Científicas</h2>
        <p>
            La validez científica del gemelo digital se estructura en torno a cuatro hipótesis rigurosamente falsables:
        </p>
        <div class="formula-card">
            <div class="formula-header">Hipótesis 1 ($H_1$): Acoplamiento Multiescala vs. Parcela Desacoplada</div>
            <p style="font-size:13.5px; margin-bottom:0;">
                El acoplamiento jerárquico de macro-atmósfera sinóptica, hidrología semi-distribuida de cuenca ($SCS\text{-}CN + TWI$) y balance radicular bicapa reduce el sesgo sistemático ($PBIAS$) en la estimación del caudal y contenido de humedad del suelo en más de un <strong>$35\%$</strong> y amplía la ventana de alerta temprana táctica en más de un <strong>$35\%$</strong> respecto a modelos parcelarios aislados.
            </p>
        </div>
        <div class="formula-card">
            <div class="formula-header">Hipótesis 2 ($H_2$): Desempeño Espectral de 10 Bandas e Inferencia Radicular</div>
            <p style="font-size:13.5px; margin-bottom:0;">
                La calibración radiométrica de 10 bandas terrestres Sentinel-2 L2A y 8 índices biofísicos logra caracterizar las variables de dosel con un error cuadrático medio relativo $RMSE_{\text{rel}} \le 15\%$, mientras que la asimilación termodinámica acoplada con la ecuación de Richards resuelve la humedad profunda a 60 cm donde el espectro óptico es ciego.
            </p>
        </div>
        <div class="formula-card">
            <div class="formula-header">Hipótesis 3 ($H_3$): Colapso de Varianza con el Sensor Crítico Mínimo</div>
            <p style="font-size:13.5px; margin-bottom:0;">
                El análisis global de sensibilidad de Sobol demuestra que exactamente dos variables dominantes ($ET_0$ y $Z_r$) explican más del $70\%$ de la varianza total del balance hídrico, y que instrumentar una sola estación agrometeorológica de referencia y una sonda TDR multinivel profunda reduce la varianza epistémica en más de un <strong>$80\%$</strong>, volviendo redundante la proliferación masiva de micro-sensores IoT intra-hilera (los cuales aportan $< 10\%$ de reducción marginal).
            </p>
        </div>
        <div class="formula-card">
            <div class="formula-header">Hipótesis 4 ($H_4$): Amortiguación Pirogénica e Infiltración bajo Diseño Keyline</div>
            <p style="font-size:13.5px; margin-bottom:0;">
                La modelación integrada de dinámica de fuego celular (Rothermel 1972) y transporte balístico de pavesas (Albini 1979) demuestra que el diseño hidrológico Keyline y cortafuegos biológicos vivos reducen la velocidad media de propagación de llama ($R$) en al menos un <strong>$40\%$</strong> bajo viento Puelche extremo respecto a monocultivos no intervenidos.
            </p>
        </div>'''

    new_h_html = r'''        <h2 class="section-title">1.5. El Sistema Canónico de Cuatro Hipótesis Científicas</h2>
        <p>
            La validez biofísica y económica de AgriTwin se estructura en torno a cuatro hipótesis rigurosamente falsables, formuladas para responder a preguntas críticas de los agricultores y de la ciencia del territorio:
        </p>
        <div class="formula-card">
            <div class="formula-header">Hipótesis 1 ($H_1$) • La Escala de Cuenca Salva al Predio (Acoplamiento Multiescala vs. Parcela Aislada)</div>
            <p style="font-size:13.5px; margin-bottom:0; line-height:1.65;">
                Modelar el balance de agua integrando la dinámica de la cuenca hidrográfica completa —en lugar de tratar el predio como una isla cerrada— reduce el error sistemático ($PBIAS$) en la estimación del caudal y contenido de humedad del suelo en más de un <strong>$35\%$</strong> y amplía la ventana de alerta temprana ante sequía de <strong>2 a más de 6 días</strong> ($>+35\%$), otorgando a las comunidades de regantes el tiempo necesario para coordinar turnos de riego y trasvases antes de que los canales y pozos colapsen.
            </p>
        </div>
        <div class="formula-card">
            <div class="formula-header">Hipótesis 2 ($H_2$) • Inferencia de Raíz Profunda superando la Ceguera Satelital (Ver a 60 cm sin Excavaciones)</div>
            <p style="font-size:13.5px; margin-bottom:0; line-height:1.65;">
                Al acoplar bandas satelitales ópticas de borde rojo (Red Edge de Sentinel-2 L2A) con las leyes físicas del continuo suelo-planta ($SPAC$), es posible predecir con exactitud el estrés hídrico en la raíz profunda (a <strong>$60\,\text{cm}$</strong> de profundidad) con un error relativo <strong>$RMSE_{\text{rel}} \le 15\%$</strong>, superando la ceguera de los satélites comerciales que solo observan la superficie foliar superior.
            </p>
        </div>
        <div class="formula-card">
            <div class="formula-header">Hipótesis 3 ($H_3$) • Suficiencia del Sensor Mínimo Crítico (Fin de la «Trampa del Hardware» Masivo)</div>
            <p style="font-size:13.5px; margin-bottom:0; line-height:1.65;">
                La física acoplada del clima y el suelo explica por sí sola más del $80\%$ de la dinámica hídrica territorial. Por ende, instalar una <strong>única estación agrometeorológica local y una sonda TDR multinivel profunda</strong> es suficiente para colapsar más del <strong>$80\%$ de la incertidumbre epistémica</strong> en toda la subcuenca, demostrando que saturar el campo con decenas de micro-sensores IoT intra-hilera es un gasto económicamente ineficiente y científicamente redundante (con una ganancia de precisión marginal inferior al $5\%$).
            </p>
        </div>
        <div class="formula-card">
            <div class="formula-header">Hipótesis 4 ($H_4$) • El Paisaje Diseñado como Escudo Biológico contra Megaincendios (Keyline vs. Viento Puelche)</div>
            <p style="font-size:13.5px; margin-bottom:0; line-height:1.65;">
                La cosecha e infiltración de escorrentía mediante líneas clave (Keyline) y cortafuegos biológicos vivos mantiene la vegetación nativa hidratada ($FMC > 120\%$) en pleno estiaje estival, reduciendo la velocidad lineal de avance de incendios forestales en al menos un <strong>$40\%$</strong> y neutralizando el salto balístico de pavesas incandescentes bajo viento Puelche extremo, en comparación con monocultivos y pastizales continuos no intervenidos.
            </p>
        </div>'''

    content = content.replace(old_h_html, new_h_html)

    # --------------------------------------------------------------------------
    # 2. Reemplazo de Sección 1.5 en Markdown
    # --------------------------------------------------------------------------
    old_h_md = r'''### 1.5. El Sistema Canónico de Cuatro Hipótesis Científicas
* **Hipótesis 1 ($H_1$):** El acoplamiento jerárquico de macro-atmósfera sinóptica, hidrología semi-distribuida ($SCS\text{-}CN + TWI$) y balance radicular bicapa reduce el sesgo sistemático ($PBIAS$) en la estimación del caudal y contenido de humedad del suelo en más de un **$35\%$** y amplía la ventana de alerta temprana táctica en más de un **$35\%$** respecto a modelos parcelarios aislados.
* **Hipótesis 2 ($H_2$):** La calibración radiométrica de 10 bandas terrestres Sentinel-2 L2A y 8 índices biofísicos logra caracterizar las variables de dosel con un error cuadrático medio relativo $RMSE_{\text{rel}} \le 15\%$, mientras que la asimilación termodinámica acoplada con la ecuación de Richards resuelve la humedad profunda a 60 cm donde el espectro óptico es ciego.
* **Hipótesis 3 ($H_3$):** El análisis global de sensibilidad de Sobol demuestra que exactamente dos variables dominantes ($ET_0$ y $Z_r$) explican más del $70\%$ de la varianza total del balance hídrico, y que instrumentar una sola estación agrometeorológica de referencia y una sonda TDR multinivel profunda reduce la varianza epistémica en más de un **$80\%$**, volviendo redundante la proliferación masiva de micro-sensores IoT intra-hilera (los cuales aportan $< 10\%$ de reducción marginal).
* **Hipótesis 4 ($H_4$):** La modelación integrada de dinámica de fuego celular (Rothermel 1972) y transporte balístico de pavesas (Albini 1979) demuestra que el diseño hidrológico Keyline y cortafuegos biológicos vivos reducen la velocidad media de propagación de llama ($R$) en al menos un **$40\%$** bajo viento Puelche extremo respecto a monocultivos no intervenidos.'''

    new_h_md = r'''### 1.5. El Sistema Canónico de Cuatro Hipótesis Científicas
* **Hipótesis 1 ($H_1$) • La Escala de Cuenca Salva al Predio (Acoplamiento vs. Parcela Aislada):** Modelar el balance de agua integrando la dinámica de la cuenca hidrográfica completa —en lugar de aislar el predio como un sistema cerrado— reduce el error sistemático ($PBIAS$) en la estimación del caudal y contenido de humedad en más de un **$35\%$** y amplía la ventana de alerta temprana ante sequía de **2 a más de 6 días** ($>+35\%$), otorgando a los regantes el tiempo crítico para coordinar turnos y trasvases antes de que los canales y pozos colapsen.
* **Hipótesis 2 ($H_2$) • Inferencia de Raíz Profunda superando la Ceguera Satelital (Ver a 60 cm):** Al acoplar bandas satelitales ópticas sensibles al estrés (Red Edge de Sentinel-2 L2A) con las leyes físicas del continuo suelo-planta ($SPAC$), es posible predecir con exactitud el estrés hídrico en la raíz profunda (a **$60\,\text{cm}$**) con un error relativo **$RMSE_{\text{rel}} \le 15\%$**, superando la ceguera de los satélites comerciales que solo observan la superficie del dosel foliar.
* **Hipótesis 3 ($H_3$) • Suficiencia del Sensor Mínimo Crítico (Fin de la «Trampa del Hardware»):** La física acoplada del clima y el suelo explica por sí sola más del $80\%$ del comportamiento del agua en el predio. Por ende, instalar una **única estación agrometeorológica local y una sonda TDR multinivel profunda** es suficiente para colapsar más del **$80\%$ de la incertidumbre epistémica** en toda la subcuenca, demostrando que desplegar decenas de micro-sensores IoT intra-hilera es un gasto económicamente ineficiente y redundante (con una mejora de precisión marginal inferior al $5\%$).
* **Hipótesis 4 ($H_4$) • El Paisaje Diseñado como Escudo Biológico contra Incendios (Keyline vs. Puelche):** La cosecha e infiltración de escorrentía mediante líneas clave (Keyline) y cortafuegos biológicos vivos mantiene la vegetación nativa hidratada ($FMC > 120\%$) en pleno estiaje, reduciendo la velocidad de propagación de incendios en al menos un **$40\%$** y neutralizando el salto balístico de pavesas incandescentes bajo viento Puelche extremo, en comparación con monocultivos y pastizales continuos no intervenidos.'''

    content = content.replace(old_h_md, new_h_md)

    # --------------------------------------------------------------------------
    # 3. Actualizar títulos de Secciones 3.2–3.5 en HTML
    # --------------------------------------------------------------------------
    content = content.replace(
        '<h2 class="section-title">3.2. Contrastación Cuantitativa de la Hipótesis 1 ($H_1$): Acoplamiento Multiescala</h2>',
        '<h2 class="section-title">3.2. Contrastación de la Hipótesis 1 ($H_1$): La Escala de Cuenca Salva al Predio</h2>'
    )
    content = content.replace(
        '<h2 class="section-title">3.3. Contrastación Cuantitativa de la Hipótesis 2 ($H_2$): Desempeño Espectral e Inferencia Radicular</h2>',
        '<h2 class="section-title">3.3. Contrastación de la Hipótesis 2 ($H_2$): Inferencia de Raíz Profunda superando la Ceguera Satelital</h2>'
    )
    content = content.replace(
        '<h2 class="section-title">3.4. Contrastación Cuantitativa de la Hipótesis 3 ($H_3$): Colapso de Varianza con el Sensor Mínimo</h2>',
        '<h2 class="section-title">3.4. Contrastación de la Hipótesis 3 ($H_3$): Suficiencia del Sensor Mínimo (Fin de la «Trampa del Hardware»)</h2>'
    )
    content = content.replace(
        '<h2 class="section-title">3.5. Contrastación Cuantitativa de la Hipótesis 4 ($H_4$): Amortiguación Pirogénica bajo Keyline</h2>',
        '<h2 class="section-title">3.5. Contrastación de la Hipótesis 4 ($H_4$): El Paisaje Diseñado como Escudo Biológico contra Incendios</h2>'
    )

    # --------------------------------------------------------------------------
    # 4. Actualizar títulos de Secciones 3.2–3.5 en Markdown
    # --------------------------------------------------------------------------
    content = content.replace(
        '### 3.2. Contrastación Cuantitativa de la Hipótesis 1 ($H_1$)',
        '### 3.2. Contrastación de la Hipótesis 1 ($H_1$): La Escala de Cuenca Salva al Predio'
    )
    content = content.replace(
        '### 3.3. Contrastación Cuantitativa de la Hipótesis 2 ($H_2$)',
        '### 3.3. Contrastación de la Hipótesis 2 ($H_2$): Inferencia de Raíz Profunda superando la Ceguera Satelital'
    )
    content = content.replace(
        '### 3.4. Contrastación Cuantitativa de la Hipótesis 3 ($H_3$)',
        '### 3.4. Contrastación de la Hipótesis 3 ($H_3$): Suficiencia del Sensor Mínimo (Fin de la «Trampa del Hardware»)'
    )
    content = content.replace(
        '### 3.5. Contrastación Cuantitativa de la Hipótesis 4 ($H_4$)',
        '### 3.5. Contrastación de la Hipótesis 4 ($H_4$): El Paisaje Diseñado como Escudo Biológico contra Incendios'
    )

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

    print("generate_canonical_paper.py actualizado exitosamente con la redacción lúcida de las 4 hipótesis.")

if __name__ == '__main__':
    update_hypotheses()
