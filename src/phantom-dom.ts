export class PhantomDOM {
  private container: HTMLElement;
  private elementMap: Map<string, HTMLElement> = new Map();

  constructor(containerId: string = 'phantom-dom-container') {
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      // Make it invisible but accessible for screen readers
      container.style.position = 'absolute';
      container.style.width = '1px';
      container.style.height = '1px';
      container.style.padding = '0';
      container.style.margin = '-1px';
      container.style.overflow = 'hidden';
      container.style.clip = 'rect(0, 0, 0, 0)';
      container.style.whiteSpace = 'nowrap';
      container.style.border = '0';
      document.body.appendChild(container);
    }
    this.container = container;
  }

  addElement(id: string, role: string, ariaLabel: string, content?: string) {
    if (this.elementMap.has(id)) {
      this.updateElement(id, { role, ariaLabel, content });
      return;
    }
    const el = document.createElement('div');
    el.id = `phantom-${id}`;
    el.setAttribute('role', role);
    el.setAttribute('aria-label', ariaLabel);
    if (content) {
      el.textContent = content;
    }
    // Make focusable if it is interactive
    if (role === 'button' || role === 'link' || role === 'checkbox' || role === 'slider') {
      el.tabIndex = 0;
    }
    this.container.appendChild(el);
    this.elementMap.set(id, el);
  }

  updateElement(id: string, updates: { role?: string; ariaLabel?: string; content?: string }) {
    const el = this.elementMap.get(id);
    if (!el) return;
    if (updates.role) el.setAttribute('role', updates.role);
    if (updates.ariaLabel) el.setAttribute('aria-label', updates.ariaLabel);
    if (updates.content) el.textContent = updates.content;
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
