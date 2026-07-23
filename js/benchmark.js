import { grahamScan } from './grahamScan.js';
import { jarvisMarch } from './jarvisMarch.js';
import { quickHull } from './quickHull.js';
import { randomUniform } from './dataset.js';

const ALGORITHMS = {
  graham: { label: 'Graham Scan', run: grahamScan },
  jarvis: { label: 'Jarvis March', run: jarvisMarch },
  quickhull: { label: 'QuickHull', run: quickHull }
};

export function runBenchmark(sizes, w, h) {
  const results = [];
  for (const size of sizes) {
    const points = randomUniform(size, w, h);
    for (const key of Object.keys(ALGORITHMS)) {
      const algo = ALGORITHMS[key];
      const start = performance.now();
      const hull = algo.run(points, []);
      const elapsed = performance.now() - start;
      results.push({ size, algorithm: algo.label, time: elapsed, hullSize: hull.length });
    }
  }
  return results;
}
