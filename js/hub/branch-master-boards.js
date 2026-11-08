/**
 * AgriTwin Hub - Tableros Maestros de Rama (Fase 2 del Núcleo Continuo)
 *
 * Reemplaza los 4 mundos antiguos (view-invernadero / view-establo / view-incursion / view-mesa,
 * con sprites flotantes sobre un fondo) por UN solo componente: fondo fijo del bioma + menú flotante
 * unificado con tarjetas. Cada tarjeta invoca la herramienta que antes abría el sprite.
 *
 * Identidad por predio: el encabezado de cada tablero lee el predio activo desde FarmProfileManager
 * (nombre y estado de la rama), de modo que cada predio muestra su propia identidad.
 */
(function (window) {
  const VIEW_ID = 'view-ramas';

  // profileKey: clave de la rama dentro de FarmProfileManager.profile.branches
  const BOARDS = {
    agricola: {
      profileKey: 'invernadero',
      icon: '🌱', title: 'Modo Agrícola & Riego', tag: 'RAMA-CULTIVOS',
      subtitle: 'Catálogo botánico y agroecología del predio',
      bg: 'assets/ui/invernadero_landing_bg.jpg',
      accent: { text: 'text-emerald-300', border: 'border-emerald-500/40', chip: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', hover: 'hover:border-emerald-400/70' },
      cards: [
        { sprite: 'sprite_cultivos_1', title: 'Almácigos Criollos', desc: '840 plántulas, sustrato vivo y vigor germinativo.', fn: 'openPlantByPlantViewer', args: ['CROP-ALM-01'] },
        { sprite: 'sprite_cultivos_2', title: 'Cuarteles & Viñedos', desc: 'Cuarteles de secano y avellanos europeos.', fn: 'openPlantByPlantViewer', args: ['CROP-VIN-01'] },
        { sprite: 'sprite_cultivos_3', title: 'Gremios & Matriz Milpa', desc: 'Asociaciones maíz-poroto-calabaza, LER 1.34.', fn: 'openIntercroppingMatrixModal', args: [] },
        { sprite: 'sprite_cultivos_4', title: 'Biopreparados & Fermentos', desc: 'Bokashi, bioles y té de compost.', fn: 'openBiopreparadosRecipeModal', args: [] },
        { sprite: 'sprite_cultivos_5', title: 'Grados Día & Fases', desc: 'Acumulación térmica, siembra y poda.', fn: 'openBiodynamicCalendarModal', args: [] },
        { sprite: 'sprite_cultivos_6', title: 'Atlas Fitopatológico', desc: 'Fichas clínicas: oídio, mildiu, carencias.', fn: 'openDiagnosticAtlasModal', args: [] }
      ]
    },
    pecuario: {
      profileKey: 'establo',
      icon: '🐄', title: 'Modo Pecuario & Establo', tag: 'RAMA-ESTABLO',
      subtitle: 'Rotación, sanidad y trazabilidad del rebaño',
      bg: 'assets/ui/establo_landing_bg.jpg',
      accent: { text: 'text-amber-300', border: 'border-amber-500/40', chip: 'bg-amber-500/20 text-amber-300 border-amber-500/40', hover: 'hover:border-amber-400/70' },
      cards: [
        { sprite: 'sprite_establo_1', title: 'Rotación PRV', desc: 'Potreros, reposo y pastoreo Voisin.', fn: 'openAnimalByAnimalViewer', args: ['COW-01'] },
        { sprite: 'sprite_establo_2', title: 'Trazabilidad RFID', desc: 'Curva de peso y ficha individual.', fn: 'openAnimalByAnimalViewer', args: ['COW-02'] },
        { sprite: 'sprite_establo_3', title: 'Gabinete Sanitario', desc: 'Plan profiláctico y desparasitación.', fn: 'openVeterinaryCabinetModal', args: [] },
        { sprite: 'sprite_establo_4', title: 'Báscula Ganadera', desc: 'Ganancia diaria de peso en ovinos.', fn: 'openAnimalByAnimalViewer', args: ['SHEEP-01'] },
        { sprite: 'sprite_establo_5', title: 'Aforo & Gallinero Móvil', desc: 'kg MS/ha y plato medidor forrajero.', fn: 'openAnimalByAnimalViewer', args: ['COOP-01'] },
        { sprite: 'sprite_establo_6', title: 'Escarabajos & Suelo', desc: 'Ciclado de bosta y nitrógeno.', fn: 'openNutrientCyclingModal', args: [] }
      ]
    },
    vecinal: {
      profileKey: 'vecinal',
      icon: '🤝', title: 'Modo Vecinal & Mesa', tag: 'RAMA-VECINAL',
      subtitle: 'Pactos, fajas cortafuego y gobernanza del valle',
      bg: 'assets/ui/vecinal_meeting_landing.jpg',
      accent: { text: 'text-purple-300', border: 'border-purple-500/40', chip: 'bg-purple-500/20 text-purple-300 border-purple-500/40', hover: 'hover:border-purple-400/70' },
      featuredAction: { icon: '🐝', label: 'Topología El Panal (11 Hexágonos)', fn: 'openPanalFromMesa', args: [] },
      cards: [
        { sprite: 'sprite_mesa_chalkboard', title: 'Pizarra Comunitaria & Panal', desc: 'Asamblea rural, flujos en vivo y avisos.', fn: 'openMesaHotspotModal', args: ['panal'] },
        { sprite: 'sprite_mesa_pacts', title: 'Convenios de Colindancia', desc: 'Acuerdos prediales y pastoreo vecino.', fn: 'openMesaHotspotModal', args: ['pactos'] },
        { sprite: 'sprite_mesa_briefcase', title: 'Protocolos & Fajas', desc: 'Cortafuegos perimetrales coordinados.', fn: 'openMesaHotspotModal', args: ['maletin'] },
        { sprite: 'sprite_mesa_dao_urn', title: 'Votación Descentralizada', desc: 'Gobernanza y fondo común.', fn: 'openMesaHotspotModal', args: ['balanza'] },
        { sprite: 'sprite_mesa_radio', title: 'Frecuencia Comunal VHF', desc: 'Alerta temprana y comités APR.', fn: 'openMesaHotspotModal', args: ['radio'] },
        { sprite: 'sprite_mesa_campfire', title: 'Memoria & Actas', desc: 'Registro histórico de pactos del valle.', fn: 'openMesaHotspotModal', args: ['fogata'] }
      ]
    },
    exploracion: {
      profileKey: 'excursion',
      icon: '🧭', title: 'Modo Exploración & Rewilding', tag: 'RAMA-EXPLORACIÓN',
      subtitle: 'Suelo vivo, calicatas, fauna y microbiología',
      bg: 'assets/ui/incursion_landing_bg.jpg',
      accent: { text: 'text-teal-300', border: 'border-teal-500/40', chip: 'bg-teal-500/20 text-teal-300 border-teal-500/40', hover: 'hover:border-teal-400/70' },
      // Solo existen 3 herramientas reales (los 6 sprites antiguos repetían cada una dos veces)
      cards: [
        { sprite: 'sprite_incursion_1', title: 'Protocolos & Transectos', desc: 'Monitoreo VESS y transectos fitosociológicos.', fn: 'openRewildProtocolDrawer', args: [] },
        { sprite: 'sprite_incursion_2', title: 'Horizontes de Suelo & Microbiología', desc: 'Estratigrafía A-B-C, materia orgánica y micorrizas.', fn: 'openSoilHorizonsModal', args: [] },
        { sprite: 'sprite_incursion_3', title: 'Fototrampeo & Bioacústica', desc: 'Güiñas, zorros chilla, pumas y pudúes.', fn: 'openCameraTrapGalleryModal', args: [] }
      ]
    }
  };

  function activeProfile() {
    try { return window.farmProfileManager ? window.farmProfileManager.getActiveProfile() : null; } catch (e) { return null; }
  }

  function ensureContainer() {
    let el = document.getElementById(VIEW_ID);
    if (el) return el;
    el = document.createElement('div');
    el.id = VIEW_ID;
    el.className = 'master-view !p-0 overflow-hidden bg-black select-none';
    const anchor = document.getElementById('view-galpon');
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(el, anchor.nextSibling);
    else document.body.appendChild(el);
    return el;
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function render(key) {
    const b = BOARDS[key];
    const root = ensureContainer();
    const prof = activeProfile();
    const branch = prof && prof.branches ? prof.branches[b.profileKey] : null;
    const farmName = prof ? prof.farmName : 'Predio';
    const status = branch && branch.configured ? (branch.statusLabel || 'Configurado') : 'Sin configurar en este predio';
    const configured = !!(branch && branch.configured);

    const cards = b.cards.map((c, i) => `
      <button type="button" data-board="${key}" data-idx="${i}" class="branch-card group text-left p-3.5 rounded-2xl bg-black/55 hover:bg-black/70 border ${b.accent.border} ${b.accent.hover} transition-all cursor-pointer flex items-start gap-3 shadow-lg">
        <img src="assets/ui/${c.sprite}.png" alt="" class="w-16 h-16 object-contain shrink-0 drop-shadow-xl group-hover:scale-110 transition-transform" draggable="false">
        <div class="min-w-0">
          <div class="text-[13px] font-extrabold text-white leading-tight">${esc(c.title)}</div>
          <div class="text-[11px] text-stone-300 mt-1 leading-snug">${esc(c.desc)}</div>
        </div>
      </button>`).join('');

    root.innerHTML = `
      <div class="absolute inset-0 bg-cover bg-center" style="background-image:url('${b.bg}');"></div>
      <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/55 pointer-events-none"></div>
      <div class="relative z-10 h-full w-full overflow-y-auto flex items-start sm:items-center justify-center p-4 sm:p-8">
        <div class="w-full max-w-4xl rounded-3xl bg-[#0d1322]/88 backdrop-blur-xl border ${b.accent.border} shadow-2xl p-5 sm:p-7 space-y-5">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full border ${b.accent.chip} text-[10px] font-mono font-bold uppercase tracking-wider">
                <span>${b.icon}</span><span>${esc(b.tag)}</span><span class="opacity-60">•</span><span>${esc(farmName)}</span>
              </div>
              <h2 class="text-2xl sm:text-3xl font-black text-white font-serif tracking-tight mt-2">${esc(b.title)}</h2>
              <p class="text-xs text-stone-300 font-mono mt-0.5">${esc(b.subtitle)}</p>
              <p class="text-[11px] mt-1.5 font-mono ${configured ? b.accent.text : 'text-stone-400'}">${configured ? '● ' : '○ '}${esc(status)}</p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              ${b.featuredAction ? `<button type="button" id="branchBoardFeaturedBtn" class="px-3.5 py-2 rounded-xl bg-amber-500/25 hover:bg-amber-500/40 text-amber-200 border border-amber-400/60 text-xs font-mono font-bold cursor-pointer shadow-lg flex items-center gap-1.5"><span>${b.featuredAction.icon}</span><span>${esc(b.featuredAction.label)}</span></button>` : ''}
              <button type="button" id="branchBoardBackBtn" class="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/35 text-amber-200 border border-amber-500/40 text-xs font-mono font-bold cursor-pointer shadow-lg">🏠 Volver al Taller</button>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 ${b.cards.length > 4 ? 'lg:grid-cols-3' : 'lg:grid-cols-3'} gap-3">${cards}</div>
        </div>
      </div>`;

    root.querySelector('#branchBoardBackBtn').addEventListener('click', () => window.switchMasterView('landing'));
    const featBtn = root.querySelector('#branchBoardFeaturedBtn');
    if (featBtn && b.featuredAction) {
      featBtn.addEventListener('click', () => {
        const fn = window[b.featuredAction.fn];
        if (typeof fn === 'function') fn.apply(window, b.featuredAction.args || []);
      });
    }
    root.querySelectorAll('.branch-card').forEach(btn => {
      btn.addEventListener('click', () => runCard(key, parseInt(btn.dataset.idx, 10)));
    });
  }

  function runCard(key, idx) {
    const card = BOARDS[key].cards[idx];
    const fn = window[card.fn];
    if (typeof fn !== 'function') {
      console.warn('[BranchBoard] Herramienta no disponible:', card.fn);
      return;
    }
    try { fn.apply(window, card.args); } catch (e) { console.error('[BranchBoard] Error en', card.fn, e); }
  }

  window.openBranchBoard = function (key) {
    if (!BOARDS[key]) return;
    render(key);
    window.currentBranchBoard = key;
    window.switchMasterView('ramas');
  };
  window.BRANCH_BOARDS = BOARDS;

  // Si cambia el predio activo con un tablero abierto, refrescar la identidad mostrada
  window.addEventListener('agritwin:profileChanged', function () {
    const root = document.getElementById(VIEW_ID);
    if (root && root.classList.contains('active-view') && window.currentBranchBoard) render(window.currentBranchBoard);
  });
})(window);
