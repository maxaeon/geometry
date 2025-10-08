import { equilateralByDistance, verticesOnCircle, parallelBySlope, perpendicularBySlope } from '../../src/engine/validators.js';

describe('geometry validators', () => {
  test('equilateralByDistance detects equilateral triangle', () => {
    const A = { x: 0, y: 0 };
    const B = { x: 1, y: 0 };
    const C = { x: 0.5, y: Math.sqrt(3) / 2 };
    expect(equilateralByDistance(A, B, C, 1e-3)).toBe(true);
  });

  test('equilateralByDistance fails when sides differ', () => {
    const A = { x: 0, y: 0 };
    const B = { x: 1, y: 0 };
    const C = { x: 0.5, y: 0.9 };
    expect(equilateralByDistance(A, B, C, 1e-3)).toBe(false);
  });

  test('verticesOnCircle checks points with tolerance', () => {
    const center = { x: 0, y: 0 };
    const verts = [
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: -0.999, y: -0.01 }
    ];
    expect(verticesOnCircle(verts, center, 0.05)).toBe(true);
  });

  test('parallelBySlope handles vertical lines', () => {
    const seg1 = { x1: 0, y1: 0, x2: 0, y2: 5 };
    const seg2 = { x1: 2, y1: 1, x2: 2, y2: 6 };
    expect(parallelBySlope(seg1, seg2, 1e-3)).toBe(true);
  });

  test('perpendicularBySlope detects perpendicular lines', () => {
    const seg1 = { x1: 0, y1: 0, x2: 1, y2: 0 };
    const seg2 = { x1: 0, y1: 0, x2: 0, y2: 1 };
    expect(perpendicularBySlope(seg1, seg2, 1e-3)).toBe(true);
  });
});
