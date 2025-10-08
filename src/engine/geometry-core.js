export const EPS = 1e-6;

export function point(x, y) {
  return { x, y };
}

export function segment(p1, p2) {
  return { p1, p2 };
}

export function circle(center, radius) {
  return { center, radius };
}

export function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

export function orientation(a, b, c) {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

export function isCollinear(a, b, c, tolerance = EPS) {
  return Math.abs(orientation(a, b, c)) <= tolerance;
}

function between(a, b, c) {
  return (
    Math.min(a.x, b.x) - EPS <= c.x && c.x <= Math.max(a.x, b.x) + EPS &&
    Math.min(a.y, b.y) - EPS <= c.y && c.y <= Math.max(a.y, b.y) + EPS
  );
}

export function segmentIntersection(s1, s2) {
  const { p1: a1, p2: a2 } = s1;
  const { p1: b1, p2: b2 } = s2;
  const o1 = orientation(a1, a2, b1);
  const o2 = orientation(a1, a2, b2);
  const o3 = orientation(b1, b2, a1);
  const o4 = orientation(b1, b2, a2);

  if (Math.abs(o1) < EPS && between(a1, a2, b1)) return b1;
  if (Math.abs(o2) < EPS && between(a1, a2, b2)) return b2;
  if (Math.abs(o3) < EPS && between(b1, b2, a1)) return a1;
  if (Math.abs(o4) < EPS && between(b1, b2, a2)) return a2;

  if (o1 * o2 < 0 && o3 * o4 < 0) {
    const t = o1 / (o1 - o2);
    return point(
      a1.x + t * (a2.x - a1.x),
      a1.y + t * (a2.y - a1.y)
    );
  }
  return null;
}

export function lineCircleIntersection(line, circ) {
  const { p1, p2 } = line;
  const { center, radius } = circ;
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const fx = p1.x - center.x;
  const fy = p1.y - center.y;

  const a = dx * dx + dy * dy;
  const b = 2 * (fx * dx + fy * dy);
  const c = fx * fx + fy * fy - radius * radius;
  const disc = b * b - 4 * a * c;
  if (disc < -EPS) return [];
  if (Math.abs(disc) <= EPS) {
    const t = -b / (2 * a);
    return [point(p1.x + t * dx, p1.y + t * dy)];
  }
  const sqrt = Math.sqrt(disc);
  const t1 = (-b + sqrt) / (2 * a);
  const t2 = (-b - sqrt) / (2 * a);
  return [
    point(p1.x + t1 * dx, p1.y + t1 * dy),
    point(p1.x + t2 * dx, p1.y + t2 * dy)
  ];
}

export function circleCircleIntersection(c1, c2) {
  const d = distance(c1.center, c2.center);
  if (d > c1.radius + c2.radius + EPS) return [];
  if (d < Math.abs(c1.radius - c2.radius) - EPS) return [];
  if (d < EPS && Math.abs(c1.radius - c2.radius) < EPS) return [];
  const a = (c1.radius ** 2 - c2.radius ** 2 + d ** 2) / (2 * d);
  const hSq = c1.radius ** 2 - a ** 2;
  if (hSq < -EPS) return [];
  const h = hSq <= 0 ? 0 : Math.sqrt(hSq);
  const p0 = c1.center;
  const p1 = c2.center;
  const x2 = p0.x + a * (p1.x - p0.x) / d;
  const y2 = p0.y + a * (p1.y - p0.y) / d;
  if (h === 0) {
    return [point(x2, y2)];
  }
  return [
    point(x2 + h * (p1.y - p0.y) / d, y2 - h * (p1.x - p0.x) / d),
    point(x2 - h * (p1.y - p0.y) / d, y2 + h * (p1.x - p0.x) / d)
  ];
}

export function isPointOnCircle(pt, circ, tolerance = EPS) {
  return Math.abs(distance(pt, circ.center) - circ.radius) <= tolerance;
}

export function isPointOnSegment(pt, seg, tolerance = EPS) {
  return isCollinear(seg.p1, seg.p2, pt, tolerance) && between(seg.p1, seg.p2, pt);
}
