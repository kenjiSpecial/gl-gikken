#version 300 es

precision highp float;

uniform samplerCube uTexture;
// uniform sampler2D uTexture;

in vec3 vNorm;
// in vec2 vUv;

out vec4 myOutputColor;

void main() {
    // myOutputColor = texture(uTexture, vNorm); 

    myOutputColor = texture(uTexture, vNorm);
    // myOutputColor.a = 1.0; 
    // myOutputColor = vec4(vUv, 0.0, 1.0);
}