/**
 * AgriTwin - PossibilitiesCatalog & App Guide (Botón 'i' de Información)
 * 
 * Renamed to "Catálogo de Ítems"
 * Comprehensive taxonomy catalog, item definitions, and visual specifications for AgriTwin 3D.
 */

export class PossibilitiesCatalog {
  static CATEGORIES = [
    {
      id: 'fruits',
      title: '🍎 Cultivos & Frutales',
      items: [
        { name: 'Manzanos (Malus domestica)', family: 'Rosaceae', icon: '🍎', color: '#ef4444', style: 'orchard_apple', water: 'Alto', frost: 'Resistente (-5°C)', fireRisk: 'Bajo', desc: 'Cuartel frutal de alto rendimiento con riego por goteo.' },
        { name: 'Cerezos (Prunus avium)', family: 'Rosaceae', icon: '🍒', color: '#dc2626', style: 'orchard_cherry', water: 'Alto', frost: 'Sensible en flor', fireRisk: 'Bajo', desc: 'Variedades Bing/Lapins con microaspersión antiheladas.' },
        { name: 'Avellanos Europeos (Corylus avellana)', family: 'Betulaceae', icon: '🌰', color: '#b45309', style: 'orchard_hazel', water: 'Medio', frost: 'Muy resistente', fireRisk: 'Bajo-Medio', desc: 'Frutal de nuez con cobertura de trébol subterráneo.' },
        { name: 'Olivos (Olea europaea)', family: 'Oleaceae', icon: '🫒', color: '#65a30d', style: 'orchard_olive', water: 'Bajo-Medio', frost: 'Resistente', fireRisk: 'Medio', desc: 'Cultivo intensivo de aceite de oliva y aceitunas de mesa.' },
        { name: 'Cítricos (Citrus spp.)', family: 'Rutaceae', icon: '🍊', color: '#f97316', style: 'orchard_citrus', water: 'Medio-Alto', frost: 'Sensible (< -2°C)', fireRisk: 'Bajo', desc: 'Naranjos, limoneros y mandarinos.' },
        { name: 'Vides / Viñedos (Vitis vinifera)', family: 'Vitaceae', icon: '🍇', color: '#7e22ce', style: 'vineyard', water: 'Bajo', frost: 'Sensible en brotación', fireRisk: 'Medio', desc: 'Parronales y viñedos de cepas finas.' },
        { name: 'Arándanos (Vaccinium corymbosum)', family: 'Ericaceae', icon: '🫐', color: '#2563eb', style: 'berry_shrub', water: 'Alto', frost: 'Resistente', fireRisk: 'Bajo', desc: 'Arbustal frutal de berries con mulch orgánico.' },
        { name: 'Frutales Genéricos', family: 'Familia Genérica', icon: '🌳', color: '#10b981', style: 'orchard_generic', water: 'Variable', frost: 'Variable', fireRisk: 'Bajo', desc: 'Selección genérica para frutales no clasificados en la lista.' }
      ]
    },
    {
      id: 'native_forest',
      title: '🌳 Bosque Nativo & Silvicultura',
      items: [
        { name: 'Quillay (Quillaja saponaria)', family: 'Rosaceae', icon: '🌳', color: '#15803d', style: 'native_broadleaf', water: 'Bajo', frost: 'Resistente', fireRisk: 'Resiliente (Corteza gruesa)', desc: 'Árbol nativo esclerófilo de alta capacidad apícola y bio-remediación.' },
        { name: 'Peumo (Cryptocarya alba)', family: 'Lauraceae', icon: '🍃', color: '#166534', style: 'native_broadleaf', water: 'Medio', frost: 'Resistente', fireRisk: 'Bajo-Medio', desc: 'Especie nativa arbórea de sombra densa y retención de humedad.' },
        { name: 'Boldo (Peumus boldus)', family: 'Monimiaceae', icon: '🌿', color: '#14532d', style: 'native_broadleaf', water: 'Bajo', frost: 'Muy resistente', fireRisk: 'Resiliente', desc: 'Nativo de hojas medicinales aromáticas y baja inflamabilidad.' },
        { name: 'Roble / Hualo (Nothofagus obliqua)', family: 'Nothofagaceae', icon: '🌲', color: '#1e3a1e', style: 'native_roble', water: 'Medio', frost: 'Resistente', fireRisk: 'Medio', desc: 'Caducifolio nativo del Maule de gran valor ecológico y paisajístico.' },
        { name: 'Coigüe (Nothofagus dombeyi)', family: 'Nothofagaceae', icon: '🌲', color: '#064e3b', style: 'native_broadleaf', water: 'Medio-Alto', frost: 'Resistente', fireRisk: 'Medio', desc: 'Árbol perenne de rápido crecimiento para corredores biológicos.' },
        { name: 'Pino Radiata (Pinus radiata)', family: 'Pinaceae', icon: '🌲', color: '#047857', style: 'conifer_pine', water: 'Bajo', frost: 'Muy resistente', fireRisk: '⚠️ EXTREMO (Combustible Alto)', desc: 'Especie introducida silvícola. Requiere cortafuegos preventivos.' },
        { name: 'Eucalipto (Eucalyptus globulus)', family: 'Myrtaceae', icon: '🌿', color: '#059669', style: 'slender_eucalyptus', water: 'Alto consumidor', frost: 'Resistente', fireRisk: '⚠️ ALTO (Aceites volátiles)', desc: 'Plantación forestal. Alta absorción de napas hídricas.' },
        { name: 'Bosque Nativo Genérico', family: 'Familia Genérica', icon: '🌲', color: '#15803d', style: 'native_broadleaf', water: 'Adaptativo', frost: 'Resistente', fireRisk: 'Bajo-Medio', desc: 'Agrupación de especies nativas diversas para restauración ecológica.' }
      ]
    },
    {
      id: 'shrubs_herbs',
      title: '🌿 Arbustos, Hierbas & Pastizales',
      items: [
        { name: 'Pastizal Natural Seco', family: 'Poaceae', icon: '🌾', color: '#eab308', style: 'pasture', water: 'Secano', frost: 'Resistente', fireRisk: '⚠️ ALTO en verano', desc: 'Cubierta gramínea estacional con fardos de heno y cercado rústico.' },
        { name: 'Alfalfa (Medicago sativa)', family: 'Fabaceae', icon: '🌾', color: '#84cc16', style: 'pasture_green', water: 'Alto', frost: 'Resistente', fireRisk: 'Bajo', desc: 'Leguminosa forrajera fijadora de nitrógeno para praderas verdes.' },
        { name: 'Trébol Subterráneo (Trifolium subterraneum)', family: 'Fabaceae', icon: '🍀', color: '#22c55e', style: 'pasture_clover', water: 'Medio', frost: 'Resistente', fireRisk: 'Bajo', desc: 'Cobertura viva para control de malezas y protección biológica.' },
        { name: 'Maqui (Aristotelia chilensis)', family: 'Elaeocarpaceae', icon: '🍇', color: '#6b21a8', style: 'shrub_berry', water: 'Medio', frost: 'Resistente', fireRisk: 'Bajo', desc: 'Arbusto nativo superfruto antioxidante para bordes de estero.' },
        { name: 'Rosa Mosqueta (Rosa rubiginosa)', family: 'Rosaceae', icon: '🌹', color: '#e11d48', style: 'shrub_rose', water: 'Bajo', frost: 'Muy resistente', fireRisk: 'Medio', desc: 'Arbusto silvestre ideal para cercos vivos y protección de bordes.' },
        { name: 'Arbustos Genéricos', family: 'Familia Genérica', icon: '🌿', color: '#4ade80', style: 'shrub_generic', water: 'Bajo-Medio', frost: 'Variable', fireRisk: 'Medio', desc: 'Categoría para arbustos y matorrales continentales.' },
        { name: 'Hierbas Genéricas & Cubiertas', family: 'Familia Genérica', icon: '🌱', color: '#a3e635', style: 'pasture_herb', water: 'Variable', frost: 'Resistente', fireRisk: 'Variable', desc: 'Coberturas vegetales herbáceas para protección de suelos.' }
      ]
    },
    {
      id: 'infrastructure',
      title: '🏚️ Construcciones e Infraestructura',
      items: [
        { name: 'Galpón Agrícola / Bodega', family: 'Construcción', icon: '🏚️', color: '#d97706', style: 'barn_farm', material: 'Acero / Madera', fireRisk: 'Estructura Protegida', desc: 'Almacenamiento de fardos, maquinaria pesada y herramientas de campo.' },
        { name: 'Taller Mecánico & Mantenimiento', family: 'Construcción', icon: '🛠️', color: '#64748b', style: 'barn_workshop', material: 'Hormigón / Metal', fireRisk: 'Área Crítica', desc: 'Mantenimiento de tractores, implementos y repuestos agrícolas.' },
        { name: 'Invernadero Alta Tecnología', family: 'Infraestructura', icon: '🏛️', color: '#06b6d4', style: 'greenhouse', material: 'Policarbonato / Acero', fireRisk: 'Bajo', desc: 'Producción protegida con climatización automática e hidroponía.' },
        { name: 'Bodega de Fitosanitarios & Agroquímicos', family: 'Construcción', icon: '📦', color: '#b91c1c', style: 'barn_storage', material: 'Albañilería Cortafuego', fireRisk: 'Protocolo Especial', desc: 'Almacén norma SAG para productos de protección de cultivos.' },
        { name: 'Estación Meteorológica IoT', family: 'Tecnología', icon: '📡', color: '#8b5cf6', style: 'iot_tower', material: 'Panel Solar + Telemetría', fireRisk: 'Ninguno', desc: 'Sensor de temperatura, humedad, radiación UV, viento y pluviosidad.' },
        { name: 'Estanque Acumulador de Agua', family: 'Infraestructura Hídrica', icon: '💧', color: '#0284c7', style: 'water_pond', material: 'Geomembrana', fireRisk: 'Reserva de Incendios', desc: 'Reserva hídrica para riego localizado y combate preventivo de fuego.' },
        { name: 'Caseta de Riego / Bombas', family: 'Infraestructura Hídrica', icon: '🚰', color: '#0ea5e9', style: 'pump_station', material: 'Metal / Malla', fireRisk: 'Bajo', desc: 'Automatización de válvulas de retención y filtrado de agua.' },
        { name: 'Casa Patronal / Vivienda Campo', family: 'Construcción Habitacional', icon: '🏡', color: '#ea580c', style: 'house_villa', material: 'Madera / Teja', fireRisk: 'Protección Perimetral', desc: 'Residencia principal del fundo y oficinas administrativas.' }
      ]
    },
    {
      id: 'hydrologic',
      title: '🌊 Recursos Hídricos & Sensores',
      items: [
        { name: 'Estero Colliguay / Cauce Natural', family: 'Cuerpo de Agua', icon: '🌊', color: '#0369a1', style: 'water_river', flow: 'Continuo', desc: 'Eje hídrico del territorio. Proporciona agua de recarga ambiental.' },
        { name: 'Canal de Riego Matriz', family: 'Infraestructura Hídrica', icon: '💧', color: '#0284c7', style: 'water_canal', flow: 'Controlado por Compuerta', desc: 'Conducción hídrica para distribución entre sectores agrícolas.' },
        { name: 'Nodo Sensor IoT Suelo (VPD + Humedad)', family: 'Tecnología IoT', icon: '📡', color: '#a855f7', style: 'iot_node', range: 'LoRaWAN 15km', desc: 'Medición a 30cm y 60cm de profundidad con transmisión inalámbrica.' },
        { name: 'Trampa de Monitoreo de Plagas', family: 'Manejo Integrado', icon: '🪤', color: '#f59e0b', style: 'pest_trap', type: 'Feromonas / Luz', desc: 'Detección temprana de polillas y plagas cuarentenarias.' }
      ]
    },
    {
      id: 'permaculture',
      title: '🌿 Permacultura & Keyline Yeomans',
      items: [
        { name: 'Tranque Keyline de Retención', family: 'Hidrología Regenerativa', icon: '💧', color: '#0284c7', style: 'water_pond', water: 'Cosecha de Agua', frost: 'Termorregulador', fireRisk: 'Reserva Estratégica', desc: 'Embalse excavado en punto de inflexión topográfico (Keypoint) para riego por gravedad.', isKeylineElement: true, hydroRole: 'retention_pond' },
        { name: 'Zanja de Infiltración / Swale', family: 'Hidrología Regenerativa', icon: '〰️', color: '#06b6d4', style: 'swale_keyline', water: 'Infiltración Pasiva', frost: 'Bajo', fireRisk: 'Barrera Húmeda', desc: 'Zanja a nivel o al 0.2% que intercepta escorrentía superficial y recarga el manto freático.', isKeylineElement: true, hydroRole: 'infiltrating_swale' },
        { name: 'Potrero PRV (Pastoreo Voisin)', family: 'Ganadería Regenerativa', icon: '🐄', color: '#16a34a', style: 'pasture_clover', water: 'Medio', frost: 'Resistente', fireRisk: 'Bajo (Césped no senescente)', desc: 'Cuartel rotacional de alta densidad con cerco móvil y reposo óptimo de pradera.', isPrvElement: true },
        { name: 'Zona 1: Huerto Biointensivo', family: 'Zonificación Mollison', icon: '🌱', color: '#facc15', style: 'orchard_generic', water: 'Frecuente', frost: 'Protegido', fireRisk: 'Bajo', desc: 'Sector de máximo cuidado junto a la casa: hortalizas, semilleros y compost.', isPermacultureZone: 1 },
        { name: 'Zona 2: Huerto Frutal & Aves', family: 'Zonificación Mollison', icon: '🐓', color: '#84cc16', style: 'orchard_generic', water: 'Medio', frost: 'Moderado', fireRisk: 'Bajo', desc: 'Frutales menores, gallinero móvil e invernadero intermedio.', isPermacultureZone: 2 },
        { name: 'Zona 4: Bosque de Biomasa & Leña', family: 'Zonificación Mollison', icon: '🪵', color: '#b45309', style: 'native_broadleaf', water: 'Secano', frost: 'Muy resistente', fireRisk: 'Medio', desc: 'Árboles de rápido crecimiento para postes, leña y cortavientos andino.', isPermacultureZone: 4 },
        { name: 'Zona 5: Reserva Intangible / Rewilding', family: 'Zonificación Mollison', icon: '🌲', color: '#0284c7', style: 'native_broadleaf', water: 'Natural', frost: 'Resiliente', fireRisk: 'Bajo-Medio', desc: 'Corredor biológico sin intervención para fauna nativa y regulación de cuenca.', isPermacultureZone: 5 }
      ]
    }
  ];

  static getAllItems() {
    const all = [];
    this.CATEGORIES.forEach(cat => {
      cat.items.forEach(item => {
        all.push({
          ...item,
          categoryId: cat.id,
          categoryTitle: cat.title
        });
      });
    });
    return all;
  }

  static findItemByName(name) {
    if (!name) return this.CATEGORIES[0].items[0];
    const clean = name.toLowerCase().trim();
    const all = this.getAllItems();
    return all.find(it => it.name.toLowerCase() === clean) ||
           all.find(it => it.name.toLowerCase().includes(clean)) ||
           all.find(it => clean.includes(it.name.toLowerCase())) ||
           all[0];
  }

  static renderModalHTML() {
    return `
      <div id="infoModalOverlay" class="modal-overlay glass-modal-backdrop" style="display:none;">
        <div class="modal-container glass-panel width-large">
          <div class="modal-header">
            <div class="modal-title-group">
              <span class="modal-icon">ℹ️</span>
              <div>
                <h2 class="modal-title">AgriTwin 3D - Guía del Gemelo Digital & Catálogo de Ítems</h2>
                <div class="modal-subtitle">Desarrollado por AgroTech Chile & Rewild (Powered by Nanobanana Engine)</div>
              </div>
            </div>
            <button id="closeInfoModalBtn" class="close-btn">&times;</button>
          </div>

          <!-- Modal Nav Tabs -->
          <div class="modal-tabs">
            <button class="tab-btn active" data-tab="tab_app_guide">📖 ¿Cómo Funciona la App?</button>
            <button class="tab-btn" data-tab="tab_catalog">🌿 Catálogo de Ítems</button>
            <button class="tab-btn" data-tab="tab_architecture">⚡ Arquitectura & Redes IoT</button>
          </div>

          <div class="modal-body">
            <!-- TAB 1: HOW APP WORKS -->
            <div id="tab_app_guide" class="tab-content active">
              <div class="guide-grid">
                <div class="guide-card glass-panel">
                  <div class="guide-icon">🌐</div>
                  <h3>1. Gemelo Digital 3D Interactivo</h3>
                  <p>AgriTwin proyecta en 3D el relieve real del predio (Estero Colliguay, Parral, Maule), permitiendo alternar entre imágenes satelitales ortorrectificadas, vista vectorial Civ VI y modo Híbrido.</p>
                </div>
                <div class="guide-card glass-panel">
                  <div class="guide-icon">⏱️</div>
                  <h3>2. Simulación IoT en Tiempo Real</h3>
                  <p>El motor de simulación acelera el tiempo (1x, 2x, 5x) generando telemetría sintética de humedad de suelo, déficit de humedad de vapor (VPD), temperatura ambiental y nivel freático.</p>
                </div>
                <div class="guide-card glass-panel">
                  <div class="guide-icon">⚠️</div>
                  <h3>3. Diagnóstico de Riesgos & FWI</h3>
                  <p>Evalúa capas climáticas de Estrés Hídrico, Riesgo de Heladas y Riesgo de Incendios Forestales (basado en el modelo Canadian FWI y factores topoclimáticos de ladera).</p>
                </div>
                <div class="guide-card glass-panel">
                  <div class="guide-icon">🎨</div>
                  <h3>4. Herramienta Pincel & Catálogo de Ítems</h3>
                  <p>Dibuja polígonos haciendo clic sobre el mapa y asígnales al instante cualquier ítem del Catálogo de Ítems (Pastizales con fardos, Cerezos, Bosque Nativo, Galpones, Estanques, Invernaderos).</p>
                </div>
                <div class="guide-card glass-panel">
                  <div class="guide-icon">📁</div>
                  <h3>5. Proyectos & Shapefiles (.shp)</h3>
                  <p>Guarda y carga el estado de tu predio en formato <code>.agritwin</code> o importa capas de información espacial en archivos ESRI Shapefile y GeoJSON.</p>
                </div>
                <div class="guide-card glass-panel">
                  <div class="guide-icon">🧭</div>
                  <h3>6. Navegación & Posición Solar</h3>
                  <p>Rosa de los vientos sincronizada con la rotación de cámara 3D, indicador de escala métrica y tracker en vivo de azimut y elevación del sol en el Maule.</p>
                </div>
              </div>
            </div>

            <!-- TAB 2: CATALOG OF ITEMS -->
            <div id="tab_catalog" class="tab-content" style="display:none;">
              <div class="catalog-search-bar">
                <input type="text" id="catalogSearchInput" placeholder="🔍 Buscar especie, construcción o ítem (ej: Pastizal, Quillay, Galpón, Manzanos)..." class="input-glass">
              </div>
              <div class="catalog-categories-container" id="catalogCategoriesList">
                ${this.buildCategoriesHTML()}
              </div>
            </div>

            <!-- TAB 3: ARCHITECTURE & SPECS -->
            <div id="tab_architecture" class="tab-content" style="display:none;">
              <div class="architecture-box glass-panel">
                <h3>⚡ Especificaciones Técnicas del Sistema AgriTwin</h3>
                <ul>
                  <li><strong>Motor 3D:</strong> Three.js WebGL Engine con sombreado dinámico PCFSoftShadowMap y ToneMapping ACESFilmic.</li>
                  <li><strong>Modelo Astronómico:</strong> Cálculo en tiempo real de trayectoria solar en latitud -36.14°S (Parral, Maule).</li>
                  <li><strong>Modelo de Incendios:</strong> FWI (Fine Fuel Moisture Code, DMC, DC) + Índice de combustibilidad por biomasa vegetacional.</li>
                  <li><strong>Telemetría Sensores:</strong> Transmisión virtual LoRaWAN / MQTT con frecuencia de actualización a 100ms.</li>
                  <li><strong>Estética Branding:</strong> Powered by <strong>Nanobanana UI Framework</strong> con vidrios esmerilados glassmorphism.</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button id="closeInfoModalFooterBtn" class="btn-primary">Entendido y Cerrar</button>
          </div>
        </div>
      </div>
    `;
  }

  static buildCategoriesHTML() {
    return this.CATEGORIES.map(cat => `
      <div class="catalog-category-group" data-cat="${cat.id}">
        <h3 class="category-title">${cat.title}</h3>
        <div class="category-items-grid">
          ${cat.items.map(item => `
            <div class="catalog-item-card glass-panel" data-name="${item.name.toLowerCase()} ${item.family ? item.family.toLowerCase() : ''}">
              <div class="item-header">
                <span class="item-icon">${item.icon}</span>
                <div>
                  <h4 class="item-title">${item.name}</h4>
                  <span class="item-badge">${item.family || item.category || 'Agrícola'}</span>
                </div>
              </div>
              <p class="item-desc">${item.desc}</p>
              <div class="item-tags">
                ${item.water ? `<span class="tag blue">💧 Agua: ${item.water}</span>` : ''}
                ${item.frost ? `<span class="tag purple">❄️ Helada: ${item.frost}</span>` : ''}
                ${item.fireRisk ? `<span class="tag rose">🔥 Fuego: ${item.fireRisk}</span>` : ''}
                ${item.material ? `<span class="tag amber">🏗️ Material: ${item.material}</span>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  }
}
