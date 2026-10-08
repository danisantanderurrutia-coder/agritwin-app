/**
 * test-ecosystem-sync.js
 * Automated validation of the 6 Twins and 18 Advisors Suite.
 */
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const hubHtmlPath = path.join(repoRoot, 'agritwin-hub', 'index.html');
const agriHtmlPath = path.join(repoRoot, 'agritwin', 'index.html');
const advisorsJsPath = path.join(repoRoot, 'agritwin-hub', 'js', 'hub', 'ecosystem-advisors.js');
const navJsPath = path.join(repoRoot, 'agritwin-hub', 'js', 'hub', 'hub-navigation.js');

let failures = [];

function assert(condition, message) {
    if (!condition) {
        failures.push(`❌ ${message}`);
        console.error(`❌ FAIL: ${message}`);
    } else {
        console.log(`✅ PASS: ${message}`);
    }
}

console.log('================================================================');
console.log('🔍 TEST SUITE: AUDITORÍA 6 TWINS & 18 ASESORES (AGROTWIN SUITE)');
console.log('================================================================\n');

// 1. Text audit: Residual "9 asesor" / "3 twin" / "3 ramas"
console.log('--- 1. AUDITORÍA DE TEXTOS RESIDUALES OBSOLETOS ---');
const filesToCheck = [
    { name: 'agritwin-hub/index.html', path: hubHtmlPath },
    { name: 'agritwin-hub/js/hub/ecosystem-advisors.js', path: advisorsJsPath },
    { name: 'agritwin-hub/js/hub/hub-navigation.js', path: navJsPath }
];

const forbiddenPatterns = [
    /9\s*asesor/i,
    /3\s*twin/i,
    /3\s*ramas/i
];

filesToCheck.forEach(file => {
    const content = fs.readFileSync(file.path, 'utf8');
    forbiddenPatterns.forEach(pattern => {
        const matches = content.match(pattern);
        assert(!matches, `Archivo ${file.name} no debe contener ocurrencias de '${pattern}'. ${matches ? 'Encontrado: ' + matches[0] : ''}`);
    });
});

// 2. ADVISORS_DATA Structure
console.log('\n--- 2. AUDITORÍA DE ESTRUCTURA ADVISORS_DATA (18 SLOTS) ---');

// Setup minimal globals so loading the file or evaluating data works cleanly
global.window = global;
global.document = {
    getElementById: () => null,
    createElement: () => ({ style: {}, classList: { add() {}, remove() {} } }),
    body: { appendChild() {} }
};

let ecosystemModule;
const advJsContent = fs.readFileSync(advisorsJsPath, 'utf8');
const dataStart = advJsContent.indexOf('const ECOSYSTEM_SERVICES_DATA =');
const dataPart = advJsContent.substring(dataStart, advJsContent.indexOf('// UI CONTROLLER & MODALS'));
const m = { exports: {} };
const runner = new Function('module', 'exports', 'window', 'document', dataPart + '\nreturn module.exports;');
ecosystemModule = runner(m, m.exports, global.window, global.document);

try {
    const advisors = ecosystemModule.ADVISORS_DATA;
    const advisorKeys = Object.keys(advisors || {});
    assert(advisorKeys.length === 18, `ADVISORS_DATA debe contener exactamente 18 asesores (encontrados: ${advisorKeys.length})`);

    const expectedTwins = ['predio', 'vecinal', 'cuenca', 'establo', 'invernadero', 'excursion'];
    const twinCounts = {};
    expectedTwins.forEach(t => twinCounts[t] = 0);

    advisorKeys.forEach(key => {
        const adv = advisors[key];
        assert(adv.name && adv.name.length > 0, `Asesor [${key}] tiene nombre definido: "${adv.name}"`);
        assert(adv.role && adv.role.length > 0, `Asesor [${key}] tiene rol definido: "${adv.role}"`);
        assert(adv.icon && adv.icon.length > 0, `Asesor [${key}] tiene icono: "${adv.icon}"`);
        assert(adv.avatarImg && adv.avatarImg.length > 0, `Asesor [${key}] tiene avatarImg: "${adv.avatarImg}"`);
        assert(Array.isArray(adv.liveMetrics) && adv.liveMetrics.length === 4, `Asesor [${key}] tiene exactamente 4 métricas en vivo`);
        assert(Array.isArray(adv.recommendedActions) && adv.recommendedActions.length === 3, `Asesor [${key}] tiene exactamente 3 acciones recomendadas`);
        
        if (twinCounts[adv.twin] !== undefined) {
            twinCounts[adv.twin]++;
        }
    });

    expectedTwins.forEach(twin => {
        assert(twinCounts[twin] === 3, `Twin '${twin}' debe tener exactamente 3 asesores asignados (tiene: ${twinCounts[twin]})`);
    });

    // 3. ECOSYSTEM_SERVICES_DATA: 6 twins present
    console.log('\n--- 3. AUDITORÍA DE MATRIZ CICES & SERVICIOS ECOSISTÉMICOS ---');
    const services = ecosystemModule.ECOSYSTEM_SERVICES_DATA;
    assert(Array.isArray(services) && services.length >= 18, `ECOSYSTEM_SERVICES_DATA tiene ${services ? services.length : 0} servicios (mínimo 18 para los 6 twins)`);
    
    const serviceTwins = new Set(services.map(s => s.twin));
    expectedTwins.forEach(t => {
        assert(serviceTwins.has(t), `ECOSYSTEM_SERVICES_DATA contiene servicios para el twin '${t}'`);
    });

    // 4. DEBATE_SCENARIOS: Verify 4 scenarios have interventions from multiple twins
    console.log('\n--- 4. AUDITORÍA DE CÁMARA DE DELIBERACIÓN & ESCENARIOS ---');
    const scenarios = ecosystemModule.DEBATE_SCENARIOS;
    const scenarioKeys = Object.keys(scenarios || {});
    assert(scenarioKeys.length === 4, `DEBATE_SCENARIOS debe contener 4 escenarios (encontrados: ${scenarioKeys.length})`);
    
    scenarioKeys.forEach(sKey => {
        const sc = scenarios[sKey];
        assert(sc.interventions && sc.interventions.length >= 6, `Escenario ${sKey} tiene deliberación activa (${sc.interventions.length} intervenciones)`);
        assert(sc.consensus && Array.isArray(sc.consensus.priorityActions) && sc.consensus.priorityActions.length >= 3, `Escenario ${sKey} tiene acciones prioritarias de consenso`);
    });

} catch (err) {
    failures.push(`❌ Error evaluando ecosistema JS: ${err.message}\n${err.stack}`);
    console.error(err);
}

// 5. Audit Modals in HTML
console.log('\n--- 5. AUDITORÍA DE MODALES EN HUB & AGRITWIN ---');
const hubHtml = fs.readFileSync(hubHtmlPath, 'utf8');
const agriHtml = fs.readFileSync(agriHtmlPath, 'utf8');

const hubModalIds = [
    'predioAdvisorsModal',
    'mesaAdvisorsModal',
    'cuencaAdvisorsModal',
    'establoAdvisorsModal',
    'invernaderoAdvisorsModal',
    'excursionAdvisorsModal'
];

hubModalIds.forEach(mId => {
    assert(hubHtml.includes(`id="${mId}"`), `agritwin-hub/index.html debe contener el modal #${mId}`);
});

const agriModalIds = [
    'predioAdvisorsModalAgri',
    'establoAdvisorsModalAgri',
    'invernaderoAdvisorsModalAgri',
    'excursionAdvisorsModalAgri'
];

agriModalIds.forEach(mId => {
    assert(agriHtml.includes(`id="${mId}"`), `agritwin/index.html debe contener el modal #${mId}`);
});

// 6. Dossier verification
console.log('\n--- 6. AUDITORÍA DE DOSSIER EJECUTIVO (PÁGINA 1 Y 2) ---');
assert(hubHtml.includes('AT-2026-18E-01'), 'Dossier tiene folio de 18 especialistas: AT-2026-18E-01');
assert(hubHtml.includes('Válido por 6 Twins'), 'Dossier Página 1 indica validez para 6 Twins');
assert(hubHtml.includes('Dictamen & Compromisos de los 18 Asesores'), 'Dossier Página 2 titula Dictamen de los 18 Asesores');
assert(hubHtml.includes('Dr. Marcelo') && hubHtml.includes('Dr. Gonzalo') && hubHtml.includes('Dra. Javiera'), 'Firmas de garantes incorporan a los especialistas de los 6 twins');

console.log('\n================================================================');
if (failures.length === 0) {
    console.log('🎉 TODOS LOS TESTS PASARON CON ÉXITO (0 ERRORES ENCONTRADOS)');
    console.log('================================================================');
    process.exit(0);
} else {
    console.log(`⚠️ SE DETECTARON ${failures.length} FALLOS EN EL SISTEMA:`);
    failures.forEach(f => console.log(f));
    console.log('================================================================');
    process.exit(1);
}
