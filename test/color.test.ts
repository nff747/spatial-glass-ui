import { describe, it, expect } from 'vitest';
import {
  getRelativeLuminance,
  getContrastRatio,
  passesWcagAA,
  passesWcagAAA
} from '../src/color';

describe('WCAG 2.1 Contrast and Luminance Evaluation', () => {
  it('calculates relative luminance for pure black and pure white', () => {
    expect(getRelativeLuminance({ r: 0, g: 0, b: 0 })).toBe(0.0);
    expect(getRelativeLuminance({ r: 255, g: 255, b: 255 })).toBe(1.0);
  });

  it('calculates maximum contrast ratio (21:1) between black and white', () => {
    const white = { r: 255, g: 255, b: 255 };
    const black = { r: 0, g: 0, b: 0 };
    const ratio = getContrastRatio(white, black);

    expect(ratio).toBeCloseTo(21.0, 1);
    expect(passesWcagAA(ratio)).toBe(true);
    expect(passesWcagAAA(ratio)).toBe(true);
  });

  it('calculates minimum contrast ratio (1:1) between identical colors', () => {
    const gray = { r: 128, g: 128, b: 128 };
    const ratio = getContrastRatio(gray, gray);

    expect(ratio).toBeCloseTo(1.0, 2);
    expect(passesWcagAA(ratio)).toBe(false);
    expect(passesWcagAAA(ratio)).toBe(false);
  });

  it('correctly discriminates AA vs AAA thresholds for normal and large text', () => {
    // 3.5 ratio
    expect(passesWcagAA(3.5, false)).toBe(false);
    expect(passesWcagAA(3.5, true)).toBe(true); // Large text passes AA

    // 5.0 ratio
    expect(passesWcagAA(5.0, false)).toBe(true);
    expect(passesWcagAAA(5.0, false)).toBe(false);
    expect(passesWcagAAA(5.0, true)).toBe(true); // Large text passes AAA
  });
});
