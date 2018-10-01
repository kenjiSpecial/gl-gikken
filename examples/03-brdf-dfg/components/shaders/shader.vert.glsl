precision highp float;

attribute vec4 position;
attribute vec3 normal;

uniform mat4 uMVPMatrix;
uniform mat4 uModelMatrix;
uniform mat4 uNormalMatrix;

varying vec3 vNormal;
varying vec3 vWorldPos;

void main() {
    vWorldPos = vec3(uModelMatrix * position);
    vNormal = normalize(vec3(uNormalMatrix * vec4(normal, 0.0)));

    gl_Position = uMVPMatrix * position;
}