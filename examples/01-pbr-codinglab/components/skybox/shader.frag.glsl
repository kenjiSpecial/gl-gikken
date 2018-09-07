precision highp float;

uniform samplerCube uTexture;

varying vec3 vNorm;

void main() {
    // gl_FragColor = textureCube(uTexture, vNorm);
    
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}