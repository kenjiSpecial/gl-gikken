
precision highp float;

varying vec3 vNorm;

uniform samplerCube uEnvironmentMap;
uniform float roughness;

const float PI = 3.14159265359;

void main(){
    vec3 N = normalize(vNorm);
    
}