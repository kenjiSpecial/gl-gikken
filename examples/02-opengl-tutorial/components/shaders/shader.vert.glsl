precision highp float;

attribute vec4 position;
attribute vec3 normal;
attribute vec2 uv;

// uniform mat4 uMVPMatrix;
uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uNormalMatrix;

varying vec3 vNormal;

varying vec2 vUv;
varying vec3 vWorldPos;

void main() {
    vUv = uv;
    vNormal =  mat3(uModelMatrix) * normal;
    
    vec4 pos = uModelMatrix * position;
    vWorldPos = vec3(uModelMatrix * position);

    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * position;
}