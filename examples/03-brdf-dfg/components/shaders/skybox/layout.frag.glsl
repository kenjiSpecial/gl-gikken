precision highp float;

varying vec3 vNormal;

uniform samplerCube uTexture;

void main() {
    gl_FragColor = textureCube(uTexture, vNormal);

    // gl_FragColor = texture2D(uTexture, vUv);
    
    // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}