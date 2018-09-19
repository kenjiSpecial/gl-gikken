precision highp float;

attribute vec4 position;
attribute vec3 normal;

uniform mat4 uPMatrix;
uniform mat4 uMVMatrix;
uniform mat4 uNormalMatrix;


varying vec3 vNormal;
varying vec3 vPos;

void main() {
    vNormal = normalize(vec3(uNormalMatrix * vec4(normal, 0.0)));
    vec4 spacePos = uMVMatrix * position;

    gl_Position = uPMatrix * spacePos;
    vPos = vec3(spacePos);
}