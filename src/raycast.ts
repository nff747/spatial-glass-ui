export interface Ray3D {
  origin: [number, number, number];
  direction: [number, number, number];
}

export interface SpatialPlane {
  center: [number, number, number];
  normal: [number, number, number];
  right: [number, number, number];
  width: number;
  height: number;
}

export interface RaycastHit {
  distance: number;
  point: [number, number, number];
  uv: [number, number];
}

export function intersectRayPlane(ray: Ray3D, plane: SpatialPlane): RaycastHit | null {
  const [ox, oy, oz] = ray.origin;
  const [dx, dy, dz] = ray.direction;
  const [cx, cy, cz] = plane.center;
  const [nx, ny, nz] = plane.normal;

  const denom = dx * nx + dy * ny + dz * nz;
  if (Math.abs(denom) < 1e-6) {
    return null;
  }

  const t = ((cx - ox) * nx + (cy - oy) * ny + (cz - oz) * nz) / denom;
  if (t < 0) {
    return null;
  }

  const px = ox + t * dx;
  const py = oy + t * dy;
  const pz = oz + t * dz;

  const vx = px - cx;
  const vy = py - cy;
  const vz = pz - cz;

  const [rx, ry, rz] = plane.right;
  const ux = ny * rz - nz * ry;
  const uy = nz * rx - nx * rz;
  const uz = nx * ry - ny * rx;

  const localX = vx * rx + vy * ry + vz * rz;
  const localY = vx * ux + vy * uy + vz * uz;

  const halfW = plane.width * 0.5;
  const halfH = plane.height * 0.5;

  if (Math.abs(localX) > halfW || Math.abs(localY) > halfH) {
    return null;
  }

  const u = (localX + halfW) / plane.width;
  const v = (localY + halfH) / plane.height;

  return {
    distance: t,
    point: [px, py, pz],
    uv: [u, v]
  };
}

/**
 * Computes normalized 3D gaze ray from eye origin and look-at target vector.
 */
export function computeGazeRay(
  eyePosition: [number, number, number],
  gazeTarget: [number, number, number]
): Ray3D {
  const dx = gazeTarget[0] - eyePosition[0];
  const dy = gazeTarget[1] - eyePosition[1];
  const dz = gazeTarget[2] - eyePosition[2];
  const len = Math.hypot(dx, dy, dz);
  const invLen = len > 1e-6 ? 1.0 / len : 0.0;
  return {
    origin: [eyePosition[0], eyePosition[1], eyePosition[2]],
    direction: [dx * invLen, dy * invLen, dz * invLen]
  };
}
