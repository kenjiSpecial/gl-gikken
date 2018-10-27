#version 300 es

layout(location = 0) in vec4 position;
layout(location = 1) in vec2 uv;

out vec2 vUv;

void main(){
    gl_Position = position;// + vec4(0.5, 0.5, 0.0, 0.0);
    vUv = uv;
}