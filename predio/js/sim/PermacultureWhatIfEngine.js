/**
 * PermacultureWhatIfEngine.js
 * 
 * Motor de Simulación y Análisis Predictivo Permacultural para AgriTwin Predio.
 * Basado en los principios de diseño ecológico de Bill Mollison y David Holmgren,
 * e hidrología Keyline de P.A. Yeomans.
 * 
 * Evalúa:
 *  1. Inversión Económica (CAPEX, faena y horas-hombre).
 *  2. Zonificación Concéntrica 0-5 y Fricción Espacial (distancias de traslado, gasto calórico y tiempo).
 *  3. Balance Energético e Hídrico (kWh/mes generación vs consumo, m³/año infiltración).
 *  4. Simbiosis Suelo-Objetos (1 Polígono = 1 Uso de Suelo con múltiples elementos integrados).
 *  5. Proyección Estratégica a 5 Años (ROI regenerativo, acumulación de Materia Orgánica y carbono).
 * 
 * Estética de presentación: Age of Empires III (Caoba pulida, molduras de latón dorado, pergamino).
 */

export class PermacultureWhatIfEngine {
  constructor(options = {}) {
    this.originX = options.originX !== undefined ? options.originX : -8;
    this.originZ = options.originZ !== undefined ? options.originZ : 8;
    this.usdClpRate = options.usdClpRate || 950;

    // Frecuencias operativas típicas por Zona Mollison (visitas anuales ida y vuelta)
    this.zoneFrequencies = {
      1: { name: 'Zona 1 (Intensiva / Hogar)', visitsPerYear: 850, maxIdealDist: 35 },
      2: { name: 'Zona 2 (Semi-intensiva)', visitsPerYear: 365, maxIdealDist: 90 },
      3: { name: 'Zona 3 (Comercial / PRV)', visitsPerYear: 140, maxIdealDist: 250 },
      4: { name: 'Zona 4 (Silvopastoreo / Biomasa)', visitsPerYear: 24, maxIdealDist: 550 },
      5: { name: 'Zona 5 (Silvestre Intangible)', visitsPerYear: 4, maxIdealDist: 2000 }
    };
  }

  /**
   * Ejecuta el análisis holístico de los objetos colocados y los polígonos del predio
   */
  evaluate(placedObjects = [], customPolygons = [], parcels = []) {
    const list = Array.isArray(placedObjects) ? placedObjects : [];
    const polys = Array.isArray(customPolygons) ? customPolygons : [];
    const farmParcels = Array.isArray(parcels) ? parcels : [];

    // 1. CAPEX e Inversión
    let totalCapexClp = 0;
    let totalBuildHours = 0;
    const categoryTotals = {
      structures: { count: 0, cost: 0, hours: 0, label: 'Estructuras & Edificaciones', icon: '🏛️' },
      water: { count: 0, cost: 0, hours: 0, label: 'Agua, Lagunas & Albercas', icon: '💧' },
      paths: { count: 0, cost: 0, hours: 0, label: 'Caminos & Conectividad', icon: '🛤️' },
      fences: { count: 0, cost: 0, hours: 0, label: 'Portones, Rejas & Cercos', icon: '🚪' },
      vehicles: { count: 0, cost: 0, hours: 0, label: 'Maquinaria & Vehículos', icon: '🚜' },
      sensors: { count: 0, cost: 0, hours: 0, label: 'Sensores IoT & Energía', icon: '⚡' },
      trees: { count: 0, cost: 0, hours: 0, label: 'Árboles & Agroforestería', icon: '🌳' },
      animals: { count: 0, cost: 0, hours: 0, label: 'Ganadería Regenerativa', icon: '🐄' },
      crops: { count: 0, cost: 0, hours: 0, label: 'Cultivos & Zanjas Swale', icon: '🌾' }
    };

    // 2. Balance Energético e Hídrico
    let energyGenerationKWh = 0;
    let energyConsumptionKWh = 0;
    let waterInfiltrationM3 = 0;
    let waterConsumptionLitersDay = 0;
    let carbonCaptureKgYear = 0;
    let nitrogenFixationKgYear = 0;

    // 3. Fricción Espacial & Zonificación Mollison
    let totalCommutingKmYear = 0;
    let totalCommutingHoursYear = 0;
    let misplacedCount = 0;
    const spatialWarnings = [];
    const zoneDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    list.forEach(obj => {
      const cat = obj.category || 'structures';
      const cost = Number(obj.costClp || 0);
      const hours = Number(obj.buildHours || 0);

      totalCapexClp += cost;
      totalBuildHours += hours;

      if (categoryTotals[cat]) {
        categoryTotals[cat].count++;
        categoryTotals[cat].cost += cost;
        categoryTotals[cat].hours += hours;
      }

      // Distancia euclidiana al núcleo central (Zona 0)
      const dist = Math.hypot(Number(obj.x || 0) - this.originX, Number(obj.z || 0) - this.originZ);
      let actualZone = 1;
      if (dist > 550) actualZone = 5;
      else if (dist > 250) actualZone = 4;
      else if (dist > 90) actualZone = 3;
      else if (dist > 35) actualZone = 2;

      zoneDistribution[actualZone]++;

      const idealZone = Number(obj.idealZone || actualZone);
      const zoneFreq = this.zoneFrequencies[idealZone]?.visitsPerYear || 100;

      // Desplazamiento anual (ida y vuelta)
      const annualDistanceKm = (2 * dist * zoneFreq) / 1000;
      const annualCommuteHours = annualDistanceKm / 4.5; // 4.5 km/h a pie

      totalCommutingKmYear += annualDistanceKm;
      totalCommutingHoursYear += annualCommuteHours;

      // Detección de fricción espacial
      if (actualZone > idealZone + 1) {
        misplacedCount++;
        spatialWarnings.push({
          type: 'high_friction',
          severity: 'warning',
          objectName: obj.name,
          icon: obj.icon || '📍',
          actualZone,
          idealZone,
          dist: Math.round(dist),
          wastedKm: Math.round(annualDistanceKm),
          wastedHours: Math.round(annualCommuteHours),
          message: `"${obj.name}" está a ${Math.round(dist)}m (Zona ${actualZone}). Al requerir visitas frecuentes (Zona ${idealZone}), implica caminar ~${Math.round(annualDistanceKm)} km/año (${Math.round(annualCommuteHours)}h anuales). Se recomienda acercar a Zona ${idealZone}.`
        });
      } else if (actualZone < idealZone - 1) {
        misplacedCount++;
        spatialWarnings.push({
          type: 'crowding',
          severity: 'info',
          objectName: obj.name,
          icon: obj.icon || '📍',
          actualZone,
          idealZone,
          dist: Math.round(dist),
          message: `"${obj.name}" se ubicó en Zona ${actualZone} (alta prioridad de cocina/vivienda), cuando su escala extensiva corresponde a Zona ${idealZone}.`
        });
      }

      // Impactos ecológicos y energéticos específicos
      this.accumulateEcologicalFluxes(obj, {
        addEnergyGen: (kwh) => energyGenerationKWh += kwh,
        addEnergyCons: (kwh) => energyConsumptionKWh += kwh,
        addInfiltration: (m3) => waterInfiltrationM3 += m3,
        addWaterCons: (l) => waterConsumptionLitersDay += l,
        addCarbon: (kg) => carbonCaptureKgYear += kg,
        addNitrogen: (kg) => nitrogenFixationKgYear += kg
      });
    });

    // Puntuación de Coherencia Mollison (0 a 100%)
    const totalObjs = list.length;
    let mollisonScore = 100;
    if (totalObjs > 0) {
      const penalty = (misplacedCount / totalObjs) * 45;
      mollisonScore = Math.max(30, Math.round(100 - penalty));
    }

    // 4. Simbiosis Suelo vs Objetos (1 Polígono = 1 Uso de Suelo)
    const allPolygons = [...polys, ...farmParcels];
    const polygonSynergies = this.evaluatePolygonSynergies(allPolygons, list);

    // 5. Proyecciones Estratégicas a 5 Años
    const strategicProjections = this.calculateStrategicProjections(
      totalCapexClp,
      list,
      allPolygons,
      energyGenerationKWh,
      energyConsumptionKWh,
      waterInfiltrationM3,
      carbonCaptureKgYear,
      nitrogenFixationKgYear
    );

    return {
      totalObjects: totalObjs,
      totalCapexClp,
      totalCapexUsd: Math.round(totalCapexClp / this.usdClpRate),
      totalBuildHours: Math.round(totalBuildHours * 10) / 10,
      totalBuildDays2Persons: Math.round((totalBuildHours / 16) * 10) / 10,
      categoryTotals,
      energy: {
        generationKWh: Math.round(energyGenerationKWh),
        consumptionKWh: Math.round(energyConsumptionKWh),
        netBalanceKWh: Math.round(energyGenerationKWh - energyConsumptionKWh),
        isPositive: energyGenerationKWh >= energyConsumptionKWh
      },
      water: {
        infiltrationM3Year: Math.round(waterInfiltrationM3),
        livestockConsumptionLDay: Math.round(waterConsumptionLitersDay)
      },
      carbon: {
        captureKgYear: Math.round(carbonCaptureKgYear),
        nitrogenKgYear: Math.round(nitrogenFixationKgYear)
      },
      spatial: {
        score: mollisonScore,
        misplacedCount,
        totalCommutingKmYear: Math.round(totalCommutingKmYear),
        totalCommutingHoursYear: Math.round(totalCommutingHoursYear),
        zoneDistribution,
        warnings: spatialWarnings
      },
      polygonSynergies,
      strategicProjections
    };
  }

  accumulateEcologicalFluxes(obj, f) {
    const id = obj.itemId || '';
    if (id === 'sensor_solar_pv') {
      f.addEnergyGen(480); // kWh/mes
    } else if (id === 'struct_windmill') {
      f.addEnergyGen(140); // kWh eq de bombeo
      f.addInfiltration(320); // m3 año
    } else if (id === 'struct_barn') {
      f.addEnergyCons(85);
    } else if (id === 'struct_silo') {
      f.addEnergyCons(50);
    } else if (id === 'veh_tractor') {
      f.addEnergyCons(350); // diésel eq
    } else if (id === 'crop_swale') {
      f.addInfiltration(650); // m3/año por zanja
    } else if (id.startsWith('tree_')) {
      f.addCarbon(32); // kg CO2e / año / árbol adulto
      f.addInfiltration(45);
    } else if (id === 'animal_cow') {
      f.addWaterCons(70); // L/día
      f.addNitrogen(95); // kg N orgánico / año
    } else if (id === 'animal_sheep') {
      f.addWaterCons(8);
      f.addNitrogen(16);
    } else if (id === 'animal_hen') {
      f.addWaterCons(0.4);
      f.addNitrogen(1.8);
    } else if (id === 'water_lagoon') {
      f.addInfiltration(1800); // m3 infiltrados/año por laguna ecológica
    } else if (id === 'water_fountain') {
      f.addInfiltration(80);
    } else if (id === 'water_wetland') {
      f.addInfiltration(450);
    } else if (id === 'water_pool') {
      f.addInfiltration(38); // reserva hídrica de 38m3 para contingencias
    } else if (id === 'path_rural_road') {
      f.addInfiltration(120); // drenaje lateral
    } else if (id === 'path_culvert') {
      f.addInfiltration(350); // paso hidráulico
    }
  }

  evaluatePolygonSynergies(polygons, placedObjects) {
    return polygons.map(poly => {
      const polyId = poly.id;
      const polyName = poly.customName || poly.name || 'Cuartel';
      const polyType = (poly.cropType || poly.itemName || poly.category || '').toLowerCase();
      const inObjects = placedObjects.filter(o => o.polygonId === polyId);

      const itemsInside = inObjects.map(o => o.itemId || '');
      let score = 'neutral';
      let scoreLabel = '🟡 Coexistencia Estándar';
      let rationale = 'Uso de suelo en operación.';

      // Reglas Permaculturales de Simbiosis
      const hasFruit = polyType.includes('cerezo') || polyType.includes('frutal') || polyType.includes('avellano') || polyType.includes('olivo');
      const hasPasture = polyType.includes('pradera') || polyType.includes('pastoreo') || polyType.includes('voisin');
      const hasForest = polyType.includes('bosque') || polyType.includes('nativo') || polyType.includes('reserva');
      const hasSwale = itemsInside.includes('crop_swale');
      const hasSheep = itemsInside.includes('animal_sheep');
      const hasHen = itemsInside.includes('animal_hen');
      const hasCow = itemsInside.includes('animal_cow');

      if (hasFruit && (hasSheep || hasHen)) {
        score = 'synergy';
        scoreLabel = '🟢 Sinergia Regenerativa Alta';
        rationale = 'Animales menores pastando bajo frutales: desmalezado natural, abono nitrogenado fresco y control biológico de insectos plaga (Cero agroquímicos).';
      } else if (hasFruit && hasSwale) {
        score = 'synergy';
        scoreLabel = '🟢 Sinergia Hidrológica Keyline';
        rationale = 'Zanjas de infiltración abastecen directamente el bulbo radicular de los frutales reduciendo necesidad de riego presurizado.';
      } else if (hasForest && hasCow) {
        score = 'alert';
        scoreLabel = '⚠️ Conflicto de Uso Potencial';
        rationale = 'Bovinos pesados en bosque nativo frágil pueden compactar el suelo y ramonear renovales esclerófilos. Se sugiere limitar pastoreo o preferir ovinos guiados.';
      } else if (hasPasture && (hasCow || hasSheep)) {
        score = 'synergy';
        scoreLabel = '🟢 Óptimo PRV (Voisin)';
        rationale = 'Pastoreo rotacional en pradera: impacto bosta/orina con periodo de descanso adecuado regenera estructura de suelo.';
      } else if (inObjects.length > 0) {
        score = 'positive';
        scoreLabel = '✨ Coexistencia Multiuso';
        rationale = `${inObjects.length} elementos integrados en la misma unidad de uso de suelo (${polyName}).`;
      } else {
        scoreLabel = '⚪ Sin elementos asociados';
        rationale = 'Polígono sin estructuras ni semovientes añadidos aún.';
      }

      return {
        id: polyId,
        name: polyName,
        landUseType: poly.itemName || poly.cropType || 'Uso Mixto',
        areaHa: poly.areaHa || 1.0,
        objectsCount: inObjects.length,
        objects: inObjects,
        score,
        scoreLabel,
        rationale
      };
    });
  }

  calculateStrategicProjections(capex, placedObjects, polygons, energyGen, energyCons, waterInf, carbonKg, nitrogenKg) {
    const objCount = placedObjects.length;
    const treeCount = placedObjects.filter(o => (o.itemId || '').startsWith('tree_')).length;
    const animalCount = placedObjects.filter(o => (o.itemId || '').startsWith('animal_')).length;

    // Ahorro anual estimado en insumos sintéticos (fertilizante NPK, herbicidas, acarreo)
    const annualSyntheticSavingsClp = Math.round((nitrogenKg * 2800) + (animalCount * 180000) + (treeCount * 15000));
    
    // Ahorro eléctrico/energía anual
    const netEnergy = Math.max(0, energyGen - energyCons);
    const annualEnergySavingsClp = Math.round(netEnergy * 12 * 145); // $145 CLP / kWh tarifa rural

    const totalAnnualSavingsClp = annualSyntheticSavingsClp + annualEnergySavingsClp;
    const simplePaybackYears = totalAnnualSavingsClp > 0 ? (capex / totalAnnualSavingsClp).toFixed(1) : 'N/A';

    return {
      annualSyntheticSavingsClp,
      annualEnergySavingsClp,
      totalAnnualSavingsClp,
      paybackYears: simplePaybackYears,
      phases: [
        {
          phase: 'Año 1: Agua & Tierra (Base Biofísica)',
          state: 'Fundacional',
          focus: 'Subsolado Keyline, zanjas swales y tranque.',
          soilOrganicMatter: '2.8% (+0.4%)',
          waterRetention: `${Math.round(waterInf + 2500)} m³/año`,
          co2Balance: '-4.2 t CO2e'
        },
        {
          phase: 'Año 2: Cortavientos & Rebaños Menores',
          state: 'Establecimiento',
          focus: 'Ovinos y gallinas camperas integradas en frutales.',
          soilOrganicMatter: '3.4% (+1.0%)',
          waterRetention: `${Math.round(waterInf + 4800)} m³/año`,
          co2Balance: '-8.5 t CO2e'
        },
        {
          phase: 'Año 3: Cosecha Agroecológica & PRV Pleno',
          state: 'Producción',
          focus: 'Cosechas comerciales de cerezos sin residuos químicos.',
          soilOrganicMatter: '4.2% (+1.8%)',
          waterRetention: `${Math.round(waterInf + 7200)} m³/año`,
          co2Balance: '-14.0 t CO2e'
        },
        {
          phase: 'Año 5: Autonomía Plena & Resiliencia Maule',
          state: 'Consolidación',
          focus: '100% independencia energética, suelo fértil estabilizado.',
          soilOrganicMatter: '5.1% (+2.7%)',
          waterRetention: `${Math.round(waterInf + 12000)} m³/año`,
          co2Balance: '-22.5 t CO2e'
        }
      ]
    };
  }

  /**
   * Genera el HTML del Deck Táctico What-If (Paleta Age of Empires III)
   */
  renderTacticalDeckHTML(metrics) {
    const m = metrics;
    const warnList = m.spatial.warnings;

    return `
      <!-- CONTENEDOR TÁCTICO WHAT-IF PERMACULTURA (AOE III PALETTE) -->
      <div style="background: linear-gradient(180deg, #2b1d13 0%, #170f09 100%); border: 2px solid #b8860b; border-radius: 10px; padding: 12px; margin-top: 12px; box-shadow: inset 0 0 14px rgba(0,0,0,0.9), 0 6px 18px rgba(0,0,0,0.6); color: #fef3c7; font-family: 'Plus Jakarta Sans', Georgia, serif;">
        
        <!-- Header estilo Pergamino Imperial AoE III -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #8c6721; padding-bottom: 8px; margin-bottom: 10px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 20px;">📜</span>
            <div>
              <div style="font-size: 13px; font-weight: 800; color: #fbbf24; text-shadow: 0 1px 2px #000; letter-spacing: 0.04em;">
                SIMULADOR WHAT-IF • PRINCIPIOS PERMACULTURALES
              </div>
              <div style="font-size: 9.5px; color: #dfc8a5;">
                Análisis Biofísico, Inversión CAPEX & Zonificación Mollison
              </div>
            </div>
          </div>
          <span style="font-size: 10px; font-weight: 800; background: linear-gradient(180deg, #8b1e1e, #500e0e); color: #fef3c7; border: 1px solid #c89b3c; padding: 2px 8px; border-radius: 4px; text-shadow: 0 1px 1px #000;">
            ${m.totalObjects} ELEMENTOS
          </span>
        </div>

        <!-- Métricas Clave en Tarjetas AoE III -->
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 10px;">
          <!-- CAPEX Total -->
          <div style="background: rgba(18, 12, 7, 0.85); border: 1px solid #78521d; border-radius: 6px; padding: 8px; box-shadow: inset 0 0 8px rgba(0,0,0,0.6);">
            <div style="font-size: 9px; color: #dfc8a5; text-transform: uppercase;">Inversión CAPEX Total</div>
            <div style="font-size: 15px; font-weight: 900; color: #fbbf24; margin-top: 2px; text-shadow: 0 1px 2px #000;">
              $${m.totalCapexClp.toLocaleString('es-CL')}
            </div>
            <div style="font-size: 9px; color: #a89078;">≈ USD $${m.totalCapexUsd.toLocaleString('en-US')}</div>
          </div>

          <!-- Faena & Horas-Hombre -->
          <div style="background: rgba(18, 12, 7, 0.85); border: 1px solid #78521d; border-radius: 6px; padding: 8px; box-shadow: inset 0 0 8px rgba(0,0,0,0.6);">
            <div style="font-size: 9px; color: #dfc8a5; text-transform: uppercase;">Faena & Mano de Obra</div>
            <div style="font-size: 15px; font-weight: 900; color: #6ee7b7; margin-top: 2px; text-shadow: 0 1px 2px #000;">
              ${m.totalBuildHours} <span style="font-size: 10px; font-weight: 600;">horas-hombre</span>
            </div>
            <div style="font-size: 9px; color: #a89078;">≈ ${m.totalBuildDays2Persons} días (cuadrilla de 2)</div>
          </div>

          <!-- Coherencia Mollison -->
          <div style="background: rgba(18, 12, 7, 0.85); border: 1px solid #78521d; border-radius: 6px; padding: 8px; box-shadow: inset 0 0 8px rgba(0,0,0,0.6);">
            <div style="font-size: 9px; color: #dfc8a5; text-transform: uppercase;">Coherencia Mollison</div>
            <div style="font-size: 15px; font-weight: 900; color: ${m.spatial.score > 75 ? '#4ade80' : '#f59e0b'}; margin-top: 2px; text-shadow: 0 1px 2px #000;">
              ${m.spatial.score}% <span style="font-size: 10px; font-weight: 600;">eficiencia</span>
            </div>
            <div style="font-size: 9px; color: #a89078;">${m.spatial.misplacedCount} alertas espaciales</div>
          </div>

          <!-- Balance Energético Net -->
          <div style="background: rgba(18, 12, 7, 0.85); border: 1px solid #78521d; border-radius: 6px; padding: 8px; box-shadow: inset 0 0 8px rgba(0,0,0,0.6);">
            <div style="font-size: 9px; color: #dfc8a5; text-transform: uppercase;">Balance Eléctrico Mensual</div>
            <div style="font-size: 15px; font-weight: 900; color: ${m.energy.isPositive ? '#38bdf8' : '#f87171'}; margin-top: 2px; text-shadow: 0 1px 2px #000;">
              ${m.energy.netBalanceKWh > 0 ? '+' : ''}${m.energy.netBalanceKWh} <span style="font-size: 10px; font-weight: 600;">kWh/m</span>
            </div>
            <div style="font-size: 9px; color: #a89078;">${m.energy.generationKWh} gen / ${m.energy.consumptionKWh} con</div>
          </div>
        </div>

        <!-- Desglose por Categoría AoE III -->
        <div style="margin-bottom: 10px;">
          <div style="font-size: 10px; font-weight: 800; color: #e5c158; text-transform: uppercase; margin-bottom: 6px; display: flex; align-items: center; gap: 4px;">
            <span>⚔️</span> Recursos Asignados por Ramo
          </div>
          <div style="display: flex; flex-direction: column; gap: 4px;">
            ${Object.values(m.categoryTotals).filter(c => c.count > 0).map(c => `
              <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.3); border: 1px solid rgba(184,134,11,0.25); padding: 4px 8px; border-radius: 4px; font-size: 10.5px;">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span>${c.icon}</span>
                  <span style="color: #fef3c7; font-weight: 600;">${c.label} (${c.count})</span>
                </div>
                <div style="font-family: monospace; color: #fbbf24; font-weight: 700;">
                  $${c.cost.toLocaleString('es-CL')} • ${c.hours}h
                </div>
              </div>
            `).join('') || `
              <div style="font-size: 10px; color: #a89078; font-style: italic; padding: 4px;">
                Aún no has asentado objetos del catálogo. Abre el dock "🏛️ Objetos" para comenzar la simulación.
              </div>
            `}
          </div>
        </div>

        <!-- Alertas de Fricción Espacial & Traslado Humano -->
        <div style="margin-bottom: 10px; background: rgba(0,0,0,0.35); border: 1px solid #8c6721; border-radius: 6px; padding: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <strong style="font-size: 10.5px; color: #fbbf24; display: flex; align-items: center; gap: 4px;">
              <span>🚶</span> Desplazamiento Anual Predial: <span style="color: #fef3c7;">${m.spatial.totalCommutingKmYear} km/año</span>
            </strong>
            <span style="font-size: 9.5px; color: #dfc8a5; font-family: monospace;">(${m.spatial.totalCommutingHoursYear}h caminata)</span>
          </div>
          ${warnList.length > 0 ? `
            <div style="display: flex; flex-direction: column; gap: 5px; max-height: 140px; overflow-y: auto; padding-right: 4px;">
              ${warnList.map(w => `
                <div style="background: rgba(139, 30, 30, 0.25); border-left: 3px solid #ef4444; padding: 5px 8px; border-radius: 4px; font-size: 10px; color: #fecaca; line-height: 1.35;">
                  <strong>${w.icon} ${w.objectName}:</strong> ${w.message}
                </div>
              `).join('')}
            </div>
          ` : `
            <div style="font-size: 10px; color: #86efac; line-height: 1.35;">
              ✓ Distribución armónica: Los elementos intensivos están en radios cercanos y los extensivos en radios exteriores. Cero fricción innecesaria.
            </div>
          `}
        </div>

        <!-- Botones de Acción Estilo AoE III -->
        <div style="display: flex; gap: 6px;">
          <button onclick="window.downloadPermacultureReport && window.downloadPermacultureReport()" style="flex: 1; padding: 7px 10px; background: linear-gradient(180deg, #44301d 0%, #201309 100%); border: 1px solid #b8860b; color: #fef3c7; border-radius: 5px; font-size: 10.5px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: inset 0 1px 0 rgba(255,255,255,0.15);">
            <span>📥</span> Descargar Dossier What-If (.md)
          </button>
          <button onclick="window.objectPlacementManager && window.objectPlacementManager.openDock()" style="padding: 7px 12px; background: linear-gradient(180deg, #8b1e1e 0%, #500e0e 100%); border: 1px solid #d4af37; color: #fff; border-radius: 5px; font-size: 10.5px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 5px;">
            <span>🏛️</span> Asentar Más Objetos
          </button>
        </div>

      </div>
    `;
  }

  /**
   * Genera el HTML del Panel Estratégico What-If (Landing Principal / Modo Predio)
   */
  renderStrategicLandingHTML(metrics) {
    const m = metrics;
    const proj = m.strategicProjections;

    return `
      <!-- MÓDULO ESTRATÉGICO PERMACULTURAL • HORIZONTE 5 AÑOS (AOE III PALETTE) -->
      <div style="background: linear-gradient(180deg, #24180f 0%, #150d07 100%); border: 2px solid #b8860b; border-radius: 12px; padding: 14px; margin-top: 12px; box-shadow: inset 0 0 16px rgba(0,0,0,0.85), 0 8px 24px rgba(0,0,0,0.7); color: #fef3c7; font-family: 'Plus Jakarta Sans', Georgia, serif;">
        
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #8c6721; padding-bottom: 8px; margin-bottom: 12px;">
          <div>
            <div style="font-size: 14px; font-weight: 900; color: #fbbf24; letter-spacing: 0.04em; display: flex; align-items: center; gap: 8px;">
              <span>🌾</span> PROYECCIÓN ESTRATÉGICA PERMACULTURAL • 5 AÑOS
            </div>
            <div style="font-size: 10px; color: #dfc8a5; margin-top: 2px;">
              Retorno sobre la Inversión, Resiliencia Hídrica & Regeneración de Suelo
            </div>
          </div>
          <span style="font-size: 9.5px; font-weight: 800; background: linear-gradient(180deg, #3d2a1a, #1f140a); color: #d4af37; border: 1px solid #8c6721; padding: 3px 8px; border-radius: 4px;">
            ROI Est.: ${proj.paybackYears} AÑOS
          </span>
        </div>

        <!-- Resumen de Retorno Anual por Sinergias -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 12px;">
          <div style="background: rgba(0,0,0,0.4); border: 1px solid #78521d; border-radius: 6px; padding: 8px; text-align: center;">
            <div style="font-size: 9px; color: #dfc8a5;">Ahorro Insumos Químicos</div>
            <div style="font-size: 13px; font-weight: 900; color: #4ade80; margin-top: 2px;">
              $${proj.annualSyntheticSavingsClp.toLocaleString('es-CL')}<span style="font-size: 8.5px; font-weight: 500;">/año</span>
            </div>
            <div style="font-size: 8.5px; color: #a89078;">Bono nitrógeno animal</div>
          </div>

          <div style="background: rgba(0,0,0,0.4); border: 1px solid #78521d; border-radius: 6px; padding: 8px; text-align: center;">
            <div style="font-size: 9px; color: #dfc8a5;">Ahorro Energía Limpia</div>
            <div style="font-size: 13px; font-weight: 900; color: #38bdf8; margin-top: 2px;">
              $${proj.annualEnergySavingsClp.toLocaleString('es-CL')}<span style="font-size: 8.5px; font-weight: 500;">/año</span>
            </div>
            <div style="font-size: 8.5px; color: #a89078;">Solar + Bombeo Eólico</div>
          </div>

          <div style="background: rgba(0,0,0,0.4); border: 1px solid #78521d; border-radius: 6px; padding: 8px; text-align: center;">
            <div style="font-size: 9px; color: #dfc8a5;">Infiltración Hídrica</div>
            <div style="font-size: 13px; font-weight: 900; color: #67e8f9; margin-top: 2px;">
              +${m.water.infiltrationM3Year} <span style="font-size: 8.5px; font-weight: 500;">m³/año</span>
            </div>
            <div style="font-size: 8.5px; color: #a89078;">Swales & Keyline</div>
          </div>
        </div>

        <!-- Hoja de Ruta Biológica en 4 Fases Acumulativas -->
        <div style="margin-bottom: 12px;">
          <div style="font-size: 10px; font-weight: 800; color: #e5c158; text-transform: uppercase; margin-bottom: 6px;">
            📈 Curva de Regeneración Biológica del Predio
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            ${proj.phases.map(p => `
              <div style="background: rgba(0,0,0,0.3); border-left: 3px solid #b8860b; padding: 6px 10px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <strong style="color: #fef3c7; font-size: 11px;">${p.phase}</strong>
                  <div style="color: #cbd5e1; font-size: 9.5px; margin-top: 1px;">${p.focus}</div>
                </div>
                <div style="text-align: right; font-family: monospace; font-size: 9.5px;">
                  <span style="color: #86efac; font-weight: 700;">MO: ${p.soilOrganicMatter}</span><br>
                  <span style="color: #7dd3fc;">${p.co2Balance}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Botón para ver vista táctica en el 3D -->
        <div style="display: flex; gap: 8px;">
          <button onclick="window.selectPredioHouseTab && window.selectPredioHouseTab('permaculture')" style="flex: 1; padding: 8px 12px; background: linear-gradient(180deg, #44301d 0%, #291c10 100%); border: 1px solid #b8860b; color: #fbbf24; border-radius: 6px; font-size: 11px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>🌱</span> Abrir Panel Táctico 3D
          </button>
          <button onclick="window.objectPlacementManager && window.objectPlacementManager.openDock()" style="padding: 8px 14px; background: linear-gradient(180deg, #8b1e1e 0%, #500e0e 100%); border: 1px solid #d4af37; color: #fff; border-radius: 6px; font-size: 11px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 6px;">
            <span>🏛️</span> Asentar Elementos
          </button>
        </div>

      </div>
    `;
  }

  /**
   * Genera el informe descargable en Markdown
   */
  generateMarkdownReport(metrics) {
    const m = metrics;
    const p = m.strategicProjections;

    return `# MEMORIA TÉCNICA WHAT-IF: TRANSICIÓN PERMACULTURAL & ASENTAMIENTO 3D
**Fundo Estero Colliguay • AgriTwin Predio**
*Fecha de Emisión: ${new Date().toLocaleDateString('es-CL')}*

---

## 1. RESUMEN EJECUTIVO DE INVERSIÓN
- **Total de Elementos Asentados:** ${m.totalObjects}
- **Inversión CAPEX Total Estimada:** $${m.totalCapexClp.toLocaleString('es-CL')} CLP (~$${m.totalCapexUsd.toLocaleString('en-US')} USD)
- **Mano de Obra & Faena:** ${m.totalBuildHours} horas-hombre (${m.totalBuildDays2Persons} días de trabajo con cuadrilla de 2 personas)
- **Retorno Simple Estimado (Payback):** ${p.paybackYears} años

---

## 2. DESGLOSE POR RAMO (ESTÉTICA AOE III)
${Object.values(m.categoryTotals).map(c => `- **${c.label}:** ${c.count} unidades | $${c.cost.toLocaleString('es-CL')} CLP | ${c.hours} horas`).join('\n')}

---

## 3. EVALUACIÓN DE ZONIFICACIÓN BILL MOLLISON (ZONAS 0 A 5)
- **Índice de Eficiencia Espacial:** ${m.spatial.score}%
- **Desplazamiento Peatonal Predial:** ${m.spatial.totalCommutingKmYear} km/año (${m.spatial.totalCommutingHoursYear} horas/año)
- **Alertas de Fricción Espacial:** ${m.spatial.misplacedCount}

### Advertencias de Ubicación:
${m.spatial.warnings.length > 0 ? m.spatial.warnings.map(w => `- ⚠️ **${w.objectName}**: ${w.message}`).join('\n') : '- ✓ Distribución concéntrica óptima.'}

---

## 4. BALANCES DE ENERGÍA & RECURSOS
- **Generación Eléctrica Renovable:** ${m.energy.generationKWh} kWh/mes
- **Consumo Estimado de Instalaciones:** ${m.energy.consumptionKWh} kWh/mes
- **Balance Neto:** ${m.energy.netBalanceKWh} kWh/mes (${m.energy.isPositive ? 'Superávit' : 'Déficit'})
- **Infiltración Hídrica Adicional:** +${m.water.infiltrationM3Year} m³/año
- **Aporte Orgánico de Nitrógeno:** +${m.carbon.nitrogenKgYear} kg N/año (Rebaño integrado)
- **Captura de Carbono:** -${m.carbon.captureKgYear} kg CO2e/año

---

## 5. HOJA DE RUTA ESTRATÉGICA (5 AÑOS)
${p.phases.map(ph => `### ${ph.phase}
- **Enfoque:** ${ph.focus}
- **Materia Orgánica:** ${ph.soilOrganicMatter}
- **Retención Hídrica:** ${ph.waterRetention}
- **Balance Carbono:** ${ph.co2Balance}
`).join('\n')}

---
*Generado automáticamente por AgriTwin 3D • AgroTech Chile*
`;
  }
}
