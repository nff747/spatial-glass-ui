import { describe, it, expect } from 'vitest';
import { SpatialMatrix } from '../src/matrix';

describe('SpatialMatrix 4x4 utilities', () => {
  it('generates 4x4 identity matrix with determinant 1.0', () => {
    const id = SpatialMatrix.identity();
    expect(id.length).toBe(16);
    expect(SpatialMatrix.determinant(id)).toBe(1.0);
  });

  it('inverts non-singular affine transform matrix accurately', () => {
    const id = SpatialMatrix.identity();
    const inv = SpatialMatrix.invert(id);

    expect(inv).not.toBeNull();
    expect(inv![0]).toBeCloseTo(1.0);
    expect(inv![5]).toBeCloseTo(1.0);
    expect(inv![10]).toBeCloseTo(1.0);
    expect(inv![15]).toBeCloseTo(1.0);
  });

  it('returns null when attempting to invert a singular (zero-determinant) matrix', () => {
    // All zeros -> det = 0
    const singular = new Float32Array(16);
    expect(SpatialMatrix.determinant(singular)).toBe(0.0);
    expect(SpatialMatrix.invert(singular)).toBeNull();
  });

  it('projects 3D world coordinates through identity matrix to same coordinate', () => {
    const id = SpatialMatrix.identity();
    const projected = SpatialMatrix.projectPoint([10, 20, 30], id);

    expect(projected[0]).toBeCloseTo(10);
    expect(projected[1]).toBeCloseTo(20);
    expect(projected[2]).toBeCloseTo(30);
  });
});
