precision highp float;


#define M_PI 3.1415926535897932384626433832795

#define R_Diffuse 1.0;

uniform vec3 uCameraPos;
uniform vec3 uLightDir;
uniform float uRoughness;
uniform float uType;

varying vec3 vNormal;
varying vec3 vPos;

float chiGGX(float v)
{
    return v > 0. ? 1. : 0.;
}

float GGX_Distribution(vec3 n, vec3 h, float alpha)
{

    float NoH = dot(n,h);
    float alpha2 = alpha * alpha;
    float NoH2 = NoH * NoH;
    float den = NoH2 * alpha2 + (1. - NoH2);
    
    return (chiGGX(NoH) * alpha2) / ( M_PI * den * den );
}

float saturate(float val){
    return clamp(val, 0.0, 1.0);
}

float GGX_PartialGeometryTerm(vec3 v, vec3 n, vec3 h, float alpha)
{
    float VoH2 = saturate(dot(v,h));
    float chi = chiGGX( VoH2 / saturate(dot(v,n)) );
    VoH2 = VoH2 * VoH2;
    float tan2 = ( 1. - VoH2 ) / VoH2;
    return VoH2; //(chi * 2.) / ( 1. + sqrt( 1. + alpha * alpha * tan2 ) );
    // return a;
}

void main() {
    // vec3 color = normalize(vNormal + vec3(1.0));
    vec3 camDir = normalize(uCameraPos - vPos);
    vec3 halfVec = normalize( normalize(-uLightDir) + camDir);

    vec3 color;
    if(uType < 1.) color = vec3(GGX_Distribution(vNormal, halfVec, uRoughness));
    else if(uType < 2.) color = vec3(GGX_PartialGeometryTerm(camDir, vNormal, halfVec, uRoughness));
    else color = vec3(1.0);

    gl_FragColor = vec4(vec3(color), 1.0);
    // gl_FragColor = vec4(vec3(normalize(camDir)), 1.0);
}  