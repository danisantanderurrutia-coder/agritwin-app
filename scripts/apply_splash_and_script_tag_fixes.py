# -*- coding: utf-8 -*-
with open('/Users/danielsantander/Documents/agritwin-app/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Agregar guardia de supresión de splash para deep-links en <head>
head_target = '''    <script>
        tailwind.config = {'''

head_replacement = '''    <script>
        // Si el usuario entra con un deep-link (#hash), ocultar el splash negro inmediatamente
        if (window.location.hash && window.location.hash.length > 1) {
            document.write('<style>#alchemicalAppSplash { display: none !important; opacity: 0 !important; pointer-events: none !important; }</style>');
        }
        window.dismissAlchemicalSplash = function() {
            const splash = document.getElementById('alchemicalAppSplash');
            if (splash) {
                splash.style.opacity = '0';
                splash.style.pointerEvents = 'none';
                splash.style.display = 'none';
            }
        };
    </script>
    <script>
        tailwind.config = {'''

# 2. Corregir etiquetas de scripts con cache-busting v=4.2.5
scripts_target = '''    <script src="js/hub/geo-layers.js?v=4.1.0-windy-cuenca"></script>
    <script src="js/hub/hub-navigation.js?v=4.1.0-windy-cuenca"></script>
    <script src="js/hub/mesa-vecinos.js"></script>
    <script src="js/hub/vault-cockpit.js"></script>
    <script src="js/hub/cerro-cuenca.js"></script>
    <script src="js/hub/ecosystem-advisors.js?v=4.1.0-windy-cuenca"></script>
    <script src="js/hub/mesa-hotspots-lenses.js"></script>'''

scripts_replacement = '''    <script src="js/hub/geo-layers.js?v=4.2.5-hindcast"></script>
    <script src="js/hub/hub-navigation.js?v=4.2.5-hindcast"></script>
    <script src="js/hub/mesa-vecinos.js?v=4.2.5-hindcast"></script>
    <script src="js/hub/vault-cockpit.js?v=4.2.5-hindcast"></script>
    <script src="js/hub/cerro-cuenca.js?v=4.2.5-hindcast"></script>
    <script src="js/hub/ecosystem-advisors.js?v=4.2.5-hindcast"></script>
    <script src="js/hub/mesa-hotspots-lenses.js?v=4.2.5-hindcast"></script>'''

# 3. Corregir tag mal cerrado de farm-profile-manager.js
fpm_target = '''<script src="js/hub/farm-profile-manager.js">
    function runInteractiveSoilGridsCalc() {'''

fpm_replacement = '''<script src="js/hub/farm-profile-manager.js?v=4.2.5-hindcast"></script>
<script>
    function runInteractiveSoilGridsCalc() {'''

assert head_target in content, "head_target not found"
assert scripts_target in content, "scripts_target not found"
assert fpm_target in content, "fpm_target not found"

content = content.replace(head_target, head_replacement, 1)
content = content.replace(scripts_target, scripts_replacement, 1)
content = content.replace(fpm_target, fpm_replacement, 1)

with open('/Users/danielsantander/Documents/agritwin-app/index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("index.html actualizado exitosamente con cierre de scripts y supresor de splash para deep-links!")
