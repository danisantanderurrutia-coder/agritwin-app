/**
 * AgriTwin - Bundled Farm Datasets Fallback
 * 
 * Provides offline/file:// protocol fallback so the app works reliably without a web server.
 */

export const BUNDLED_PARCELS = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "id": "A101",
        "name": "Cuartel Norte - Cereales Extensivos (Trigo Candeal & Avena)",
        "crop": "Trigo Candeal (Triticum durum) & Avena",
        "cropType": "trigo",
        "symbol": "🌾",
        "area_ha": 3.8,
        "ndvi": 0.76,
        "soil_type": "Franco Arcilloso Rojo Profundo",
        "irrigation_type": "Secano con Riego Suplementario",
        "status": "Óptimo",
        "zone": "Zona 3 - Cereales & Cobertura"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [-122.0836, 37.3888],
            [-122.0812, 37.3888],
            [-122.0812, 37.3872],
            [-122.0836, 37.3872],
            [-122.0836, 37.3888]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "A102",
        "name": "Pradera Regenerativa & Pastoreo Ovino",
        "crop": "Pradera Polifítica (Trébol, Ballica & Alfalfa) & Pastoreo Racional",
        "cropType": "pradera",
        "symbol": "🌱",
        "area_ha": 2.2,
        "ndvi": 0.78,
        "soil_type": "Franco con Estructura Estable",
        "irrigation_type": "Secano con Riego Suplementario",
        "status": "Óptimo",
        "zone": "Zona 4 - Pastoreo & Forraje"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [-122.0858, 37.3888],
            [-122.0838, 37.3888],
            [-122.0838, 37.3874],
            [-122.0858, 37.3874],
            [-122.0858, 37.3888]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "A103",
        "name": "Tranque Predial Australiano & Reserva Hídrica (HDPE)",
        "crop": "Embalse de Acumulación 18.000 m³ con Boya IoT",
        "cropType": "tranque",
        "symbol": "💧",
        "area_ha": 1.6,
        "ndvi": 0.22,
        "soil_type": "Cuenca Excavada con Geomembrana 1.5mm",
        "irrigation_type": "Matriz Principal de Presurización",
        "status": "Óptimo",
        "zone": "Zona 5 - Seguridad Hídrica"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [-122.0810, 37.3888],
            [-122.0792, 37.3888],
            [-122.0792, 37.3872],
            [-122.0810, 37.3872],
            [-122.0810, 37.3888]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "A104",
        "name": "Biofábrica, Vivero Bioclimático & Compost Bokashi",
        "crop": "Microorganismos Nativos de Montaña & Biopreparados",
        "cropType": "biofabrica",
        "symbol": "🔬",
        "area_ha": 0.8,
        "ndvi": 0.88,
        "soil_type": "Suelo Vivo Enmendado con Compost Termófilo",
        "irrigation_type": "Nebulización & Microaspersión",
        "status": "Óptimo",
        "zone": "Zona 1 - Núcleo de Regeneración"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [-122.0836, 37.3870],
            [-122.0820, 37.3870],
            [-122.0820, 37.3862],
            [-122.0836, 37.3862],
            [-122.0836, 37.3870]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "B101",
        "name": "Cuartel Viñedos Patrimoniales del Maule (País & Carignan)",
        "crop": "Vitis vinifera (Cepa País Centenaria & Carignan Secano)",
        "cropType": "vinedo",
        "symbol": "🍇",
        "area_ha": 2.8,
        "ndvi": 0.79,
        "soil_type": "Granítico Meteorizado con Cuarzo",
        "irrigation_type": "Doble Línea de Goteo Subsuperficial",
        "status": "Óptimo",
        "zone": "Zona 2 - Vitivinicultura de Precisión"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [-122.0818, 37.3860],
            [-122.0792, 37.3860],
            [-122.0792, 37.3846],
            [-122.0818, 37.3846],
            [-122.0818, 37.3860]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "B102",
        "name": "Cuartel Cerezos de Exportación (Lapins & Santina)",
        "crop": "Prunus avium (Cerezos con Cobertura y Anti-Heladas)",
        "cropType": "cerezos",
        "symbol": "🍒",
        "area_ha": 3.1,
        "ndvi": 0.84,
        "soil_type": "Franco Aluvial Profundo Bien Drenado",
        "irrigation_type": "Microaspersión Antiheladas + Goteo",
        "status": "Óptimo",
        "zone": "Zona 2 - Fruticultura de Alta Rentabilidad"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [-122.0818, 37.3844],
            [-122.0792, 37.3844],
            [-122.0792, 37.3830],
            [-122.0818, 37.3830],
            [-122.0818, 37.3844]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "B103",
        "name": "Monte Frutal de Olivos de Secano (Olea europaea)",
        "crop": "Olivos Frantoio & Arbequina (Aceite Extra Virgen)",
        "cropType": "olivos",
        "symbol": "🫒",
        "area_ha": 1.8,
        "ndvi": 0.72,
        "soil_type": "Pedregoso con Grava Fluvial",
        "irrigation_type": "Déficit Hídrico Controlado (RDI)",
        "status": "Óptimo",
        "zone": "Zona 2 - Especies Resilientes"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [-122.0838, 37.3844],
            [-122.0820, 37.3844],
            [-122.0820, 37.3830],
            [-122.0838, 37.3830],
            [-122.0838, 37.3844]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "B104",
        "name": "Pradera Regenerativa Polifítica & Fijación de Nitrógeno",
        "crop": "Alfalfa (Medicago sativa), Trébol Subterráneo & Festuca",
        "cropType": "pradera",
        "symbol": "🌱",
        "area_ha": 1.4,
        "ndvi": 0.86,
        "soil_type": "Franco Orgánico Enrichido",
        "irrigation_type": "Aspersión Sectorizada",
        "status": "Óptimo",
        "zone": "Zona 1 - Suelo Vivo & Pastoreo Rotacional"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [-122.0836, 37.3860],
            [-122.0820, 37.3860],
            [-122.0820, 37.3846],
            [-122.0836, 37.3846],
            [-122.0836, 37.3860]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "C101",
        "name": "Huerto Agroecológico de Avellanos Europeos & Nogales",
        "crop": "Corylus avellana (Barcelona) & Juglans regia (Chandler)",
        "cropType": "frutales",
        "symbol": "🌰",
        "area_ha": 2.4,
        "ndvi": 0.83,
        "soil_type": "Limoso Aluvial Ribereño Húmedo",
        "irrigation_type": "Microaspersión Bajo Copa",
        "status": "Óptimo",
        "zone": "Zona 2 - Agroforestería Frutal"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [-122.0864, 37.3868],
            [-122.0840, 37.3868],
            [-122.0840, 37.3854],
            [-122.0864, 37.3854],
            [-122.0864, 37.3868]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "C102",
        "name": "Módulo de Cultivo de Hongos Shiitake en Troncos",
        "crop": "Lentinula edodes en Troncos Inoculados de Roble",
        "cropType": "shiitake",
        "symbol": "🍄",
        "area_ha": 0.9,
        "ndvi": 0.91,
        "soil_type": "Mantillo Húmedo con Capa de Hojarasca",
        "irrigation_type": "Nebulización Fina por Microclima",
        "status": "Óptimo",
        "zone": "Zona 2 - Micología Aplicada"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [-122.0864, 37.3852],
            [-122.0844, 37.3852],
            [-122.0844, 37.3842],
            [-122.0864, 37.3842],
            [-122.0864, 37.3852]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "C103",
        "name": "Corredor Ribereño Nativo & Amortiguación Fluvial (Estero Colliguay)",
        "crop": "Quillay (Quillaja), Boldo, Maitén, Sauce Chileno & Maqui",
        "cropType": "nativo",
        "symbol": "🌳",
        "area_ha": 2.2,
        "ndvi": 0.94,
        "soil_type": "Ripario Aluvial de Alta Infiltración",
        "irrigation_type": "Régimen Fluvial Natural / Napa Freática",
        "status": "Óptimo",
        "zone": "Zona 4 - Corredor Biológico & Mitigación Inundación"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [-122.0866, 37.3840],
            [-122.0838, 37.3840],
            [-122.0838, 37.3826],
            [-122.0866, 37.3826],
            [-122.0866, 37.3840]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "D101",
        "name": "Cuartel Forestal & Faja Cortafuego Silvopastoril",
        "crop": "Pino radiata & Eucalyptus manejado con faja limpia CONAF",
        "cropType": "forestal",
        "symbol": "🌲",
        "area_ha": 4.6,
        "ndvi": 0.71,
        "soil_type": "Secano Costero / Transición Andina",
        "irrigation_type": "Lluvia Estacional / Desbroce Preventivo",
        "status": "Precaución",
        "zone": "Zona 4 - Barrera Cortafuego Predial"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [-122.0790, 37.3888],
            [-122.0770, 37.3888],
            [-122.0770, 37.3830],
            [-122.0790, 37.3830],
            [-122.0790, 37.3888]
          ]
        ]
      }
    }
  ]
}
;

export const BUNDLED_ENTITIES = {
  "house": {
    "id": "house_main",
    "name": "Casa Principal - Predio Meniels",
    "location": {
      "longitude": -122.0838,
      "latitude": 37.3858,
      "altitude": 0.5
    },
    "details": {
      "propertyName": "Meniels",
      "locationRegion": "Parral, Región del Maule, Chile",
      "coordinatesLabel": "36.14°S, 71.82°O",
      "houseSizeM2": 180,
      "occupants": 4,
      "solarPanels": {
        "model": "Mono-PERC 550W Tier 1 Bifacial",
        "quantity": 18,
        "capacityKwp": 9.9,
        "monthlyGenKwh": 1380
      },
      "heating": {
        "type": "Estufa Bosca Doble Cámara (Combustión Lenta)",
        "model": "Bosca Limit 380",
        "capacityKw": 12,
        "woodSeasonM3": 4.5
      },
      "metabolism": {
        "dailyKcalTotal": 8000,
        "monthlyKcalTotal": 240000,
        "monthlyPowerKwh": 320,
        "dailyWaterLiters": 600,
        "monthlyWaterM3": 18,
        "annualRainHarvestLiters": 240000
      }
    }
  },
  "sensors": [
    {
      "id": "IOT-SN-01",
      "name": "Sonda FDR Multinivel Suelo Trigo Candeal",
      "hardware": "ESP32-S3 + Sonda FDR 4 Niveles (20, 40, 60, 100 cm)",
      "protocol": "LoRaWAN EU868",
      "location": {
        "longitude": -122.0825,
        "latitude": 37.3880,
        "altitude": 15.0
      },
      "telemetry": {
        "soilMoisture": 38.5,
        "temperature": 23.8,
        "humidity": 56.0,
        "batteryLevel": 96.0,
        "status": "optimal"
      },
      "history": [
        { "time": "08:00", "moisture": 41.2, "temperature": 18.5 },
        { "time": "09:00", "moisture": 39.8, "temperature": 21.0 },
        { "time": "10:00", "moisture": 38.5, "temperature": 23.8 }
      ]
    },
    {
      "id": "IOT-SN-02",
      "name": "Sonda FDR Suelo Biofábrica & Vivero Bokashi",
      "hardware": "ESP32-WROOM-32U + Sensor TDR Suelo Vivo",
      "protocol": "MQTT / TLS",
      "location": {
        "longitude": -122.0828,
        "latitude": 37.3866,
        "altitude": 15.0
      },
      "telemetry": {
        "soilMoisture": 45.8,
        "temperature": 24.2,
        "humidity": 68.0,
        "batteryLevel": 92.0,
        "status": "optimal"
      },
      "history": [
        { "time": "08:00", "moisture": 48.0, "temperature": 19.2 },
        { "time": "09:00", "moisture": 46.9, "temperature": 21.8 },
        { "time": "10:00", "moisture": 45.8, "temperature": 24.2 }
      ]
    },
    {
      "id": "IOT-SN-03",
      "name": "Sonda Suelo Cuartel Cerezos Lapins (Antiheladas)",
      "hardware": "ESP32-S3 LoRaWAN + Termometría Subterránea",
      "protocol": "LoRaWAN US915",
      "location": {
        "longitude": -122.0805,
        "latitude": 37.3837,
        "altitude": 15.0
      },
      "telemetry": {
        "soilMoisture": 36.4,
        "temperature": 22.4,
        "humidity": 60.5,
        "batteryLevel": 94.0,
        "status": "optimal"
      },
      "history": [
        { "time": "08:00", "moisture": 39.0, "temperature": 17.5 },
        { "time": "09:00", "moisture": 37.6, "temperature": 20.1 },
        { "time": "10:00", "moisture": 36.4, "temperature": 22.4 }
      ]
    },
    {
      "id": "IOT-SN-04",
      "name": "Sonda Suelo Viñedos Cepa País & Carignan",
      "hardware": "LoRaWAN Sonda Capacitiva Multi-Estrato",
      "protocol": "LoRaWAN AU915",
      "location": {
        "longitude": -122.0805,
        "latitude": 37.3853,
        "altitude": 15.0
      },
      "telemetry": {
        "soilMoisture": 32.1,
        "temperature": 25.1,
        "humidity": 52.0,
        "batteryLevel": 97.0,
        "status": "optimal"
      },
      "history": [
        { "time": "08:00", "moisture": 34.5, "temperature": 19.8 },
        { "time": "09:00", "moisture": 33.2, "temperature": 22.5 },
        { "time": "10:00", "moisture": 32.1, "temperature": 25.1 }
      ]
    },
    {
      "id": "IOT-SN-05",
      "name": "Sonda Suelo Monte Olivos de Secano",
      "hardware": "ESP32-C3 Ultra Low Power",
      "protocol": "LoRaWAN US915",
      "location": {
        "longitude": -122.0829,
        "latitude": 37.3837,
        "altitude": 15.0
      },
      "telemetry": {
        "soilMoisture": 27.8,
        "temperature": 25.9,
        "humidity": 49.0,
        "batteryLevel": 95.0,
        "status": "optimal"
      },
      "history": [
        { "time": "08:00", "moisture": 30.1, "temperature": 20.4 },
        { "time": "09:00", "moisture": 28.9, "temperature": 23.2 },
        { "time": "10:00", "moisture": 27.8, "temperature": 25.9 }
      ]
    },
    {
      "id": "IOT-SN-06",
      "name": "Sonda Suelo Pradera Regenerativa Polifítica",
      "hardware": "ESP32-S3 + Electrodo Nitratos & Humedad",
      "protocol": "LoRaWAN EU868",
      "location": {
        "longitude": -122.0828,
        "latitude": 37.3853,
        "altitude": 15.0
      },
      "telemetry": {
        "soilMoisture": 42.0,
        "temperature": 23.0,
        "humidity": 62.0,
        "batteryLevel": 98.0,
        "status": "optimal"
      },
      "history": [
        { "time": "08:00", "moisture": 44.5, "temperature": 18.2 },
        { "time": "09:00", "moisture": 43.1, "temperature": 20.8 },
        { "time": "10:00", "moisture": 42.0, "temperature": 23.0 }
      ]
    },
    {
      "id": "IOT-DENDRO-01",
      "name": "Dendrómetro IoT Micrométrico de Tronco (Cerezo Lapins)",
      "hardware": "Dendrómetro de Precisión Ecomatik LVDT 1 µm + LoRaWAN",
      "protocol": "LoRaWAN US915",
      "location": {
        "longitude": -122.0800,
        "latitude": 37.3838,
        "altitude": 16.0
      },
      "telemetry": {
        "soilMoisture": 35.8,
        "trunkContractionMicrons": 24.5,
        "temperature": 22.8,
        "humidity": 58.0,
        "batteryLevel": 99.0,
        "status": "optimal"
      },
      "history": [
        { "time": "08:00", "moisture": 38.0, "temperature": 17.8 },
        { "time": "09:00", "moisture": 36.9, "temperature": 20.5 },
        { "time": "10:00", "moisture": 35.8, "temperature": 22.8 }
      ]
    },
    {
      "id": "IOT-DENDRO-02",
      "name": "Dendrómetro IoT de Tallo (Vid Cepa País)",
      "hardware": "Micro-dendrómetro de sarmiento LVDT + ESP32 LoRa",
      "protocol": "LoRaWAN AU915",
      "location": {
        "longitude": -122.0800,
        "latitude": 37.3852,
        "altitude": 16.0
      },
      "telemetry": {
        "soilMoisture": 31.9,
        "trunkContractionMicrons": 18.2,
        "temperature": 24.9,
        "humidity": 53.0,
        "batteryLevel": 96.0,
        "status": "optimal"
      },
      "history": [
        { "time": "08:00", "moisture": 34.0, "temperature": 19.5 },
        { "time": "09:00", "moisture": 32.8, "temperature": 22.3 },
        { "time": "10:00", "moisture": 31.9, "temperature": 24.9 }
      ]
    },
    {
      "id": "IOT-PEST-01",
      "name": "Trampa Inteligente LoRaWAN Lobesia botrana (Polilla de la Vid)",
      "hardware": "Trampa Delta Automatizada con Cámara RGB & Feromona",
      "protocol": "LoRaWAN AU915",
      "location": {
        "longitude": -122.0812,
        "latitude": 37.3855,
        "altitude": 16.0
      },
      "telemetry": {
        "soilMoisture": 33.0,
        "capturasDiarias": 2,
        "temperaturaMedia": 23.5,
        "batteryLevel": 93.0,
        "status": "optimal"
      },
      "history": [
        { "time": "08:00", "moisture": 35.0, "temperature": 18.0 },
        { "time": "09:00", "moisture": 34.0, "temperature": 21.0 },
        { "time": "10:00", "moisture": 33.0, "temperature": 23.5 }
      ]
    },
    {
      "id": "IOT-RIVER-01",
      "name": "Limnígrafo Ultrasónico Fluvial (Estero Colliguay)",
      "hardware": "Sensor Ultrasónico de Nivel Hidráulico MaxBotix + ESP32 LoRa",
      "protocol": "LoRaWAN US915",
      "location": {
        "longitude": -122.0855,
        "latitude": 37.3833,
        "altitude": 14.0
      },
      "telemetry": {
        "soilMoisture": 58.4,
        "waterLevelMeters": 0.85,
        "flowRateM3s": 1.42,
        "floodRisk": "Bajo (Caudal Estable)",
        "temperature": 18.2,
        "batteryLevel": 98.0,
        "status": "optimal"
      },
      "history": [
        { "time": "08:00", "moisture": 62.0, "temperature": 15.0 },
        { "time": "09:00", "moisture": 60.1, "temperature": 16.8 },
        { "time": "10:00", "moisture": 58.4, "temperature": 18.2 }
      ]
    },
    {
      "id": "IOT-PIEZO-01",
      "name": "Sonda Piezométrica de Napa Freática (Acuífero Perquilauquén)",
      "hardware": "Transductor Piezoresistivo Subterráneo 0-30m + 4G LTE-M",
      "protocol": "MQTT / TLS",
      "location": {
        "longitude": -122.0845,
        "latitude": 37.3848,
        "altitude": 14.0
      },
      "telemetry": {
        "soilMoisture": 51.0,
        "groundwaterDepthMeters": -8.4,
        "aquiferRecargaPct": 68.0,
        "waterTemperature": 15.6,
        "batteryLevel": 97.0,
        "status": "warning"
      },
      "history": [
        { "time": "08:00", "moisture": 53.0, "temperature": 15.4 },
        { "time": "09:00", "moisture": 52.0, "temperature": 15.5 },
        { "time": "10:00", "moisture": 51.0, "temperature": 15.6 }
      ]
    },
    {
      "id": "IOT-BOYA-01",
      "name": "Boya Flotante IoT de Calidad de Agua (Tranque Australiano)",
      "hardware": "Boya Marina Mini Solar + Sondas Multiparámetro (OD, pH, CE)",
      "protocol": "LoRaWAN EU868",
      "location": {
        "longitude": -122.0801,
        "latitude": 37.3880,
        "altitude": 15.0
      },
      "telemetry": {
        "soilMoisture": 100.0,
        "waterTempC": 19.4,
        "dissolvedOxygenPpm": 7.8,
        "evaporationRateMmDay": 4.6,
        "batteryLevel": 99.0,
        "status": "optimal"
      },
      "history": [
        { "time": "08:00", "moisture": 100.0, "temperature": 16.5 },
        { "time": "09:00", "moisture": 100.0, "temperature": 18.0 },
        { "time": "10:00", "moisture": 100.0, "temperature": 19.4 }
      ]
    },
    {
      "id": "IOT-SOLAR-01",
      "name": "Piranómetro & Sensor PAR (Parque Agrovoltaico)",
      "hardware": "Kipp & Zonen CMP3 + Sensor Quantum PAR LI-COR + LoRa",
      "protocol": "Modbus RS485 / LoRaWAN",
      "location": {
        "longitude": -122.0848,
        "latitude": 37.3881,
        "altitude": 18.0
      },
      "telemetry": {
        "soilMoisture": 36.0,
        "solarIrradianceWm2": 860.0,
        "parUmols": 1720.0,
        "pvDailyYieldKwh": 485.0,
        "temperature": 25.2,
        "batteryLevel": 100.0,
        "status": "optimal"
      },
      "history": [
        { "time": "08:00", "moisture": 38.0, "temperature": 19.0 },
        { "time": "09:00", "moisture": 37.1, "temperature": 22.4 },
        { "time": "10:00", "moisture": 36.0, "temperature": 25.2 }
      ]
    },
    {
      "id": "IOT-WX-01",
      "name": "Estación Meteorológica Central de Microzona (Meniels)",
      "hardware": "Torre Agrometeorológica Automática Grado OMM + Cell LTE-M / LoRa Gateway",
      "protocol": "HTTP REST / TLS (Red Compartida Microzona)",
      "location": {
        "longitude": -122.0838,
        "latitude": 37.3858,
        "altitude": 20.0
      },
      "categoryMaule": "microclimate_station",
      "priority": "Critica",
      "telemetry": {
        "soilMoisture": 31.4,
        "temperature": 18.5,
        "shelterTemp2mC": 18.5,
        "humidity": 68.0,
        "atmosphericPressureHpa": 1014.2,
        "solarRadiationWm2": 890.0,
        "rainAccumMm": 0.0,
        "et0PenmanMonteith": 4.2,
        "coldHoursAccumulated": 745,
        "degreeDaysAccumulated": 390,
        "batteryLevel": 98.0,
        "status": "optimal",
        "sprayWindow": {
          "status": "active",
          "windowToday": "07:30 - 10:45 h",
          "windCondition": "5.2 km/h ENE (Calmo / Sin Deriva)",
          "recommendation": "Franja ideal para aplicación de fitosanitarios. Suspender al mediodía por ráfagas de viento Puelche > 20 km/h."
        },
        "cherryCrackingRisk": {
          "riskLevel": "Medio (72h)",
          "rainForecast48hMm": 14.5,
          "recommendation": "Probabilidad de lluvia en cosecha: evaluar aplicación preventiva de protector cuticular o coordinar cuadrilla de adelanto de cosecha en cuartel Lapins."
        }
      },
      "history": [
        { "time": "08:00", "moisture": 35.0, "temperature": 14.0 },
        { "time": "09:00", "moisture": 33.2, "temperature": 16.5 },
        { "time": "10:00", "moisture": 31.4, "temperature": 18.5 }
      ]
    },
    {
      "id": "IOT-WIND-01",
      "name": "Anemómetro Ultrasónico 3D & Veleta (Viento Puelche)",
      "hardware": "Gill WindSonic 3D + Davis Anemometer + ESP32-S3 LoRa",
      "protocol": "LoRaWAN AU915",
      "location": {
        "longitude": -122.0845,
        "latitude": 37.3876,
        "altitude": 22.0
      },
      "categoryMaule": "wind_drift",
      "priority": "Alta",
      "telemetry": {
        "soilMoisture": 28.0,
        "temperature": 19.8,
        "humidity": 45.0,
        "windSpeedKmH": 8.4,
        "windDirectionDeg": 75,
        "windDirectionText": "ENE (Precordillera Andina)",
        "gustSpeedKmH": 14.2,
        "fwiIndex": 24.5,
        "spraySuitability": "Apto (Viento bajo umbral de deriva 12 km/h)",
        "batteryLevel": 99.0,
        "status": "optimal"
      },
      "history": [
        { "time": "08:00", "moisture": 30.0, "temperature": 15.0, "windSpeed": 4.5 },
        { "time": "09:00", "moisture": 29.1, "temperature": 17.5, "windSpeed": 6.8 },
        { "time": "10:00", "moisture": 28.0, "temperature": 19.8, "windSpeed": 8.4 }
      ]
    },
    {
      "id": "IOT-FROST-01",
      "name": "Sensor de Helada a Altura de Fruta - Cuartel Cerezo Lapins (Hondonada Fría)",
      "hardware": "Nodo LoRaWAN Ultra-Low-Power (ESP32-C3) + SHT45 Termo-higrómetro a 1.2 m",
      "protocol": "LoRaWAN AU915",
      "location": {
        "longitude": -122.0818,
        "latitude": 37.3832,
        "altitude": 13.5
      },
      "categoryMaule": "frost_fruit_height",
      "priority": "Critica",
      "telemetry": {
        "soilMoisture": 36.5,
        "fruitHeightTempC": -0.8,
        "temperature": -0.8,
        "shelterTemp2mC": 2.4,
        "deltaHeightShelterC": -3.2,
        "wetBulbTempC": -1.5,
        "dewPointC": -2.1,
        "windSpeedKmH": 1.8,
        "frostType": "Radiativa (Inversión Térmica en Cuenca)",
        "batteryLevel": 97.0,
        "status": "critical",
        "decision": {
          "code": "ALERTA_HELADA_BULBO_BAJO",
          "actionNeeded": "NO RIEGO ANTIHELADA / ACTIVAR CALEFACCIÓN O VENTILADORES",
          "summary": "-0.8°C a flor/fruta (abrigo marca 2.4°C engañosa). Bulbo húmedo es -1.5°C: aplicar agua provocaría evaporación y enfriamiento letal. Evitar aspersión hasta que bulbo húmedo supere -0.5°C.",
          "phenology": "Floración temprana (Umbral letal 10%: -1.1°C)",
          "lossRiskCLP": 14500000
        }
      },
      "history": [
        { "time": "04:00", "moisture": 37.0, "fruitHeightTemp": 1.2, "temperature": 1.2 },
        { "time": "05:00", "moisture": 36.8, "fruitHeightTemp": 0.1, "temperature": 0.1 },
        { "time": "06:00", "moisture": 36.5, "fruitHeightTemp": -0.8, "temperature": -0.8 }
      ]
    },
    {
      "id": "IOT-FROST-02",
      "name": "Sensor de Helada a Altura de Fruta - Viñedo Cepa País (Ladera Media)",
      "hardware": "Nodo LoRaWAN Ultra-Low-Power + SHT45 a 1.0 m",
      "protocol": "LoRaWAN AU915",
      "location": {
        "longitude": -122.0808,
        "latitude": 37.3846,
        "altitude": 15.2
      },
      "categoryMaule": "frost_fruit_height",
      "priority": "Critica",
      "telemetry": {
        "soilMoisture": 32.8,
        "fruitHeightTempC": 1.4,
        "temperature": 1.4,
        "shelterTemp2mC": 3.0,
        "deltaHeightShelterC": -1.6,
        "wetBulbTempC": 0.5,
        "dewPointC": -0.2,
        "windSpeedKmH": 3.2,
        "frostType": "Flujo de Ladera (Sin acumulación crítica)",
        "batteryLevel": 98.0,
        "status": "warning",
        "decision": {
          "code": "PREVENTIVO_LADERA",
          "actionNeeded": "MONITOREO AUTOMÁTICO",
          "summary": "1.4°C a nivel de yemas de vid. El drenaje de aire frío corre hacia la hondonada del cuartel cerezo.",
          "phenology": "Brotación activa",
          "lossRiskCLP": 0
        }
      },
      "history": [
        { "time": "04:00", "moisture": 33.5, "fruitHeightTemp": 2.8, "temperature": 2.8 },
        { "time": "05:00", "moisture": 33.0, "fruitHeightTemp": 2.0, "temperature": 2.0 },
        { "time": "06:00", "moisture": 32.8, "fruitHeightTemp": 1.4, "temperature": 1.4 }
      ]
    },
    {
      "id": "IOT-LEAF-01",
      "name": "Sensor de Mojamiento Foliar & Presión Fúngica (Parrón y Arándano)",
      "hardware": "Sensor de Resistencia Foliar PHYTOS-31 + LoRaWAN",
      "protocol": "LoRaWAN AU915",
      "location": {
        "longitude": -122.0822,
        "latitude": 37.3850,
        "altitude": 15.5
      },
      "categoryMaule": "foliar_wetness",
      "priority": "Critica",
      "telemetry": {
        "soilMoisture": 41.2,
        "leafWetnessHours": 11.5,
        "leafWetnessPct": 100.0,
        "temperature": 17.2,
        "humidity": 94.0,
        "botrytisRiskIndex": 0.82,
        "venturiaRiskIndex": 0.65,
        "oidioRiskIndex": 0.40,
        "batteryLevel": 96.0,
        "status": "warning",
        "decision": {
          "code": "GATILLAR_FUNGICIDA_RIESGO_REAL",
          "actionNeeded": "APLICACIÓN DIRIGIDA DE BOTRICIDA",
          "summary": "11.5 h continuas de mojamiento a 17.2°C cumplen umbral de Mills para infección severa de Botrytis. Pasar de calendario fijo a aplicación preventiva focalizada hoy entre 16:30 y 19:00 h.",
          "estimatedSavingCLP": 380000,
          "sprayWindowOptimal": "16:30 - 19:00 h"
        }
      },
      "history": [
        { "time": "04:00", "moisture": 41.8, "wetnessHours": 7.5, "temperature": 14.5 },
        { "time": "05:00", "moisture": 41.5, "wetnessHours": 9.5, "temperature": 15.8 },
        { "time": "06:00", "moisture": 41.2, "wetnessHours": 11.5, "temperature": 17.2 }
      ]
    },
    {
      "id": "IOT-FLOW-01",
      "name": "Caudalímetro Telemétrico DGA & Control Turno de Canal (Pozo #1)",
      "hardware": "Caudalímetro Electromagnético DN100 + Modem DGA MEE 4G LTE-M",
      "protocol": "MQTT / TLS (Norma DGA Res. 1238)",
      "location": {
        "longitude": -122.0835,
        "latitude": 37.3842,
        "altitude": 14.8
      },
      "categoryMaule": "water_canal_dga",
      "priority": "Alta",
      "telemetry": {
        "soilMoisture": 35.0,
        "instantFlowLps": 24.5,
        "accumulatedVolumeM3": 18450.0,
        "pumpDailyHours": 5.8,
        "energyCostCLPDaily": 18900,
        "dgaCompliance": "Transmitido Conforme (Resolución MEE DGA)",
        "dgaBatchCode": "DGA-MEE-2026-PARRAL-0912",
        "daysToNextCanalTurn": 4,
        "requiredVolumeTurnM3": 1150.0,
        "soilWaterReserveDays": 4.2,
        "batteryLevel": 100.0,
        "status": "optimal",
        "decision": {
          "code": "GESTION_TURNO_CANAL",
          "actionNeeded": "NO PRENDER POZO / ESPERAR TURNO DE CANAL",
          "summary": "El bulbo de suelo aguanta 4.2 días. Turno de canal llega en 4 días (Martes 08:00 h). Aplicar exactamente 32 mm en el turno para recargar perfil sin gastar energía eléctrica de bombeo subterráneo.",
          "energySavingEstimatedCLP": 112000
        }
      },
      "history": [
        { "time": "08:00", "flowLps": 0.0, "totalM3": 18450.0 },
        { "time": "09:00", "flowLps": 24.5, "totalM3": 18538.0 },
        { "time": "10:00", "flowLps": 24.5, "totalM3": 18626.0 }
      ]
    }
  ],
  "trees": [
    {
      "id": "CROP-QUI-01",
      "species": "Quillaja saponaria",
      "variety": "Quillay Nativo (Corredor Ribereño)",
      "cropCategory": "Bosque Nativo / Protección Fluvial",
      "plantedYear": 2012,
      "heightMeters": 9.5,
      "canopyDiameterMeters": 6.8,
      "healthStatus": "optimal",
      "estimatedYieldKg": 0.0,
      "location": { "longitude": -122.0858, "latitude": 37.3835 }
    },
    {
      "id": "CROP-BOL-01",
      "species": "Peumus boldus",
      "variety": "Boldo Esclerófilo Nativo",
      "cropCategory": "Bosque Nativo / Medicina",
      "plantedYear": 2010,
      "heightMeters": 8.0,
      "canopyDiameterMeters": 5.4,
      "healthStatus": "optimal",
      "estimatedYieldKg": 140.0,
      "location": { "longitude": -122.0850, "latitude": 37.3832 }
    },
    {
      "id": "CROP-MAI-01",
      "species": "Maytenus boaria",
      "variety": "Maitén Andino-Ribereño",
      "cropCategory": "Bosque Nativo / Amortiguación",
      "plantedYear": 2014,
      "heightMeters": 10.2,
      "canopyDiameterMeters": 5.8,
      "healthStatus": "optimal",
      "estimatedYieldKg": 0.0,
      "location": { "longitude": -122.0844, "latitude": 37.3830 }
    },
    {
      "id": "CROP-SAU-01",
      "species": "Salix humboldtiana",
      "variety": "Sauce Chileno Fluvial",
      "cropCategory": "Bosque Nativo / Fijación de Riberas",
      "plantedYear": 2011,
      "heightMeters": 11.5,
      "canopyDiameterMeters": 7.2,
      "healthStatus": "optimal",
      "estimatedYieldKg": 0.0,
      "location": { "longitude": -122.0862, "latitude": 37.3838 }
    },
    {
      "id": "CROP-MAQ-01",
      "species": "Aristotelia chilensis",
      "variety": "Maqui Silvestre Antioxidante",
      "cropCategory": "Fruto Nativo / Superalimento",
      "plantedYear": 2017,
      "heightMeters": 3.8,
      "canopyDiameterMeters": 2.6,
      "healthStatus": "optimal",
      "estimatedYieldKg": 85.0,
      "location": { "longitude": -122.0848, "latitude": 37.3836 }
    },
    {
      "id": "CROP-AVE-01",
      "species": "Corylus avellana",
      "variety": "Avellano Europeo (Barcelona)",
      "cropCategory": "Fruto Seco de Exportación",
      "plantedYear": 2018,
      "heightMeters": 4.8,
      "canopyDiameterMeters": 3.4,
      "healthStatus": "optimal",
      "estimatedYieldKg": 620.0,
      "location": { "longitude": -122.0852, "latitude": 37.3862 }
    },
    {
      "id": "CROP-AVE-02",
      "species": "Corylus avellana",
      "variety": "Avellano Europeo (Tonda di Giffoni)",
      "cropCategory": "Fruto Seco de Exportación",
      "plantedYear": 2019,
      "heightMeters": 4.2,
      "canopyDiameterMeters": 3.0,
      "healthStatus": "optimal",
      "estimatedYieldKg": 540.0,
      "location": { "longitude": -122.0846, "latitude": 37.3860 }
    },
    {
      "id": "CROP-NOG-01",
      "species": "Juglans regia",
      "variety": "Nogal Chandler de Exportación",
      "cropCategory": "Fruto Seco de Exportación",
      "plantedYear": 2016,
      "heightMeters": 7.5,
      "canopyDiameterMeters": 6.2,
      "healthStatus": "optimal",
      "estimatedYieldKg": 820.0,
      "location": { "longitude": -122.0858, "latitude": 37.3864 }
    },
    {
      "id": "CROP-SHI-01",
      "species": "Lentinula edodes",
      "variety": "Hongo Shiitake en Troncos de Roble",
      "cropCategory": "Micología Agroecológica",
      "plantedYear": 2022,
      "heightMeters": 0.8,
      "canopyDiameterMeters": 1.4,
      "healthStatus": "optimal",
      "estimatedYieldKg": 210.0,
      "location": { "longitude": -122.0854, "latitude": 37.3847 }
    },
    {
      "id": "CROP-VIN-01",
      "species": "Vitis vinifera",
      "variety": "Cepa País Centenaria (Espaldera)",
      "cropCategory": "Vid Patrimonial del Maule",
      "plantedYear": 2015,
      "heightMeters": 1.8,
      "canopyDiameterMeters": 2.0,
      "healthStatus": "optimal",
      "estimatedYieldKg": 4200.0,
      "location": { "longitude": -122.0805, "latitude": 37.3855 }
    },
    {
      "id": "CROP-VIN-02",
      "species": "Vitis vinifera",
      "variety": "Cepa Carignan Secano Interior",
      "cropCategory": "Vid Patrimonial del Maule",
      "plantedYear": 2017,
      "heightMeters": 1.8,
      "canopyDiameterMeters": 2.0,
      "healthStatus": "optimal",
      "estimatedYieldKg": 3800.0,
      "location": { "longitude": -122.0812, "latitude": 37.3850 }
    },
    {
      "id": "CROP-CER-01",
      "species": "Prunus avium",
      "variety": "Cerezo Lapins con Microaspersión",
      "cropCategory": "Fruta Fresca Exportación",
      "plantedYear": 2019,
      "heightMeters": 3.6,
      "canopyDiameterMeters": 3.2,
      "healthStatus": "optimal",
      "estimatedYieldKg": 5600.0,
      "location": { "longitude": -122.0805, "latitude": 37.3838 }
    },
    {
      "id": "CROP-CER-02",
      "species": "Prunus avium",
      "variety": "Cerezo Santina Temprano",
      "cropCategory": "Fruta Fresca Exportación",
      "plantedYear": 2020,
      "heightMeters": 3.4,
      "canopyDiameterMeters": 2.9,
      "healthStatus": "optimal",
      "estimatedYieldKg": 4900.0,
      "location": { "longitude": -122.0812, "latitude": 37.3835 }
    },
    {
      "id": "CROP-OLI-01",
      "species": "Olea europaea",
      "variety": "Olivo Frantoio & Arbequina",
      "cropCategory": "Olivo de Resiliencia Climática",
      "plantedYear": 2017,
      "heightMeters": 4.5,
      "canopyDiameterMeters": 4.0,
      "healthStatus": "optimal",
      "estimatedYieldKg": 1850.0,
      "location": { "longitude": -122.0828, "latitude": 37.3838 }
    },
    {
      "id": "CROP-AGRI-01",
      "species": "Castanea sativa",
      "variety": "Castaño Marrón de Lyon (Agroforestería)",
      "cropCategory": "Frutales Mayores & Biomasa",
      "plantedYear": 2021,
      "heightMeters": 6.5,
      "canopyDiameterMeters": 5.0,
      "healthStatus": "optimal",
      "estimatedYieldKg": 420.0,
      "location": { "longitude": -122.0848, "latitude": 37.3882 }
    },
    {
      "id": "CROP-TRANQUE-01",
      "species": "Water Basin HDPE",
      "variety": "Embalse Australiano 18.000 m³ con Geomembrana",
      "cropCategory": "Infraestructura Hídrica",
      "plantedYear": 2021,
      "heightMeters": 2.5,
      "canopyDiameterMeters": 18.0,
      "healthStatus": "optimal",
      "estimatedYieldKg": 0.0,
      "location": { "longitude": -122.0801, "latitude": 37.3880 }
    },
    {
      "id": "CROP-BIO-01",
      "species": "Biofactory Dome",
      "variety": "Invernadero Bioclimático & Compost Bokashi",
      "cropCategory": "Biopreparados Agroecológicos",
      "plantedYear": 2022,
      "heightMeters": 4.2,
      "canopyDiameterMeters": 8.0,
      "healthStatus": "optimal",
      "estimatedYieldKg": 12000.0,
      "location": { "longitude": -122.0828, "latitude": 37.3866 }
    },
    {
      "id": "CROP-PIN-01",
      "species": "Pinus radiata",
      "variety": "Pino Insigne con Manejo Silvopastoril",
      "cropCategory": "Cortina Cortafuego Silvopastoril",
      "plantedYear": 2014,
      "heightMeters": 14.0,
      "canopyDiameterMeters": 4.8,
      "healthStatus": "optimal",
      "estimatedYieldKg": 980.0,
      "location": { "longitude": -122.0782, "latitude": 37.3860 }
    },
    {
      "id": "CROP-EUC-01",
      "species": "Eucalyptus globulus",
      "variety": "Eucaliptus Manejado con Faja Desbrozada",
      "cropCategory": "Barrera Perimetral Cortafuego",
      "plantedYear": 2015,
      "heightMeters": 16.5,
      "canopyDiameterMeters": 4.2,
      "healthStatus": "optimal",
      "estimatedYieldKg": 1250.0,
      "location": { "longitude": -122.0778, "latitude": 37.3845 }
    }
  ]
}
;
