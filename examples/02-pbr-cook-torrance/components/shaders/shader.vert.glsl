precision highp float;

attribute vec4 position;
attribute vec3 normal;

uniform mat4 uMMatrix;
uniform mat4 uVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNormalMatrix;

varying vec3 vNormal;
varying vec3 vPos;

void main() {
    vNormal = normalize(vec3(uNormalMatrix * vec4(normal, 0.0)));
    vPos = vec3(uMMatrix * position);

    gl_Position = uPMatrix * uVMatrix * uMMatrix * position;
    //vPos = vec3(spacePos);
}