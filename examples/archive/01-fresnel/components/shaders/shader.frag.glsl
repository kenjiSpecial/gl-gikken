precision highp float;

uniform vec3 uCameraPosition;
uniform vec3 uLightDirection;
uniform bool uSchlick;

uniform float uSchlickR0;

varying vec3 vNormal;
varying vec3 vPosition;

void main() {

    vec3 viewDirection = normalize(uCameraPosition - vPosition);
    vec3 halfVector = normalize(viewDirection + normalize(uLightDirection));
    float HdV = max(0.001, dot(halfVector, viewDirection));
    float w = pow(1.0 - HdV, 5.0);
    float spec = max(0.0, dot(
                  reflect(-uLightDirection, vNormal), 
                  viewDirection)) * w;

    // float w = pow(1.0 - max(0.0, 
    //               dot(halfVector, viewDirection)), 5.0);
    // float specularReflection = min(w, 1.0);

    // vec3 color = normalize(vNormal + vec3(1.0));
    vec3 color = vec3(spec);

    gl_FragColor = vec4(color, 1.0);
}  