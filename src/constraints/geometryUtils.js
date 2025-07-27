// Utility functions for analyzing geometric relationships using the
// constraint graph data structures.

function getShape(obj){
  return obj && obj.shape ? obj.shape : obj;
}

function distance(a,b){
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function angleAt(a, b, c){
  const ab = Math.atan2(a.y - b.y, a.x - b.x);
  const cb = Math.atan2(c.y - b.y, c.x - b.x);
  let diff = Math.abs(ab - cb);
  if(diff > Math.PI) diff = Math.PI * 2 - diff;
  return diff;
}

export function isEquilateral(triangleNodes){
  if(!Array.isArray(triangleNodes) || triangleNodes.length !== 3) return false;
  const pts = triangleNodes.map(getShape);
  if(!pts.every(p => p && typeof p.x === 'number' && typeof p.y === 'number'))
    return false;
  const l1 = distance(pts[0], pts[1]);
  const l2 = distance(pts[1], pts[2]);
  const l3 = distance(pts[2], pts[0]);
  const avg = (l1 + l2 + l3) / 3;
  const tol = avg * 0.05; // 5% tolerance
  return Math.abs(l1 - avg) < tol && Math.abs(l2 - avg) < tol && Math.abs(l3 - avg) < tol;
}

export function isPerpBisector(segA, segB){
  const s1 = getShape(segA);
  const s2 = getShape(segB);
  if(!s1 || !s2 || s1.x1 === undefined || s2.x1 === undefined) return false;
  // Find intersection
  const denom = (s1.x1 - s1.x2)*(s2.y1 - s2.y2) - (s1.y1 - s1.y2)*(s2.x1 - s2.x2);
  if(denom === 0) return false;
  const px = ((s1.x1*s1.y2 - s1.y1*s1.x2)*(s2.x1 - s2.x2) - (s1.x1 - s1.x2)*(s2.x1*s2.y2 - s2.y1*s2.x2)) / denom;
  const py = ((s1.x1*s1.y2 - s1.y1*s1.x2)*(s2.y1 - s2.y2) - (s1.y1 - s1.y2)*(s2.x1*s2.y2 - s2.y1*s2.x2)) / denom;
  const inter = {x: px, y: py};
  const mid1 = {x: (s1.x1 + s1.x2)/2, y: (s1.y1 + s1.y2)/2};
  const mid2 = {x: (s2.x1 + s2.x2)/2, y: (s2.y1 + s2.y2)/2};
  const tol = 3; // pixels
  const isMid1 = distance(inter, mid1) < tol;
  const isMid2 = distance(inter, mid2) < tol;
  // Check perpendicular
  const dx1 = s1.x2 - s1.x1;
  const dy1 = s1.y2 - s1.y1;
  const dx2 = s2.x2 - s2.x1;
  const dy2 = s2.y2 - s2.y1;
  const dot = dx1*dx2 + dy1*dy2;
  const len1 = Math.hypot(dx1, dy1);
  const len2 = Math.hypot(dx2, dy2);
  if(len1 === 0 || len2 === 0) return false;
  const cos = dot / (len1*len2);
  const perp = Math.abs(cos) < 0.05; // ~90 degrees
  return perp && (isMid1 || isMid2);
}

export function areSimilar(tri1, tri2){
  if(!Array.isArray(tri1) || tri1.length !== 3 || !Array.isArray(tri2) || tri2.length !== 3) return false;
  const a = tri1.map(getShape);
  const b = tri2.map(getShape);
  if(!a.every(p => p && p.x !== undefined) || !b.every(p => p && p.x !== undefined)) return false;
  const lengthsA = [distance(a[0],a[1]), distance(a[1],a[2]), distance(a[2],a[0])].sort((x,y)=>x-y);
  const lengthsB = [distance(b[0],b[1]), distance(b[1],b[2]), distance(b[2],b[0])].sort((x,y)=>x-y);
  const ratio = lengthsA[0]/lengthsB[0];
  const tol = 0.05;
  for(let i=1;i<3;i++){
    if(Math.abs(lengthsA[i]/lengthsB[i] - ratio) > tol) return false;
  }
  // Optionally compare angles for robustness
  const anglesA = [angleAt(a[1],a[0],a[2]), angleAt(a[0],a[1],a[2]), angleAt(a[0],a[2],a[1])].sort((x,y)=>x-y);
  const anglesB = [angleAt(b[1],b[0],b[2]), angleAt(b[0],b[1],b[2]), angleAt(b[0],b[2],b[1])].sort((x,y)=>x-y);
  for(let i=0;i<3;i++){
    if(Math.abs(anglesA[i]-anglesB[i])>0.1) return false;
  }
  return true;
}

if (typeof window !== 'undefined') {
  window.isEquilateral = isEquilateral;
  window.isPerpBisector = isPerpBisector;
  window.areSimilar = areSimilar;
}
