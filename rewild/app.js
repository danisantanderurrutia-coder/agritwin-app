/* =========================================================================================
   REWILDING FIELD SUITE — DRAFTS-IN-PROGRESS SELECTOR, SAVE & PAUSE ENGINE & MULTI-PROTOCOL FUSION
   ========================================================================================= */

/* ===================== INDEXEDDB STORAGE ENGINE ===================== */
const DB_NAME = 'RewildSuiteDB';
const DB_VERSION = 1;
const STORE_NAME = 'keyval';

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(key) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result !== undefined ? req.result : null);
      req.onerror = () => reject(req.error);
    });
  } catch(e) {
    const val = localStorage.getItem(key);
    return val !== null ? val : null;
  }
}

async function idbSet(key, val) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(val, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch(e) {
    try { localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val)); } catch(err){}
  }
}

async function idbDelete(key) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch(e) {
    localStorage.removeItem(key);
  }
}

window.storage = {
  get: async function(key) {
    const val = await idbGet(key);
    return val !== null ? { value: typeof val === 'string' ? val : JSON.stringify(val) } : null;
  },
  set: async function(key, val) {
    await idbSet(key, typeof val === 'string' ? val : JSON.stringify(val));
  },
  delete: async function(key) {
    await idbDelete(key);
  }
};

/* ===================== CANVAS IMAGE COMPRESSOR ===================== */
function compressImage(file, maxDim = 1200, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to parse image element'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/* ===================== SERVICE WORKER ===================== */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

/* ===================== UTILS ===================== */
function uid(){ return Math.random().toString(36).slice(2,10); }
function getPath(obj,path){ return path.split('.').reduce((o,k)=>(o==null?undefined:o[k]),obj); }
function setPath(obj,path,val){
  const k=path.split('.');
  let o=obj;
  for(let i=0;i<k.length-1;i++){
    if(o[k[i]]==null) o[k[i]]={};
    o=o[k[i]];
  }
  o[k[k.length-1]]=val;
}
function esc(s){ return (s==null?'':String(s)).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

/* ===================== NAV, STATE & ADMIN MODE ===================== */
let nav = { screen:'home', protocol:null, homeTab:'protocols', locationId:null, showModal:null };
let state = null;
let saveTimer = null;
let toastTimer = null;
let toastMsg = '';
let sessionMsg = '';
let savedProgress = {};
let sessionArchives = [];
let isAdmin = false;

function showToast(msg, duration = 2200){
  toastMsg = msg;
  renderToast();
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastMsg = '';
    renderToast();
  }, duration);
}

function renderToast(){
  let el = document.getElementById('rewild-toast');
  if(!toastMsg){
    if(el) el.remove();
    return;
  }
  if(!el){
    el = document.createElement('div');
    el.id = 'rewild-toast';
    el.className = 'toast-badge';
    document.body.appendChild(el);
  }
  el.innerHTML = toastMsg;
}

/* ===================== PROTOCOL METADATA ===================== */
const PROTOCOL_META = {
  gowild: { title: 'ReNatura Certification Survey', org: 'Inspired by GoWild — Rewilding Sudoeste, Aljezur, Portugal', steps: ['Intro','General','Patches','Summary'], storageKey: 'gowild_survey_state', filePrefix: 'renatura-survey', shortLabel: 'ReNatura', icon:'🌿', layer: 'Capa 1: Certificación y Clasificación General' },
  soil: { title: 'Field Soil Description Protocol', org: 'General-purpose terrain soil profile description', steps: ['Intro','Site','Pits','Summary'], storageKey: 'soil_survey_state', filePrefix: 'soil-survey', shortLabel: 'Soil', icon:'🟤', layer: 'Capa 2: Edafología y Perfiles de Suelo' },
  vess: { title: 'VESS — Visual Evaluation of Soil Structure', org: 'Field structure test (SRUC method) — Sq1 (good) to Sq5 (poor)', steps: ['Intro','Site','Blocks','Summary'], storageKey: 'vess_state', filePrefix: 'vess-survey', shortLabel: 'VESS', icon:'🧱', layer: 'Capa 2: Calidad Estructural del Suelo' },
  survey: { title: 'Visitor Perception Survey', org: 'Rewilding Sudoeste – public perception & engagement', steps: ['Intro','General','Responses','Summary'], storageKey: 'survey_state', filePrefix: 'perception-survey', shortLabel: 'Survey', icon:'📋', layer: 'Capa 5: Percepción Social y Servicios Ecosistémicos' },
  nativeforest: { title: 'Native Forest Assessment', org: 'ReNatura-standard sampling for native / climax woodland', steps: ['Intro','General','Patches','Summary'], storageKey: 'nativeforest_state', filePrefix: 'nativeforest-survey', shortLabel: 'Native Forest', icon:'🌳', layer: 'Capa 3: Fitosociología y Bosques Clímax' },
  plantation: { title: 'Tree Plantations & Industrial Forest Management', org: 'ReNatura-standard sampling for plantation / production forestry stands', steps: ['Intro','General','Patches','Summary'], storageKey: 'plantation_state', filePrefix: 'plantation-survey', shortLabel: 'Plantation', icon:'🌲', layer: 'Capa 3: Silvicultura y Productividad' },
  shrubland: { title: 'Shrublands Assessment', org: 'ReNatura-standard sampling for matos / garrigue / heathland', steps: ['Intro','General','Patches','Summary'], storageKey: 'shrubland_state', filePrefix: 'shrubland-survey', shortLabel: 'Shrubland', icon:'🌾', layer: 'Capa 3: Matorrales y Sucesión Vegetal' },
  wetland: { title: 'Wetlands Assessment', org: 'ReNatura-standard sampling for marshes, riparian & floodplain wetlands', steps: ['Intro','General','Patches','Summary'], storageKey: 'wetland_state', filePrefix: 'wetland-survey', shortLabel: 'Wetland', icon:'💧', layer: 'Capa 4: Hidrología y Zonas Húmedas' },
  peatland: { title: 'Peatlands Assessment', org: 'ReNatura-standard sampling for bogs, fens & mires', steps: ['Intro','General','Patches','Summary'], storageKey: 'peatland_state', filePrefix: 'peatland-survey', shortLabel: 'Peatland', icon:'🪵', layer: 'Capa 4: Turberas y Captura de Carbono' }
};

/* ===================== PRE-POPULATED CASE STUDIES & IN-PROGRESS PROTOTYPES ===================== */
const CASE_STUDIES = {
  chile_ruiles: {
    id: 'chile_ruiles',
    name: 'Reserva Nacional Los Ruiles (Chile)',
    icon: '🇨🇱',
    locationName: 'Sector Chanco, Región del Maule, Chile',
    coords: '-35.8333° S, -72.6333° W',
    area: '29.0 Hectares',
    isComplete: true,
    description: 'Estudio de recuperación y restauración ecológica post-incendio forestal (Megaincendio 2017). Monitoreo de conservación del Ruil (Nothofagus alessandrii), especie endémica en peligro de extinción, junto con Quillay, Boldo, Peumo y control de regeneración invasora de Pinus radiata.',
    tags: ['Chile', 'Megaincendio 2017', 'Nothofagus alessandrii', 'Restauración Post-Fuego', 'Suelo Volcánico/Costa'],
    protocols: {
      nativeforest: {
        surveyorName: 'Dr. Mateo Sepúlveda (CONAF Maule)',
        propertyName: 'Reserva Nacional Los Ruiles (Sector Chanco, Chile)',
        date: '2026-03-15',
        pct: 100,
        patches: [
          { patchId: 'Cuadrante-1: Bosque Maduro de Ruil', climaxType: 'Nothofagus alessandrii (Ruil)', canopyCover: '85%', topsoilThickness: '12cm (con carbón fino post-incendio)', finalRating: '5+ (Bosque Clímax)', details: 'DAP promedio de Ruil: 48cm. Presencia de Coihue (Nothofagus dombeyi) y Quillay (Quillaja saponaria). Sotobosque prolífico con 85 plántulas/m².' },
          { patchId: 'Cuadrante-2: Quebrada de Boldo y Peumo', climaxType: 'Bosque Hidrófilo de Quebrada', canopyCover: '70%', topsoilThickness: '15cm', finalRating: '4+', details: 'Dominancia de Peumus boldus y Cryptocarya alba. Sotobosque denso de Maqui (Aristotelia chilensis) y Murtilla (Ugni molinae).' }
        ]
      },
      soil: {
        surveyorName: 'Dra. Camila Morales (Universidad de Talca)',
        propertyName: 'Reserva Nacional Los Ruiles (Perfil Suelo Post-Fuego)',
        date: '2026-03-16',
        pct: 100,
        patches: [
          { patchId: 'Calicata-1: Perfil Loma Post-Incendio', climaxType: 'Suelo Franco-Arcilloso Volcánico-Costero', topsoilThickness: '0-12cm (Horizonte A con fina capa de ceniza y carbón, pH 6.2)', finalRating: 'Buena Regeneración Organic-Rich', details: 'Horizonte Bw (12-45cm): Pardo rojizo 7.5YR 4/4, estructura en bloques subangulares. Fragmentos gruesos: 15% esquisto meteorizado.' }
        ]
      },
      vess: {
        surveyorName: 'Ing. Rodrigo Fuentes',
        propertyName: 'Reserva Nacional Los Ruiles (Estrés Hidrofóbico)',
        date: '2026-03-16',
        pct: 100,
        patches: [
          { patchId: 'Bloque VESS-1', climaxType: 'Calidad Estructural Sq2', topsoilThickness: 'Capa superficial 0-5cm Sq2, Capa subsuperficial 5-15cm Sq4 (compactada por fuego)', finalRating: 'Sq2.5 (Estructura Moderadamente Buena)', details: 'Agregados subangulares con buena presencia de raíces en los primeros 10cm.' }
        ]
      },
      shrubland: {
        surveyorName: 'Equipo Conservación Maule',
        propertyName: 'Reserva Nacional Los Ruiles (Matorral Maqui/Murtilla)',
        date: '2026-03-17',
        pct: 100,
        patches: [
          { patchId: 'Matorral de Regeneración', climaxType: 'Matorral de Maqui y Murtilla', canopyCover: '45%', topsoilThickness: '8cm', finalRating: '3+', details: 'Rebrote vigoroso de Maqui post-fuego. Alerta de invasión por renovales de Pinus radiata que requieren erradicación manual.' }
        ]
      }
    }
  },
  chile_biobio: {
    id: 'chile_biobio',
    name: 'Prototipo Bío-Bío — Parque Nacional Nahuelbuta & Quebrada Caramávida',
    icon: '🇨🇱',
    locationName: 'Cordillera de Nahuelbuta, Región del Bío-Bío, Chile',
    coords: '-37.8000° S, -73.2000° W',
    area: '68.0 Hectares (Mapeo Ecosistémico en Curso)',
    isComplete: false,
    description: 'Campamento de mapeo e investigación ecológica en curso en la Cordillera de Nahuelbuta (Región del Bío-Bío). Monitoreo de relictos milenarios de Araucaria (Araucaria araucana), Robles (Nothofagus obliqua), Chauras (Gaultheria poeppigii) y hábitat del Zorro de Darwin. Contiene 9 protocolos en proceso de mapeo (datos en avance parcial, sin informe final listo).',
    tags: ['Bío-Bío Chile', 'Nahuelbuta', 'Araucaria araucana', 'Borrador - En Progreso', 'Prototipo Parcial'],
    protocols: {
      gowild: {
        surveyorName: 'Ing. Lucas Valenzuela (CONAF Bío-Bío)',
        propertyName: 'Nahuelbuta Sector Caramávida (ReNatura)',
        date: '2026-04-02',
        pct: 30,
        patches: [
          { patchId: 'Cuadrante-N1: Araucarias en Cumbre', climaxType: 'Bosque Clímax de Araucaria araucana', canopyCover: '60%', topsoilThickness: '14cm (En evaluación)', finalRating: 'Borrador - En Progreso (30%)', details: '🚧 Borrador en progreso: Muestreo preliminar de 12 ejemplares milenarios de Araucaria. Registro pendiente de sotobosque.' }
        ]
      },
      soil: {
        surveyorName: 'Dra. Elena Alarcón (U. de Concepción)',
        propertyName: 'Nahuelbuta Perfil Suelo Granítico',
        date: '2026-04-03',
        pct: 60,
        patches: [
          { patchId: 'Calicata-B1: Perfil Granítico de Montaña', climaxType: 'Suelo Acídico Orgánico de Altura', topsoilThickness: '0-18cm (Horizonte O/A muy espeso, pH 5.4)', finalRating: 'Borrador - En Progreso (60%)', details: '🚧 Borrador en progreso: Horizonte Bw (18-50cm) en análisis de laboratorio. Roca madre granítica a 50cm.' }
        ]
      },
      vess: {
        surveyorName: 'Ing. Lucas Valenzuela',
        propertyName: 'Nahuelbuta VESS Estructural',
        date: '2026-04-03',
        pct: 35,
        patches: [
          { patchId: 'Bloque VESS-BíoBío', climaxType: 'Estructura Granular Orgánica Sq1.5', topsoilThickness: '0-10cm Sq1, 10-25cm Sq2', finalRating: 'Borrador - En Progreso (35%)', details: '🚧 Borrador en progreso: Excelente porosidad natural por alta acumulación de hojarasca de Araucaria.' }
        ]
      },
      survey: {
        surveyorName: 'Equipo de Vinculación Cañete-Angol',
        propertyName: 'Encuestas Comunitarias Nahuelbuta',
        date: '2026-04-04',
        pct: 70,
        patches: [
          { patchId: 'Muestra 28 Respuestas', climaxType: 'Comunidades Locales Bío-Bío', topsoilThickness: 'Alto Valor de Conservación', finalRating: 'Borrador - En Progreso (70%)', details: '🚧 Borrador en progreso: 28 encuestas aplicadas en sectores de Cañete y Contulmo sobre valor cultural de la Araucaria.' }
        ]
      },
      nativeforest: {
        surveyorName: 'Dra. Elena Alarcón',
        propertyName: 'Bosque Relictual de Roble y Coigüe',
        date: '2026-04-05',
        pct: 45,
        patches: [
          { patchId: 'Transecto Caramávida Norte', climaxType: 'Nothofagus obliqua (Roble) y N. dombeyi', canopyCover: '80%', topsoilThickness: '16cm', finalRating: 'Borrador - En Progreso (45%)', details: '🚧 Borrador en progreso: Medición de DAP realizada en 18 individuos. Pendiente catastro de epífitas y musgos.' }
        ]
      },
      plantation: {
        surveyorName: 'Ing. Marcos Tapia',
        propertyName: 'Zona Amortiguación Pino-Araucaria',
        date: '2026-04-05',
        pct: 55,
        patches: [
          { patchId: 'Franja de Transición', climaxType: 'Pinus radiata en Retiro / Conversión', canopyCover: '50%', topsoilThickness: '6cm', finalRating: 'Borrador - En Progreso (55%)', details: '🚧 Borrador en progreso: Plan de tala gradual de pino para expandir corredor ecológico nativo.' }
        ]
      },
      shrubland: {
        surveyorName: 'Equipo CONAF Bío-Bío',
        propertyName: 'Matorral Altomontano de Chaura',
        date: '2026-04-06',
        pct: 50,
        patches: [
          { patchId: 'Matorral de Gaultheria poeppigii', climaxType: 'Chauratales de Cumbre', canopyCover: '40%', topsoilThickness: '8cm', finalRating: 'Borrador - En Progreso (50%)', details: '🚧 Borrador en progreso: Caracterización de flora menor asociada a quebradas de roca expuesta.' }
        ]
      },
      wetland: {
        surveyorName: 'Dra. Elena Alarcón',
        propertyName: 'Quebrada Caramávida (Humedal)',
        date: '2026-04-06',
        pct: 25,
        patches: [
          { patchId: 'Estero Caramávida', climaxType: 'Bosque Hidrófilo de Ribera', canopyCover: '90%', topsoilThickness: '22cm', finalRating: 'Borrador - En Progreso (25%)', details: '🚧 Borrador en progreso: Registro inicial de helechos arborescentes y calidad del agua en nacientes.' }
        ]
      },
      peatland: {
        surveyorName: 'Ing. Lucas Valenzuela',
        propertyName: 'Turbera de Altura Nahuelbuta',
        date: '2026-04-07',
        pct: 40,
        patches: [
          { patchId: 'Turbera de Sphagnum', climaxType: 'Turbera Acumuladora de Carbono', topsoilThickness: 'Espesor de turba > 80cm', finalRating: 'Borrador - En Progreso (40%)', details: '🚧 Borrador en progreso: Medición de capacidad de retención hídrica en turbera altoandina.' }
        ]
      }
    }
  },
  portugal_aljezur: {
    id: 'portugal_aljezur',
    name: 'Quinta de São Pedro (Portugal)',
    icon: '🇵🇹',
    locationName: 'Aljezur, Algarve, Portugal',
    coords: '37.3167° N, -8.8000° W',
    area: '42.5 Hectares',
    isComplete: true,
    description: 'Certificación ReNatura y reconversión ecológica de eucaliptal comercial hacia bosque clímax de sobreiral (Quercus suber), restauración de matorral de medroño (Arbutus unedo) y conservación de zona húmeda de ribera.',
    tags: ['Portugal', 'Algarve', 'Quercus suber', 'ReNatura Certification', 'Restauración Ribera'],
    protocols: {
      gowild: {
        surveyorName: 'Dra. Sofia Mendes (ReNatura Portugal)',
        propertyName: 'Quinta de São Pedro (Aljezur)',
        date: '2026-02-10',
        pct: 100,
        patches: [
          { patchId: 'Parcela-1: Sobreiral Norte', climaxType: 'Natura 2000: 91E0 (Bosque Clímax de Alcornoque)', canopyCover: '≥ 50%', topsoilThickness: '10cm', finalRating: '5+ (Sobresaliente)', details: 'Alcornoque maduro (Quercus suber) con sotobosque denso de Arbutus unedo y Erica arborea. Cero presencia de invasoras.' },
          { patchId: 'Parcela-2: Antiguo Eucaliptal', climaxType: 'Silvicultura en Reconversión', canopyCover: '< 50%', topsoilThickness: '3cm', finalRating: '3-', details: 'Corta gradual de Eucalyptus globulus realizada. Regeneración natural de Cistus ladanifer (Estepa) en etapa 3.' }
        ]
      },
      wetland: {
        surveyorName: 'Ing. Joao Silva',
        propertyName: 'Quinta de São Pedro (Ribeiro de Aljezur)',
        date: '2026-02-12',
        pct: 100,
        patches: [
          { patchId: 'Tramo de Ribera', climaxType: 'Bosque de Galería / Aliseda Riparia', canopyCover: '75%', topsoilThickness: '18cm', finalRating: '4+', details: 'Control exitoso de cañaveral (Arundo donax). Establecimiento de sauces nativos y juncos.' }
        ]
      },
      survey: {
        surveyorName: 'Equipo de Participación Ciudadana',
        propertyName: 'Quinta de São Pedro (Encuestas de Percepción)',
        date: '2026-02-14',
        pct: 100,
        patches: [
          { patchId: 'Encuesta Comunitaria Aljezur', climaxType: '45 Respuestas Registradas', topsoilThickness: 'Percepción Muy Positiva', finalRating: '92% Apoyo al Rewilding', details: 'Comunidad local valora la reducción de riesgo de incendios y la conservación del agua.' }
        ]
      }
    }
  }
};

/* ===================== CUSTOM BUILDER STATE ===================== */
let customBuilderState = {
  title: 'Protocolo de Monitoreo Personalizado',
  description: 'Formulario editable creado por el usuario para campañas específicas de terreno.',
  questions: [
    { id: 'q1', type: 'text', label: 'Código / Identificador del Cuadrante', required: true, note: 'Ej. C-01, Transecto Norte' },
    { id: 'q2', type: 'select', label: 'Estado de Salud de la Vegetación', required: true, options: ['Excelente (Vigoroso)', 'Bueno (Poca alteración)', 'Degradado (Estrés hídrico/fuego)', 'Invasión Severa'] },
    { id: 'q3', type: 'rating', label: 'Índice de Vigor de Dosel (1 a 5)', required: false, note: '1 = Muerte regresiva, 5 = Máxima densidad de follaje' },
    { id: 'q4', type: 'photo', label: 'Fotografía de Panorámica General del Sitio', required: true },
    { id: 'q5', type: 'gps', label: 'Coordenadas GPS de Precisión del Punto', required: true }
  ]
};

/* ===================== GENERIC FIELD RENDERERS ===================== */
function qLabel(label, required, note){
  return `<label class="q">${esc(label)}${required ? ' <span class="req">*</span>' : ''}${note ? `<span class="note"> — ${esc(note)}</span>` : ''}</label>`;
}
function radioGroup(path,label,options,required,note){
  const val=getPath(state,path)||'';
  return `<div class="field">${qLabel(label,required,note)}
    <div class="choices">
      ${options.map(o=>`<div class="choice radio ${val===o.v?'selected':''}" data-bind-radio="${path}" data-value="${esc(o.v)}"><span class="mark"></span>${esc(o.l)}</div>`).join('')}
    </div></div>`;
}
function checkboxGroup(path,label,options,required,note){
  const arr=getPath(state,path)||[];
  return `<div class="field">${qLabel(label,required,note)}
    <div class="choices">
      ${options.map(o=>`<div class="choice checkbox ${arr.includes(o.v)?'selected':''}" data-bind-checkbox="${path}" data-value="${esc(o.v)}"><span class="mark"></span>${esc(o.l)}</div>`).join('')}
    </div></div>`;
}
function textField(path,label,required,note,placeholder){
  const val=getPath(state,path)||'';
  return `<div class="field">${qLabel(label,required,note)}
    <input type="text" data-bind-text="${path}" value="${esc(val)}" placeholder="${esc(placeholder||'')}"></div>`;
}
function textareaField(path,label,required,note,placeholder){
  const val=getPath(state,path)||'';
  return `<div class="field">${qLabel(label,required,note)}
    <textarea data-bind-text="${path}" placeholder="${esc(placeholder||'')}">${esc(val)}</textarea></div>`;
}
function numberField(path,label,required,note,unit){
  const val=getPath(state,path)||'';
  return `<div class="field">${qLabel(label+(unit?' ('+unit+')':''),required,note)}
    <input class="mono-input" type="number" step="any" data-bind-text="${path}" value="${esc(val)}"></div>`;
}
function dateTimeField(datePath,timePath,label,required){
  const d=getPath(state,datePath)||'', t=getPath(state,timePath)||'';
  return `<div class="field">${qLabel(label,required)}
    <div class="gpsrow">
      <input type="date" data-bind-text="${datePath}" value="${esc(d)}">
      <input type="time" data-bind-text="${timePath}" value="${esc(t)}">
    </div></div>`;
}

function selectField(path,label,options,required,note){
  const val=getPath(state,path)||'';
  return `<div class="field">${qLabel(label,required,note)}
    <select data-bind-select="${path}">
      <option value="">-- Seleccionar --</option>
      ${options.map(o=>`<option value="${esc(o.v)}" ${val===o.v?'selected':''}>${esc(o.l)}</option>`).join('')}
    </select></div>`;
}

/* ===================== ECOSYSTEM INTEGRATION & VALUATION ENGINE ===================== */
function computeEcoIndex(cs){
  if(!cs || !cs.protocols) return { score: 50, carbonApt: 'Media', biodiversity: 'En evaluación', fireRisk: 'Medio', coverageLayers: 0 };
  const pKeys = Object.keys(cs.protocols);
  let layerCount = pKeys.length;
  let totalPct = 0;
  pKeys.forEach(k => { totalPct += (cs.protocols[k].pct || 0); });
  const avgCompletion = layerCount > 0 ? totalPct / layerCount : 0;
  
  let baseScore = Math.min(95, Math.max(35, Math.round(30 + (layerCount * 8) + (avgCompletion * 0.35))));
  if(cs.id === 'chile_ruiles') baseScore = 88;
  if(cs.id === 'portugal_aljezur') baseScore = 91;
  if(cs.id === 'chile_biobio') baseScore = 74;

  let carbonApt = baseScore >= 80 ? 'Excelente (Alto Potencial)' : (baseScore >= 60 ? 'Bueno (Apto)' : 'Moderado');
  let fireRisk = baseScore >= 80 ? 'Bajo (Resiliencia Clímax)' : (baseScore >= 60 ? 'Medio (En Transición)' : 'Elevado (Combustible Acumulado)');
  let biodiversity = baseScore >= 85 ? 'Sobresaliente (Especies Clímax/Endémicas)' : (baseScore >= 70 ? 'Alto (Regeneración Activa)' : 'Medio');

  return {
    score: baseScore,
    avgCompletion: Math.round(avgCompletion),
    layerCount,
    carbonApt,
    biodiversity,
    fireRisk
  };
}

function renderEcoIndexDashboard(cs){
  const eco = computeEcoIndex(cs);
  return `
    <div style="background:var(--paper);border:1px solid var(--gold);border-radius:12px;padding:20px;margin-bottom:20px;box-shadow:var(--shadow)">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
        <div>
          <div style="font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--gold-dark);font-weight:700">Valuación Territorial &amp; Servicios Ecosistémicos (Dueño de Predio)</div>
          <h2 style="font-family:'Fraunces',serif;color:var(--canopy);margin:4px 0 0;font-size:22px">Índice Sintético de Salud Ecosistémica</h2>
        </div>
        <div style="display:flex;align-items:center;gap:10px">
          <div style="background:linear-gradient(135deg,var(--canopy),var(--moss));color:#FFFFFF;padding:10px 18px;border-radius:12px;text-align:center;box-shadow:0 3px 10px rgba(30,70,32,.25)">
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;opacity:.9">Eco-Score Global</div>
            <div style="font-size:28px;font-weight:800;font-family:'Fraunces',serif;line-height:1.1">${eco.score}<span style="font-size:16px;font-weight:500">/100</span></div>
          </div>
        </div>
      </div>

      <div class="eco-kpi-grid">
        <div class="eco-kpi-card" style="border-left:3px solid var(--canopy)">
          <div class="eco-kpi-title">Capas Evaluadas</div>
          <div class="eco-kpi-val">${eco.layerCount} <span style="font-size:14px;color:var(--ink-dim)">/ 9 Capas</span></div>
          <div class="eco-kpi-sub">${eco.avgCompletion}% de completitud global</div>
        </div>

        <div class="eco-kpi-card" style="border-left:3px solid var(--gold)">
          <div class="eco-kpi-title">Aptitud Bonos de Carbono</div>
          <div class="eco-kpi-val" style="font-size:18px;color:var(--gold-dark)">${eco.carbonApt}</div>
          <div class="eco-kpi-sub">Biomasa y horizonte orgánico de suelo</div>
        </div>

        <div class="eco-kpi-card" style="border-left:3px solid var(--horizon)">
          <div class="eco-kpi-title">Biodiversidad &amp; Clímax</div>
          <div class="eco-kpi-val" style="font-size:18px;color:var(--horizon)">${eco.biodiversity}</div>
          <div class="eco-kpi-sub">Especies nativas y estructura trófica</div>
        </div>

        <div class="eco-kpi-card" style="border-left:3px solid var(--clay)">
          <div class="eco-kpi-title">Resiliencia a Incendios</div>
          <div class="eco-kpi-val" style="font-size:18px;color:var(--clay-dark)">${eco.fireRisk}</div>
          <div class="eco-kpi-sub">Humedad de sotobosque y discontinuidad</div>
        </div>
      </div>

      <div style="background:var(--paper-2);border-radius:8px;padding:12px 14px;font-size:12.5px;color:var(--ink);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
        <span>💡 <i>Añade más protocolos (Suelo, Hidrología o Fitosociología) a este predio para certificar capas aditivas y maximizar su valor de conservación.</i></span>
        <button class="btn btn-canopy btn-sm" data-action="quickaddlayer" data-locid="${cs.id}">+ Añadir Nueva Capa a este Predio</button>
      </div>
    </div>
  `;
}

/* ===================== PROTOCOL-SPECIFIC FIELD SPECIALIZATIONS (NO DUPLICITY) ===================== */
function renderPatchFormSpecifics(pId, pPath){
  if(pId === 'vess'){
    return `
      <div style="background:var(--paper-2);border-left:3px solid var(--clay);padding:14px;border-radius:8px;margin:16px 0">
        <h4 style="margin:0 0 8px;color:var(--canopy);font-size:14px">🧱 Módulo Específico VESS (Evaluación Estructural de SRUC)</h4>
        <div style="font-size:12px;color:var(--ink-dim);margin-bottom:12px">Califica la calidad de los bloques de suelo excavados (pala de 20x20x20cm).</div>
        ${selectField(pPath + '.vessScore', 'Puntuación Estructural VESS (Sq)', [
          {v:'Sq1', l:'Sq1: Muy Buena (Agregados friables, muy porosos, fácil disgregación manual)'},
          {v:'Sq2', l:'Sq2: Buena (Agregados redondeados y subangulares porosos, raíces abundantes)'},
          {v:'Sq3', l:'Sq3: Moderada (Agregados más densos, menor porosidad visible)'},
          {v:'Sq4', l:'Sq4: Pobre (Bloques angulares densos, raíces restringidas a fisuras)'},
          {v:'Sq5', l:'Sq5: Muy Pobre (Masa masiva, compactación severa, nódulos anaeróbicos)'}
        ], true, 'Escala estándar de 1 a 5')}
        ${numberField(pPath + '.blockDepth', 'Profundidad de la capa limitante de raíces', false, 'cm')}
        ${selectField(pPath + '.aggregateBreak', 'Comportamiento de fragmentación al soltar bloque', [
          {v:'friable', l:'Se disgrega en agregados finos naturales al caer desde 1m'},
          {v:'semi-compact', l:'Requiere presión manual moderada de los dedos'},
          {v:'hard', l:'Requiere gran fuerza o no se disgrega'}
        ], false)}
      </div>
    `;
  }

  if(pId === 'soil'){
    return `
      <div style="background:var(--paper-2);border-left:3px solid var(--clay);padding:14px;border-radius:8px;margin:16px 0">
        <h4 style="margin:0 0 8px;color:var(--canopy);font-size:14px">🟤 Módulo Edafología: Calicata &amp; Horizontes</h4>
        <div style="font-size:12px;color:var(--ink-dim);margin-bottom:12px">Descripción estratificada del perfil edáfico de terreno.</div>
        <div class="gpsrow">
          ${textField(pPath + '.horizonA', 'Horizonte A (Espesor en cm y color Munsell)', false, 'Ej. 0-12cm, 7.5YR 3/2')}
          ${textField(pPath + '.horizonB', 'Horizonte B/Bw (Espesor y estructura)', false, 'Ej. 12-45cm, Bloques subangulares')}
        </div>
        <div class="gpsrow">
          ${selectField(pPath + '.soilTexture', 'Textura al Tacto', [
            {v:'franco', l:'Franco (Equilibrado arena/limo/arcilla)'},
            {v:'franco_arcilloso', l:'Franco-Arcilloso (Pegajoso, moldeable)'},
            {v:'franco_arenoso', l:'Franco-Arenoso (Áspero, buen drenaje)'},
            {v:'arcilloso', l:'Arcilloso Pesado (Alta retención de agua)'},
            {v:'organico', l:'Orgánico / Húmico (Esponjoso)'}
          ], false)}
          ${numberField(pPath + '.soilPh', 'pH de Campo (con tiras o potenciómetro)', false, '4.0 - 9.0')}
        </div>
        ${selectField(pPath + '.coarseFragments', 'Porcentaje de Fragmentos Gruesos / Pedregosidad', [
          {v:'0-5', l:'< 5% (Sin piedras)'},
          {v:'5-15', l:'5 - 15% (Ligeramente pedregoso)'},
          {v:'15-35', l:'15 - 35% (Moderadamente pedregoso)'},
          {v:'gt35', l:'> 35% (Muy pedregoso o esquelético)'}
        ], false)}
      </div>
    `;
  }

  if(pId === 'nativeforest'){
    return `
      <div style="background:var(--paper-2);border-left:3px solid var(--canopy);padding:14px;border-radius:8px;margin:16px 0">
        <h4 style="margin:0 0 8px;color:var(--canopy);font-size:14px">🌳 Módulo Fitosociología: Bosque Nativo Clímax</h4>
        <div class="gpsrow">
          ${numberField(pPath + '.treeDap', 'DAP Promedio de Árboles Dominantes', false, 'cm (a 1.30m altura)')}
          ${numberField(pPath + '.canopyHeight', 'Altura Promedio del Dosel Superior', false, 'metros')}
        </div>
        ${selectField(pPath + '.deadWood', 'Madera Muerta / Necromasa en Cuadrante', [
          {v:'abundante', l:'Abundante en suelo y en pie (Excelente hábitat saproxílico)'},
          {v:'moderada', l:'Presencia de ramas caídas y algún tronco en descomposición'},
          {v:'escasa', l:'Escasa o retirada por manejo forestal'}
        ], false, 'Indicador clave de rewilding y madurez del ecosistema')}
        ${textField(pPath + '.epiphytesLichen', 'Líquenes, Musgos y Epífitas observadas', false, 'Ej. Barbas de viejo, Usnea, helechos epífitos')}
      </div>
    `;
  }

  if(pId === 'wetland' || pId === 'peatland'){
    return `
      <div style="background:var(--paper-2);border-left:3px solid var(--horizon);padding:14px;border-radius:8px;margin:16px 0">
        <h4 style="margin:0 0 8px;color:var(--canopy);font-size:14px">💧 Módulo Hidrología &amp; Humedales / Turberas</h4>
        <div class="gpsrow">
          ${numberField(pPath + '.waterTableDepth', 'Profundidad de Napa Freática / Nivel de Agua', false, 'cm (+/- si sobre suelo)')}
          ${selectField(pPath + '.waterFlowRegime', 'Régimen Hídrico del Sitio', [
            {v:'permanente', l:'Flujo permanente / Saturación continua'},
            {v:'estacional', l:'Inundación estacional o invernal'},
            {v:'intermitente', l:'Riada efímera / Ribera temporal'}
          ], false)}
        </div>
        ${pId === 'peatland' ? selectField(pPath + '.vonPost', 'Grado de Descomposición de Turba (Escala von Post)', [
          {v:'H1-H3', l:'H1 - H3 (Turba poco descompuesta, estructura vegetal intacta)'},
          {v:'H4-H6', l:'H4 - H6 (Turba moderadamente descompuesta)'},
          {v:'H7-H10', l:'H7 - H10 (Turba muy descompuesta, masa amorfa)'}
        ], false) : ''}
        ${textField(pPath + '.riparianBuffer', 'Ancho de la franja de amortiguación riparia', false, 'metros de vegetación nativa')}
      </div>
    `;
  }

  if(pId === 'survey'){
    return `
      <div style="background:var(--paper-2);border-left:3px solid var(--horizon);padding:14px;border-radius:8px;margin:16px 0">
        <h4 style="margin:0 0 8px;color:var(--canopy);font-size:14px">📋 Módulo Percepción Social &amp; Servicios Culturales</h4>
        ${selectField(pPath + '.perceivedFireRisk', 'Percepción Local del Riesgo de Incendio', [
          {v:'muy_bajo', l:'Muy bajo con la presencia del bosque/rewilding'},
          {v:'moderado', l:'Moderado, requiere cortafuegos limpios'},
          {v:'alto', l:'Alto por biomasa continua no manejada'}
        ], false)}
        ${selectField(pPath + '.rewildingAcceptance', 'Aceptación del Rewilding y Conservación', [
          {v:'muy_favorable', l:'Altamente favorable (90-100% de la comunidad)'},
          {v:'favorable', l:'Favorable con dudas sobre fauna o accesos'},
          {v:'indiferente', l:'Indiferente / Desconocimiento de la iniciativa'},
          {v:'reticente', l:'Reticente por temor a pérdida de actividad silvícola'}
        ], false)}
      </div>
    `;
  }

  return '';
}

/* ===================== EVENT HANDLERS & NAVIGATION ===================== */
document.addEventListener('input', function(e){
  const el = e.target.closest('[data-bind-text]');
  if(el && state){ setPath(state, el.getAttribute('data-bind-text'), el.value); autosave(); }
  
  const bTitle = e.target.closest('[data-bind-builder-title]');
  if(bTitle){ customBuilderState.title = bTitle.value; }
  const bLabel = e.target.closest('[data-bind-builder-label]');
  if(bLabel){
    const qIndex = parseInt(bLabel.getAttribute('data-index'));
    if(customBuilderState.questions[qIndex]){
      customBuilderState.questions[qIndex].label = bLabel.value;
    }
  }
});

document.addEventListener('change', function(e){
  const sel = e.target.closest('[data-bind-select]');
  if(sel && state){ setPath(state, sel.getAttribute('data-bind-select'), sel.value); autosave(); render(); return; }
  
  const bType = e.target.closest('[data-bind-builder-type]');
  if(bType){
    const qIndex = parseInt(bType.getAttribute('data-index'));
    if(customBuilderState.questions[qIndex]){
      customBuilderState.questions[qIndex].type = bType.value;
      render();
    }
  }
});

document.addEventListener('change', async function(e){
  const el = e.target.closest('[data-bind-photo]');
  if(!el || !el.files || !el.files[0] || !state) return;
  const path = el.getAttribute('data-bind-photo');
  const file = el.files[0];
  try {
    const compressedUrl = await compressImage(file, 1200, 0.8);
    setPath(state, path, compressedUrl);
    autosave();
    render();
  } catch(err) {
    alert('Could not process photo: ' + err.message);
  }
});

document.addEventListener('click', function(e){
  try {
    const r = e.target.closest('[data-bind-radio]');
    if(r && state){ setPath(state, r.getAttribute('data-bind-radio'), r.getAttribute('data-value')); autosave(); render(); return; }
    const c = e.target.closest('[data-bind-checkbox]');
    if(c && state){
      const path = c.getAttribute('data-bind-checkbox'), val = c.getAttribute('data-value');
      const arr = getPath(state, path) || [];
      const idx = arr.indexOf(val);
      if(idx > -1) arr.splice(idx, 1); else arr.push(val);
      setPath(state, path, arr);
      autosave();
      render();
      return;
    }
    const t = e.target.closest('[data-action]');
    if(!t) return;
    const action = t.getAttribute('data-action');

    if(action === 'openprotocol'){ openProtocol(t.getAttribute('data-protocol')); }
    else if(action === 'openlocation'){ openLocation(t.getAttribute('data-locid')); }
    else if(action === 'loadsitedraft'){ loadSiteDraft(t.getAttribute('data-csid'), nav.protocol); }
    else if(action === 'saveandpause'){
      if(state){
        autosave();
        alert('💾 Progreso guardado exitosamente. Puedes continuar en cualquier momento.');
        nav.screen = 'home'; nav.protocol = null; nav.locationId = null; nav.showModal = null;
        scanAllProgress().then(render); window.scrollTo(0,0);
      }
    }
    else if(action === 'toggleadmin'){ isAdmin = !isAdmin; sessionMsg = isAdmin ? '🔑 Modo Administrador Activo' : ''; render(); }
    else if(action === 'openmaininfo'){ nav.showModal = 'maininfo'; render(); }
    else if(action === 'openprotoinfo'){ nav.showModal = 'protoinfo'; render(); }
    else if(action === 'closemodal'){ nav.showModal = null; render(); }
    else if(action === 'exportcasepdf'){ exportLocationPDF(t.getAttribute('data-locid')); }
    else if(action === 'exportcaseexcel'){ exportLocationExcel(t.getAttribute('data-locid')); }
    else if(action === 'exportcasejson'){ exportLocationJSON(t.getAttribute('data-locid')); }
    else if(action === 'exportcasecsv'){ exportLocationCSV(t.getAttribute('data-locid')); }
    else if(action === 'quickaddlayer'){
      nav.showModal = 'addlayer';
      nav.targetLocationId = t.getAttribute('data-locid');
      render();
    }
    else if(action === 'startlayerforlocation'){
      const targetLoc = t.getAttribute('data-locid');
      const pId = t.getAttribute('data-protocol');
      nav.showModal = null;
      loadSiteDraft(targetLoc, pId);
      openProtocol(pId);
    }
    else if(action === 'archivesession'){ archiveCurrentSession(); }
    else if(action === 'discardsession'){ discardCurrentSession(); }
    else if(action === 'backhome'){ nav.screen = 'home'; nav.protocol = null; nav.locationId = null; nav.showModal = null; scanAllProgress().then(render); window.scrollTo(0,0); }
    else if(action === 'hometab'){ nav.homeTab = t.getAttribute('data-tab'); render(); }
    else if(action === 'addbuilderq'){ addBuilderQuestion(); render(); }
    else if(action === 'deletebuilderq'){
      const idx = parseInt(t.getAttribute('data-index'));
      customBuilderState.questions.splice(idx, 1);
      render();
    }
    else if(action === 'launchcustomsurvey'){
      alert('🚀 Starting session with Custom Builder Protocol: "' + customBuilderState.title + '"');
      openProtocol('gowild');
    }
    else if(action === 'gotostep'){ if(state){ state.step = parseInt(t.getAttribute('data-step')); render(); window.scrollTo(0,0); } }
    else if(action === 'nextstep'){ nextStep(); }
    else if(action === 'prevstep'){ prevStep(); }
    else if(action === 'addpatch'){ if(state){ state.patches.push(newPatch()); state.editingPatch = state.patches.length - 1; state.step = 4; render(); } }
    else if(action === 'editpatch'){ if(state){ state.editingPatch = parseInt(t.getAttribute('data-index')); state.step = 4; render(); } }
    else if(action === 'removepatch'){ if(state && confirm('Delete patch?')){ state.patches.splice(parseInt(t.getAttribute('data-index')), 1); autosave(); render(); } }
    else if(action === 'clearphoto'){ if(state){ setPath(state, t.getAttribute('data-path'), null); autosave(); render(); } }
    else if(action === 'exportjson'){ exportJSON(); }
    else if(action === 'exportcsv'){ exportCSV(); }
    else if(action === 'printview'){ window.print(); }
  } catch(err) {
    console.error('Click error:', err);
  }
});

function loadSiteDraft(csId, pId){
  const cs = CASE_STUDIES[csId];
  if(!cs || !cs.protocols || !cs.protocols[pId]) return;
  const pData = cs.protocols[pId];
  state = {
    step: 0,
    editingPatch: -1,
    surveyorName: pData.surveyorName || '',
    propertyName: `${cs.name} (${pData.propertyName || ''})`,
    date: pData.date || '',
    time: '10:00',
    patches: JSON.parse(JSON.stringify(pData.patches || []))
  };
  sessionMsg = `🚧 Cargado borrador en progreso de ${cs.name} (${pData.pct}% completado).`;
  render();
  window.scrollTo(0,0);
}

function openLocation(locId){
  nav.screen = 'locationdetail';
  nav.locationId = locId || 'chile_ruiles';
  nav.showModal = null;
  render();
  window.scrollTo(0,0);
}
window.openLocation = openLocation;

function addBuilderQuestion(){
  customBuilderState.questions.push({
    id: uid(),
    type: 'text',
    label: 'Nueva Pregunta Personalizada ' + (customBuilderState.questions.length + 1),
    required: false,
    note: ''
  });
}

/* ===================== EXPORTERS ===================== */
function exportLocationPDF(locId){
  const cs = CASE_STUDIES[locId] || CASE_STUDIES.chile_ruiles;
  if (!window.jspdf || !window.jspdf.jsPDF) {
    alert('PDF exporter library loading... Please try again in a moment.');
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('p', 'mm', 'a4');

  doc.setFillColor(24, 32, 25);
  doc.rect(0, 0, 210, 48, 'F');
  
  doc.setTextColor(216, 172, 70);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('REWILDING FIELD SUITE — INFORME ECOLÓGICO MULTICAPA DE TERRENO', 14, 15);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(17);
  doc.text(`${cs.icon || ''} ${cs.name}`, 14, 28);

  doc.setTextColor(180, 210, 190);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Ubicación: ${cs.locationName} | Área: ${cs.area} | Coordenadas: ${cs.coords}`, 14, 39);

  doc.setFillColor(245, 248, 245);
  doc.rect(14, 54, 182, 38, 'F');
  doc.setDrawColor(200, 220, 200);
  doc.rect(14, 54, 182, 38, 'S');

  doc.setTextColor(36, 64, 47);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Resumen del Predio & Contexto Ecológico:', 18, 62);

  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  const descLines = doc.splitTextToSize(cs.description, 174);
  doc.text(descLines, 18, 68);

  doc.setFont('helvetica', 'bold');
  doc.text(`Etiquetas: ${cs.tags.join(', ')}`, 18, 86);

  let y = 100;
  doc.setTextColor(216, 172, 70);
  doc.setFontSize(13);
  doc.text('Capas del Territorio Registradas & Protocolos Muestreados', 14, y);
  y += 8;

  Object.keys(cs.protocols).forEach((pId) => {
    const meta = PROTOCOL_META[pId] || { title: pId, icon: '📋', layer: 'Capa Ecológica' };
    const pData = cs.protocols[pId];

    if (y > 250) { doc.addPage(); y = 20; }

    doc.setFillColor(36, 64, 47);
    doc.rect(14, y, 182, 11, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(`${meta.icon} ${meta.layer} — ${meta.title} (${pData.pct}% Completado)`, 18, y + 7);
    y += 15;

    doc.setTextColor(80, 80, 80);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(`Encuestador Responsable: ${pData.surveyorName} | Fecha: ${pData.date} | Avance: ${pData.pct}%`, 18, y);
    y += 7;

    (pData.patches || []).forEach((item, idx) => {
      if (y > 250) { doc.addPage(); y = 20; }

      doc.setFillColor(248, 250, 248);
      doc.rect(18, y, 174, 22, 'F');
      doc.setDrawColor(220, 230, 220);
      doc.rect(18, y, 174, 22, 'S');

      doc.setTextColor(36, 64, 47);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(`Ítem #${idx+1}: ${item.patchId}`, 22, y + 6);

      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`Target/Clímax: ${item.climaxType} | Cobertura/Suelo: ${item.canopyCover || item.topsoilThickness || 'N/A'} | Estado: ${item.finalRating || 'N/A'}`, 22, y + 11);

      doc.setTextColor(50, 50, 50);
      const splitDetails = doc.splitTextToSize(`Observaciones: ${item.details}`, 166);
      doc.text(splitDetails[0] || '', 22, y + 17);

      y += 26;
    });

    y += 6;
  });

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text(`Rewilding Field Suite PWA — Página ${i} de ${pageCount}`, 14, 290);
  }

  doc.save(`${cs.id}_informe_ecologico_completo.pdf`);
}

function exportLocationJSON(locId){
  const cs = CASE_STUDIES[locId] || CASE_STUDIES.chile_ruiles;
  downloadBlob(`${cs.id}_estudio_caso_fusionado.json`, JSON.stringify(cs, null, 2), 'application/json');
}

function exportLocationExcel(locId){
  const cs = CASE_STUDIES[locId] || CASE_STUDIES.chile_ruiles;
  if (typeof XLSX === 'undefined') {
    alert('Excel exporter loading...');
    return;
  }
  const wb = XLSX.utils.book_new();

  const summaryRows = [{
    'Nombre_Terreno': cs.name,
    'Ubicacion': cs.locationName,
    'Coordenadas': cs.coords,
    'Area': cs.area,
    'Estado_Mapeo': cs.isComplete ? 'Completado (100%)' : 'Borrador - En Progreso (Avance Parcial)',
    'Descripcion': cs.description
  }];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryRows), 'Resumen_Terreno');

  Object.keys(cs.protocols).forEach(pId => {
    const meta = PROTOCOL_META[pId] || { title: pId };
    const pData = cs.protocols[pId];
    const rows = (pData.patches || []).map(p => ({
      'Capa': meta.layer,
      'Protocolo': meta.title,
      'Encuestador': pData.surveyorName,
      'Fecha': pData.date,
      'Identificador_Item': p.patchId,
      'Climax_Vegetacion': p.climaxType,
      'Cobertura_Dosel': p.canopyCover || p.topsoilThickness,
      'Calificacion_Estado': p.finalRating,
      'Observaciones_Campo': p.details
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, meta.shortLabel || pId);
  });

  XLSX.writeFile(wb, `${cs.id}_libro_multicapa.xlsx`);
}

function exportLocationCSV(locId){
  const cs = CASE_STUDIES[locId] || CASE_STUDIES.chile_ruiles;
  const cols = ['Terreno','Capa_Ecológica','Protocolo','Encuestador','Fecha','Item','Tipo_Climax','Observaciones'];
  const rows = [cols.join(',')];

  Object.keys(cs.protocols).forEach(pId => {
    const meta = PROTOCOL_META[pId] || { layer: 'Capa' };
    const pData = cs.protocols[pId];
    (pData.patches || []).forEach(p => {
      const line = [
        `"${cs.name}"`,
        `"${meta.layer}"`,
        `"${pId}"`,
        `"${pData.surveyorName}"`,
        `"${pData.date}"`,
        `"${p.patchId}"`,
        `"${p.climaxType}"`,
        `"${(p.details || '').replace(/"/g,'""')}"`
      ];
      rows.push(line.join(','));
    });
  });

  downloadBlob(`${cs.id}_datos_fusionados.csv`, rows.join('\n'), 'text/csv');
}

/* ===================== AUTOSAVE & ARCHIVE VAULT ===================== */
function autosave(){
  if(nav.screen !== 'app' || !nav.protocol || !state) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const meta = PROTOCOL_META[nav.protocol];
    if(meta && meta.storageKey){
      idbSet(meta.storageKey, JSON.stringify(state)).then(() => {
        updateProtocolProgress(nav.protocol);
        showToast('🟢 Autoguardado local en IndexedDB');
      }).catch(() => {});
    }
  }, 600);
}

async function archiveCurrentSession(){
  const meta = PROTOCOL_META[nav.protocol];
  if(!meta) return;
  const prog = savedProgress[nav.protocol];
  const archiveEntry = {
    id: uid(),
    protocolId: nav.protocol,
    title: meta.title,
    icon: meta.icon,
    pct: prog ? prog.pct : 0,
    site: (state && state.propertyName) ? state.propertyName : 'Saved Site',
    surveyor: (state && state.surveyorName) ? state.surveyorName : 'Surveyor',
    archivedAt: new Date().toLocaleString(),
    data: JSON.parse(JSON.stringify(state))
  };

  const rawArchives = await idbGet('rewild_session_archives');
  let archives = rawArchives ? (typeof rawArchives === 'string' ? JSON.parse(rawArchives) : rawArchives) : [];
  archives.unshift(archiveEntry);
  await idbSet('rewild_session_archives', JSON.stringify(archives));
  sessionArchives = archives;

  await idbDelete(meta.storageKey);
  delete savedProgress[nav.protocol];
  state = newGowildState();
  sessionMsg = '📦 Current session archived successfully into Locations Vault.';
  render(); window.scrollTo(0,0);
}

async function discardCurrentSession(){
  const meta = PROTOCOL_META[nav.protocol];
  if(!meta) return;
  if(confirm('🗑 Discard test data? This will permanently delete current un-archived test progress.')){
    await idbDelete(meta.storageKey);
    delete savedProgress[nav.protocol];
    state = newGowildState();
    sessionMsg = '🗑 Test data discarded.';
    render(); window.scrollTo(0,0);
  }
}

async function loadSessionArchives(){
  try {
    const raw = await idbGet('rewild_session_archives');
    sessionArchives = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : [];
  } catch(e){ sessionArchives = []; }
}

async function updateProtocolProgress(pId){
  const meta = PROTOCOL_META[pId];
  if(!meta) return;
  try {
    const raw = await idbGet(meta.storageKey);
    if(!raw){ savedProgress[pId] = null; return; }
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const items = data.patches || data.pits || data.blocks || [];
    let pct = 0;
    if(items.length > 0){
      let sum = 0;
      items.forEach(p => {
        let count = 0;
        if(p.patchId || p.pitLabel) count++;
        if(p.climaxType || p.landCoverNow) count++;
        if(p.canopyCover || p.topsoilThickness) count++;
        if(p.finalRating || p.soilPh) count++;
        if(p.photo || p.soilHolePhoto) count++;
        sum += Math.round((count / 5) * 100);
      });
      pct = Math.min(100, Math.max(15, Math.round(sum / items.length)));
    } else if(data.surveyorName || data.propertyName || data.date){
      pct = 10;
    }
    if(pct > 0){
      savedProgress[pId] = { pct, hasData: true, surveyor: data.surveyorName || 'Anonymous', site: data.propertyName || 'Location', date: data.date || '', itemsCount: items.length };
    } else {
      savedProgress[pId] = null;
    }
  } catch(e){ savedProgress[pId] = null; }
}

async function scanAllProgress(){
  await loadSessionArchives();
  const keys = Object.keys(PROTOCOL_META);
  for(const k of keys){
    await updateProtocolProgress(k);
  }
}

async function initSession(){
  const meta = PROTOCOL_META[nav.protocol];
  if(!meta) return;
  try {
    const savedStr = await idbGet(meta.storageKey);
    if(savedStr){
      const saved = typeof savedStr === 'string' ? JSON.parse(savedStr) : savedStr;
      state = Object.assign(newGowildState(), saved);
      await updateProtocolProgress(nav.protocol);
      sessionMsg = 'Restored saved progress.';
    } else {
      state = newGowildState();
      sessionMsg = '';
    }
  } catch(e){ state = newGowildState(); }
}

function newPatch(){ return { id: uid(), patchId: '', climaxType: '', canopyCover: '', topsoilThickness: '', finalRating: '', photo: null }; }
function newGowildState(){ return { step: 0, editingPatch: -1, surveyorName: '', propertyName: '', date: '', time: '', patches: [] }; }

function openProtocol(pId){
  nav.screen = 'app';
  nav.protocol = pId;
  nav.showModal = null;
  initSession().then(() => {
    if(!state) state = newGowildState();
    if(state.step > 4 || state.step == null) state.step = 0;
    render();
    window.scrollTo(0,0);
  });
}
window.openProtocol = openProtocol;

function nextStep(){
  if(isAdmin){
    if(state && state.step < 3) state.step++;
    render(); window.scrollTo(0,0);
    return;
  }
  if(state && state.step < 3){ state.step++; render(); window.scrollTo(0,0); }
}
function prevStep(){ if(state && state.step > 0){ state.step--; render(); window.scrollTo(0,0); } }

/* ===================== MODALS & INFO SCREENS ===================== */
function renderMainInfoModal(){
  return `<div style="position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:999;display:flex;align-items:center;justify-content:center;padding:20px;overflow-y:auto">
    <div style="background:var(--paper);border:1px solid var(--gold);border-radius:12px;max-width:760px;width:100%;max-height:90vh;overflow-y:auto;padding:26px;position:relative">
      <button class="btn btn-ghost btn-sm" data-action="closemodal" style="position:absolute;top:16px;right:16px">Cerrar ✕</button>
      <h2 style="font-family:'Fraunces',serif;color:var(--gold);margin:0 0 10px">ℹ️ Guía &amp; Arquitectura por Capas del Territorio</h2>
      
      <div style="font-size:13.5px;line-height:1.6;color:var(--ink);margin-bottom:16px">
        La <b>Rewilding Field Suite</b> está diseñada bajo el principio de <b>Reconstrucción Territorial por Capas</b>. Los 9 protocolos no compiten entre sí, sino que se superponen como capas GIS complementarias para caracterizar un terreno.
      </div>

      <div style="background:var(--paper-2);border-left:3px solid var(--canopy);padding:12px;border-radius:6px;font-size:12.5px;line-height:1.6;margin-bottom:18px">
        <b>🔍 Análisis de Solapes &amp; Datos Compartidos:</b><br>
        • <b>Datos Base Independientes (Capa 0):</b> Se mantiene intencionalmente la fecha, hora, encuestador y GPS independientes en cada protocolo, ya que los muestreos pueden realizarse en días distintos, por diferentes profesionales o en puntos GPS diversos dentro de un predio extenso.<br>
        • <b>Solape Suelo-Vegetación:</b> El espesor de topsoil y pH se registran brevemente en ReNatura y en detalle en el Protocolo de Suelo y VESS.<br>
        • <b>Solape Dosel:</b> La cobertura % de árbol/arbusto se consulta de forma general en ReNatura y fitosociológicamente en Native Forest.
      </div>

      <h4 style="color:var(--gold);margin:14px 0 8px">Estructura del Modelo por Capas:</h4>
      <div style="font-size:12.5px;color:var(--ink-dim);line-height:1.7">
        • <b>Capa 1 (Certificación &amp; Clasificación):</b> ReNatura Certification Survey (Puntuación general, estadios de sucesión).<br>
        • <b>Capa 2 (Edafología &amp; Geomorfología):</b> Soil Profile Description &amp; VESS Soil Structure (Horizontes O/A/B/C, textura y estructura Sq1-Sq5).<br>
        • <b>Capa 3 (Fitosociología &amp; Biomasa):</b> Native Forest, Shrublands &amp; Tree Plantations (DAP de árboles, especies clave y dominancia).<br>
        • <b>Capa 4 (Hidrología &amp; Humedales):</b> Wetlands &amp; Peatlands (Riberas, napa freática, acumulación de turba y carbono).<br>
        • <b>Capa 5 (Percepción Social &amp; Servicios):</b> Visitor Perception Survey (Evaluación del valor social y riesgo de fuego).
      </div>

      <div style="margin-top:20px;text-align:right">
        <button class="btn btn-primary btn-sm" data-action="closemodal">Entendido, ir a la Suite</button>
      </div>
    </div>
  </div>`;
}

function renderProtoInfoModal(){
  const meta = PROTOCOL_META[nav.protocol] || PROTOCOL_META.gowild;
  return `<div style="position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:999;display:flex;align-items:center;justify-content:center;padding:20px;overflow-y:auto">
    <div style="background:var(--paper);border:1px solid var(--horizon);border-radius:12px;max-width:680px;width:100%;max-height:90vh;overflow-y:auto;padding:26px;position:relative">
      <button class="btn btn-ghost btn-sm" data-action="closemodal" style="position:absolute;top:16px;right:16px">Cerrar ✕</button>
      <h2 style="font-family:'Fraunces',serif;color:var(--horizon);margin:0 0 8px">${meta.icon} ${meta.title}</h2>
      <div style="font-size:12px;color:var(--gold);font-weight:700;margin-bottom:14px">${meta.layer}</div>

      <div style="font-size:13px;line-height:1.6;color:var(--ink);margin-bottom:16px">
        <b>Alcance Metodológico:</b> ${meta.org}. Este protocolo captura los aspectos específicos de esta capa para la reconstrucción del territorio.
      </div>

      <div style="background:var(--horizon-dark);border-left:3px solid var(--horizon);padding:12px;border-radius:6px;font-size:12.5px;color:#CFE7EC;line-height:1.5;margin-bottom:16px">
        <b>🧰 Equipamiento Recomendado para este Protocolo:</b><br>
        Cinta métrica (min. 10m), cinta flexible para DAP de árboles (130cm), pala de mano, tabla de colores Munsell/swatches, cuadrante de muestreo y vinagre/ácido diluido para carbonatos.
      </div>

      <div style="margin-top:20px;text-align:right">
        <button class="btn btn-horizon btn-sm" data-action="closemodal">Entendido, continuar encuesta</button>
      </div>
    </div>
  </div>`;
}

/* ===================== RENDER SCREENS ===================== */
function renderHome(){
  return `<div class="hero">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:10px">
      <div style="display:flex;align-items:center">
        <img src="app_icon.png" alt="Emblem" style="height:36px;width:36px;border-radius:8px;margin-right:10px;box-shadow:0 0 10px rgba(216,172,70,0.5)">
        <span style="font-family:'Fraunces',serif;color:var(--gold);font-size:18px;font-weight:700">Rewild Suite</span>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-ghost btn-sm" data-action="openmaininfo">ℹ️ Guía Metodológica</button>
        <button class="btn ${isAdmin?'btn-primary':'btn-ghost'} btn-sm" data-action="toggleadmin">🔑 ${isAdmin?'Modo Admin (Activo)':'Modo Admin'}</button>
      </div>
    </div>
    <h1>Field Survey Protocols &amp; Terrestrial Suite</h1>
    <p class="lede">Standardised field survey forms for ecological monitoring, soil profile analysis, and rewilding property certification in Portugal and Chile.</p>
  </div>
  
  <div class="home-subnav">
    <div class="stab ${nav.homeTab==='protocols'?'active':''}" data-action="hometab" data-tab="protocols">📋 All Field Protocols (9)</div>
    <div class="stab ${nav.homeTab==='locations'?'active':''}" data-action="hometab" data-tab="locations">📍 Registered Locations &amp; Case Studies</div>
    <div class="stab ${nav.homeTab==='builder'?'active':''}" data-action="hometab" data-tab="builder">🛠 Custom Survey Builder (Editable)</div>
  </div>

  <div class="home-body">
    ${nav.homeTab === 'protocols' ? renderProtocolGrid() : (nav.homeTab === 'locations' ? renderLocationsHub() : renderSurveyBuilder())}
    <div class="footer-note">⚡ Rewild Field Suite PWA — Powered by IndexedDB offline storage &amp; canvas image compression.</div>
  </div>`;
}

function renderProtocolGrid(){
  const cards = Object.keys(PROTOCOL_META).map(pId => {
    const meta = PROTOCOL_META[pId];
    const prog = savedProgress[pId];
    return `
      <div class="pcard bg-${pId}" style="cursor:pointer" onclick="openProtocol('${pId}')" data-action="openprotocol" data-protocol="${pId}">
        <div class="glyph">${meta.icon}</div>
        <div class="status">${meta.shortLabel}</div>
        <div class="pname">${meta.title}</div>
        <div class="ptag">${meta.org}</div>
        ${prog && prog.hasData ? `<div class="resumebadge">${prog.pct}% complete</div>` : ''}
      </div>
    `;
  }).join('');

  return `<div class="home-section-label">Available Ecosystem Protocols</div>
  <div class="protocol-grid">${cards}</div>`;
}

function renderLocationsHub(){
  const csKeys = Object.keys(CASE_STUDIES);
  const caseStudyCards = csKeys.map(csId => {
    const cs = CASE_STUDIES[csId];
    const protoBadges = Object.keys(cs.protocols).map(pId => {
      const meta = PROTOCOL_META[pId];
      const pData = cs.protocols[pId];
      const isPart = pData && pData.pct < 100;
      return `<span class="loc-chip ${pId}" style="${isPart?'background:#4A2E00;color:#F6C075;border:1px dashed var(--gold)':''}">${meta ? meta.icon : '✦'} ${meta ? meta.shortLabel : pId} (${pData ? pData.pct : 100}%${isPart?' en curso':''})</span>`;
    }).join(' ');

    return `
      <div class="loc-card" style="cursor:pointer;border-left:4px solid ${cs.isComplete?'var(--canopy)':'var(--gold)'}" onclick="openLocation('${cs.id}')" data-action="openlocation" data-locid="${cs.id}">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div class="lname">${cs.icon || '🏞'} ${esc(cs.name)}</div>
          ${!cs.isComplete ? `<span style="background:#5A3800;color:#F6C075;font-size:11px;font-weight:700;padding:2px 8px;border-radius:4px">🚧 Borrador - En Progreso</span>` : `<span style="background:var(--canopy);color:#fff;font-size:11px;font-weight:700;padding:2px 8px;border-radius:4px">✓ Mapeo 100% Listo</span>`}
        </div>
        <div class="lmeta">${esc(cs.locationName)} · ${cs.area}</div>
        <div style="font-size:12.5px;color:var(--ink-dim);margin:8px 0;line-height:1.5">${esc(cs.description.substring(0, 140))}…</div>
        <div class="lprotos">${protoBadges}</div>
        <button class="btn btn-primary btn-sm" style="margin-top:12px" onclick="openLocation('${cs.id}')" data-action="openlocation" data-locid="${cs.id}">Ver capas y borradores en progreso →</button>
      </div>
    `;
  }).join('');

  return `<div class="card">
    <div class="section-title">📍 Locations Hub &amp; Predios Registrados</div>
    <div class="section-sub">Explora predios con mapeo 100% completado (Chile Maule y Portugal) o predios en proceso de mapeo (Prototipo Región del Bío-Bío, Chile).</div>
    
    <div style="margin-bottom:24px">
      <h4 style="color:var(--gold);margin:0 0 12px;font-size:14px">Estudios de Caso &amp; Predios Prototipo Registrados</h4>
      <div class="loc-grid">${caseStudyCards}</div>
    </div>
  </div>`;
}

function renderLocationDetail(){
  const cs = CASE_STUDIES[nav.locationId] || CASE_STUDIES.chile_ruiles;
  const protoEntries = Object.keys(cs.protocols).map(pId => {
    const meta = PROTOCOL_META[pId] || { title: pId, icon: '📋', layer: 'Capa Ecológica' };
    const pData = cs.protocols[pId];
    const isPart = pData.pct < 100;
    const itemCards = (pData.patches || []).map((item, idx) => `
      <div class="repeat-item" style="margin-top:8px">
        <span class="idx">Ítem ${idx+1}</span>
        <div style="font-weight:600;color:var(--gold);font-size:14px">${esc(item.patchId)}</div>
        <div style="font-size:12.5px;color:var(--ink-dim);margin:4px 0"><b>Tipo/Clímax:</b> ${esc(item.climaxType)} · <b>Cobertura/Orgánico:</b> ${esc(item.canopyCover || item.topsoilThickness)}</div>
        <div style="font-size:12px;color:var(--ink);line-height:1.5">${esc(item.details)}</div>
      </div>
    `).join('');

    return `
      <div class="card" style="border-left:4px solid ${isPart?'var(--gold)':'var(--canopy)'};margin-bottom:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
          <div>
            <h3 style="margin:0;font-size:16px;color:var(--canopy)">${meta.icon} ${meta.title}</h3>
            <div style="font-size:11.5px;color:var(--gold-dark);font-weight:700;margin-top:2px">${meta.layer}</div>
            <div style="font-size:12px;color:var(--ink-dim);margin-top:2px">Encuestador: <b>${esc(pData.surveyorName)}</b> · Fecha: <b>${pData.date}</b> · Estado: ${isPart ? `<span style="color:var(--gold-dark);font-weight:700">🚧 Borrador - En Progreso (${pData.pct}%)</span>` : `<span style="color:var(--canopy);font-weight:700">✓ 100% Completado</span>`}</div>
          </div>
          ${isPart ? `<button class="btn btn-primary btn-sm" onclick="openProtocol('${pId}')" data-action="loadsitedraft" data-csid="${cs.id}">Continuar Mapeo (${pData.pct}%) →</button>` : ''}
        </div>
        <div style="margin-top:12px">${itemCards}</div>
      </div>
    `;
  }).join('');

  return `<div class="content">
    <button class="btn btn-ghost btn-sm" data-action="backhome" style="margin-bottom:14px">← Volver al Locations Hub</button>
    
    <div class="hero" style="border-radius:12px;padding:28px 24px;margin-bottom:20px;color:#FFFFFF">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px">
        <div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
            <span class="eyebrow" style="margin:0;color:var(--gold-light)">Caso de Estudio Multicapa</span>
            ${!cs.isComplete ? `<span style="background:#5A3800;color:#F6C075;font-size:11px;font-weight:700;padding:2px 8px;border-radius:4px">🚧 Borrador - En Progreso (Avance Parcial)</span>` : ''}
          </div>
          <h1 style="font-size:26px;margin:4px 0;color:#FFFFFF">${cs.icon || ''} ${esc(cs.name)}</h1>
          <div style="font-size:13.5px;color:var(--gold-light);margin-bottom:10px">📍 ${esc(cs.locationName)} · Coordenadas: ${cs.coords} · Área: ${cs.area}</div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn btn-primary btn-sm" data-action="exportcasepdf" data-locid="${cs.id}">📄 Exportar PDF ${cs.isComplete?'':'(Parcial)'}</button>
          <button class="btn btn-horizon btn-sm" data-action="exportcaseexcel" data-locid="${cs.id}">📊 Exportar Libro Excel</button>
          <button class="btn btn-ghost btn-sm" data-action="exportcasejson" data-locid="${cs.id}" style="color:#FFFFFF;border-color:rgba(255,255,255,0.4)">⬇ Exportar JSON</button>
        </div>
      </div>
      <p style="font-size:13.5px;color:rgba(255,255,255,0.88);line-height:1.6;max-width:800px;margin-top:10px">${esc(cs.description)}</p>
      <div class="tagrow" style="margin-top:14px">${cs.tags.map(t=>`<span class="tag-pill" style="background:rgba(255,255,255,0.15);color:#FFFFFF;border:1px solid rgba(255,255,255,0.25)">${t}</span>`).join('')}</div>
    </div>

    ${renderEcoIndexDashboard(cs)}

    <h3 style="color:var(--canopy);margin:0 0 14px;font-family:'Fraunces',serif">Capas del Territorio Registradas (${cs.isComplete ? 'Fusión 100% Completada' : 'Borradores en Progreso de Mapeo'})</h3>
    ${protoEntries}
  </div>`;
}

function renderSurveyBuilder(){
  const qList = customBuilderState.questions.map((q, i) => `
    <div class="qbuilder-item" style="background:var(--paper);border:1px solid var(--line);border-radius:10px;padding:16px;margin-bottom:14px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <span class="qtype-badge">Campo #${i+1} · Type: ${q.type.toUpperCase()}</span>
        <button class="btn btn-ghost btn-sm" data-action="deletebuilderq" data-index="${i}" style="color:var(--warn);border:none;padding:2px 6px">Eliminar ✕</button>
      </div>

      <div class="field" style="margin-bottom:10px">
        <label class="q" style="font-size:12.5px;color:var(--gold)">Nombre de la Pregunta / Etiqueta:</label>
        <input type="text" data-bind-builder-label data-index="${i}" value="${esc(q.label)}" style="font-weight:600">
      </div>

      <div class="gpsrow">
        <div>
          <label class="q" style="font-size:11.5px;color:var(--ink-dim)">Tipo de Entrada:</label>
          <select data-bind-builder-type data-index="${i}">
            <option value="text" ${q.type==='text'?'selected':''}>Texto Libre</option>
            <option value="select" ${q.type==='select'?'selected':''}>Selección Múltiple (Desplegable)</option>
            <option value="rating" ${q.type==='rating'?'selected':''}>Escala de Calificación (1 a 5)</option>
            <option value="photo" ${q.type==='photo'?'selected':''}>Captura de Fotografía</option>
            <option value="gps" ${q.type==='gps'?'selected':''}>Coordenadas GPS</option>
          </select>
        </div>
        <div>
          <label class="q" style="font-size:11.5px;color:var(--ink-dim)">Nota de ayuda (opcional):</label>
          <input type="text" value="${esc(q.note || '')}" placeholder="Instrucciones para el encuestador">
        </div>
      </div>
    </div>
  `).join('');

  return `<div class="card">
    <div class="section-title">🛠 Custom Survey Builder (Totalmente Editable)</div>
    <div class="section-sub">Personaliza tu propio formulario de terreno. Edita los nombres de las preguntas, cambia los tipos de entrada, agrega nuevos campos o inicia una sesión.</div>
    
    <div class="field" style="margin-bottom:18px">
      <label class="q" style="font-size:14px;color:var(--gold)">Título del Protocolo Personalizado:</label>
      <input type="text" data-bind-builder-title value="${esc(customBuilderState.title)}" style="font-size:16px;font-weight:700">
    </div>

    <div style="margin-bottom:20px">${qList}</div>

    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <button class="btn btn-ghost" data-action="addbuilderq">+ Agregar Nueva Pregunta</button>
      <button class="btn btn-primary" data-action="launchcustomsurvey">🚀 Iniciar Sesión con este Protocolo</button>
    </div>
  </div>`;
}

// FEATURE: Drafts - In Progress Selector for Each Protocol
function renderSessionRecapBanner(){
  const pId = nav.protocol;
  const meta = PROTOCOL_META[pId];
  const prog = savedProgress[pId];

  let siteDraftsHtml = '';
  Object.keys(CASE_STUDIES).forEach(csId => {
    const cs = CASE_STUDIES[csId];
    if(cs.protocols && cs.protocols[pId]){
      const pData = cs.protocols[pId];
      if(pData.pct < 100){
        siteDraftsHtml += `
          <div style="background:var(--paper);border:1px solid var(--gold);border-radius:8px;padding:12px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
            <div>
              <div style="font-weight:700;color:var(--gold);font-size:13.5px">
                🚧 Borrador - En Progreso (${pData.pct}%)
              </div>
              <div style="font-size:12.5px;color:var(--ink);margin-top:2px">
                Predio: <b>${esc(cs.name)}</b> — Encuestador: <b>${esc(pData.surveyorName)}</b>
              </div>
            </div>
            <button class="btn btn-primary btn-sm" data-action="loadsitedraft" data-csid="${cs.id}">Continuar Mapeo Bío-Bío (${pData.pct}%) →</button>
          </div>
        `;
      }
    }
  });

  const activeDraftHtml = (prog && prog.hasData) ? `
    <div style="background:var(--paper-2);border-left:3px solid var(--canopy);padding:12px;border-radius:8px;margin-bottom:10px">
      <div style="font-size:13.5px;font-weight:600;color:var(--canopy);margin-bottom:4px">
        🟢 Borrador Local Activo (${prog.pct}% Completado)
      </div>
      <div style="font-size:12px;color:var(--ink-dim);margin-bottom:10px">
        Sitio: <b>${esc(prog.site)}</b> · Encuestador: <b>${esc(prog.surveyor)}</b>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-primary btn-sm" data-action="gotostep" data-step="0">Reanudar Borrador (${prog.pct}%)</button>
        <button class="btn btn-ghost btn-sm" data-action="archivesession" style="color:var(--canopy);border-color:var(--canopy)">📦 Archivar en Bóveda</button>
        <button class="btn btn-ghost btn-sm" data-action="discardsession" style="color:var(--warn);border-color:var(--warn)">🗑 Descartar Pruebas</button>
      </div>
    </div>
  ` : '';

  if(!siteDraftsHtml && !activeDraftHtml) return sessionMsg ? `<div class="helptext">${sessionMsg}</div>` : '';

  return `<div class="card" style="margin-bottom:18px;border-left:4px solid var(--gold);background:var(--paper-2)">
    <h4 style="color:var(--gold);margin:0 0 10px;font-size:14px">Borradores En Progreso &amp; Sesiones para ${meta ? meta.shortLabel : pId}</h4>
    ${siteDraftsHtml}
    ${activeDraftHtml}
  </div>`;
}

function renderApp(){
  if(!state) state = newGowildState();
  const meta = PROTOCOL_META[nav.protocol] || PROTOCOL_META.gowild;
  let body = '';
  if(state.step === 0) body = renderGowildIntro();
  else if(state.step === 1) body = renderGowildGeneral();
  else if(state.step === 2) body = renderGowildPatches();
  else if(state.step === 3) body = renderGowildReview();
  else if(state.step === 4) body = renderGowildPatchEdit();
  else body = renderGowildIntro();

  return `<div class="topbar">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;flex-wrap:wrap;gap:10px">
      <div class="backhome" data-action="backhome">← Volver al Suite Hub</div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-ghost btn-sm" data-action="openprotoinfo">ℹ️ Guía</button>
        <button class="btn btn-ghost btn-sm" data-action="saveandpause" style="color:var(--gold);border-color:var(--gold)">💾 Guardar y Salir</button>
        <button class="btn ${isAdmin?'btn-primary':'btn-ghost'} btn-sm" data-action="toggleadmin">🔑 ${isAdmin?'Admin (Activo)':'Admin'}</button>
      </div>
    </div>
    ${isAdmin ? `<div style="background:#5A3800;color:#F6C075;padding:6px 12px;border-radius:6px;font-size:12px;font-weight:700;margin-bottom:10px">🔑 Modo Administrador / Inspector Activo — Navegación libre por pasos sin validación obligatoria.</div>` : ''}
    <div class="eyebrow">${meta.org} · ${meta.layer}</div>
    <h1>${meta.title}</h1>
  </div>
  <div class="content" style="padding-bottom:0">${renderSessionRecapBanner()}</div>
  <div id="app-body">${body}</div>`;
}

function renderGowildIntro(){
  return `<div class="content"><div class="card">
    <div class="section-title">${PROTOCOL_META[nav.protocol].title} Overview</div>
    <div class="intro-block">Standardised habitat certification for rewilding plots inspired by GoWild Sudoeste.</div>
    ${textField('surveyorName','Surveyor Name',true)}
    ${textField('propertyName','Property / Site Name',true)}
    <div style="margin-top:16px;display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn btn-primary" data-action="nextstep">Begin Survey →</button>
      <button class="btn btn-ghost" data-action="saveandpause" style="color:var(--gold);border-color:var(--gold)">💾 Guardar y Salir</button>
    </div>
  </div></div>`;
}

function renderGowildGeneral(){
  return `<div class="content"><div class="card">
    <div class="section-title">Session Information</div>
    ${dateTimeField('date','time','Date & Time',false)}
    ${numberField('groupSize','Team Size',false)}
    <div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn btn-ghost" data-action="prevstep">← Back</button>
      <button class="btn btn-primary" data-action="nextstep">Continue to Survey Items →</button>
      <button class="btn btn-ghost" data-action="saveandpause" style="color:var(--gold);border-color:var(--gold)">💾 Guardar y Salir</button>
    </div>
  </div></div>`;
}

function renderGowildPatches(){
  const items = (state.patches || []).map((p,i)=>`
    <div class="patch-card">
      <div>
        <div class="pname">${p.patchId ? esc(p.patchId) : 'Patch '+(i+1)}</div>
        <div class="pmeta">${p.climaxType ? esc(p.climaxType) : 'Unclassified'}</div>
      </div>
      <div class="patch-actions">
        <button class="btn btn-primary btn-sm" data-action="editpatch" data-index="${i}">Edit</button>
        <button class="btn btn-ghost btn-sm" data-action="removepatch" data-index="${i}">Delete</button>
      </div>
    </div>
  `).join('');

  return `<div class="content"><div class="card">
    <div class="section-title">Survey Quadrats / Items</div>
    ${items || '<div class="note">No items added yet.</div>'}
    <div class="add-row" data-action="addpatch" style="margin-top:14px">+ Add Survey Quadrat</div>
    <div style="margin-top:18px;display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn btn-ghost" data-action="prevstep">← Back</button>
      <button class="btn btn-primary" data-action="nextstep">Review &amp; Export →</button>
      <button class="btn btn-ghost" data-action="saveandpause" style="color:var(--gold);border-color:var(--gold)">💾 Guardar y Salir</button>
    </div>
  </div></div>`;
}

function renderGowildPatchEdit(){
  const idx = state.editingPatch >= 0 ? state.editingPatch : 0;
  const pPath = `patches.${idx}`;
  const pId = nav.protocol || 'gowild';
  const meta = PROTOCOL_META[pId] || { title: 'Módulo de Campo', icon: '🌿' };
  return `<div class="content"><div class="card">
    <div class="section-title">${meta.icon} Cuadrante / Parcela #${idx+1} — ${meta.title}</div>
    <div class="section-sub">Registra los datos de este punto de muestreo. Los módulos específicos de ${meta.shortLabel} se activan automáticamente abajo.</div>
    
    <div style="background:var(--paper-2);padding:14px;border-radius:8px;border:1px solid var(--line);margin-bottom:16px">
      <div style="font-size:11.5px;text-transform:uppercase;letter-spacing:.08em;color:var(--gold-dark);font-weight:700;margin-bottom:8px">Núcleo Común (Capa 0: Identificación &amp; Cobertura)</div>
      <div class="gpsrow">
        ${textField(pPath + '.patchId', 'Identificador del Cuadrante / Calicata', true, 'e.g. Q-01, P-02, Transecto')}
        ${textField(pPath + '.climaxType', 'Tipo / Target de Vegetación Clímax', true, 'e.g. Ruil, Roble, Sobreiral')}
      </div>
      <div class="gpsrow">
        ${textField(pPath + '.canopyCover', 'Cobertura de Dosel (%) / Estrato', false, 'e.g. 85%, <50%')}
        ${textField(pPath + '.topsoilThickness', 'Espesor Capa Orgánica / Horizonte A (cm)', false, 'e.g. 12cm')}
      </div>
      ${textField(pPath + '.finalRating', 'Calificación / Score Preliminar', false, 'e.g. 5+ (Clímax), Sq2, Apto')}
    </div>

    ${renderPatchFormSpecifics(pId, pPath)}

    ${textareaField(pPath + '.details', 'Observaciones de Campo, Especies Clave & Notas Ecológicas', false, 'Describe fauna, perturbaciones o notas para el informe')}
    
    <div style="margin-top:20px;display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn btn-primary" data-action="gotostep" data-step="2">✓ Guardar Cuadrante y Volver →</button>
      <button class="btn btn-ghost" data-action="saveandpause" style="color:var(--gold);border-color:var(--gold)">💾 Guardar y Salir</button>
    </div>
  </div></div>`;
}

function renderGowildReview(){
  return `<div class="content"><div class="card">
    <div class="section-title">Summary &amp; Export</div>
    <div class="section-sub">Surveyor: ${esc(state.surveyorName||'—')} · Site: ${esc(state.propertyName||'—')}</div>
    <div class="top-tools">
      <button class="btn btn-primary" data-action="exportjson">⬇ Export JSON</button>
      <button class="btn btn-horizon" data-action="exportcsv">⬇ Export CSV</button>
      <button class="btn btn-ghost" data-action="printview">🖨 Print View</button>
      <button class="btn btn-ghost" data-action="saveandpause" style="color:var(--gold);border-color:var(--gold)">💾 Guardar y Salir</button>
    </div>
  </div></div>`;
}

function downloadBlob(filename, content, type){
  const blob = new Blob([content], {type});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; document.body.appendChild(a); a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 300);
}

function exportJSON(){
  downloadBlob('rewild-survey-' + (state.date || 'data') + '.json', JSON.stringify(state, null, 2), 'application/json');
}

function exportCSV(){
  const cols = ['patchId','climaxType','canopyCover','topsoilThickness','finalRating'];
  const rows = [cols.join(',')];
  (state.patches || []).forEach(p => {
    rows.push(cols.map(c => '"' + (p[c] == null ? '' : String(p[c])).replace(/"/g,'""') + '"').join(','));
  });
  downloadBlob('rewild-patches-' + (state.date || 'data') + '.csv', rows.join('\n'), 'text/csv');
}

function renderAddLayerModal(){
  const cs = CASE_STUDIES[nav.targetLocationId] || CASE_STUDIES.chile_biobio;
  const existingProtocols = Object.keys(cs.protocols || {});

  const availableProtocols = Object.keys(PROTOCOL_META).map(pId => {
    const meta = PROTOCOL_META[pId];
    const isAdded = existingProtocols.includes(pId);
    return `
      <div style="background:var(--paper-2);border:1px solid ${isAdded?'var(--canopy)':'var(--line)'};border-radius:10px;padding:12px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
        <div>
          <div style="font-weight:700;color:var(--canopy);font-size:14px">${meta.icon} ${meta.title}</div>
          <div style="font-size:11.5px;color:var(--gold-dark);font-weight:600">${meta.layer}</div>
          <div style="font-size:12px;color:var(--ink-dim);margin-top:2px">${meta.org}</div>
        </div>
        ${isAdded ? 
          `<button class="btn btn-ghost btn-sm" data-action="startlayerforlocation" data-locid="${cs.id}" data-protocol="${pId}">✓ Ver / Continuar Capa →</button>` : 
          `<button class="btn btn-primary btn-sm" data-action="startlayerforlocation" data-locid="${cs.id}" data-protocol="${pId}">+ Añadir Esta Capa al Predio</button>`
        }
      </div>
    `;
  }).join('');

  return `<div style="position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:999;display:flex;align-items:center;justify-content:center;padding:20px;overflow-y:auto">
    <div style="background:var(--paper);border:1px solid var(--gold);border-radius:12px;max-width:720px;width:100%;max-height:90vh;overflow-y:auto;padding:24px;position:relative">
      <button class="btn btn-ghost btn-sm" data-action="closemodal" style="position:absolute;top:16px;right:16px">Cerrar ✕</button>
      <h2 style="font-family:'Fraunces',serif;color:var(--canopy);margin:0 0 6px">➕ Añadir Capa Territorial a: ${esc(cs.name)}</h2>
      <div style="font-size:13px;color:var(--ink-dim);margin-bottom:18px">Selecciona un protocolo para superponerlo a este predio. Cada capa alimenta el <b>Índice Sintético de Salud Ecosistémica</b>.</div>
      <div>${availableProtocols}</div>
    </div>
  </div>`;
}

function render(){
  try {
    const root = document.getElementById('root');
    if(!root) return;
    if(!state) state = newGowildState();

    if(nav.screen === 'home') root.innerHTML = renderHome();
    else if(nav.screen === 'locationdetail') root.innerHTML = renderLocationDetail();
    else if(nav.screen === 'app') root.innerHTML = renderApp();

    if(nav.showModal === 'maininfo') root.innerHTML += renderMainInfoModal();
    else if(nav.showModal === 'protoinfo') root.innerHTML += renderProtoInfoModal();
    else if(nav.showModal === 'addlayer') root.innerHTML += renderAddLayerModal();
  } catch(err) {
    console.error('Render execution error:', err);
  }
}

// Initial scan and render
scanAllProgress().then(render);
