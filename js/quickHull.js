import { cross, dedupePoints } from './geometry.js';

function findHullSide(points, a, b, steps) {
  let farthest = null;
  let maxDist = 0;
  for (const p of points) {
    const d = cross(a, b, p);
    if (d > maxDist) {
      maxDist = d;
      farthest = p;
    }
  }
  if (!farthest) return [];
  steps.push({ type: 'farthest', a, b, point: farthest });

  const left = points.filter(p => cross(a, farthest, p) > 0);
  const right = points.filter(p => cross(farthest, b, p) > 0);
  steps.push({ type: 'divide', a, b, farthest, leftCount: left.length, rightCount: right.length });

  return [...findHullSide(left, a, farthest, steps), farthest, ...findHullSide(right, farthest, b, steps)];
}

export function quickHull(inputPoints, steps) {
  const points = dedupePoints(inputPoints);
  if (points.length < 3) return points.slice();

  let minX = points[0];
  let maxX = points[0];
  for (const p of points) {
    if (p.x < minX.x) minX = p;
    if (p.x > maxX.x) maxX = p;
  }
  steps.push({ type: 'extremes', minX, maxX });

  const upper = points.filter(p => cross(minX, maxX, p) > 0);
  const lower = points.filter(p => cross(maxX, minX, p) > 0);

  const hull = [minX, ...findHullSide(upper, minX, maxX, steps), maxX, ...findHullSide(lower, maxX, minX, steps)];
  steps.push({ type: 'done', hull: hull.slice() });
  return hull;
}