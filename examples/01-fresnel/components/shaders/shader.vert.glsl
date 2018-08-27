precision highp float;

attribute vec4 position;
attribute vec3 normal;

uniform mat4 uModelMatrix;
uniform mat4 uMVPMatrix;
uniform mat4 uNormalMatrix;
uniform vec3 uCameraPosition;


varying vec3 vNormal;
varying vec3 vPosition;

void main() {
    vNormal = normalize(vec3(uNormalMatrix * vec4(normal, 0.0)));    
    vPosition = vec3(uModelMatrix * position);

    gl_Position = uMVPMatrix * position; 

}