import { SpatialTransform } from './phantom-dom';

export class SpatialLayout {
  /**
   * Snaps a floating point coordinate to the nearest physical device sub-pixel grid.
   */
  public static snapToSubpixel(value: number, dpr: number = 1.0): number {
    if (dpr <= 0) return Math.round(value);
    return Math.round(value * dpr) / dpr;
  }

  /**
   * Snaps all dimensions and offsets of a spatial transform to device pixels.
   */
  public static snapSpatialTransform(t: SpatialTransform, dpr: number = 1.0): SpatialTransform {
    return {
      x: this.snapToSubpixel(t.x, dpr),
      y: this.snapToSubpixel(t.y, dpr),
      width: this.snapToSubpixel(t.width, dpr),
      height: this.snapToSubpixel(t.height, dpr),
      matrix4x4: t.matrix4x4
    };
  }

  /**
   * Clamps spatial bounds so the glass UI panel remains within viewport visibility.
   */
  public static clampSpatialBounds(
    bounds: SpatialTransform,
    viewportWidth: number,
    viewportHeight: number,
    margin: number = 0
  ): SpatialTransform {
    const maxX = Math.max(margin, viewportWidth - bounds.width - margin);
    const maxY = Math.max(margin, viewportHeight - bounds.height - margin);

    return {
      ...bounds,
      x: Math.max(margin, Math.min(maxX, bounds.x)),
      y: Math.max(margin, Math.min(maxY, bounds.y))
    };
  }

  /**
   * Evaluates if a 2D viewport point lies within the bounding box of a spatial panel.
   */
  public static containsPoint(t: SpatialTransform, x: number, y: number): boolean {
    return x >= t.x && x <= (t.x + t.width) && y >= t.y && y <= (t.y + t.height);
  }
}
