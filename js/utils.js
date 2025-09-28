
export function toClip(x, y) {
  return { x: x * 2 - 1, y: 1 - y * 2 };
}

export function rand(min, max) {
  return Math.random() * (max - min) + min;
}

export function screenToNorm(sx, sy, canvas) {
  const rect = canvas.getBoundingClientRect();
  const x = (sx - rect.left) / rect.width;
  const y = (sy - rect.top) / rect.height;
  return { x, y };
}

export function pointInPolygon(pt, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x, yi = poly[i].y;
    const xj = poly[j].x, yj = poly[j].y;
    const intersect = ((yi > pt.y) != (yj > pt.y)) && (pt.x < (xj - xi) * (pt.y - yi) / (yj - yi + 1e-12) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

export function pointInTriangle(p, a, b, c) {
  const v0x = c.x - a.x, v0y = c.y - a.y, v1x = b.x - a.x, v1y = b.y - a.y, v2x = p.x - a.x, v2y = p.y - a.y;
  const dot00 = v0x * v0x + v0y * v0y, dot01 = v0x * v1x + v0y * v1y, dot02 = v0x * v2x + v0y * v2y, dot11 = v1x * v1x + v1y * v1y, dot12 = v1x * v2x + v1y * v2y;
  const invDen = 1 / (dot00 * dot11 - dot01 * dot01 + 1e-12);
  const u = (dot11 * dot02 - dot01 * dot12) * invDen;
  const v = (dot00 * dot12 - dot01 * dot02) * invDen;
  const epsilon = 1e-7;
  return (u >= -epsilon) && (v >= -epsilon) && (u + v < 1 + epsilon);
}

export function dist2(a, b) {
  const dx = a.x - b.x, dy = a.y - b.y;
  return dx * dx + dy * dy;
}