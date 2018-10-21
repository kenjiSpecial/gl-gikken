precision highp float;

attribute vec4 position;
attribute vec3 normal;
attribute vec2 uv;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uNormalMatrix;

varying vec3 vNormal;
varying vec3 vWorldPos;
varying vec2 vUv;

void main() {
    vWorldPos = vec3(uModelMatrix * position);
    vNormal = normalize(vec3(uNormalMatrix * vec4(normal, 0.0)));
    vUv = uv;

    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * position;
}