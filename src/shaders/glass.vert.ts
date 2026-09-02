export const glassVert = `#version 300 es
precision highp float;

layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec2 aUv;
layout(location = 2) in vec3 aNormal;

uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uModelMatrix;

out vec3 vPosition;
out vec2 vUv;
out vec3 vNormal;
out vec3 vViewPosition;

void main() {
    vec4 worldPosition = uModelMatrix * vec4(aPosition, 1.0);
    vec4 viewPosition = uViewMatrix * worldPosition;
    
    vPosition = worldPosition.xyz;
    vUv = aUv;
    
    // Transform normal to world space
    mat3 normalMatrix = transpose(inverse(mat3(uModelMatrix)));
    vNormal = normalize(normalMatrix * aNormal);
    
    vViewPosition = -viewPosition.xyz;
    
    gl_Position = uProjectionMatrix * viewPosition;
}
`;
