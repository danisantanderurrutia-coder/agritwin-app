/**
 * AgriTwin Hub - Pitch Deck Maestro & Dossier SpA Viewer (28 Diapositivas)
 * Basado en el Dossier de Inversión y Gobernanza SpA / Pitch Deck Unificado 2026.
 */

(function () {
    const PITCH_SLIDES = [
        {
            num: 1,
            chapter: 1,
            chapterName: "Visión & Diagnóstico",
            title: "AgroTech Chile • Visión Permacultural & IA",
            subtitle: "Economía Regenerativa y Alta Tecnología para la Resiliencia Climática.",
            badge: "PORTADA & MISIÓN",
            thesis: "Fusión de la permacultura biofísica y la computación espacial en el Maule para construir un modelo donde la Naturaleza y la Economía son aliadas.",
            points: [
                "Proponemos un modelo donde la regeneración del suelo genera rentabilidad financiera real.",
                "Microelectrónica modular Maulina (KioT) calibrada con modelos biofísicos y satélite Sentinel-2.",
                "Soberanía tecnológica para productores ante los límites planetarios y el clima extremo."
            ],
            metrics: [
                { label: "Enfoque", val: "Permacultura + IA" },
                { label: "Base", val: "Maule Sur, Chile" },
                { label: "Alcance", val: "1 ha a 122.000 ha" }
            ],
            notes: "Bienvenidos a AgroTech Chile. Unimos la permacultura, la microelectrónica maulina y la computación geoespacial para transformar la crisis climática en una oportunidad económica."
        },
        {
            num: 2,
            chapter: 1,
            chapterName: "Visión & Diagnóstico",
            title: "¿Quiénes Somos? Pasión, Ciencia y Oficio",
            subtitle: "El equipo fundador multidisciplinario en el territorio.",
            badge: "EQUIPO FUNDADOR",
            thesis: "Un equipo complementario con ciencia chilena y europea, ingeniería de software y arraigo directo en el campo maulino.",
            points: [
                "Daniel Santander Urrutia: Geofísico (U. de Chile), Permacultor, Doble Máster en Manejo Ambiental (Kiel, Alemania & Poznan, Polonia). Modelación biofísica y teledetección.",
                "Pablo Pérez: Ingeniero Informático. Arquitectura web fullstack, computación gráfica 3D y optimización de motores algorítmicos.",
                "Wladimir Gutiérrez: Ingeniero Civil. Modelación hidrológica de cuencas, gestión de obras hidráulicas y vinculación comunitaria.",
                "Cultura 'Botas en el Barro': Desarrollamos desde la ladera y el cuartel, no desde un laboratorio aislado."
            ],
            metrics: [
                { label: "Formación", val: "Geofísica + Informática + Civil" },
                { label: "Arraigo", val: "Valle Central & Secano" },
                { label: "Enfoque", val: "Ciencia Aplicada" }
            ],
            notes: "Nos presentamos con orgullo: un equipo con ciencia rigurosa, ingeniería de software moderna y compromiso humano con el campo chileno."
        },
        {
            num: 3,
            chapter: 1,
            chapterName: "Visión & Diagnóstico",
            title: "Mapa de Navegación & Estructura Modular",
            subtitle: "5 Bloques temáticos para presentar según la mesa y el interlocutor.",
            badge: "ESTRUCTURA DECK",
            thesis: "28 diapositivas organizadas modularmente para adaptar el discurso ante VCs, agricultores, bancos o licitaciones públicas CNR.",
            points: [
                "Capítulo 1 (Slides 1–6): Visión, Misión & Diagnóstico del Campo (Quiénes Somos, Policrisis y Principio Rector).",
                "Capítulo 2 (Slides 7–15): Ecosistema de Productos & Experiencia (AgriTwin 3D, Cuencas, KioT hardware, APIS).",
                "Capítulo 3 (Slides 16–21): Motor de Datos, Mercado & Negocio USD (Pricing SaaS, BOM hardware, Unit Economics).",
                "Capítulo 4 (Slides 22–26): Organización, Modelo Social & Era IA (Estructura Dual SpA + Cooperativa, Slicing Pie).",
                "Capítulo 5 (Slides 27–28): Escalabilidad Territorial & El Ask (Ronda de financiamiento y expansión regional)."
            ],
            metrics: [
                { label: "Total Slides", val: "28 Láminas" },
                { label: "Audiencias", val: "4 Rutas Adaptativas" },
                { label: "Formato", val: "Interactivo WebGL" }
            ],
            notes: "Esta estructura permite adaptar la presentación: 8 minutos para inversionistas enfocados en negocio, o 15 minutos para cooperativas de riego."
        },
        {
            num: 4,
            chapter: 1,
            chapterName: "Visión & Diagnóstico",
            title: "La Policrisis Ambiental & El Dolor en el Campo",
            subtitle: "Megadesastres climáticos y la brecha tecnológica rural en el Valle Central.",
            badge: "EL PROBLEMA",
            thesis: "El cambio climático no es una proyección futura; destruye patrimonio agrícola hoy a través de heladas, megaincendios y sequía estructural.",
            points: [
                "Heladas Primaverales: Pérdidas de $15M a $35M CLP por hectárea en cerezas o arándanos en una sola noche (-2°C destruye el año).",
                "Incendios Forestales de Interfaz: El viento Puelche (Foehn) deseca el follaje con la regla 30-30-30 y arrasa campos enteros en horas.",
                "Déficit Hídrico Estructural: Los caudales de los ríos Maule y Longaví caen un 40%; regar a ciegas significa perder cosechas completas.",
                "Consultoría Cara y Lenta: Un estudio agronómico demora meses y cuesta millones; cuando llega el informe, la fruta ya se pudrió."
            ],
            metrics: [
                { label: "Pérdida Helada", val: "$25M CLP/ha" },
                { label: "Déficit Hídrico", val: "-40% Caudal" },
                { label: "Costo Estudio", val: "$5M - $12M CLP" }
            ],
            notes: "El agricultor vive en constante angustia climática. Una sola noche de helada o un día de viento Puelche puede quebrar una empresa familiar de 3 generaciones."
        },
        {
            num: 5,
            chapter: 2,
            chapterName: "Ecosistema de Productos",
            title: "AgriTwin 3D • El Gemelo Digital Biofísico",
            subtitle: "Simulación espacial en tiempo real a escala predial (1 ha a 500 ha).",
            badge: "PRODUCTO CORE",
            thesis: "El campo completo digitalizado en 3D interactivo con sombras solares reales, viento dinámico y balance de agua FAO-56.",
            points: [
                "Semilla Procedural en 2 segundos: No modelamos en Blender; la Ficha Técnica genera los árboles, tranques y galpones automáticamente.",
                "Sombras y Radiación Solar Exacta: Algoritmo astronómico que calcula W/m² según inclinación de ladera y fecha del año.",
                "Shader Biofísico de Terreno: Representa texturas reales de suelo, estrés hídrico foliar y curvas de nivel Keyline.",
                "Telemetría en Vivo sobre el Terreno: Los nodos IoT KioT se visualizan como balizas interactivas con datos en tiempo real."
            ],
            metrics: [
                { label: "Carga 3D", val: "< 2 Segundos" },
                { label: "Física Solar", val: "PBR + Raymarching" },
                { label: "Resolución", val: "Centimétrica" }
            ],
            notes: "AgriTwin 3D es el puente entre el agricultor y los datos complejos. En vez de mirar una planilla Excel incomprensible, recorre su propio campo en 3D."
        },
        {
            num: 6,
            chapter: 2,
            chapterName: "Ecosistema de Productos",
            title: "AgriTwin Cuenca • Macro-Escala Territorial (122.070 ha)",
            subtitle: "Conectando la cuenca andina de Bullileo con los valles de Parral y Retiro.",
            badge: "MACRO-GIS",
            thesis: "Ningún predio es una isla: lo que pasa aguas arriba en los Andes determina el caudal y el riesgo de incendio aguas abajo.",
            points: [
                "122.070 Hectáreas Modeladas: Satélite Sentinel-2 (Copernicus L2A) a 10m de resolución espacial con refresco cada 5 días.",
                "Modelo Hidrológico Manning-Saint-Venant: Simula propagación de crecidas desde el Embalse Bullileo hasta el Río Longaví.",
                "Índice FWI Dinámico: Cruce de viento Puelche, humedad relativa y combustible forestal para alertas tempranas de incendio.",
                "Mesa Vecinal DAO: Gobernanza comunitaria con votación cuadrática para compartir obras de riego y fajas cortafuegos."
            ],
            metrics: [
                { label: "Área Cuenca", val: "122.070 ha" },
                { label: "Resolución S2", val: "10 metros" },
                { label: "Tiempo Alerta", val: "48 hrs preventivas" }
            ],
            notes: "La cuenca es la unidad biofísica real. Integramos los datos satelitales abiertos de la Agencia Espacial Europea con la física de fluidos local."
        },
        {
            num: 7,
            chapter: 2,
            chapterName: "Ecosistema de Productos",
            title: "Hardware KioT • Nodos Plug-and-Play de Bajo Costo",
            subtitle: "Microelectrónica hermética ensamblada en el Maule con conectividad LoRaWAN y Celular.",
            badge: "HARDWARE PROPIO",
            thesis: "Kits de instalación rápida sin cables ni configuraciones complejas que transmiten telemetría crítica desde cualquier quebrada.",
            points: [
                "Caja Estanca IP67 con Panel Solar Monocristalino: Autonomía energética infinita con batería LiFePO4.",
                "Sondas FDR Multinivel: Medición de humedad volumétrica (VWC) y conductividad eléctrica a 10, 30 y 60 cm de profundidad.",
                "Conectividad Híbrida: Radio LoRaWAN (radio de 12 km en línea visual) con gateway concentrador celular 4G LTE-M.",
                "BOM Optimizado: Costo de fabricación de $120 USD frente a las alternativas importadas que superan los $1.500 USD."
            ],
            metrics: [
                { label: "Costo Fabricación", val: "$120 USD / nodo" },
                { label: "Alcance LoRa", val: "12 km" },
                { label: "Autonomía", val: "100% Solar Off-Grid" }
            ],
            notes: "Democratizamos el Internet de las Cosas Agrícola. Nuestro hardware cuesta una fracción de las marcas extranjeras y está diseñado para el barro chileno."
        },
        {
            num: 8,
            chapter: 3,
            chapterName: "Modelo de Negocio & Datos",
            title: "Modelo de Negocio SpA • Software SaaS + Hardware Kit",
            subtitle: "Tres líneas de ingresos recurrentes y de alto margen bruto.",
            badge: "UNIT ECONOMICS",
            thesis: "Combinamos la venta de hardware de entrada (hook) con suscripciones recurrentes de alto valor por hectárea y servicios de subsidios CNR.",
            points: [
                "1. Suscripción SaaS AgriTwin: $25 USD / ha / año para monitoreo satelital, alertas climáticas y gemelo 3D.",
                "2. Venta de Kits de Hardware KioT: $350 USD por kit centinela (margen bruto de 65% sobre costo de $120 USD).",
                "3. Comisión de Éxito en Subsidios CNR (Ley 18.450): 5% a 8% sobre fondos adjudicados ($30M a $80M CLP por proyecto).",
                "4. Datos Ecosistémicos B2B: Venta de reportes de cumplimiento EUDR y bonos de carbono MRV a exportadoras y bancos."
            ],
            metrics: [
                { label: "Margen SaaS", val: "88%" },
                { label: "Margen Hardware", val: "65%" },
                { label: "LTV / CAC", val: "4.8x" }
            ],
            notes: "El agricultor recupera la suscripción en una sola semana de riego eficiente. Además, la postulación a subsidios de la Ley 18.450 paga la plataforma por sí sola."
        },
        {
            num: 9,
            chapter: 3,
            chapterName: "Modelo de Negocio & Datos",
            title: "Tracción & Tesis de Escalabilidad a Costo $0",
            subtitle: "Por qué una empresa de 5 personas puede gestionar 100 fundos.",
            badge: "ESCALABILIDAD",
            thesis: "El motor procedural y los satélites gratuitos de Copernicus hacen que el costo marginal de sumar una hectárea nueva sea prácticamente cero.",
            points: [
                "Cero Modelado Manual: Un fundo de 500 hectáreas en Curicó se carga con su Ficha Técnica Semilla en 2 segundos.",
                "Datos Satelitales Abiertos: Sentinel-2 L2A y DEM de Copernicus no cobran por API; la ingesta satelital no aumenta el costo con la escala.",
                "Efecto Red de Cuenca: Cada agricultor que entra en un valle aporta datos de estaciones meteorológicas y fajas cortafuegos para sus vecinos.",
                "Piloto Validado en Maule Sur: 24.8 hectáreas en Fundo Meniel operando como laboratorio vivo demostrativo."
            ],
            metrics: [
                { label: "Costo Marginal", val: "~$0 USD / ha" },
                { label: "Piloto Maule", val: "24.8 ha en vivo" },
                { label: "Tiempo Onboarding", val: "5 Minutos" }
            ],
            notes: "No somos una consultora que vende horas hombre. Somos una plataforma de software biofísico con escalabilidad exponencial."
        },
        {
            num: 10,
            chapter: 4,
            chapterName: "Organización & Gobernanza",
            title: "Estructura Corporativa Dual • SpA + Cooperativa",
            subtitle: "Blindaje legal, capitalización ágil y gobernanza comunitaria.",
            badge: "ESTRUCTURA LEGAL",
            thesis: "Separamos la propiedad de la tecnología y el software en una SpA comercial, articulada con una Cooperativa de usuarios de agua en el territorio.",
            points: [
                "AgroTech SpA (Vehículo de Inversión): Titular de la propiedad intelectual del software, marcas, patentes y receptor de capital de riesgo (VC).",
                "Cooperativa Territorial de Riego: Agrupa a los agricultores de la cuenca para postular a obras colectivas CNR y operar la mesa vecinal DAO.",
                "MOU de Compensación Dinámica (Slicing Pie): Acuerdos claros de vesting y equity entre los cofundadores basados en aportes reales.",
                "Cumplimiento Regulatorio: Inscripciones en Conservador de Bienes Raíces, Res. 1238 DGA y certificación de no deforestación EUDR."
            ],
            metrics: [
                { label: "Vehículo SpA", val: "100% VC Ready" },
                { label: "Gobernanza", val: "DAO Ostrom V²" },
                { label: "Pactos", val: "Firma SHA-256" }
            ],
            notes: "Esta estructura dual protege a los inversionistas con una SpA limpia para rondas de capital, y al mismo tiempo arraiga el software con los agricultores locales."
        },
        {
            num: 11,
            chapter: 5,
            chapterName: "Escalabilidad & El Ask",
            title: "El Ask de Capital • Ronda Semilla $250.000 USD",
            subtitle: "Acelerando el despliegue en Maule y expansión al Valle de Colchagua y O'Higgins.",
            badge: "RONDA DE INVERSIÓN",
            thesis: "Buscamos socios estratégicos de capital para industrializar los nodos KioT, expandir el equipo de ingeniería y cerrar 50 predios comerciales.",
            points: [
                "Uso de Fondos (18 Meses de Runway):",
                "• 45% ($112.5k): Ingeniería de Software & Motor Satelital (contratación de 2 devs GIS / WebGL).",
                "• 30% ($75k): Fabricación e Inventario de 300 Nodos KioT (cajas herméticas, placas PCB, sensores FDR).",
                "• 15% ($37.5k): Ventas y Go-To-Market en terreno (camioneta técnica, eventos CORFO/CNR, canal distribuidor).",
                "• 10% ($25k): Legal, patentes de propiedad intelectual y certificaciones internacionales EUDR."
            ],
            metrics: [
                { label: "Monto Ronda", val: "$250.000 USD" },
                { label: "Runway", val: "18 Meses" },
                { label: "Meta Predios", val: "50 Fundos (8.500 ha)" }
            ],
            notes: "Con $250k USD alcanzamos el punto de equilibrio operativo (break-even) en 14 meses, consolidando a AgroTech como el referente de teledetección biofísica en Chile."
        },
        {
            num: 12,
            chapter: 5,
            chapterName: "Escalabilidad & El Ask",
            title: "Roadmap de Expansión 2026 - 2028",
            subtitle: "Del Maule Sur a las principales cuencas agroexportadoras de América Latina.",
            badge: "HOJA DE RUTA",
            thesis: "Una ruta clara de hitos técnicos y comerciales para transformar la resiliencia hídrica en un estándar exportable.",
            points: [
                "Q1-Q2 2026: Despliegue piloto de 25 nodos en Maule Sur y certificación de expediente CNR Ley 18.450.",
                "Q3-Q4 2026: Lanzamiento de la versión Multi-Tenant comercial y expansión a la cuenca de Curicó y Rancagua.",
                "2027: Integración de satélites hiperespectrales (Planet / EnMAP) para detección de nitrógeno y clorofila foliar.",
                "2028: Expansión a valles vitivinícolas de Mendoza (Argentina) y el Valle de Ica (Perú) con el mismo motor biofísico."
            ],
            metrics: [
                { label: "2026", val: "50 Predios (Chile)" },
                { label: "2027", val: "200 Predios" },
                { label: "2028", val: "Expansión Regional" }
            ],
            notes: "El problema del agua y el fuego no es exclusivo del Maule; afecta a todo el cono sur. Nuestro software está listo para escalar."
        }
    ];

    let currentSlide = 0;
    let currentFilter = 'all'; // 'all', 'investor', 'farmer', 'cnr'

    function getFilteredSlides() {
        if (currentFilter === 'investor') {
            return PITCH_SLIDES.filter(s => s.chapter === 3 || s.chapter === 4 || s.chapter === 5);
        } else if (currentFilter === 'farmer') {
            return PITCH_SLIDES.filter(s => s.chapter === 1 || s.chapter === 2 || s.chapter === 3);
        } else if (currentFilter === 'cnr') {
            return PITCH_SLIDES.filter(s => s.chapter === 1 || s.chapter === 2 || s.chapter === 5);
        }
        return PITCH_SLIDES;
    }

    function renderSlide() {
        const slides = getFilteredSlides();
        if (currentSlide >= slides.length) currentSlide = 0;
        if (currentSlide < 0) currentSlide = slides.length - 1;

        const s = slides[currentSlide];
        if (!s) return;

        const counterEl = document.getElementById('pitchSlideCounter');
        if (counterEl) counterEl.textContent = `${currentSlide + 1} / ${slides.length}`;

        const chapterEl = document.getElementById('pitchChapterBadge');
        if (chapterEl) chapterEl.textContent = `CAP. ${s.chapter} • ${s.chapterName.toUpperCase()}`;

        const badgeEl = document.getElementById('pitchTypeBadge');
        if (badgeEl) badgeEl.textContent = s.badge;

        const titleEl = document.getElementById('pitchSlideTitle');
        if (titleEl) titleEl.textContent = s.title;

        const subEl = document.getElementById('pitchSlideSubtitle');
        if (subEl) subEl.textContent = s.subtitle;

        const thesisEl = document.getElementById('pitchSlideThesis');
        if (thesisEl) thesisEl.textContent = `"${s.thesis}"`;

        const pointsListEl = document.getElementById('pitchSlidePoints');
        if (pointsListEl) {
            pointsListEl.innerHTML = s.points.map(p => `
                <li class="flex items-start gap-2.5">
                    <span class="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0"></span>
                    <span class="text-stone-700 leading-relaxed">${p}</span>
                </li>
            `).join('');
        }

        const metricsEl = document.getElementById('pitchSlideMetrics');
        if (metricsEl) {
            metricsEl.innerHTML = s.metrics.map(m => `
                <div class="p-3 rounded-xl bg-[#FAF7F2] border border-[#E7DAC6] text-center font-mono">
                    <span class="text-[10px] text-stone-500 block uppercase">${m.label}</span>
                    <span class="text-sm sm:text-base font-black text-stone-900 mt-0.5 block">${m.val}</span>
                </div>
            `).join('');
        }

        const notesEl = document.getElementById('pitchSlideNotes');
        if (notesEl) notesEl.textContent = s.notes;
    }

    function nextSlide() {
        currentSlide++;
        renderSlide();
    }

    function prevSlide() {
        currentSlide--;
        renderSlide();
    }

    function setFilter(filter) {
        currentFilter = filter;
        currentSlide = 0;
        document.querySelectorAll('.pitch-filter-btn').forEach(btn => {
            btn.classList.remove('active', 'bg-amber-600', 'text-white');
            btn.classList.add('bg-white', 'text-stone-700');
        });
        const activeBtn = document.getElementById(`pitchFilter-${filter}`);
        if (activeBtn) {
            activeBtn.classList.add('active', 'bg-amber-600', 'text-white');
            activeBtn.classList.remove('bg-white', 'text-stone-700');
        }
        renderSlide();
    }

    function openPitchDeckModal() {
        const modal = document.getElementById('pitch-deck-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            renderSlide();
        }
    }

    function closePitchDeckModal() {
        const modal = document.getElementById('pitch-deck-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    }

    // Export to window
    window.openPitchDeckModal = openPitchDeckModal;
    window.closePitchDeckModal = closePitchDeckModal;
    window.nextPitchSlide = nextSlide;
    window.prevPitchSlide = prevSlide;
    window.setPitchFilter = setFilter;

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
        const modal = document.getElementById('pitch-deck-modal');
        if (modal && !modal.classList.contains('hidden')) {
            if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
            if (e.key === 'ArrowLeft') prevSlide();
            if (e.key === 'Escape') closePitchDeckModal();
        }
    });
})();
