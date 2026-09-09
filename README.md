<div align="center">

<img src="assets/banner.jpg" width="800" alt="Project Banner">


# 🪞 spatial-glass-ui

**Hardware-Accelerated Zero-DOM Spatial Interfaces**

[![Powered by nff747](https://img.shields.io/badge/Powered%20by-nff747-111111?style=for-the-badge&logo=github&logoColor=white)](https://github.com/nff747)
[![License: MIT](https://img.shields.io/badge/License-MIT-FF0055.svg?style=for-the-badge)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![WebGL2](https://img.shields.io/badge/WebGL_2.0-000000.svg?style=for-the-badge&logo=webgl&logoColor=white)]()

*Stop destroying framerates with CSS `backdrop-filter: blur()`.<br>Render true volumetric, refraction-accurate dark glassmorphism directly on the GPU.*

[The CSS Bottleneck](#the-problem-the-css-backdrop-filter-bottleneck) · [Architecture](#architecture-two-pass-spatial-rendering) · [Custom Shaders](#shader-mathematics) · [API](#api-usage)

</div>

---

## The Problem: The CSS `backdrop-filter` Bottleneck

Modern web design loves "Glassmorphism." But implementing it with standard CSS (`backdrop-filter: blur()`) is a performance disaster:
1. **GPU Thrashing:** The browser must perform an expensive multi-pass Gaussian blur on the DOM layer behind *every single glass element*. Stacking 3 glass panels? Say goodbye to 60fps on mobile.
2. **Flat Limitations:** CSS blurs are 2D. They don't refract. They don't have chromatic aberration. They don't react volumetrically to light sources (cursors).
3. **Z-Depth Illusions:** CSS 3D transforms (`translateZ`) are fake projections that don't interact with physical lighting.

### The Solution: Spatial Engine
`spatial-glass-ui` bypasses the DOM entirely for UI rendering. It treats the UI as a series of 3D planes floating in a WebGL2 frustum. It samples a background Framebuffer Object (FBO) to compute **physically accurate refraction, chromatic aberration, and Fresnel reflectance** in a single optimized pass.

---

## Architecture: Two-Pass Spatial Rendering

Instead of div tags, we use hardware quads.

```
┌────────────────────────────────────────────────────────┐
│                  spatial-glass-ui                      │
│                                                        │
│  [PASS 1: The World]                                   │
│  Render underlying 3D scene (particles, video, etc)    │
│  └─> Output to Background FBO (Texture0)               │
│                                                        │
│  [PASS 2: The Interface]                               │
│  Sort UI Panels (Back-to-Front)                        │
│  For each panel:                                       │
│    1. Calculate SDF clipping (Rounded Corners)         │
│    2. Calculate View Vector (Parallax)                 │
│    3. Offset Texture0 UVs via Normal (Refraction)      │
│    4. Apply Volumetric Lighting (Cursor distance)      │
│  └─> Output to Screen                                  │
└────────────────────────────────────────────────────────┘
```

**Zero-DOM Clipping:** Instead of CSS `border-radius`, the fragment shader uses Signed Distance Fields (SDF) to mathematically clip the fragments, ensuring zero jagged edges and perfect anti-aliasing independent of resolution.

---

## 🎨 Dashboard Mockup

```text
┌────────────────────────────────────────────────────────────┐
│  ORBITAL NETWORKS / v2.4                                   │
│                                                            │
│  ┌──────────────────┐  ┌────────────────────────────────┐  │
│  │ Analytics Nav    │  │ ┌──────────────┐ ┌───────────┐ │  │
│  │                  │  │ │ Bandwidth    │ │ Latency   │ │  │
│  │ [ Overview ]     │  │ │ 98.6 Gbps    │ │ 12 ms     │ │  │
│  │                  │  │ └──────────────┘ └───────────┘ │  │
│  │ [ Network ]      │  │                                │  │
│  │                  │  │ ┌────────────────────────────┐ │  │
│  │ [ Settings ]     │  │ │ Waveform Activity          │ │  │
│  │                  │  │ │  /\      /\                │ │  │
│  └──────────────────┘  │ │ /  \    /  \      /\       │ │  │
│                        │ │/    \/\/    \____/  \      │ │  │
│                        │ └────────────────────────────┘ │  │
│                        └────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### 1. Installation

```bash
npm install spatial-glass-ui gl-matrix react react-dom
```

### 2. React JSX Usage

```tsx
import React from 'react';
import { GlassProvider, GlassPanel, GlassCard, GlassButton, HoloChart } from 'spatial-glass-ui';

export function Dashboard() {
  return (
    <GlassProvider className="dashboard-container">
      <div style={{ display: 'flex', gap: '20px' }}>
        <GlassPanel depth={50} cornerRadius={20}>
          <GlassButton>Overview</GlassButton>
          <GlassButton>Network</GlassButton>
        </GlassPanel>
        
        <div>
          <GlassCard depth={100}>
            <h2>Bandwidth</h2>
            <div>98.6 Gbps</div>
          </GlassCard>
          
          <HoloChart depth={150}>
            <h3>Waveform</h3>
            {/* Chart SVG */}
          </HoloChart>
        </div>
      </div>
    </GlassProvider>
  );
}
```

---

## 🧩 Component Gallery

The `spatial-glass-ui` React wrapper exports several pre-configured UI components for immediate use:

- **`GlassProvider`**: Initializes the `SpatialEngine` context and the WebGL canvas background.
- **`GlassPanel`**: The base container with physical refraction, customizable depth, and dynamic edge lighting.
- **`GlassCard`**: A preset with deeper Z-index and moderate blur/refraction, perfect for grouping content.
- **`GlassButton`**: An interactive element with hover states translated into physical light interactions.
- **`HoloChart`**: A preset styled with a subtle chromatic tint and high aberration for data visualizations.

---

## ⚙️ Customization

Customize the look and feel using standard CSS variables (Custom Properties) that hook directly into the WebGL uniforms:

```css
.my-glass-element {
  /* Controls the micro-bump roughness of the glass */
  --glass-blur: 0.5;
  
  /* Controls the RGB channel splitting */
  --glass-aberration: 0.15;
  
  /* The edge reflection glow color */
  --border-glow-color: rgba(0, 255, 255, 0.8);
}
```

---

## ♿ Accessibility

### Phantom DOM Mirroring

Bypassing the DOM for rendering normally destroys accessibility. `spatial-glass-ui` solves this with the **Phantom DOM**. 

For every glass component rendered in WebGL, an invisible, perfectly aligned DOM element is synced on top of it. This means:
- Screen readers (VoiceOver, NVDA) can still read your content.
- Keyboard navigation (Tab) works natively.
- Interactive hitboxes are pixel-perfect and aligned with the rendered geometry.

---

## Shader Mathematics

The magic happens in `glass.frag.ts`. Here is how the physical properties are computed:

### 1. Refraction & Chromatic Aberration
We offset the screen-space UV coordinates using the perturbed surface normal to simulate the bending of light. We sample the background texture three times with slight offsets to simulate wavelength separation (Chromatic Aberration).
```glsl
vec2 refrOffset = N.xy * uRefraction;
vec2 chrOffset = N.xy * uChromaticAb;
float r = texture(uBackground, screenUv - refrOffset + chrOffset).r;
float g = texture(uBackground, screenUv - refrOffset).g;
float b = texture(uBackground, screenUv - refrOffset - chrOffset).b;
```

### 2. Fresnel Reflectance
The edges of the glass reflect more light than the center facing the camera. We use Schlick's approximation:
```glsl
float fresnel = R0 + (1.0 - R0) * pow(1.0 - max(dot(N, V), 0.0), 5.0);
```

### 3. Dynamic Volumetric Lighting
The cursor acts as a point light source in 3D space (`uLightPos`). The shader computes distance-based edge illumination and specular highlights, making the glass "glow" as the cursor hovers near it.

---

## License

[MIT](LICENSE) — iKi / Frozen Flame

---

## 📜 Open Source & Commercial Use (MIT)

This project is 100% open-source software under the **[MIT License](LICENSE)**.

### 💼 Commercial Use & Free Redistribution
You are explicitly permitted to use, modify, fork, integrate, package, and sell commercial products or SaaS built using this engine with **one visible attribution requirement**:
> **Attribution Requirement**: You must include a visible credit to **nff747** in your application (e.g., `Powered by nff747` linking to [https://github.com/nff747](https://github.com/nff747) in your application UI, footer, about modal, or documentation).

```html
<!-- Example visible footer attribution -->
<p>Powered by <a href="https://github.com/nff747" target="_blank">nff747</a></p>
```
