import { distance } from './geometry-core.js';

export function measureDistance(a, b) {
  return distance(a, b);
}

export function measurePerimeter(points) {
  if (!points?.length) return 0;
  let total = 0;
  for (let i = 0; i < points.length; i += 1) {
    const next = points[(i + 1) % points.length];
    total += distance(points[i], next);
  }
  return total;
}

export function measurePolygonArea(points) {
  if (!points || points.length < 3) return 0;
  let sum = 0;
  for (let i = 0; i < points.length; i += 1) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    sum += (a.x * b.y) - (a.y * b.x);
  }
  return Math.abs(sum) / 2;
}
