precision highp float;

attribute vec4 position;
attribute vec3 normal;
attribute vec2 uv;

uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uNormalMatrix;

varying vec3 vNormal;
varying vec3 vWorldPos;
varying vec2 vUv;

void main() {
    mat4 rotViewMatrix = mat4(mat3(uViewMatrix));
    vUv = uv;
    gl_Position = uProjectionMatrix * rotViewMatrix * position;
}