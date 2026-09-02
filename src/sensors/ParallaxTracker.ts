import { mat4, vec3 } from 'gl-matrix';

export interface SensorData {
  cursorX: number;
  cursorY: number;
  pitch: number;
  yaw: number;
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * Parallax & Sensor Tracker
 * Listens to Mouse and DeviceOrientation (Gyroscope) to compute
 * real-time spatial transformations (parallax) and cursor depth logic.
 * ═══════════════════════════════════════════════════════════════════
 */
export class ParallaxTracker {
  private data: SensorData = { cursorX: 0, cursorY: 0, pitch: 0, yaw: 0 };
  private targetData: SensorData = { cursorX: 0, cursorY: 0, pitch: 0, yaw: 0 };
  
  // Smoothing factor for LERPing sensor data to avoid jitter
  private lerpFactor = 0.1;
  
  constructor(private canvas: HTMLCanvasElement) {}

  public start() {
    window.addEventListener('mousemove', this.onMouseMove);
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', this.onDeviceOrientation);
    }
  }

  public stop() {
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('deviceorientation', this.onDeviceOrientation);
  }

  private onMouseMove = (e: MouseEvent) => {
    // Map cursor to Normalized Device Coordinates (-1 to 1)
    const rect = this.canvas.getBoundingClientRect();
    this.targetData.cursorX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.targetData.cursorY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    
    // Fallback: use cursor for parallax if no gyro
    if (!window.DeviceOrientationEvent || !('ontouchstart' in window)) {
      this.targetData.yaw = this.targetData.cursorX * 15.0; // max 15 deg tilt
      this.targetData.pitch = -this.targetData.cursorY * 15.0;
    }
  };

  private onDeviceOrientation = (e: DeviceOrientationEvent) => {
    if (e.beta === null || e.gamma === null) return;
    // Map gyro beta/gamma to pitch and yaw
    // Beta: front-to-back tilt [-180, 180] -> clamp to [-30, 30]
    // Gamma: left-to-right tilt [-90, 90] -> clamp to [-30, 30]
    const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);
    
    this.targetData.pitch = clamp(e.beta - 45, -30, 30); // Assume 45 deg resting angle
    this.targetData.yaw = clamp(e.gamma, -30, 30);
  };

  /**
   * Called every frame to smoothly interpolate sensor data.
   */
  public update(): SensorData {
    this.data.cursorX += (this.targetData.cursorX - this.data.cursorX) * this.lerpFactor;
    this.data.cursorY += (this.targetData.cursorY - this.data.cursorY) * this.lerpFactor;
    this.data.pitch += (this.targetData.pitch - this.data.pitch) * this.lerpFactor;
    this.data.yaw += (this.targetData.yaw - this.data.yaw) * this.lerpFactor;
    return this.data;
  }

  /**
   * Generates a view matrix based on current parallax yaw/pitch.
   */
  public getViewMatrix(distance: number = 5.0): mat4 {
    const view = mat4.create();
    mat4.translate(view, view, [0, 0, -distance]);
    
    // Apply parallax rotation
    mat4.rotateX(view, view, (this.data.pitch * Math.PI) / 180);
    mat4.rotateY(view, view, (this.data.yaw * Math.PI) / 180);
    
    return view;
  }
  
  /**
   * Returns cursor in 3D world space (approximate)
   */
  public getLightPosition(orthoWidth: number, orthoHeight: number): vec3 {
    return [
      this.data.cursorX * (orthoWidth / 2),
      this.data.cursorY * (orthoHeight / 2),
      1.0 // Z-depth of the cursor hovering over the UI
    ];
  }
}
