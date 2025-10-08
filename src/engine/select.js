export function findSelectable(shapes, point, radius = 10) {
  return shapes.filter(shape => {
    if ('x' in shape && 'y' in shape) {
      const dx = shape.x - point.x;
      const dy = shape.y - point.y;
      return Math.hypot(dx, dy) <= radius;
    }
    return false;
  });
}

export function sortByProximity(shapes, point) {
  return [...shapes].sort((a, b) => {
    const da = Math.hypot((a.x ?? 0) - point.x, (a.y ?? 0) - point.y);
    const db = Math.hypot((b.x ?? 0) - point.x, (b.y ?? 0) - point.y);
    return da - db;
  });
}
