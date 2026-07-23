const COLORS = {
  point: '#5c4a73',
  hullPoint: '#ed9e58',
  hullEdge: '#a34054',
  pivot: '#ed9e58',
  candidate: '#e9bcb9',
  faint: '#3a2a52'
};

function circle(ctx, p, r, color, outline) {
  ctx.beginPath();
  ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
  if (outline) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  } else {
    ctx.fillStyle = color;
    ctx.fill();
  }
}

function line(ctx, a, b, color, width, dashed) {
  ctx.beginPath();
  ctx.setLineDash(dashed ? [5, 4] : []);
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
  ctx.setLineDash([]);
}

function polyline(ctx, pts, color, width, close) {
  if (pts.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  if (close) ctx.closePath();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

function drawBasePoints(ctx, points) {
  for (const p of points) circle(ctx, p, 4, COLORS.point, false);
}

function drawHullPolygon(ctx, hull) {
  if (hull.length < 2) return;
  polyline(ctx, hull, COLORS.hullEdge, 2, hull.length > 2);
  for (const p of hull) circle(ctx, p, 5.5, COLORS.hullPoint, false);
}

function renderStep(ctx, step) {
  switch (step.type) {
    case 'pivot':
      circle(ctx, step.point, 9, COLORS.pivot, true);
      break;
    case 'sorted':
      circle(ctx, step.order[0], 9, COLORS.pivot, true);
      break;
    case 'push':
    case 'pop':
      polyline(ctx, step.stack, COLORS.hullEdge, 2, false);
      for (const p of step.stack) circle(ctx, p, 5, COLORS.hullPoint, false);
      if (step.candidate) circle(ctx, step.candidate, 7, COLORS.candidate, true);
      if (step.type === 'pop' && step.popped) circle(ctx, step.popped, 7, COLORS.pivot, true);
      break;
    case 'start':
      circle(ctx, step.point, 9, COLORS.pivot, true);
      break;
    case 'compare':
      if (step.hull && step.hull.length > 1) polyline(ctx, step.hull, COLORS.hullEdge, 2, false);
      circle(ctx, step.current, 8, COLORS.pivot, true);
      circle(ctx, step.best, 6, COLORS.hullEdge, true);
      circle(ctx, step.candidate, 6, COLORS.candidate, false);
      line(ctx, step.current, step.candidate, COLORS.candidate, 1, true);
      line(ctx, step.current, step.best, COLORS.hullEdge, 1.5, false);
      break;
    case 'select':
      if (step.hull && step.hull.length > 1) polyline(ctx, step.hull, COLORS.hullEdge, 2, false);
      circle(ctx, step.current, 7, COLORS.pivot, true);
      circle(ctx, step.next, 8, COLORS.hullPoint, false);
      line(ctx, step.current, step.next, COLORS.hullEdge, 2.5, false);
      break;
    case 'extremes':
      circle(ctx, step.minX, 8, COLORS.pivot, true);
      circle(ctx, step.maxX, 8, COLORS.pivot, true);
      line(ctx, step.minX, step.maxX, COLORS.faint, 1.5, true);
      break;
    case 'farthest':
      line(ctx, step.a, step.b, COLORS.faint, 1.5, true);
      circle(ctx, step.point, 8, COLORS.candidate, false);
      break;
    case 'divide':
      circle(ctx, step.a, 6, COLORS.pivot, true);
      circle(ctx, step.b, 6, COLORS.pivot, true);
      circle(ctx, step.farthest, 7, COLORS.hullPoint, false);
      line(ctx, step.a, step.farthest, COLORS.hullEdge, 1.5, false);
      line(ctx, step.farthest, step.b, COLORS.hullEdge, 1.5, false);
      break;
    case 'done':
      drawHullPolygon(ctx, step.hull);
      break;
  }
}

export function render(canvas, points, hull, currentStep) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBasePoints(ctx, points);
  if (currentStep) renderStep(ctx, currentStep);
  else drawHullPolygon(ctx, hull);
}
