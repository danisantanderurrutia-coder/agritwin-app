# Documento de Enlace y Memoria Contextual: Marco Teórico AgriTwin
**Fecha de Generación:** Noviembre 2026  
**Repositorio Principal:** `/Users/danielsantander/Documents/Agrotech/agritwin`  
**Repositorio App / Espejo:** `/Users/danielsantander/Documents/agritwin-app`  
**Objetivo:** Permitir el arranque inmediato de un nuevo hilo de conversación sin pérdida de rigor, contexto, decisiones epistemológicas ni genealogía matemática.

---

## 1. Núcleo Epistemológico Fundamental (Las Claves Decisionales)

1. **Superación de Destination Earth (DestinE):**
   * *DestinE (Europa / ECMWF / ESA):* Megaproyecto macro-planetario de grilla gruesa ($1\text{ a }9\text{ km}$) en supercomputadores petascala (LUMI, MareNostrum 5). Modela superficies estandarizadas pasivas; no tiene operadores agroecológicos, ni suelo vivo a microescala, ni gobernanza comunitaria.
   * *AgriTwin:* **Síntesis situada, frugal y de alta resolución ($10\text{ m}$ a submétrica)**. Desacoplado en motores matemáticos puros que corren en $<5\text{ ms}$ en un navegador. Transmuta intervenciones regenerativas humanas (Keyline Yeomans, zanjas de infiltración, fajas WUI) en **operadores dinámicos de sumidero y frontera dentro de Ecuaciones en Derivadas Parciales (EDPs)** acoplados a la teoría de bienes comunes de **Elinor Ostrom**.

2. **Los Dos Operadores Biofísicos Clave en EDPs:**
   * **Hidrodinámica 2D (Saint-Venant difusivo):** $\frac{\partial h}{\partial t} + \nabla \cdot (h \mathbf{u}) = P_e(t) - S_{\text{keyline}}(x, y, t)$  
     Donde $S_{\text{keyline}} = \min\left( \frac{V_{\text{tranque}} - V(t)}{\Delta t \cdot A_{\text{celda}}}, \; K_{\text{sat}} \cdot \nabla h \cdot \frac{w_{\text{zanja}}}{L_{\text{celda}}} \cdot \psi(\text{AMC}) \right)$.  
     Atenúa pico aluvial en $-22.4\%$ y expande ventana de evacuación en $+2.4\text{ h}$. Si el tranque o el suelo se saturan ($\text{AMC-III}$), $S_{\text{keyline}} \to 0$ (simula rebalse real).
   * **Pirodinámica WUI (Byram-Albini):**  
     Distancia radiante $D_{\text{radiante}} = 4.0 \cdot L_{\text{llama}}$ con $I_B = 259 L_{\text{flame}}^{2.17}$.  
     Probabilidad estocástica de salto de pavesas $P_{\text{spotting}} = 1 - \exp\left( - 0.042 \cdot \frac{U_{10}^{1.35}}{W_{\text{faja}}} \cdot (1 - \text{HR}) \cdot \frac{C_{\text{dosel}}}{50} \right)$.  
     Demuestra que la faja seca de 45 m retiene el $81.3\%$ bajo viento Puelche ($42\text{ km/h}$), pero colapsa al $94\%$ de salto aéreo bajo tormentas de $65\text{ km/h}$ (Viña del Mar), exigiendo alerta táctica C2 y aspersión húmeda.

3. **Las 4 Hipótesis Científicas Formales:**
   * **H1 (Rigor Hidrológico):** Asimilación de micro-topografía DEM 30m y curvas de escorrentía SCS-CN reduce el sesgo $PBIAS$ en $>30\%$ vs. lumped. (Logrado: $92.2\%$).
   * **H2 (Ventana Predictiva):** Acoplamiento de balances radiativos y drenaje catabático expande la alerta temprana de heladas/olas de calor en $>2$ horas. (Logrado: $204\%$).
   * **H3 (Sensor Mínimo Viable):** Con 1 nodo KioT por cada 5 ha y nudging asimilativo, el error de humedad de dosel se mantiene $<15\%$ RMSE. (Logrado: $11.2\%$).
   * **H4 (Freno Pirogénico Keyline):** Red de surcos Keyline y cortinas vivas desacelera el avance de fuego en $>40\%$ vs. monocultivo. (Logrado: $54.8\%$).

---

## 2. Mapa de Archivos Canónicos del Proyecto

| Rol Documental | Ruta en el Repositorio | Descripción |
| :--- | :--- | :--- |
| **Paper 1 (Marco Teórico & UQ)** | `docs/PAPER_CIENTIFICO_AGRITWIN_MARCO_TEORICO_UQ.md` | Markdown canónico IMRAD, 14 ecuaciones, UQ (Klemeš, Sobol, GUM). |
| **Paper 1 Imprimible** | `docs/PAPER_CIENTIFICO_AGRITWIN_IMPRIMIBLE.html` | Versión HTML editorial de alta fidelidad con KaTeX y estilos Q1. |
| **Paper 2 (Hindcast Incendios)** | `docs/INFORME_HINDCAST_REAL_SANTA_JUANA_VINA.md` | Auditoría ciega Santa Juana (2023) y Viña del Mar (2024), dNBR. |
| **Paper 2 Imprimible** | `docs/INFORME_HINDCAST_REAL_IMPRIMIBLE.html` | Versión imprimible con galería 4 capas y formulación Byram-Albini. |
| **Paper 3 (Hindcast Inundaciones)** | `docs/INFORME_HINDCAST_REAL_INUNDACIONES_MAULE_MATAQUITO.md` | Licantén, Longaví y Ancoa 2023. Sentinel-1 SAR $\sigma_0 < -18\text{ dB}$, HAND. |
| **Paper 3 Imprimible** | `docs/INFORME_HINDCAST_REAL_INUNDACIONES_IMPRIMIBLE.html` | Versión HTML con 12 capturas a $1600\times1000$ y Saint-Venant 2D. |
| **The Vault (Bóveda Interactiva)** | `index.html` | 10 Módulos de física, UQ, gobernanza Ostrom, fichas de datos satelitales. |
| **Motores Biofísicos Puros** | `js/engines/basin-hydrology-engine.js`<br>`js/engines/soil-water-engine.js` | Funciones deterministas puras desacopladas del DOM. |
| **Scripts de Benchmarking** | `scripts/r_benchmark_cases.R`<br>`scripts/isric_soilgrids_soc.R`<br>`scripts/floods/capture_flood_screenshots.py` | Reproducibilidad en R y Python para figuras y validación estadística. |

---

## 3. Estado de Sincronización de Repositorios

Ambos repositorios se encuentran estrictamente idénticos y sincronizados con GitHub:
* `agritwin-hub` (`/Users/danielsantander/Documents/Agrotech/agritwin`) en commit `cc0c243` o superior.
* `agritwin-app` (`/Users/danielsantander/Documents/agritwin-app`) en commit `e2820ce` o superior.

---

## 4. Prompt Maestro para Iniciar el Nuevo Chat

Copia y pega el siguiente bloque exacto en el primer mensaje de tu nuevo chat:

```markdown
Hola Antigravity. Estoy abriendo este nuevo chat específicamente enfocado en continuar profundizando, puliendo y auditando el Marco Teórico Científico (Paper 1, Paper 2, Paper 3 y The Vault) de AgriTwin en /Users/danielsantander/Documents/Agrotech/agritwin.

Antes de cualquier propuesta, lee obligatoriamente el archivo de memoria y enlace recién generado en el repositorio:
`docs/HANDOVER_MARCO_TEORICO_NUEVO_CHAT.md`
y el paper canónico:
`docs/PAPER_CIENTIFICO_AGRITWIN_MARCO_TEORICO_UQ.md`.

Reglas y premisas intocables que ya resolvimos y debes mantener:
1. No subordinar AgriTwin a Destination Earth: AgriTwin superó ese nivel macro-planetario mediante síntesis situada, frugalidad computacional (<5 ms), física hiperlocal (10m) y operadores agroecológicos dinámicos en EDPs (Saint-Venant 2D para Keyline y Byram-Albini para WUI), además de la gobernanza comunitaria de Elinor Ostrom.
2. Rigor científico Q1: protocolo Klemeš 1986, descomposición GUM / Sobol, métricas KGE/NSE/PBIAS y simetría entre el hindcast de fuego (Sentinel-2 dNBR) y el de inundaciones (Sentinel-1 SAR Banda C).
3. Todo cambio en el Marco Teórico debe mantenerse sincronizado entre el Markdown canónico y las versiones HTML imprimibles.

Confírmame que leíste el documento de handover y dime en qué puntos específicos del marco teórico nos enfocaremos hoy.
```
