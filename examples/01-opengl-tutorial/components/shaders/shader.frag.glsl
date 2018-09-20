precision highp float;

uniform sampler2D uColorTex;
uniform sampler2D uAoTex;

varying vec3 vNormal;
varying vec2 vUv;

void main() {
    
    vec3 color = texture2D(uColorTex, vUv).rgb;
    // vec3 aoColor = texture2D(uAoTex, vUv).rgb;
    
    gl_FragColor = vec4(color, 1.0);
}  