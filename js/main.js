import { grahamScan } from './grahamScan.js';
import { jarvisMarch } from './jarvisMarch.js';
import { quickHull } from './quickHull.js';
import { render } from './canvas.js';
import { randomUniform, randomCircle, randomRectangleBorder, randomGaussian, randomCluster, parsePointsFile } from './dataset.js';
import { runBenchmark } from './benchmark.js';

const canvas = document.getElementById('hull-canvas');
const canvasWrap = document.getElementById('canvas-wrap');

const el = {
  modeAdd: document.getElementById('mode-add'),
  modeRemove: document.getElementById('mode-remove'),
  datasetType: document.getElementById('dataset-type'),
  pointCount: document.getElementById('point-count'),
  generateBtn: document.getElementById('generate-btn'),
  importInput: document.getElementById('import-input'),
  clearBtn: document.getElementById('clear-btn'),
  algorithmSelect: document.getElementById('algorithm-select'),
  dynamicToggle: document.getElementById('dynamic-toggle'),
  computeBtn: document.getElementById('compute-btn'),
  playBtn: document.getElementById('play-btn'),
  prevBtn: document.getElementById('prev-btn'),
  nextBtn: document.getElementById('next-btn'),
  resetBtn: document.getElementById('reset-btn'),
  speedSlider: document.getElementById('speed-slider'),
  stepCounter: document.getElementById('step-counter'),
  stepDescription: document.getElementById('step-description'),
  pointStat: document.getElementById('point-stat'),
  hullStat: document.getElementById('hull-stat'),
  algoStat: document.getElementById('algo-stat'),
  benchmarkSizes: document.getElementById('benchmark-sizes'),
  benchmarkBtn: document.getElementById('benchmark-btn'),
  benchmarkBody: document.getElementById('benchmark-body')
};

const ALGORITHMS = {
  graham: { label: 'Graham Scan', run: grahamScan },
  jarvis: { label: 'Jarvis March', run: jarvisMarch },
  quickhull: { label: 'QuickHull', run: quickHull }
};

let points = [];
let hull = [];
let steps = [];
let stepIndex = -1;
let mode = 'add';
let playing = false;
let playTimer = null;

function resizeCanvas() {
  canvas.width = canvasWrap.clientWidth;
  canvas.height = canvasWrap.clientHeight;
  draw();
}

function draw() {
  const step = stepIndex >= 0 && stepIndex < steps.length ? steps[stepIndex] : null;
  render(canvas, points, hull, step);
}

function updateStats() {
  el.pointStat.textContent = points.length;
  el.hullStat.textContent = hull.length;
  el.algoStat.textContent = ALGORITHMS[el.algorithmSelect.value].label;
}

function stepDescription(step) {
  if (!step) return points.length < 3 ? 'Tambahkan minimal 3 titik untuk membentuk convex hull.' : 'Tekan "Hitung Hull" untuk memulai visualisasi.';
  switch (step.type) {
    case 'pivot': return 'Memilih titik pivot (titik paling bawah) sebagai titik awal.';
    case 'sorted': return 'Mengurutkan titik berdasarkan sudut polar terhadap pivot.';
    case 'push': return 'Menambahkan titik ke dalam stack karena membentuk belokan yang valid.';
    case 'pop': return 'Mengeluarkan titik dari stack karena belokan tidak convex.';
    case 'start': return 'Memilih titik paling kiri sebagai titik awal pembungkusan.';
    case 'compare': return 'Membandingkan kandidat titik berikutnya menggunakan orientasi.';
    case 'select': return 'Titik berikutnya pada hull terpilih.';
    case 'extremes': return 'Menentukan titik dengan x minimum dan x maksimum sebagai garis pemisah awal.';
    case 'farthest': return 'Mencari titik terjauh dari garis pemisah.';
    case 'divide': return 'Membagi himpunan titik menjadi dua sisi dan memproses secara rekursif.';
    case 'done': return 'Convex hull selesai dibentuk.';
    default: return '';
  }
}

function updateStepUI() {
  const step = stepIndex >= 0 && stepIndex < steps.length ? steps[stepIndex] : null;
  el.stepCounter.textContent = steps.length ? (stepIndex + 1) + ' / ' + steps.length : '0 / 0';
  el.stepDescription.textContent = stepDescription(step);
  el.prevBtn.disabled = stepIndex <= 0;
  el.nextBtn.disabled = steps.length === 0 || stepIndex >= steps.length - 1;
  el.playBtn.textContent = playing ? 'Pause' : 'Play';
}

function computeHull(recordSteps) {
  const algo = ALGORITHMS[el.algorithmSelect.value];
  const recorded = [];
  hull = algo.run(points, recordSteps ? recorded : []);
  steps = recorded;
  stepIndex = recordSteps ? (steps.length ? 0 : -1) : -1;
  updateStats();
  updateStepUI();
  draw();
}

function stopPlaying() {
  playing = false;
  if (playTimer) clearInterval(playTimer);
  playTimer = null;
}

function play() {
  if (steps.length === 0 || stepIndex >= steps.length - 1) return;
  playing = true;
  const speed = 900 - Number(el.speedSlider.value) * 80;
  playTimer = setInterval(() => {
    if (stepIndex >= steps.length - 1) {
      stopPlaying();
      updateStepUI();
      return;
    }
    stepIndex++;
    draw();
    updateStepUI();
  }, speed);
  updateStepUI();
}

function addPoint(x, y) {
  points.push({ x, y });
  onPointsChanged();
}

function removeNearestPoint(x, y) {
  let closest = -1;
  let closestDist = 12;
  for (let i = 0; i < points.length; i++) {
    const d = Math.hypot(points[i].x - x, points[i].y - y);
    if (d < closestDist) {
      closestDist = d;
      closest = i;
    }
  }
  if (closest >= 0) {
    points.splice(closest, 1);
    onPointsChanged();
  }
}

function onPointsChanged() {
  stopPlaying();
  steps = [];
  stepIndex = -1;
  if (el.dynamicToggle.checked) computeHull(false);
  else {
    hull = [];
    updateStats();
    updateStepUI();
    draw();
  }
}

canvas.addEventListener('click', e => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  if (mode === 'add') addPoint(x, y);
  else removeNearestPoint(x, y);
});

el.modeAdd.addEventListener('click', () => {
  mode = 'add';
  el.modeAdd.classList.add('active');
  el.modeRemove.classList.remove('active');
});

el.modeRemove.addEventListener('click', () => {
  mode = 'remove';
  el.modeRemove.classList.add('active');
  el.modeAdd.classList.remove('active');
});

el.generateBtn.addEventListener('click', () => {
  const count = Math.max(3, Math.min(500, Number(el.pointCount.value) || 50));
  const w = canvas.width;
  const h = canvas.height;
  const type = el.datasetType.value;
  if (type === 'circle') points = randomCircle(count, w, h);
  else if (type === 'rectangle') points = randomRectangleBorder(count, w, h);
  else if (type === 'gaussian') points = randomGaussian(count, w, h);
  else if (type === 'cluster') points = randomCluster(count, w, h, 4);
  else points = randomUniform(count, w, h);
  onPointsChanged();
});

el.importInput.addEventListener('change', () => {
  const file = el.importInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const parsed = parsePointsFile(reader.result);
    if (parsed.length === 0) {
      alert('File tidak berisi titik yang valid. Gunakan format "x,y" per baris.');
      return;
    }
    points = parsed;
    onPointsChanged();
  };
  reader.readAsText(file);
  el.importInput.value = '';
});

el.clearBtn.addEventListener('click', () => {
  points = [];
  onPointsChanged();
});

el.algorithmSelect.addEventListener('change', () => {
  stopPlaying();
  steps = [];
  stepIndex = -1;
  updateStats();
  updateStepUI();
  if (el.dynamicToggle.checked) computeHull(false);
  else draw();
});

el.computeBtn.addEventListener('click', () => {
  stopPlaying();
  computeHull(true);
});

el.playBtn.addEventListener('click', () => {
  if (playing) {
    stopPlaying();
    updateStepUI();
  } else {
    play();
  }
});

el.prevBtn.addEventListener('click', () => {
  stopPlaying();
  if (stepIndex > 0) stepIndex--;
  draw();
  updateStepUI();
});

el.nextBtn.addEventListener('click', () => {
  stopPlaying();
  if (stepIndex < steps.length - 1) stepIndex++;
  draw();
  updateStepUI();
});

el.resetBtn.addEventListener('click', () => {
  stopPlaying();
  stepIndex = steps.length ? 0 : -1;
  draw();
  updateStepUI();
});

el.benchmarkBtn.addEventListener('click', () => {
  const sizes = el.benchmarkSizes.value.split(',').map(s => Number(s.trim())).filter(n => n > 3);
  if (sizes.length === 0) {
    alert('Masukkan ukuran dataset yang valid, contoh: 50,100,500');
    return;
  }
  const results = runBenchmark(sizes, canvas.width, canvas.height);
  el.benchmarkBody.innerHTML = '';
  for (const r of results) {
    const row = document.createElement('tr');
    row.innerHTML = '<td>' + r.size + '</td><td>' + r.algorithm + '</td><td>' + r.time.toFixed(3) + ' ms</td><td>' + r.hullSize + '</td>';
    el.benchmarkBody.appendChild(row);
  }
});

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
updateStats();
updateStepUI();