precision highp float;

varying vec3 vNormal;

void main() {
    vec3 color = normalize(vNormal + vec3(1.0));
    gl_FragColor = vec4(color, 1.0);
}  