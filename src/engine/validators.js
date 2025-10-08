import { distance, EPS } from './geometry-core.js';

function approxEqual(a, b, tolerance = EPS) {
  return Math.abs(a - b) <= tolerance;
}

/**
 * Checks whether the triangle formed by A, B, C is equilateral within tolerance.
 * @param {{x:number,y:number}} A
 * @param {{x:number,y:number}} B
 * @param {{x:number,y:number}} C
 * @param {number} [tolerance]
 */
export function equilateralByDistance(A, B, C, tolerance = 1e-2) {
  const ab = distance(A, B);
  const bc = distance(B, C);
  const ca = distance(C, A);
  return approxEqual(ab, bc, tolerance) && approxEqual(bc, ca, tolerance) && approxEqual(ca, ab, tolerance);
}

/**
 * Verifies that vertices lie on the same circle defined by center point.
 * @param {Array<{x:number,y:number}>} vertices
 * @param {{x:number,y:number}} center
 * @param {number} [tolerance]
 */
export function verticesOnCircle(vertices, center, tolerance = 1e-2) {
  if (!vertices?.length) return false;
  const radius = distance(vertices[0], center);
  return vertices.every(v => approxEqual(distance(v, center), radius, tolerance));
}

/**
 * Determines if two segments are parallel by slope within tolerance.
 * @param {{x1:number,y1:number,x2:number,y2:number}} seg1
 * @param {{x1:number,y1:number,x2:number,y2:number}} seg2
 * @param {number} [tolerance]
 */
export function parallelBySlope(seg1, seg2, tolerance = 1e-2) {
  const slope1 = (seg1.y2 - seg1.y1) / (seg1.x2 - seg1.x1);
  const slope2 = (seg2.y2 - seg2.y1) / (seg2.x2 - seg2.x1);
  if (!Number.isFinite(slope1) && !Number.isFinite(slope2)) return true;
  if (!Number.isFinite(slope1) || !Number.isFinite(slope2)) return false;
  return Math.abs(slope1 - slope2) <= tolerance;
}

/**
 * Determines if two segments are perpendicular by slope within tolerance.
 * @param {{x1:number,y1:number,x2:number,y2:number}} seg1
 * @param {{x1:number,y1:number,x2:number,y2:number}} seg2
 * @param {number} [tolerance]
 */
export function perpendicularBySlope(seg1, seg2, tolerance = 1e-2) {
  const slope1 = (seg1.y2 - seg1.y1) / (seg1.x2 - seg1.x1);
  const slope2 = (seg2.y2 - seg2.y1) / (seg2.x2 - seg2.x1);
  if (!Number.isFinite(slope1) && Math.abs(slope2) <= tolerance) return true;
  if (!Number.isFinite(slope2) && Math.abs(slope1) <= tolerance) return true;
  if (!Number.isFinite(slope1) || !Number.isFinite(slope2)) return false;
  return Math.abs(slope1 * slope2 + 1) <= tolerance;
}
