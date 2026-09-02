export const glassFrag = `#version 300 es
precision highp float;

uniform sampler2D uBackground; // Framebuffer texture of the scene behind the UI
uniform vec2 uResolution;      // Screen resolution
uniform vec3 uLightPos;        // 3D position of the cursor / virtual light
uniform float uTime;
uniform vec2 uPanelDimensions; // Width/Height of the specific UI panel
uniform float uCornerRadius;   // SDF corner radius

// Glass Properties
uniform vec4 uBaseTint;        // Base dark glass color
uniform float uRefraction;     // Index of refraction intensity
uniform float uChromaticAb;    // Chromatic aberration spread
uniform float uRoughness;      // Microfacet roughness (blur approximation)
uniform float uEdgeGlow;       // Intensity of cursor edge illumination

in vec3 vPosition;
in vec2 vUv;
in vec3 vNormal;
in vec3 vViewPosition;

out vec4 fragColor;

// ── Signed Distance Field (SDF) for procedural rounded rectangles ──
float sdRoundRect(vec2 p, vec2 b, float r) {
    vec2 d = abs(p) - b + vec2(r);
    return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - r;
}

// ── Hash function for noise/dithering ──
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    // 1. SDF Masking for rounded corners (Zero-DOM UI clipping)
    // Convert UVs [0,1] to local pixel coordinates centered at 0,0
    vec2 localPos = (vUv - 0.5) * uPanelDimensions;
    vec2 halfSize = uPanelDimensions * 0.5;
    float dist = sdRoundRect(localPos, halfSize, uCornerRadius);
    
    // Anti-aliased alpha mask based on SDF
    float alphaMask = 1.0 - smoothstep(-1.0, 1.0, dist);
    if (alphaMask <= 0.001) discard;

    // 2. Screen-space coordinates for background sampling
    vec2 screenUv = gl_FragCoord.xy / uResolution;

    // 3. Normal processing & View Vector
    // Add micro-bump noise to normal for "frosted" glass effect based on roughness
    vec3 N = normalize(vNormal);
    vec3 noiseNormal = normalize(vec3(hash(vUv * 100.0) - 0.5, hash(vUv * 100.0 + 42.0) - 0.5, 1.0));
    N = normalize(mix(N, noiseNormal, uRoughness * 0.2));
    
    vec3 V = normalize(vViewPosition);

    // 4. Fresnel Reflectance (Schlick's approximation)
    float R0 = 0.04; // Base reflectivity for glass
    float fresnel = R0 + (1.0 - R0) * pow(1.0 - max(dot(N, V), 0.0), 5.0);

    // 5. Chromatic Aberration & Refraction sampling
    // Offset background UVs based on normal (refraction) and separate RGB channels
    vec2 refrOffset = N.xy * uRefraction * 0.1;
    vec2 chrOffset = N.xy * uChromaticAb * 0.02;

    float r = texture(uBackground, screenUv - refrOffset + chrOffset).r;
    float g = texture(uBackground, screenUv - refrOffset).g;
    float b = texture(uBackground, screenUv - refrOffset - chrOffset).b;
    vec3 refractedBg = vec3(r, g, b);

    // 6. Dynamic Lighting (Cursor Proximity Volumetric Glow)
    vec3 L = normalize(uLightPos - vPosition);
    vec3 H = normalize(L + V);
    
    // Specular highlight
    float spec = pow(max(dot(N, H), 0.0), 128.0 * (1.0 - uRoughness));
    
    // Distance-based edge illumination (cursor proximity)
    float cursorDist = length(uLightPos.xy - vPosition.xy);
    float edgeIllumination = smoothstep(200.0, 0.0, cursorDist) * uEdgeGlow;
    
    // Procedural internal border glow (subsurface scattering fake)
    float borderGlow = smoothstep(-uCornerRadius, 0.0, dist) * 0.3;

    // 7. Compositing
    // Blend refracted background with dark tint
    vec3 finalColor = mix(refractedBg, uBaseTint.rgb, uBaseTint.a);
    
    // Add Fresnel rim light, specular bloom, and cursor illumination
    finalColor += vec3(fresnel * 0.8);
    finalColor += vec3(spec * 1.5);
    finalColor += vec3(0.0, 0.8, 1.0) * edgeIllumination; // Cyan cursor cast
    finalColor += vec3(1.0, 1.0, 1.0) * borderGlow * fresnel; // Internal frosted rim

    fragColor = vec4(finalColor, alphaMask);
}
`;
