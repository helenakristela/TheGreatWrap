import { cross, dist2, dedupePoints } from './geometry.js';

export function grahamScan(inputPoints, steps) {
  const points = dedupePoints(inputPoints);
  if (points.length < 3) return points.slice();

  let pivot = points[0];
  for (const p of points) {
    if (p.y > pivot.y || (p.y === pivot.y && p.x < pivot.x)) pivot = p;
  }
  steps.push({ type: 'pivot', point: pivot });

  const rest = points.filter(p => p !== pivot);
  rest.sort((a, b) => {
    const o = cross(pivot, a, b);
    if (o === 0) return dist2(pivot, a) - dist2(pivot, b);
    return o > 0 ? -1 : 1;
  });
  steps.push({ type: 'sorted', order: [pivot, ...rest] });

  const stack = [pivot, rest[0]];
  steps.push({ type: 'push', stack: stack.slice(), candidate: rest[0] });

  for (let i = 1; i < rest.length; i++) {
    const p = rest[i];
    while (stack.length >= 2 && cross(stack[stack.length - 2], stack[stack.length - 1], p) <= 0) {
      const popped = stack.pop();
      steps.push({ type: 'pop', stack: stack.slice(), popped, candidate: p });
    }
    stack.push(p);
    steps.push({ type: 'push', stack: stack.slice(), candidate: p });
  }

  steps.push({ type: 'done', hull: stack.slice() });
  return stack;
}
