function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

export function randomUniform(count, w, h) {
  const margin = 30;
  const points = [];
  for (let i = 0; i < count; i++) {
    points.push({ x: margin + Math.random() * (w - margin * 2), y: margin + Math.random() * (h - margin * 2) });
  }
  return points;
}

export function randomCircle(count, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(w, h) / 2 - 40;
  const points = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = r * Math.sqrt(Math.random());
    points.push({ x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius });
  }
  return points;
}

export function randomRectangleBorder(count, w, h) {
  const margin = 50;
  const left = margin;
  const right = w - margin;
  const top = margin;
  const bottom = h - margin;
  const points = [];
  for (let i = 0; i < count; i++) {
    const side = Math.floor(Math.random() * 4);
    if (side === 0) points.push({ x: left + Math.random() * (right - left), y: top });
    else if (side === 1) points.push({ x: right, y: top + Math.random() * (bottom - top) });
    else if (side === 2) points.push({ x: left + Math.random() * (right - left), y: bottom });
    else points.push({ x: left, y: top + Math.random() * (bottom - top) });
  }
  return points;
}

export function randomGaussian(count, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const sigma = Math.min(w, h) / 6;
  const points = [];
  for (let i = 0; i < count; i++) {
    const u1 = Math.random();
    const u2 = Math.random();
    const mag = Math.sqrt(-2 * Math.log(u1));
    const x = cx + mag * Math.cos(2 * Math.PI * u2) * sigma;
    const y = cy + mag * Math.sin(2 * Math.PI * u2) * sigma;
    points.push({ x: clamp(x, 15, w - 15), y: clamp(y, 15, h - 15) });
  }
  return points;
}

export function randomCluster(count, w, h, clusterCount) {
  const centers = [];
  for (let i = 0; i < clusterCount; i++) {
    centers.push({ x: 60 + Math.random() * (w - 120), y: 60 + Math.random() * (h - 120) });
  }
  const sigma = 30;
  const points = [];
  for (let i = 0; i < count; i++) {
    const center = centers[i % centers.length];
    const u1 = Math.random();
    const u2 = Math.random();
    const mag = Math.sqrt(-2 * Math.log(u1));
    const x = center.x + mag * Math.cos(2 * Math.PI * u2) * sigma;
    const y = center.y + mag * Math.sin(2 * Math.PI * u2) * sigma;
    points.push({ x: clamp(x, 10, w - 10), y: clamp(y, 10, h - 10) });
  }
  return points;
}

export function parsePointsFile(text) {
  const lines = text.split(/\r?\n/);
  const points = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const parts = trimmed.split(/[,\s]+/);
    if (parts.length < 2) continue;
    const x = parseFloat(parts[0]);
    const y = parseFloat(parts[1]);
    if (Number.isNaN(x) || Number.isNaN(y)) continue;
    points.push({ x, y });
  }
  return points;
}
