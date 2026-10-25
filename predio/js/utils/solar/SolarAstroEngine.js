/**
 * AgriTwin - Solar, Astronomical & Microclimatic Calculation Engine
 * 
 * Especializado en efemérides solares, proyección de trayectoria en el horizonte,
 * radiación GHI/DNI/DHI, estimación fotovoltaica y renderizado de cartas celestes en Canvas 2D
 * calibrado para Maule Sur / Parral (-36.14°S, -71.82°O).
 */

export class SolarAstroEngine {
  constructor(latDeg = -36.14) {
    this.latDeg = latDeg;
  }

  /**
   * Cálculos astronómicos y solares de alta precisión para Parral, Maule (Lat -36.14°S)
   */
  calculateSolarMetrics(dayOfYear, hourOfDay, latDeg = this.latDeg) {
    const declinationRad = 23.45 * Math.sin((2 * Math.PI / 365) * (dayOfYear - 81)) * (Math.PI / 180);
    const declinationDeg = declinationRad * (180 / Math.PI);
    const hourAngleRad = (hourOfDay - 12) * 15 * (Math.PI / 180);
    const latRad = latDeg * (Math.PI / 180);

    const sinElev = Math.sin(latRad) * Math.sin(declinationRad) + Math.cos(latRad) * Math.cos(declinationRad) * Math.cos(hourAngleRad);
    const elevRad = Math.asin(Math.max(-1, Math.min(1, sinElev)));
    const elevDeg = elevRad * (180 / Math.PI);

    const cosAz = (Math.sin(declinationRad) - Math.sin(latRad) * sinElev) / (Math.cos(latRad) * Math.cos(elevRad));
    const azRad = Math.atan2(Math.sin(hourAngleRad), cosAz);
    let azDeg = Math.round((azRad * (180 / Math.PI) + 360) % 360);

    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'];
    const dirIdx = Math.round(azDeg / 22.5) % 16;
    const cardinalDir = directions[dirIdx];

    // Horas luz efectivas y crepúsculo astronómico
    const cosOmegaS = -Math.tan(latRad) * Math.tan(declinationRad);
    let halfDayHours = 6;
    if (cosOmegaS >= 1) halfDayHours = 0;
    else if (cosOmegaS <= -1) halfDayHours = 12;
    else halfDayHours = Math.acos(cosOmegaS) * (180 / Math.PI) / 15;

    const daylightHours = halfDayHours * 2;
    const sunriseHour = 12 - halfDayHours;
    const sunsetHour = 12 + halfDayHours;

    const formatHour = (h) => {
      const hh = Math.floor(Math.max(0, Math.min(23, h)));
      const mm = Math.round((h - Math.floor(h)) * 60);
      return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
    };

    // Radiación Solar según modelo de cielo claro para latitud -36.14°
    const isDay = elevDeg > 0;
    let ghiInstant = 0;
    let dniInstant = 0;
    let dhiInstant = 0;

    if (isDay) {
      const sinA = Math.sin(elevRad);
      ghiInstant = Math.round(1060 * Math.pow(sinA, 1.14));
      const airMass = 1 / (sinA + 0.05);
      dniInstant = Math.round(920 * Math.pow(0.72, Math.pow(airMass, 0.678)));
      dhiInstant = Math.max(0, Math.round(ghiInstant - dniInstant * sinA));
    }

    // Radiación acumulada diaria (kWh/m²/día) & HSP para Maule Sur (mín en invierno 2.15, máx en verano 7.85)
    const seasonAngle = ((dayOfYear - 172) / 365) * 2 * Math.PI;
    const dailyGhiKwh = 5.0 - 2.85 * Math.cos(seasonAngle);
    const hsp = dailyGhiKwh;

    // Generación Fotovoltaica Fundo Meniels: 12 paneles x 550W = 6.6 kWp (Inclinación 32° Norte)
    const systemKwp = 6.6;
    const pr = 0.82; // Performance ratio 82%
    const dailyGenKwh = (systemKwp * hsp * pr);

    let instantPowerKw = 0;
    if (isDay) {
      const tiltFactor = 1.08;
      instantPowerKw = (systemKwp * (ghiInstant / 1000) * tiltFactor * pr);
      instantPowerKw = Math.min(systemKwp, Math.max(0, instantPowerKw));
    }

    const waterPumpM3 = Math.max(0, Math.round(dailyGenKwh * 1.8)); // 1.8 m³ por kWh de bombeo
    const co2SavedKg = Math.round(dailyGenKwh * 30 * 0.385); // kg CO2e al mes

    return {
      elevDeg: parseFloat(elevDeg.toFixed(1)),
      azDeg,
      cardinalDir,
      declinationDeg: parseFloat(declinationDeg.toFixed(1)),
      daylightHours: parseFloat(daylightHours.toFixed(1)),
      sunriseTime: formatHour(sunriseHour),
      sunsetTime: formatHour(sunsetHour),
      isDay,
      ghiInstant,
      dniInstant,
      dhiInstant,
      dailyGhiKwh: parseFloat(dailyGhiKwh.toFixed(1)),
      hsp: parseFloat(hsp.toFixed(1)),
      systemKwp,
      dailyGenKwh: parseFloat(dailyGenKwh.toFixed(1)),
      instantPowerKw: parseFloat(instantPowerKw.toFixed(2)),
      instantPowerPercent: Math.min(100, Math.round((instantPowerKw / systemKwp) * 100)),
      waterPumpM3,
      co2SavedKg
    };
  }

  getDayOfYearDateString(dayOfYear) {
    const d = new Date(2025, 0);
    d.setDate(dayOfYear);
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${d.getDate()} de ${months[d.getMonth()]}`;
  }

  getTodayDayOfYear() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.min(365, Math.max(1, Math.floor(diff / oneDay)));
  }

  /**
   * Dibuja el diagrama físico de la trayectoria solar sobre el horizonte en Parral (-36.14°S)
   */
  drawSunPathHorizon(canvas, dayOfYear, hourOfDay) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const padL = 38;
    const padR = 24;
    const padT = 24;
    const padB = 36;
    const plotW = width - padL - padR;
    const plotH = height - padT - padB;
    const yHorizon = padT + plotH;

    // Fondo degradado astronómico
    const skyGrad = ctx.createLinearGradient(0, padT, 0, yHorizon);
    skyGrad.addColorStop(0, 'rgba(10, 20, 40, 0.95)');
    skyGrad.addColorStop(0.7, 'rgba(15, 28, 55, 0.85)');
    skyGrad.addColorStop(1, 'rgba(25, 45, 80, 0.95)');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(padL, padT, plotW, plotH);

    // Rejilla de elevación (0°, 30°, 60°, 90°)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    [0, 30, 60, 90].forEach(deg => {
      const y = yHorizon - (deg / 90) * plotH;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(padL + plotW, y);
      ctx.stroke();

      ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
      ctx.font = '9px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText(`${deg}°`, padL - 5, y + 3);
    });

    // Rejilla de acimut y puntos cardinales
    const cardinals = [
      { deg: 0, label: 'N' },
      { deg: 45, label: 'NE' },
      { deg: 90, label: 'E' },
      { deg: 135, label: 'SE' },
      { deg: 180, label: 'S' },
      { deg: 225, label: 'SO' },
      { deg: 270, label: 'O' },
      { deg: 315, label: 'NO' },
      { deg: 360, label: 'N' }
    ];

    cardinals.forEach(c => {
      const x = padL + (c.deg / 360) * plotW;
      ctx.beginPath();
      ctx.strokeStyle = (c.label === 'N' || c.label === 'S' || c.label === 'E' || c.label === 'O')
        ? 'rgba(255, 255, 255, 0.15)'
        : 'rgba(255, 255, 255, 0.05)';
      ctx.moveTo(x, padT);
      ctx.lineTo(x, yHorizon);
      ctx.stroke();

      ctx.fillStyle = (c.label === 'N') ? '#fde047' : '#94a3b8';
      ctx.font = (c.label.length === 1) ? 'bold 10px system-ui' : '9px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(c.label, x, yHorizon + 16);
      ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
      ctx.font = '8px system-ui';
      ctx.fillText(`${c.deg}°`, x, yHorizon + 27);
    });

    // Línea de horizonte dorada
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padL, yHorizon);
    ctx.lineTo(padL + plotW, yHorizon);
    ctx.stroke();

    const drawCurve = (doy, color, lineWidth, isDashed = false) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      if (isDashed) ctx.setLineDash([4, 4]);
      else ctx.setLineDash([]);

      ctx.beginPath();
      let started = false;
      for (let h = 4.5; h <= 20.0; h += 0.1) {
        const met = this.calculateSolarMetrics(doy, h);
        if (met.elevDeg > 0) {
          const x = padL + (met.azDeg / 360) * plotW;
          const y = yHorizon - (met.elevDeg / 90) * plotH;
          if (!started) { ctx.moveTo(x, y); started = true; }
          else ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      ctx.setLineDash([]);
    };

    // Curvas estacionales de referencia
    drawCurve(355, 'rgba(251, 146, 60, 0.45)', 1.2, true); // Solsticio Verano
    drawCurve(80, 'rgba(52, 211, 153, 0.45)', 1.2, true);  // Equinoccios
    drawCurve(172, 'rgba(56, 189, 248, 0.45)', 1.2, true); // Solsticio Invierno

    // Curva del día seleccionado (gruesa y luminosa)
    drawCurve(dayOfYear, '#fbbf24', 2.4, false);

    // Marcadores de hora sobre la curva del día actual
    for (let h = 6; h <= 18; h += 2) {
      const met = this.calculateSolarMetrics(dayOfYear, h);
      if (met.elevDeg > 0) {
        const x = padL + (met.azDeg / 360) * plotW;
        const y = yHorizon - (met.elevDeg / 90) * plotH;

        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#fde047';
        ctx.font = '8.5px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(`${h}h`, x, y - 7);
      }
    }

    // Sol Actual (Posición Interactiva Dinámica)
    const currentMetrics = this.calculateSolarMetrics(dayOfYear, hourOfDay);
    const sunElev = currentMetrics.elevDeg;
    const sunAz = currentMetrics.azDeg;
    const sunX = padL + (sunAz / 360) * plotW;
    const sunY = yHorizon - (Math.max(0, sunElev) / 90) * plotH;

    if (currentMetrics.isDay) {
      // Rayo guía vertical
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.35)';
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(sunX, yHorizon);
      ctx.lineTo(sunX, sunY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Halo solar radiante
      const haloGrad = ctx.createRadialGradient(sunX, sunY, 2, sunX, sunY, 18);
      haloGrad.addColorStop(0, 'rgba(253, 224, 71, 0.95)');
      haloGrad.addColorStop(0.4, 'rgba(245, 158, 11, 0.6)');
      haloGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 18, 0, Math.PI * 2);
      ctx.fill();

      // Núcleo blanco brillante
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 5.5, 0, Math.PI * 2);
      ctx.fill();

      // Píldora de información de posición
      const pillText = `${sunElev}° Alt • ${currentMetrics.azDeg}° Az`;
      ctx.font = 'bold 9px system-ui';
      const tw = ctx.measureText(pillText).width;
      const pillY = Math.max(18, sunY - 14);

      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(sunX - tw/2 - 6, pillY - 10, tw + 12, 14, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fde047';
      ctx.textAlign = 'center';
      ctx.fillText(pillText, sunX, pillY);
    } else {
      // Indicador nocturno bajo el horizonte
      const nightY = yHorizon + 16;
      ctx.fillStyle = 'rgba(148, 163, 184, 0.85)';
      ctx.font = '10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`🌙 Bajo el horizonte (${Math.abs(sunElev)}° Noche)`, sunX, nightY);
    }
  }

  /**
   * Dibuja el climograma anual en canvas (Precipitaciones mm vs Temperatura °C)
   */
  drawClimogram(canvas, dayOfYear) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const rain = [14, 18, 25, 62, 148, 238, 215, 138, 76, 46, 26, 16];
    const temp = [21.5, 20.8, 18.2, 14.5, 11.2, 8.9, 8.4, 9.8, 12.1, 14.8, 17.5, 20.1];

    const currentMonth = Math.min(11, Math.floor(((dayOfYear - 1) / 365) * 12));

    const padLeft = 36;
    const padRight = 36;
    const padTop = 26;
    const padBottom = 30;
    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let r = 0; r <= 4; r++) {
      const y = padTop + (chartH / 4) * r;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(width - padRight, y);
      ctx.stroke();

      ctx.fillStyle = 'rgba(14, 165, 233, 0.7)';
      ctx.font = '9px system-ui';
      ctx.textAlign = 'right';
      const rainVal = Math.round(250 - (r * 250) / 4);
      ctx.fillText(`${rainVal}`, padLeft - 6, y + 3);

      ctx.fillStyle = 'rgba(249, 115, 22, 0.7)';
      ctx.textAlign = 'left';
      const tempVal = Math.round(30 - (r * 30) / 4);
      ctx.fillText(`${tempVal}°`, width - padRight + 6, y + 3);
    }

    const barWidth = (chartW / 12) * 0.58;
    for (let i = 0; i < 12; i++) {
      const x = padLeft + (i + 0.5) * (chartW / 12) - barWidth / 2;
      const barH = (rain[i] / 250) * chartH;
      const y = padTop + chartH - barH;

      const grad = ctx.createLinearGradient(0, y, 0, y + barH);
      if (i === currentMonth) {
        grad.addColorStop(0, '#38bdf8');
        grad.addColorStop(1, 'rgba(14, 165, 233, 0.4)');
      } else {
        grad.addColorStop(0, 'rgba(56, 189, 248, 0.6)');
        grad.addColorStop(1, 'rgba(14, 165, 233, 0.15)');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, barWidth, barH);

      ctx.fillStyle = (i === currentMonth) ? '#fde047' : '#94a3b8';
      ctx.font = (i === currentMonth) ? 'bold 9px system-ui' : '8.5px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(months[i], x + barWidth / 2, height - 12);
    }

    // Curva de temperatura
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    for (let i = 0; i < 12; i++) {
      const x = padLeft + (i + 0.5) * (chartW / 12);
      const y = padTop + chartH - (temp[i] / 30) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Puntos de temperatura
    for (let i = 0; i < 12; i++) {
      const x = padLeft + (i + 0.5) * (chartW / 12);
      const y = padTop + chartH - (temp[i] / 30) * chartH;

      ctx.fillStyle = (i === currentMonth) ? '#fde047' : '#0f172a';
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, (i === currentMonth) ? 5 : 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      if (i === currentMonth) {
        ctx.fillStyle = '#fde047';
        ctx.font = 'bold 9px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(`${temp[i]}°C`, x, y - 8);
      }
    }
  }

  /**
   * Dibuja la bóveda celeste austral con constelaciones principales
   */
  drawStarMap(canvas, dayOfYear, hourOfDay) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) * 0.44;

    ctx.fillStyle = '#030712';
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('S (Sur)', cx, cy + radius + 12);
    ctx.fillText('N (Norte)', cx, cy - radius - 4);
    ctx.fillText('E (Este)', cx + radius + 14, cy + 3);
    ctx.fillText('O (Oeste)', cx - radius - 14, cy + 3);

    const siderealDeg = (dayOfYear * (360 / 365) + hourOfDay * 15) % 360;
    const rot = (siderealDeg * Math.PI) / 180;

    const crux = [
      { name: 'Acrux', r: radius * 0.38, a: rot + 0.1, mag: 4.5 },
      { name: 'Mimosa', r: radius * 0.42, a: rot - 0.12, mag: 4.0 },
      { name: 'Gacrux', r: radius * 0.52, a: rot + 0.08, mag: 4.2 },
      { name: 'Imai', r: radius * 0.47, a: rot + 0.28, mag: 3.2 }
    ];

    const centaurus = [
      { name: 'Alfa Centauri', r: radius * 0.48, a: rot - 0.42, mag: 5.2 },
      { name: 'Hadar', r: radius * 0.44, a: rot - 0.28, mag: 4.4 }
    ];

    const orion = [
      { name: 'Betelgeuse', r: radius * 0.65, a: rot + Math.PI - 0.15, mag: 4.2 },
      { name: 'Rigel', r: radius * 0.68, a: rot + Math.PI + 0.2, mag: 4.5 },
      { name: 'Cinturón', r: radius * 0.62, a: rot + Math.PI + 0.02, mag: 3.5 }
    ];

    const getPos = (star) => ({
      x: cx + star.r * Math.cos(star.a),
      y: cy + star.r * Math.sin(star.a)
    });

    // Líneas de la Cruz del Sur
    const pAcrux = getPos(crux[0]);
    const pMimosa = getPos(crux[1]);
    const pGacrux = getPos(crux[2]);
    const pImai = getPos(crux[3]);

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(pAcrux.x, pAcrux.y);
    ctx.lineTo(pGacrux.x, pGacrux.y);
    ctx.moveTo(pMimosa.x, pMimosa.y);
    ctx.lineTo(pImai.x, pImai.y);
    ctx.stroke();

    // Línea de Punteros Alfa-Hadar
    const pAlfa = getPos(centaurus[0]);
    const pHadar = getPos(centaurus[1]);
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.4)';
    ctx.beginPath();
    ctx.moveTo(pAlfa.x, pAlfa.y);
    ctx.lineTo(pHadar.x, pHadar.y);
    ctx.stroke();

    // Líneas de Orión
    const p1 = getPos(orion[0]);
    const p2 = getPos(orion[1]);
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.35)';
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();

    // Renderizar todas las estrellas con brillo
    const allStars = [...crux, ...centaurus, ...orion];
    allStars.forEach(s => {
      const pos = getPos(s);
      const glow = ctx.createRadialGradient(pos.x, pos.y, 1, pos.x, pos.y, s.mag * 2.2);
      glow.addColorStop(0, '#ffffff');
      glow.addColorStop(0.5, 'rgba(56, 189, 248, 0.8)');
      glow.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, s.mag * 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, s.mag * 0.6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = '8px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(s.name, pos.x + 6, pos.y + 3);
    });

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('✨ Cruz del Sur', pAcrux.x, pAcrux.y + 14);
    ctx.fillText('✨ Punteros', pAlfa.x, pAlfa.y + 14);
    ctx.fillText('✨ Orión', p2.x, p2.y - 10);
  }
}

export const solarAstroEngine = new SolarAstroEngine();
