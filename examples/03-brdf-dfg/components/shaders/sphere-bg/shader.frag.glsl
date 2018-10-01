precision highp float;

uniform sampler2D uColorTex;

varying vec2 vUv;

void main(){
    vec4 color = texture2D(uColorTex, vUv);

    gl_FragColor = color;
    
    // gl_FragColor.rg = vUv;
    // gl_FragColor.ba = vec2(1.0);
}