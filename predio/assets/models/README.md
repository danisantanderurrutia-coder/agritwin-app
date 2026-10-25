# 📦 Biblioteca Local de Modelos 3D (.GLB) - AgriTwin

Esta carpeta contiene modelos tridimensionales en formato binario **glTF 2.0 (`.glb`)** listos para ser renderizados directamente por el motor gráfico Three.js de AgriTwin.

---

## ⚖️ Marco Legal y Licencias (Uso 100% Legal y Seguro)

Todos los modelos aquí incluidos provienen de repositorios abiertos oficiales (Poly by Google, Quaternius, Khronos Group, Three.js) y se rigen bajo licencias internacionales estándar de código abierto:

| Modelo 3D | Archivo | Origen / Autor | Licencia | Rol en el Gemelo Digital |
| :--- | :--- | :--- | :--- | :--- |
| **Casa Patronal Principal** | `FarmHouse.glb` | Poly by Google | **CC-BY 3.0** | Casa principal Tudor / administración del predio (escala adaptada a 0.24, ~6m). |
| **Galpón Principal** | `Barn.glb` | Quaternius / Poly | **CC0 (Dominio Público)** | Galpón agroindustrial de ordeña y acopio techado. |
| **Cobertizo Rústico** | `SmallBarn.glb` | Quaternius | **CC0 (Dominio Público)** | Bodega secundaria para herramientas y aperos. |
| **Silo de Forraje/Granos** | `Silo.glb` | Quaternius | **CC0 (Dominio Público)** | Almacenamiento vertical de granos y suplementación seca PRV. |
| **Molino Eólico** | `Windmill.glb` | Quaternius / Poly | **CC0 (Dominio Público)** | Molino tradicional de bombeo gravimétrico para bebederos. |
| **Parva / Fardo de Heno** | `Haystack.glb` | Quaternius | **CC0 (Dominio Público)** | Forraje almacenado en potreros de pastoreo rotacional. |
| **Tractor Agrícola** | `Tractor.glb` | Poly by Google | **CC-BY 3.0** | Maquinaria de precisión para labores de subsolado y siembra. |
| **Camión Cisterna Lácteo** | `CesiumMilkTruck.glb` | Khronos / Cesium | **CC-BY 4.0** | Transporte isotérmico de leche a 3.8°C en patio logístico. |
| **Rebaño Bovino (Vaca)** | `Cow.glb` | Poly by Google | **CC-BY 3.0** | Rebaño de pastoreo rotacional en Potrero P3 con trazabilidad SAG. |
| **Rebaño Ovino (Oveja)** | `Sheep.glb` | Poly by Google | **CC-BY 3.0** | Pastoreo selectivo ovino en Potrero P5. |
| **Caballo Criollo** | `Horse.glb` | Three.js / Data Arts | **CC-BY / MIT** | Pastoreo libre y descompactación en Potrero P7. |
| **Gallina de Pastoreo** | `Hen.glb` | Poly by Google | **CC-BY 3.0** | Pastoreo directo y control biológico alrededor del Egg Mobile en Potrero P8. |
| **Ánade / Pato Silvestre** | `Duck.glb` | Sony / Khronos | **CC0 (Dominio Público)** | Fauna acuática flotante animada en el tranque de 18.500 m³. |
| **Roble / Árbol Frondoso** | `OakTree.glb` | Quaternius / Poly | **CC0 (Dominio Público)** | Arbolado nativo y silvopastoreo en laderas y potreros. |
| **Pino Perimetral** | `PineTree.glb` | Quaternius | **CC0 (Dominio Público)** | Cortinas cortavientos perimetrales y franjas de infiltración. |
| **Farola de Forja Rural** | `AnisotropyBarnLamp.glb` | Khronos Group | **CC0 (Dominio Público)** | Iluminación de porche de la casa conectada al ciclo solar día/noche. |
| **Palta / Aguacate Hass** | `Avocado.glb` | Microsoft / Khronos | **CC-BY 4.0** | Visor fenológico interactivo 3D en el panel de cuarteles frutales. |

### ¿Qué significan estas licencias para tu proyecto?
1. **CC0 (Dominio Público):** Puedes hacer lo que quieras con el modelo: usarlo en tu software, modificarlo, venderlo o distribuirlo sin pagar regalías ni pedir permisos.
2. **CC-BY 3.0 / 4.0 (Creative Commons Atribución):** Es legal para fines comerciales y personales. El único requisito legal es incluir una mención al autor en los créditos de la aplicación (como la tabla anterior).
3. **Marcas Registradas:** Los modelos seleccionados son **"unbranded"** (vehículos y edificaciones rurales genéricas sin logotipos comerciales protegidos), garantizando total libertad de explotación comercial e institucional.

---

## 🚀 Fuentes Recomendadas para Descargar Más Modelos Legales y Gratuitos

1. **[Poly Haven](https://polyhaven.com/models) (100% CC0 - Dominio Público):**
   * Herramientas agrícolas, barriles, carretas, vallas, rocas y accesorios rústicos en ultra-alta resolución PBR.
2. **[Kenney.nl](https://kenney.nl/assets) (100% CC0 - Dominio Público):**
   * *Car Kit*, *Farm Kit*, tractores, cosechadoras, camiones ligeros y edificios modulares. Extremadamente ligeros y optimizados para navegadores web.
3. **[Quaternius](https://quaternius.com/) (100% CC0 - Dominio Público):**
   * Packs modulares de agricultura, edificios rurales, naturaleza y animales animados.
4. **[Sketchfab](https://sketchfab.com/feed) (Filtrar por "Downloadable" + Licencia CC-BY):**
   * La mayor comunidad del mundo. Miles de pickups, todoterrenos 4x4, fauna y maquinaria agrícola descargables directamente en `.glb`.

---

## 💻 Cómo se Carga un Modelo en el Código de AgriTwin

Para instanciar cualquiera de estos archivos dentro de cualquier módulo (`ParcelManager`, `InstancedVegetationManager`, `LivestockManager`, etc.):

```javascript
const loader = new THREE.GLTFLoader();

loader.load('assets/models/FarmHouse.glb', (gltf) => {
  const model = gltf.scene;
  
  // Posición en coordenadas del fundo (X, Y, Z) sobre el relieve DEM
  const elev = mapManager.getTerrainElevation(x, z);
  model.position.set(x, elev, z);
  model.scale.set(0.24, 0.24, 0.24);
  model.rotation.y = Math.PI / 4;
  
  // Activar sombras PBR automáticas
  model.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      mapManager.addPickable(child, entityData);
    }
  });

  scene.add(model);
});
```
