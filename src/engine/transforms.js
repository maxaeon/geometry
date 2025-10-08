export function translate(points, dx, dy) {
  return points.map(p => ({ x: p.x + dx, y: p.y + dy }));
}

export function rotate(points, center, radians) {
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return points.map(p => {
    const x = p.x - center.x;
    const y = p.y - center.y;
    return {
      x: center.x + x * cos - y * sin,
      y: center.y + x * sin + y * cos
    };
  });
}

export function reflectAcrossLine(points, linePoint, lineAngle) {
  const cos = Math.cos(lineAngle);
  const sin = Math.sin(lineAngle);
  return points.map(p => {
    const x = p.x - linePoint.x;
    const y = p.y - linePoint.y;
    const parallel = x * cos + y * sin;
    const perpendicular = -x * sin + y * cos;
    const reflectedPerp = -perpendicular;
    const rx = parallel * cos - reflectedPerp * sin;
    const ry = parallel * sin + reflectedPerp * cos;
    return { x: rx + linePoint.x, y: ry + linePoint.y };
  });
}
