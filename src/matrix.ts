import { mat4, vec4 } from 'gl-matrix';

export class SpatialMatrix {
  public static readonly EPSILON = 1e-8;

  public static identity(): Float32Array {
    const out = new Float32Array(16);
    mat4.identity(out);
    return out;
  }

  public static determinant(m: ArrayLike<number>): number {
    return mat4.determinant(m as any);
  }

  public static invert(m: ArrayLike<number>): Float32Array | null {
    const det = this.determinant(m);
    if (Math.abs(det) < this.EPSILON) {
      return null;
    }
    const out = new Float32Array(16);
    const success = mat4.invert(out, m as any);
    return success ? out : null;
  }

  public static projectPoint(point: [number, number, number], mvp: ArrayLike<number>): [number, number, number] {
    const v = vec4.fromValues(point[0], point[1], point[2], 1.0);
    vec4.transformMat4(v, v, mvp as any);
    const w = v[3];
    if (w !== 0) {
      return [v[0] / w, v[1] / w, v[2] / w];
    }
    return [v[0], v[1], v[2]];
  }
}
