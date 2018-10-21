precision highp float;

attribute vec4 position;
attribute vec3 normal;

uniform vec2 uMinPosition;
uniform vec2 uMaxPosition;

varying vec3 vNormal;

void main(){
    vec2 pos = mix(uMinPosition, uMaxPosition, vec2(position.x/4.0, position.y/3.));

    gl_Position = vec4(pos, 0.0, 1.0);
    vNormal = normal;
}