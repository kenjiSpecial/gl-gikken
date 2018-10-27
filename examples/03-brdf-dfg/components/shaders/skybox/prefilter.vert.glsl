#version 300 es

precision highp float;

in vec4 position;
// in vec2 uv;

uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

out vec3 vNorm;
// out vec2 vUv;

void main() {
    mat4 rotViewMatrix = mat4(mat3(uViewMatrix));
    gl_Position = uProjectionMatrix * rotViewMatrix * position;

    vNorm = position.rgb;
}