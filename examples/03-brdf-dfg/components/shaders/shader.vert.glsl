#version 300 es

precision highp float;

in vec4 position;
in vec3 normal;
in vec2 uv;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uNormalMatrix;

out vec3 vNormal;
out vec3 vWorldPos;
out vec2 vUv;

void main() {
    vWorldPos = vec3(uModelMatrix * position);
    vNormal = normalize(vec3(uNormalMatrix * vec4(normal, 0.0)));
    vUv = uv;

    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * position;
}