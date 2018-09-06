precision highp float;

attribute vec4 position;
attribute vec3 normal;

uniform mat4 uMVPMatrix;
uniform mat4 uNormalMatrix;

varying vec3 vNormal;

void main() {
    vNormal = normalize(vec3(uNormalMatrix * vec4(normal, 0.0)));
    // vNormal = normal;

    gl_Position = uMVPMatrix * position;
}