
precision highp float;

attribute vec4 position;
attribute vec2 uv;

uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

varying vec3 vNorm;

void main() {
    // vUv = uv;

    mat4 rotViewMatrix = mat4(mat3(uViewMatrix));
    gl_Position = uProjectionMatrix * rotViewMatrix * position;

    vNorm = position.rgb;
}