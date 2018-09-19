
precision highp float;

attribute vec4 position;

uniform mat4 uMVPMatrix;

varying vec3 vNorm;

void main() {
    gl_Position = uMVPMatrix * position;
    vNorm = position.rgb;
}