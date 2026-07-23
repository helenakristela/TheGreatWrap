export function cross(o, a, b) {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

export function dist2(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

export function dedupePoints(points) {
  const seen = new Set();
  const result = [];
  for (const p of points) {
    const key = Math.round(p.x) + ',' + Math.round(p.y);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(p);
  }
  return result;
}