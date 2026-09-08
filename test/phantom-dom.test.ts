import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PhantomDOM } from '../src/phantom-dom';

describe('PhantomDOM', () => {
  let phantom: PhantomDOM;

  beforeEach(() => {
    document.body.innerHTML = '';
    phantom = new PhantomDOM();
  });

  afterEach(() => {
    phantom.cleanup();
  });

  it('creates an invisible container with proper positioning for overlay and offscreen modes', () => {
    const overlayContainer = document.getElementById('phantom-dom-container');
    expect(overlayContainer).not.toBeNull();
    expect(overlayContainer?.style.position).toBe('fixed');

    // Test pure WCAG offscreen screen-reader mode
    const offscreenPhantom = new PhantomDOM('offscreen-container', false);
    const offscreenContainer = document.getElementById('offscreen-container');
    expect(offscreenContainer).not.toBeNull();
    expect(offscreenContainer?.style.position).toBe('absolute');
    offscreenPhantom.cleanup();
  });

  it('adds an element with correct attributes', () => {
    phantom.addElement('btn-1', 'button', 'Start Game');
    const el = document.getElementById('phantom-btn-1');
    expect(el).not.toBeNull();
    expect(el?.getAttribute('role')).toBe('button');
    expect(el?.getAttribute('aria-label')).toBe('Start Game');
    expect(el?.tabIndex).toBe(0);
  });

  it('updates an existing element', () => {
    phantom.addElement('text-1', 'text', 'Hello', 'Hello');
    phantom.updateElement('text-1', { content: 'World', ariaLabel: 'World Label' });
    const el = document.getElementById('phantom-text-1');
    expect(el?.textContent).toBe('World');
    expect(el?.getAttribute('aria-label')).toBe('World Label');
  });

  it('removes an element', () => {
    phantom.addElement('btn-2', 'button', 'Click me');
    expect(document.getElementById('phantom-btn-2')).not.toBeNull();
    phantom.removeElement('btn-2');
    expect(document.getElementById('phantom-btn-2')).toBeNull();
  });
});
