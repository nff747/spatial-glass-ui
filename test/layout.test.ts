import { describe, it, expect } from 'vitest';
import { SpatialLayout } from '../src/layout';
import { SpatialTransform } from '../src/phantom-dom';

describe('SpatialLayout sub-pixel & bounds alignment', () => {
  it('snaps floating coordinates to subpixel raster grid under DPR 2.0 and 3.0', () => {
    // Under DPR 2.0, pixel step is 0.5
    expect(SpatialLayout.snapToSubpixel(10.24, 2.0)).toBe(10.0);
    expect(SpatialLayout.snapToSubpixel(10.26, 2.0)).toBe(10.5);

    // Under DPR 3.0, pixel step is 1/3 (0.333...)
    expect(SpatialLayout.snapToSubpixel(5.30, 3.0)).toBeCloseTo(5.0 + 1 / 3, 2);
  });

  it('snaps entire SpatialTransform bounds structure', () => {
    const raw: SpatialTransform = { x: 1.24, y: 3.76, width: 99.4, height: 49.8 };
    const snapped = SpatialLayout.snapSpatialTransform(raw, 2.0);

    expect(snapped.x).toBe(1.0);
    expect(snapped.y).toBe(4.0);
    expect(snapped.width).toBe(99.5);
    expect(snapped.height).toBe(50.0);
  });

  it('clamps spatial panel within viewport bounds with margins', () => {
    const panel: SpatialTransform = { x: 950, y: 700, width: 200, height: 150 };
    // Viewport 1000x800 with 10px margin -> max X = 790, max Y = 640
    const clamped = SpatialLayout.clampSpatialBounds(panel, 1000, 800, 10);

    expect(clamped.x).toBe(790);
    expect(clamped.y).toBe(640);
  });

  it('detects point containment accurately', () => {
    const panel: SpatialTransform = { x: 100, y: 100, width: 200, height: 100 };
    expect(SpatialLayout.containsPoint(panel, 150, 150)).toBe(true);
    expect(SpatialLayout.containsPoint(panel, 50, 150)).toBe(false);
    expect(SpatialLayout.containsPoint(panel, 150, 250)).toBe(false);
  });
});
