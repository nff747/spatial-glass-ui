/**
 * ═══════════════════════════════════════════════════════════════════
 * Spatial Engine — WebGL2 Multi-Pass Render Architecture
 * 
 * Replaces the DOM with a hardware-accelerated WebGL2 canvas.
 * Renders the background scene to an FBO, then uses that texture
 * to compute physically accurate refraction on UI geometry.
 * ═══════════════════════════════════════════════════════════════════
 */

import { mat4, vec3 } from 'gl-matrix';
import { ParallaxTracker } from '../sensors/ParallaxTracker';
import { glassVert } from '../shaders/glass.vert';
import { glassFrag } from '../shaders/glass.frag';

export interface GlassPanelConfig {
  x: number; y: number; z: number;
  width: number; height: number;
  cornerRadius: number;
  tint: [number, number, number, number]; // RGBA
  refraction: number;
  chromaticAberration: number;
  roughness: number;
}

export class SpatialEngine {
  private gl: WebGL2RenderingContext;
  private tracker: ParallaxTracker;
  
  // Render Targets
  private backgroundFBO!: WebGLFramebuffer;
  private backgroundTexture!: WebGLTexture;
  
  // Shader Program
  private glassProgram!: WebGLProgram;
  
  // Geometry (Shared Quad)
  private vao!: WebGLVertexArrayObject;
  
  // UI Elements
  private panels: GlassPanelConfig[] = [];
  
  // State
  private isRunning = false;
  private startTime = Date.now();

  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl2', { antialias: true, alpha: false });
    if (!gl) throw new Error('WebGL2 not supported');
    this.gl = gl;
    
    this.tracker = new ParallaxTracker(canvas);
    
    this.initFBO();
    this.glassProgram = this.createProgram(glassVert, glassFrag);
    this.initGeometry();
    
    window.addEventListener('resize', this.onResize);
    this.onResize();
  }

  private onResize = () => {
    const canvas = this.gl.canvas as HTMLCanvasElement;
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
    this.gl.viewport(0, 0, canvas.width, canvas.height);
    this.initFBO(); // Recreate FBO at new resolution
  };

  /**
   * Initializes the Framebuffer Object used to capture the background
   * behind the UI panels for refraction sampling.
   */
  private initFBO() {
    const gl = this.gl;
    if (this.backgroundFBO) gl.deleteFramebuffer(this.backgroundFBO);
    if (this.backgroundTexture) gl.deleteTexture(this.backgroundTexture);

    this.backgroundTexture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, this.backgroundTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.canvas.width, gl.canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    this.backgroundFBO = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.backgroundFBO);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.backgroundTexture, 0);
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  /**
   * Compiles and links shaders.
   */
  private createProgram(vsSource: string, fsSource: string): WebGLProgram {
    const gl = this.gl;
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error('Shader compile error: ' + gl.getShaderInfoLog(shader));
      }
      return shader;
    };

    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vsSource));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fsSource));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error('Program link error: ' + gl.getProgramInfoLog(program));
    }
    return program;
  }

  /**
   * Sets up a standard normalized quad. All UI panels scale this base geometry.
   */
  private initGeometry() {
    const gl = this.gl;
    this.vao = gl.createVertexArray()!;
    gl.bindVertexArray(this.vao);

    // X, Y, Z, U, V, Nx, Ny, Nz
    const vertices = new Float32Array([
      -0.5,  0.5, 0.0,  0.0, 1.0,  0.0, 0.0, 1.0,
      -0.5, -0.5, 0.0,  0.0, 0.0,  0.0, 0.0, 1.0,
       0.5,  0.5, 0.0,  1.0, 1.0,  0.0, 0.0, 1.0,
       0.5, -0.5, 0.0,  1.0, 0.0,  0.0, 0.0, 1.0,
    ]);

    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const stride = 8 * 4;
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, stride, 3 * 4);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 3, gl.FLOAT, false, stride, 5 * 4);

    gl.bindVertexArray(null);
  }

  public addPanel(config: GlassPanelConfig) {
    this.panels.push(config);
  }

  public start() {
    this.tracker.start();
    this.isRunning = true;
    requestAnimationFrame(this.renderLoop);
  }

  public stop() {
    this.tracker.stop();
    this.isRunning = false;
  }

  private renderLoop = () => {
    if (!this.isRunning) return;
    const gl = this.gl;
    this.tracker.update();

    // ── PASS 1: Render Background ──
    // In a full application, you would render your 3D scene (particles, abstract models) here.
    // For scaffolding, we clear to a dark color to represent the void.
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.backgroundFBO);
    gl.clearColor(0.02, 0.03, 0.05, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // TODO: Client hooks into here to render their custom 3D background
    
    // ── PASS 2: Render Glass UI Panels ──
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    
    gl.useProgram(this.glassProgram);
    gl.bindVertexArray(this.vao);

    // Set globals
    const proj = mat4.create();
    // Assuming 1 unit = 1 pixel for orthographic-like UI projection, but with perspective for parallax depth
    const aspect = gl.canvas.width / gl.canvas.height;
    mat4.perspective(proj, (45 * Math.PI) / 180, aspect, 0.1, 1000.0);
    
    const view = this.tracker.getViewMatrix(1000); // Camera backed up 1000 units
    const orthoWidth = 1000 * Math.tan((45/2)*Math.PI/180) * 2 * aspect;
    const orthoHeight = 1000 * Math.tan((45/2)*Math.PI/180) * 2;
    
    const lightPos = this.tracker.getLightPosition(orthoWidth, orthoHeight);

    const setMat4 = (name: string, mat: mat4) => gl.uniformMatrix4fv(gl.getUniformLocation(this.glassProgram, name), false, mat);
    const setVec3 = (name: string, vec: vec3 | number[]) => gl.uniform3fv(gl.getUniformLocation(this.glassProgram, name), vec);
    const setVec2 = (name: string, x: number, y: number) => gl.uniform2f(gl.getUniformLocation(this.glassProgram, name), x, y);
    const setFloat = (name: string, val: number) => gl.uniform1f(gl.getUniformLocation(this.glassProgram, name), val);
    
    setMat4('uProjectionMatrix', proj);
    setMat4('uViewMatrix', view);
    setVec2('uResolution', gl.canvas.width, gl.canvas.height);
    setVec3('uLightPos', lightPos);
    setFloat('uTime', (Date.now() - this.startTime) / 1000.0);

    // Bind Background Texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.backgroundTexture);
    gl.uniform1i(gl.getUniformLocation(this.glassProgram, 'uBackground'), 0);

    // Draw Panels (Back to front sorting should be implemented here)
    for (const panel of this.panels) {
      const model = mat4.create();
      mat4.translate(model, model, [panel.x, panel.y, panel.z]);
      mat4.scale(model, model, [panel.width, panel.height, 1.0]);
      setMat4('uModelMatrix', model);
      
      setVec2('uPanelDimensions', panel.width, panel.height);
      setFloat('uCornerRadius', panel.cornerRadius);
      gl.uniform4fv(gl.getUniformLocation(this.glassProgram, 'uBaseTint'), panel.tint);
      setFloat('uRefraction', panel.refraction);
      setFloat('uChromaticAb', panel.chromaticAberration);
      setFloat('uRoughness', panel.roughness);
      setFloat('uEdgeGlow', 1.0); // Can be parameterized per panel

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    requestAnimationFrame(this.renderLoop);
  };
}
