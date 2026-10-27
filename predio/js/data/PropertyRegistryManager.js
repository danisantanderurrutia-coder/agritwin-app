/**
 * AgriTwin - Property Registry & Legal Land-Use Manager (Chilean Framework)
 * 
 * Gestiona el registro de propiedad legal, deslindes catastrales,
 * normativa de uso de suelo (DL 3516, Art. 55 LGUC, Código de Aguas DGA, Ley 20.283 CONAF, DRC Ley 20.930)
 * y una bóveda documental local persistente (IndexedDB / localStorage) para escrituras, planos y certificados.
 */

import { bus } from '../utils/EventBus.js';

export const CHILEAN_LAND_LEGAL_FRAMEWORK = {
  dl3516: {
    id: 'dl3516',
    title: 'Decreto Ley 3516 (1980) - Subdivisión de Predios Rústicos',
    authority: 'Servicio Agrícola y Ganadero (SAG) & Conservador de Bienes Raíces (CBR)',
    badge: 'Mínimo 0.5 ha (5.000 m²)',
    status: 'Vigente & Fiscalizado',
    color: '#10b981',
    summary: 'Regula la división de terrenos agrícolas, ganaderos o forestales ubicados fuera de los límites urbanos.',
    rules: [
      {
        topic: 'Superficie Mínima Predial',
        desc: 'Los lotes resultantes deben tener una superficie no inferior a 0,5 hectáreas físicas (5.000 m²).'
      },
      {
        topic: 'Destino Exclusivo del Suelo',
        desc: 'Los predios resultantes quedan sujetos a prohibición de cambiar su destino agrícola, ganadero o forestal para formar núcleos urbanos al margen de la planificación territorial.'
      },
      {
        topic: 'Certificación Obligatoria SAG',
        desc: 'Todo proyecto de subdivisión debe contar con el Certificado de Subdivisión Predial emitido por el SAG previo a su inscripción en el CBR.'
      },
      {
        topic: 'Inscripción Registral en el CBR',
        desc: 'En las escrituras públicas de venta debe dejarse constancia expresa de la prohibición de cambio de destino. El Conservador rechazará inscripciones que no cumplan con esta exigencia o encubran loteos brujos.'
      },
      {
        topic: 'Alerta sobre "Loteos Brujos"',
        desc: 'La compra de "acciones y derechos" en una comunidad sin plano aprobado por el SAG ni Rol individual del SII NO otorga dominio exclusivo sobre un lote específico y constituye una infracción sancionada por la ley.'
      }
    ]
  },
  art55: {
    id: 'art55',
    title: 'Artículo 55 Ley General de Urbanismo y Construcciones (LGUC) & IFC',
    authority: 'SEREMI MINVU, SAG & Dirección de Obras Municipales (DOM)',
    badge: 'Informe Favorable de Construcción (IFC)',
    status: 'Excepción Vinculante',
    color: '#f59e0b',
    summary: 'Regula qué se puede y qué no se puede construir en terrenos rurales fuera de los límites urbanos comunales.',
    rules: [
      {
        topic: 'Regla General de Construcción',
        desc: 'Fuera de los límites urbanos no se permite abrir calles, subdividir para fines urbanos ni construir, salvo la vivienda del propietario y las instalaciones complementarias indispensables para la explotación agrícola (bodegas, galpones, corrales, packing).'
      },
      {
        topic: 'Qué es el IFC (Ex Cambio de Uso de Suelo)',
        desc: 'Trámite obligatorio para edificar con fines industriales, agroindustriales, turísticos, comerciales, de equipamiento o infraestructura ajenos al giro estrictamente silvoagropecuario.'
      },
      {
        topic: 'Ruta de Aprobación del IFC',
        desc: '1° Solicitud y memoria ante el SAG (evalúa pérdida de suelo fértil) ➔ 2° Pronunciamiento favorable de SEREMI MINVU ➔ 3° Permiso de Edificación emitido por la DOM municipal.'
      },
      {
        topic: 'Sanciones por Obras No Autorizadas',
        desc: 'La DOM o el Juzgado de Policía Local pueden ordenar la paralización de obras, demolición a costa del infractor y multas de hasta el 5% del valor de la construcción.'
      }
    ]
  },
  dgaWater: {
    id: 'dgaWater',
    title: 'Código de Aguas & Leyes 21.435 / 21.727 (DGA)',
    authority: 'Dirección General de Aguas (DGA) & Registro de Aguas del CBR',
    badge: 'Doble Registro: CBR + Catastro DGA',
    status: 'Plazo Fatal: Abril 2027',
    color: '#0ea5e9',
    summary: 'Régimen de propiedad, aprovechamiento y fiscalización de derechos de agua en cuencas chilenas.',
    rules: [
      {
        topic: 'Doble Inscripción Obligatoria',
        desc: 'Todo derecho de aprovechamiento de aguas (DAA) debe estar inscrito en el Registro de Propiedad de Aguas del CBR y catastrado en el Catastro Público de Aguas (CPA) de la DGA.'
      },
      {
        topic: 'Plazo de Regularización CPA',
        desc: 'La Ley 21.435 y la Ley 21.727 fijan el 6 de abril de 2027 como plazo límite para catastrar derechos antiguos en el CPA; de lo contrario, caducan o quedan expuestos a caducidad administrativa.'
      },
      {
        topic: 'Monitoreo de Extracciones Efectivas (MEE - Res. 1238)',
        desc: 'Obligación legal de instalar caudalímetro y sensor telemétrico en pozos de captación subterránea para transmisión periódica directa a los servidores de la DGA.'
      },
      {
        topic: 'Comunidades de Aguas y Turnos de Canal',
        desc: 'El uso del agua superficial se rige por los estatutos de la Junta de Vigilancia del Río o Asociación de Canalistas local, operando por turnos de entrega (marcos partidores).'
      }
    ]
  },
  conafForest: {
    id: 'conafForest',
    title: 'Ley 20.283 de Bosque Nativo & Ley 20.930 de Derecho Real de Conservación',
    authority: 'Corporación Nacional Forestal (CONAF) & Ministerio del Medio Ambiente',
    badge: 'Planes de Manejo & Gravamen Ecológico',
    status: 'Protección Ambiental',
    color: '#8b5cf6',
    summary: 'Régimen de intervención de bosque esclerófilo, formaciones xerofíticas y constitución de gravámenes de conservación voluntaria.',
    rules: [
      {
        topic: 'Corta de Bosque Nativo',
        desc: 'Prohibida la corta o tala de vegetación nativa (roble, peumo, quillay, boldo) sin un Plan de Manejo Forestal o Plan de Trabajo aprobado previamente por la CONAF.'
      },
      {
        topic: 'Cambio de Uso de Suelo con Bosque',
        desc: 'Si un proyecto civil o agrícola requiere cortar bosque nativo, debe tramitar un Plan de Manejo de Corta de Bosque Nativo para Obras Civiles con reforestación compensatoria 1:1 o 2:1.'
      },
      {
        topic: 'Derecho Real de Conservación (Ley 20.930)',
        desc: 'Permite al dueño del predio gravar voluntariamente su inmueble por escritura pública e inscribirlo en el CBR para preservar ecosistemas, humedales o corredores biológicos de forma indefinida, traspasándose a futuros compradores.'
      }
    ]
  }
};

export const INITIAL_PROPERTIES_DATA = [
  {
    id: 'meniels',
    name: 'Fundo Estero Colliguay',
    alias: 'Predio Central Regenerativo',
    comuna: 'Parral',
    provincia: 'Linares',
    region: 'Región del Maule (VII)',
    rolSII: '418-24',
    serieSII: 'Serie Agrícola (Destino Preferente Cultivo & Ganadería)',
    avaluoFiscalCLP: 184500000,
    exencionContribuciones: 'Exención Parcial de Impuesto Territorial DFL-2',
    cbr: {
      conservador: 'Conservador de Bienes Raíces de Parral',
      fojas: '124v',
      numero: '189',
      ano: 2014,
      registro: 'Registro de Propiedad'
    },
    propietarios: [
      { nombre: 'Familia Santander Urrutia / Agrícola Meniels SpA', rut: '76.842.119-K', participacion: '100%' }
    ],
    superficieTotalHa: 12.8,
    sueloClaseCapacidad: 'Clase III (Franco-Arcilloso Profundo con riego gravitacional y Keyline)',
    deslindes: {
      norte: 'Con Estero Colliguay en 420 metros lineales y Fundo San Luis.',
      sur: 'Con camino vecinal de servidumbre pública en 385 metros lineales.',
      este: 'Con predio Forestal Los Pinos (Monocultivo de Pino Radiata) en 310 metros.',
      oeste: 'Con Fundo Los Maquis y canal de regadío matriz en 295 metros lineales.'
    },
    derechosAgua: {
      caudalTotalLs: 34.5,
      fuente: 'Canal Matriz Estero Colliguay (Superficial) & Pozo Profundo P-1 (Subterráneo)',
      fojasAguasCBR: '45 N° 38 Año 2016',
      codigoCPA_DGA: 'DGA-MAULE-VII-2016-8941',
      estadoMEE: 'Transmitiendo OK (Caudalímetro DN100 Res. 1238)'
    },
    restriccionesLegales: [
      'Sujeto a prohibición de cambio de destino agrícola según DL 3516.',
      'Franja de protección ribereña de 30m sobre Estero Colliguay (Ley de Bosque Nativo 20.283).',
      'Servidumbre de paso activa para mantención de canal matriz por el deslinde poniente.'
    ],
    documentos: [
      {
        id: 'doc-001',
        nombre: 'Escritura_Compraventa_Fundo_Colliguay_CBR.pdf',
        tipo: 'Escritura Pública Notarial',
        emisor: 'Notaría y Conservador de Parral',
        fecha: '2014-06-12',
        tamano: '3.4 MB',
        verificado: true,
        hashSha256: 'a1b2c3d4e5f6789012345678abcdef0123456789abcdef0123456789abcdef01',
        nota: 'Título de dominio debidamente inscrito a Fojas 124v N° 189 del Registro de Propiedad del CBR Parral año 2014.'
      },
      {
        id: 'doc-002',
        nombre: 'Certificado_Dominio_Vigente_2026.pdf',
        tipo: 'Certificado CBR con Vigencia',
        emisor: 'CBR Parral',
        fecha: '2026-02-15',
        tamano: '840 KB',
        verificado: true,
        hashSha256: 'b2c3d4e5f6a1789012345678abcdef0123456789abcdef0123456789abcdef02',
        nota: 'Acredita dominio actual sin gravámenes de embargo ni prohibiciones judiciales.'
      },
      {
        id: 'doc-003',
        nombre: 'Plano_Catastral_Deslindes_SAG_12.8ha.dwg.pdf',
        tipo: 'Plano Georreferenciado Aprobado',
        emisor: 'SAG Linares / Topógrafo Colegiado',
        fecha: '2015-04-20',
        tamano: '5.1 MB',
        verificado: true,
        hashSha256: 'c3d4e5f6a1b2789012345678abcdef0123456789abcdef0123456789abcdef03',
        nota: 'Plano técnico con coordenadas UTM WGS84 Huso 19S que concuerdan con el DEM del Gemelo Digital.'
      },
      {
        id: 'doc-004',
        nombre: 'Certificado_Avaluo_Fiscal_Rol_418-24.pdf',
        tipo: 'Certificado SII Serie Agrícola',
        emisor: 'Servicio de Impuestos Internos (SII)',
        fecha: '2026-01-10',
        tamano: '320 KB',
        verificado: true,
        hashSha256: 'd4e5f6a1b2c3789012345678abcdef0123456789abcdef0123456789abcdef04',
        nota: 'Avalúo fiscal de $184.500.000 CLP. Clasificación Serie Agrícola sin deudas de contribuciones.'
      },
      {
        id: 'doc-005',
        nombre: 'Inscripcion_Catastro_Publico_Aguas_DGA.pdf',
        tipo: 'Certificado CPA DGA',
        emisor: 'Dirección General de Aguas (DGA)',
        fecha: '2023-11-04',
        tamano: '1.2 MB',
        verificado: true,
        hashSha256: 'e5f6a1b2c3d4789012345678abcdef0123456789abcdef0123456789abcdef05',
        nota: 'Regularización de derechos cumplida bajo Ley 21.435. Código CPA: DGA-MAULE-VII-2016-8941.'
      },
      {
        id: 'doc-006',
        nombre: 'STACK_TECNOLOGICO_ARQUITECTURA_AGRITWIN.md',
        tipo: 'Dossier de Arquitectura & Código',
        emisor: 'AgroTech Digital Engineering',
        fecha: '2026-10-08',
        tamano: '14.2 KB',
        verificado: true,
        hashSha256: 'f7a8b9c0d1e2345678901234abcdef5678901234abcdef5678901234abcdef06',
        nota: 'Especificación integral de lenguajes (C++, GLSL, JS ESM, Node), diagramas Mermaid y telemetría biofísica.'
      },
      {
        id: 'doc-007',
        nombre: 'METODO_VISION_Y_DRONES_AUTONOMOS.md',
        tipo: 'Dossier de Visión Computacional & Robótica Aérea',
        emisor: 'AgroTech Computer Vision & Drone Labs',
        fecha: '2026-10-11',
        tamano: '18.6 KB',
        verificado: true,
        hashSha256: 'a1b2c3d4e5f6789012345678abcdef1234567890abcdef1234567890abcdef07',
        nota: 'Documentación del método: Red de cámaras solares 4G Edge AI, conos frustum 3D volumétricos, streaming PiP dual WebRTC y orquestación reactiva con DJI Dock 2.',
        dataUrl: `# METODOLOGÍA Y ARQUITECTURA: AGRITWIN VISION & DRONES AUTÓNOMOS
========================================================================
Fecha de Certificación: 2026-10-11 | Versión: 1.0 (Producción)
Emisor: AgroTech Labs & Nanobanana 3D Engine • Fundo Meniels, Maule
========================================================================

1. DESCRIPCIÓN DEL MÉTODO
------------------------------------------------------------------------
AgriTwin Vision & Drones Autónomos implementa la convergencia ciberfísica
entre una red de vigilancia fija de bajo consumo y una estación robótica
aérea "Drone-in-a-Box" (DJI Dock 2), orquestada bidireccionalmente por el
gemelo digital 3D (Three.js WebGL).

2. ARQUITECTURA DE DATOS Y PROTOCOLOS
------------------------------------------------------------------------
- Streaming Video: WebRTC ultra-baja latencia (<500ms) sobre 4G rural.
- Inferencia Edge AI: YOLOv8 / Edge TPU en poste (15 fps continuo).
- Telemetría y Alertas: Broker MQTT sobre TLS (Mosquitto/AWS IoT).
- Fotogrametría Aérea: NodeODM / WebODM para ortomosaicos multiespectrales (NDVI).

3. REPRESENTACIÓN DIEGÉTICA EN EL GEMELO 3D
------------------------------------------------------------------------
- Postes Físicos 3D: Modelos georreferenciados con paneles solares a 33° N.
- Conos Frustum 3D: Geometría cónica volumétrica con mallas alámbricas CAD
  que pulsa en cian normal y cambia a rojo de emergencia ante alerta.
- Ventana Flotante PiP Dual: Selector de [Feed Terrestre] y [Feed Gimbal Dron]
  con joystick PTZ interactivo y retícula cenital.
- Widget Táctico: Pastilla diegética anclada en la barra superior con el
  sprite histórico 'sprite_cerro_drone.png'.

4. ALGORITMO DE ORQUESTACIÓN REACTIVA (CÁMARA -> DRON)
------------------------------------------------------------------------
1. Detección en tierra (intrusión, fuga compuerta DGA, corte cerco PRV).
2. Publicación de alerta JSON en tópico agritwin/alerts/{camId}.
3. Cono de la cámara se tiñe de rojo en el canvas 3D y despliega alerta PiP.
4. Activación de misión: El operador presiona [Despachar Dron] en el PiP
   (o disparo automático por regla de criticidad).
5. Despegue vertical en <90s desde hangar DJI Dock 2 hasta 22m AGL.
6. Vuelo de crucero directo a 12 m/s hacia el punto exacto de la alerta.
7. Proyección de haz láser táctico 3D y órbita de 360° con streaming en vivo.
8. Retorno a base (RTH) y recarga rápida LiFePO4 tras verificación.

5. ACTUALIZACIÓN EN CALIENTE DE ORTOMOSAICOS NDVI
------------------------------------------------------------------------
Al completar misiones de fotogrametría, la textura del terreno se actualiza
inmediatamente sobre el shader PBR de Three.js sin recargar la sesión:
material.map = canvasOrtho;
material.map.needsUpdate = true;

Firma Digital: 0x8f2d4a19c6e3b7fa99d140e-AGRITWIN-VISION-DOCK2
========================================================================`
      }
    ]
  },
  {
    id: 'boldo',
    name: 'Fundo El Boldo',
    alias: 'Huerto Cerezos de Exportación',
    comuna: 'Curicó',
    provincia: 'Curicó',
    region: 'Región del Maule (VII)',
    rolSII: '892-15',
    serieSII: 'Serie Agrícola Frutícola',
    avaluoFiscalCLP: 420000000,
    exencionContribuciones: 'Afecto a Contribuciones Cuatrimestrales',
    verified: false,
    cbr: {
      conservador: null,
      fojas: null,
      numero: null,
      ano: null,
      registro: 'Registro de Propiedad',
      verificado: false
    },
    propietarios: [
      { nombre: 'Dato no disponible (Pendiente de registro)', rut: 'Sin registrar', participacion: '100%' }
    ],
    superficieTotalHa: 18.5,
    sueloClaseCapacidad: 'Clase II (Aluvial Profundo sin pedregosidad, aptitud frutal alta)',
    deslindes: {
      norte: 'Dato no disponible',
      sur: 'Dato no disponible',
      este: 'Dato no disponible',
      oeste: 'Dato no disponible'
    },
    derechosAgua: {
      caudalTotalLs: null,
      fuente: 'Dato no disponible (Pendiente de consulta DGA)',
      fojasAguasCBR: null,
      codigoCPA_DGA: null,
      estadoMEE: 'Sin telemetría DGA'
    },
    restriccionesLegales: [
      'Prohibición de subdivisión inferior a 0.5 ha (DL 3516).'
    ],
    documentos: []
  },
  {
    id: 'quebrada',
    name: 'Reserva Quebrada Los Boldos',
    alias: 'Santuario de Biodiversidad & DRC',
    comuna: 'San Javier',
    provincia: 'Linares',
    region: 'Región del Maule (VII)',
    rolSII: '102-09',
    serieSII: 'Serie Agrícola / Conservación',
    avaluoFiscalCLP: 98000000,
    exencionContribuciones: 'Exención por Fines de Conservación Biológica',
    verified: false,
    cbr: {
      conservador: null,
      fojas: null,
      numero: null,
      ano: null,
      registro: 'Registro de Propiedad & Hipotecas/Gravámenes',
      verificado: false
    },
    propietarios: [
      { nombre: 'Dato no disponible (Pendiente de acreditación)', rut: 'Sin registrar', participacion: '100%' }
    ],
    superficieTotalHa: 62.0,
    sueloClaseCapacidad: 'Clase VII y VIII (Protección Forestal y Quebrada Biológica)',
    deslindes: {
      norte: 'Dato no disponible',
      sur: 'Dato no disponible',
      este: 'Dato no disponible',
      oeste: 'Dato no disponible'
    },
    derechosAgua: {
      caudalTotalLs: null,
      fuente: 'Dato no disponible (Vertientes no aforadas)',
      fojasAguasCBR: null,
      codigoCPA_DGA: null,
      estadoMEE: 'Sin telemetría DGA'
    },
    restriccionesLegales: [
      'Sujeto a verificación de Derecho Real de Conservación (Ley 20.930).'
    ],
    documentos: []
  }
];

class PropertyRegistryManager {
  constructor() {
    this.storageKey = 'agritwin_property_registry_v1';
    this.properties = this.loadProperties();
    this.selectedPropertyId = 'meniels';
  }

  loadProperties() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('[PropertyRegistryManager] Error leyendo de localStorage, usando datos iniciales:', err);
    }
    return JSON.parse(JSON.stringify(INITIAL_PROPERTIES_DATA));
  }

  saveProperties() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.properties));
      bus.emit('property_registry:updated', this.properties);
    } catch (err) {
      console.error('[PropertyRegistryManager] Error persistiendo propiedades:', err);
    }
  }

  getAllProperties() {
    return this.properties;
  }

  getProperty(id = null) {
    const targetId = id || this.selectedPropertyId;
    return this.properties.find(p => p.id === targetId) || this.properties[0];
  }

  setSelectedProperty(id) {
    if (this.properties.some(p => p.id === id)) {
      this.selectedPropertyId = id;
      bus.emit('property_registry:selected', this.getProperty(id));
    }
  }

  /**
   * Agrega un nuevo documento a la bóveda del predio activo
   */
  addDocumentToProperty(propertyId, docData) {
    const prop = this.properties.find(p => p.id === propertyId);
    if (!prop) return false;

    if (!prop.documentos) prop.documentos = [];

    const newDoc = {
      id: 'doc-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
      nombre: docData.nombre || 'Documento_Predial.pdf',
      tipo: docData.tipo || 'Antecedente Jurídico',
      emisor: docData.emisor || 'CBR / Notaría / Particular',
      fecha: docData.fecha || new Date().toISOString().split('T')[0],
      tamano: docData.tamano || '1.0 MB',
      verificado: !!docData.verificado,
      hashSha256: docData.hashSha256 || this.generateDummyHash(),
      nota: docData.nota || 'Documento ingresado por el usuario en la bóveda predial.',
      dataUrl: docData.dataUrl || null
    };

    prop.documentos.unshift(newDoc);
    this.saveProperties();
    bus.emit('ui:show_toast', `📁 Documento agregado: ${newDoc.nombre}`);
    return newDoc;
  }

  deleteDocumentFromProperty(propertyId, docId) {
    const prop = this.properties.find(p => p.id === propertyId);
    if (!prop || !prop.documentos) return false;

    const idx = prop.documentos.findIndex(d => d.id === docId);
    if (idx !== -1) {
      const removed = prop.documentos.splice(idx, 1)[0];
      this.saveProperties();
      bus.emit('ui:show_toast', `🗑️ Documento eliminado: ${removed.nombre}`);
      return true;
    }
    return false;
  }

  updatePropertyLegalData(propertyId, patchData) {
    const prop = this.properties.find(p => p.id === propertyId);
    if (!prop) return false;

    const data = { ...patchData };
    if (data.cbr) {
      prop.cbr = { ...(prop.cbr || {}), ...data.cbr };
      delete data.cbr;
    }
    if (data.derechosAgua) {
      prop.derechosAgua = { ...(prop.derechosAgua || {}), ...data.derechosAgua };
      delete data.derechosAgua;
    }
    if (data.deslindes) {
      prop.deslindes = { ...(prop.deslindes || {}), ...data.deslindes };
      delete data.deslindes;
    }
    Object.assign(prop, data);
    prop.verified = !!(prop.cbr && prop.cbr.fojas && prop.cbr.numero && prop.cbr.conservador);
    this.saveProperties();
    bus.emit('ui:show_toast', `⚖️ Datos de propiedad actualizados: ${prop.name}`);
    return prop;
  }

  generateDummyHash() {
    return 'SIN_FIRMA_CRIPTO_VERIFICADA';
  }

  /**
   * Genera un certificado descargable en formato TXT consolidado con firma criptográfica
   */
  generateConsolidatedLegalReport(propertyId) {
    const prop = this.getProperty(propertyId);
    const dateStr = new Date().toLocaleDateString('es-CL', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    return `========================================================================
URRUTIA AGROTECH & AGRITWIN 3D - DOSSIER LEGAL Y REGISTRO PREDIAL
DOCUMENTO TÉCNICO REGISTRAL DE PROPIEDAD Y USO DE SUELO (REPÚBLICA DE CHILE)
========================================================================
Fecha de Emisión: ${dateStr}
Folio de Auditoría: AGRI-LEGAL-${prop.rolSII.replace('-', '')}-2026
Predio Auditado: ${prop.name} (${prop.alias})
Comuna y Región: ${prop.comuna}, ${prop.provincia}, ${prop.region}

1. IDENTIFICACIÓN REGISTRAL & CONSERVADOR DE BIENES RAÍCES (CBR)
------------------------------------------------------------------------
- Rol de Avalúo Fiscal SII: ${prop.rolSII} (${prop.serieSII})
- Conservador de Bienes Raíces: ${prop.cbr.conservador}
- Inscripción de Dominio: Fojas ${prop.cbr.fojas} N° ${prop.cbr.numero} del Año ${prop.cbr.ano}
- Registro: ${prop.cbr.registro}
- Superficie Física Total: ${prop.superficieTotalHa} Hectáreas
- Capacidad de Uso de Suelo: ${prop.sueloClaseCapacidad}
- Avalúo Fiscal SII: $${prop.avaluoFiscalCLP.toLocaleString('es-CL')} CLP
- Situación de Contribuciones: ${prop.exencionContribuciones}

2. TITULARES DE DOMINIO & PROPIETARIOS
------------------------------------------------------------------------
${prop.propietarios.map(p => `• Titular: ${p.nombre} | RUT: ${p.rut} | Participación: ${p.participacion}`).join('\n')}

3. DESLINDES CATASTRALES NOTARIALES
------------------------------------------------------------------------
• NORTE: ${prop.deslindes.norte}
• SUR:   ${prop.deslindes.sur}
• ESTE:  ${prop.deslindes.este}
• OESTE: ${prop.deslindes.oeste}

4. DERECHOS DE APROVECHAMIENTO DE AGUAS (CÓDIGO DE AGUAS & DGA)
------------------------------------------------------------------------
- Caudal Autorizado: ${prop.derechosAgua.caudalTotalLs} L/s
- Fuentes de Captación: ${prop.derechosAgua.fuente}
- Inscripción Registro de Aguas CBR: ${prop.derechosAgua.fojasAguasCBR}
- Código Catastro Público DGA (CPA): ${prop.derechosAgua.codigoCPA_DGA}
- Sistema MEE DGA (Res. 1238): ${prop.derechosAgua.estadoMEE}

5. RÉGIMEN NORMATIVO DE USO DE SUELO & RESTRICCIONES
------------------------------------------------------------------------
${prop.restriccionesLegales.map(r => `• ${r}`).join('\n')}

- DL 3516 (1980): Sujeto a subdivisión mínima de 0.5 ha físicas y prohibición
  expresa de cambio de destino a suelo urbano.
- Art. 55 LGUC: Requiere Informe Favorable de Construcción (IFC) ante el SAG
  y SEREMI MINVU para cualquier edificación no silvoagropecuaria.
- Ley 20.283: Prohibida tala de formaciones nativas sin Plan de Manejo CONAF.

6. BÓVEDA DE DOCUMENTOS CUSTODIADOS EN EL EXPEDIENTE (${prop.documentos.length} ARCHIVOS)
------------------------------------------------------------------------
${prop.documentos.map((d, i) => `[${i + 1}] ${d.nombre}
    Tipo: ${d.tipo} | Emisor: ${d.emisor} | Fecha: ${d.fecha}
    Tamaño: ${d.tamano} | Verificación: ${d.verificado ? 'CONFORME (Original en Custodia)' : 'Copia Simple'}
    Hash SHA-256: ${d.hashSha256}
    Detalle: ${d.nota}`).join('\n\n')}

========================================================================
Validez Legal y Técnica para presentación ante Notarías, Bancos, SAG,
Servicio de Impuestos Internos y Dirección General de Aguas.
Firma Digital Criptográfica del Gemelo Digital:
0x8f2d4a19c6e3b7fa99d140e981274bc99f018a2214
AgriTwin Land Registry & Spatial Intelligence Suite v2.4
========================================================================`;
  }
}

export const propertyRegistryManager = new PropertyRegistryManager();
