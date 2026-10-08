# 📦 Biblioteca Local de Modelos 3D (.GLB) - AgriTwin

Esta carpeta contiene modelos tridimensionales en formato binario **glTF 2.0 (`.glb`)** listos para ser renderizados directamente por el motor gráfico Three.js de AgriTwin.

---

## ⚖️ Marco Legal y Licencias (Uso 100% Legal y Seguro)

Todos los modelos aquí incluidos provienen de repositorios abiertos oficiales y se rigen bajo licencias internacionales estándar de código abierto:

| Modelo | Archivo | Origen / Autor | Licencia | Permisos de Uso |
| :--- | :--- | :--- | :--- | :--- |
| **Camión Cisterna Rural** | `CesiumMilkTruck.glb` | Khronos Group / Cesium | **CC-BY 4.0** | Libre para uso comercial, personal y modificación con atribución. |
| **Caballo Criollo / Equino** | `Horse.glb` | Three.js / Google Data Arts | **CC-BY / MIT** | Libre para uso comercial, personal y animación. |
| **Farola de Galpón Rural** | `AnisotropyBarnLamp.glb` | Khronos Group (PBR Next) | **CC0 (Dominio Público)** | Libre sin restricciones, sin necesidad de atribución. |
| **Ánade / Pato de Tranque** | `Duck.glb` | Sony / Khronos Group | **CC0 (Dominio Público)** | Libre sin restricciones. |
| **Palta / Aguacate Hass** | `Avocado.glb` | Microsoft / Khronos Group | **CC-BY 4.0** | Libre para proyectos agrícolas y demostraciones. |

### ¿Qué significan estas licencias para tu proyecto?
1. **CC0 (Dominio Público):** Puedes hacer lo que quieras con el modelo: usarlo en tu software, modificarlo, venderlo o distribuirlo sin pagar regalías ni pedir permisos.
2. **CC-BY 4.0 (Creative Commons Atribución):** Es legal para fines comerciales y personales. El único requisito legal es incluir una mención al autor en los créditos de la aplicación (como la tabla anterior).
3. **Marcas Registradas:** Si en el futuro descargas vehículos que tengan marcas comerciales protegidas (ej. logotipos oficiales de *John Deere*, *Toyota* o *Cat*), para uso comercial público se recomienda usar modelos **"unbranded"** (vehículos genéricos sin logotipos comerciales) o modelos bajo CC0/CC-BY para evitar conflictos de propiedad industrial.

---

## 🚀 Fuentes Recomendadas para Descargar Más Modelos Legales y Gratuitos

Si deseas agregar más modelos a esta biblioteca, estas son las mejores fuentes de dominio público y licencias abiertas:

1. **[Poly Haven](https://polyhaven.com/models) (100% CC0 - Dominio Público):**
   * Herramientas agrícolas, barriles, carretas, vallas, rocas y accesorios rústicos en ultra-alta resolución PBR.
2. **[Kenney.nl](https://kenney.nl/assets) (100% CC0 - Dominio Público):**
   * *Car Kit*, *Farm Kit*, tractores, cosechadoras, camiones ligeros y edificios modulares. Extremadamente ligeros y optimizados para navegadores web.
3. **[Sketchfab](https://sketchfab.com/feed) (Filtrar por "Downloadable" + Licencia CC-BY):**
   * La mayor comunidad del mundo. Miles de pickups, todoterrenos 4x4, fauna y maquinaria agrícola descargables directamente en `.glb`.
4. **[Quixel Megascans / Fab](https://fab.com):**
   * Fotogrametría escaneada del mundo real para vegetación y terrenos.

---

## 💻 Cómo se Carga un Modelo en el Código de AgriTwin

Para instanciar cualquiera de estos archivos dentro de cualquier módulo (`ParcelManager`, `InstancedVegetationManager`, `LivestockManager`, etc.):

```javascript
import { GLTFLoader } from '...'; // o new THREE.GLTFLoader() si está en el contexto global

const loader = new THREE.GLTFLoader();

loader.load('assets/models/CesiumMilkTruck.glb', (gltf) => {
  const model = gltf.scene;
  
  // Posición en coordenadas del fundo (X, Y, Z)
  model.position.set(-6.5, 0.45, -2.5);
  model.scale.set(0.65, 0.65, 0.65);
  model.rotation.y = Math.PI / 4;
  
  // Activar sombras PBR automáticas
  model.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  scene.add(model);
});
```
