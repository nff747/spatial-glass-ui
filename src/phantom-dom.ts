export interface SpatialTransform {
  x: number;
  y: number;
  width: number;
  height: number;
  matrix4x4?: number[]; // 16-element WebGL Model-View-Projection matrix
}

export class PhantomDOM {
  private container: HTMLElement;
  private elementMap: Map<string, HTMLElement> = new Map();
  private isInteractiveOverlay: boolean = false;

  constructor(containerId: string = 'phantom-dom-container', enableHitboxOverlay: boolean = true) {
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      this.isInteractiveOverlay = enableHitboxOverlay;

      if (enableHitboxOverlay) {
        // High-precision Sub-Pixel Spatial Overlay Mode
        container.style.position = 'fixed';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '100vw';
        container.style.height = '100vh';
        container.style.pointerEvents = 'none';
        container.style.zIndex = '9999';
        container.style.overflow = 'hidden';
      } else {
        // Pure WCAG Screen Reader Offscreen Mode
        container.style.position = 'absolute';
        container.style.width = '1px';
        container.style.height = '1px';
        container.style.padding = '0';
        container.style.margin = '-1px';
        container.style.overflow = 'hidden';
        container.style.clip = 'rect(0, 0, 0, 0)';
        container.style.whiteSpace = 'nowrap';
        container.style.border = '0';
      }
      document.body.appendChild(container);
    }
    this.container = container;
  }

  addElement(id: string, role: string, ariaLabel: string, content?: string, transform?: SpatialTransform) {
    if (this.elementMap.has(id)) {
      this.updateElement(id, { role, ariaLabel, content, transform });
      return;
    }
    const el = document.createElement('div');
    el.id = `phantom-${id}`;
    el.setAttribute('role', role);
    el.setAttribute('aria-label', ariaLabel);
    if (content) {
      el.textContent = content;
    }

    if (this.isInteractiveOverlay) {
      el.style.position = 'absolute';
      el.style.pointerEvents = 'auto';
      el.style.cursor = 'pointer';
      el.style.opacity = '0'; // Visually transparent, physically tactile
      if (transform) {
        this.applyTransform(el, transform);
      }
    }

    // Make focusable if it is interactive
    if (role === 'button' || role === 'link' || role === 'checkbox' || role === 'slider') {
      el.tabIndex = 0;
    }
    this.container.appendChild(el);
    this.elementMap.set(id, el);
  }

  private applyTransform(el: HTMLElement, t: SpatialTransform) {
    el.style.width = `${t.width}px`;
    el.style.height = `${t.height}px`;
    if (t.matrix4x4 && t.matrix4x4.length === 16) {
      el.style.transform = `matrix3d(${t.matrix4x4.join(',')})`;
      el.style.transformOrigin = '0 0';
    } else {
      el.style.left = `${t.x}px`;
      el.style.top = `${t.y}px`;
    }
  }

  updateElement(id: string, updates: { role?: string; ariaLabel?: string; content?: string; transform?: SpatialTransform }) {
    const el = this.elementMap.get(id);
    if (!el) return;
    if (updates.role) el.setAttribute('role', updates.role);
    if (updates.ariaLabel) el.setAttribute('aria-label', updates.ariaLabel);
    if (updates.content) el.textContent = updates.content;
    if (updates.transform) this.applyTransform(el, updates.transform);
  }

  syncSpatialTransform(id: string, transform: SpatialTransform) {
    const el = this.elementMap.get(id);
    if (el) this.applyTransform(el, transform);
  }

  removeElement(id: string) {
    const el = this.elementMap.get(id);
    if (el) {
      this.container.removeChild(el);
      this.elementMap.delete(id);
    }
  }

  cleanup() {
    this.container.remove();
    this.elementMap.clear();
  }
}
