precision highp float;

uniform samplerCube uTexture;
// uniform sampler2D uTexture;

varying vec3 vNorm;
varying vec2 vUv;

void main() {
    gl_FragColor = textureCube(uTexture, vNorm);

    // gl_FragColor = texture2D(uTexture, vUv);
    // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}