import { cross, dist2, dedupePoints } from './geometry.js';

export function jarvisMarch(inputPoints, steps) {
  const points = dedupePoints(inputPoints);
  if (points.length < 3) return points.slice();

  let start = points[0];
  for (const p of points) {
    if (p.x < start.x || (p.x === start.x && p.y < start.y)) start = p;
  }
  steps.push({ type: 'start', point: start });

  const hull = [start];
  let current = start;

  do {
    let next = current === points[0] ? points[1] : points[0];
    for (const candidate of points) {
      if (candidate === current || candidate === next) continue;
      steps.push({ type: 'compare', current, candidate, best: next });
      const o = cross(current, next, candidate);
      if (o < 0 || (o === 0 && dist2(current, candidate) > dist2(current, next))) next = candidate;
    }
    steps.push({ type: 'select', current, next, hull: hull.slice() });
    current = next;
    if (current !== start) hull.push(current);
  } while (current !== start && hull.length <= points.length);

  steps.push({ type: 'done', hull: hull.slice() });
  return hull;
}