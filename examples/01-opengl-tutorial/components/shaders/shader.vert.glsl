precision highp float;

attribute vec4 position;
attribute vec3 normal;
attribute vec2 uv;

uniform mat4 uMVPMatrix;
uniform mat4 uNormalMatrix;

varying vec3 vNormal;
varying vec2 vUv;

void main() {
    vUv = uv;

    gl_Position = uMVPMatrix * position;
}