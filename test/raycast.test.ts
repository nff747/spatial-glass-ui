import { describe, it, expect } from 'vitest';
import { intersectRayPlane, computeGazeRay, Ray3D, SpatialPlane } from '../src/raycast';

describe('Spatial UI 3D Raycasting', () => {
  const panel: SpatialPlane = {
    center: [0, 0, 0],
    normal: [0, 0, 1], // Facing along +Z
    right: [1, 0, 0],  // Width along +X
    width: 4,
    height: 2
  };

  it('intersects ray directly aimed at panel center', () => {
    const ray: Ray3D = {
      origin: [0, 0, 5],
      direction: [0, 0, -1] // Shooting towards origin
    };

    const hit = intersectRayPlane(ray, panel);
    expect(hit).not.toBeNull();
    expect(hit!.distance).toBeCloseTo(5.0);
    expect(hit!.point).toEqual([0, 0, 0]);
    expect(hit!.uv[0]).toBeCloseTo(0.5); // Center UV
    expect(hit!.uv[1]).toBeCloseTo(0.5);
  });

  it('generates normalized gaze ray and intersects panel', () => {
    const eye: [number, number, number] = [0, 0, 10];
    const target: [number, number, number] = [0, 0, 0];
    const gaze = computeGazeRay(eye, target);

    expect(gaze.direction[2]).toBeCloseTo(-1.0);
    const hit = intersectRayPlane(gaze, panel);
    expect(hit).not.toBeNull();
    expect(hit!.distance).toBeCloseTo(10.0);
  });

  it('returns null when ray misses panel boundaries', () => {
    const ray: Ray3D = {
      origin: [10, 10, 5],
      direction: [0, 0, -1] // Misses 4x2 panel
    };

    expect(intersectRayPlane(ray, panel)).toBeNull();
  });

  it('returns null when ray points away from the plane', () => {
    const ray: Ray3D = {
      origin: [0, 0, 5],
      direction: [0, 0, 1] // Points away into +Z
    };

    expect(intersectRayPlane(ray, panel)).toBeNull();
  });

  it('returns null when ray is parallel to the panel plane', () => {
    const ray: Ray3D = {
      origin: [0, 0, 1],
      direction: [1, 0, 0] // Parallel to plane
    };

    expect(intersectRayPlane(ray, panel)).toBeNull();
  });
});
