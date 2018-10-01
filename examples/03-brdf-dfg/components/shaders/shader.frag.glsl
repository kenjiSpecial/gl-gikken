#extension GL_EXT_shader_texture_lod : enable
#extension GL_OES_standard_derivatives : enable

#define PI 3.1415
precision highp float;

varying vec3 vNormal;
varying vec3 vWorldPos;

uniform float uType;
uniform vec3 uCameraPos;
uniform vec3 uLightPos;
uniform vec3 uLightDir;
uniform float uRoughness;

float DistributionGGX(vec3 N, vec3 H, float a)
{
    float a2     = a*a;
    float NdotH  = max(dot(N, H), 0.0);
    float NdotH2 = NdotH*NdotH;
	
    float nom    = a2;
    float denom  = (NdotH2 * (a2 - 1.0) + 1.0);
    denom        = PI * denom * denom;
	
    return nom / denom;
}

float GeometrySchlickGGX(float NdotV, float k)
{
    float nom   = NdotV;
    float denom = NdotV * (1.0 - k) + k;
	
    return nom / denom;
}
  
float GeometrySmith(vec3 N, vec3 V, vec3 L, float k)
{
    float NdotV = max(dot(N, V), 0.0);
    float NdotL = max(dot(N, L), 0.0);
    float ggx1 = GeometrySchlickGGX(NdotV, k);
    float ggx2 = GeometrySchlickGGX(NdotL, k);
	
    return ggx1 * ggx2;
}

vec3 fresnelSchlick(float cosTheta, vec3 F0)
{
    return F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);
}

void main() {
    vec3 color;
    vec3 cameraDir = normalize(uCameraPos - vWorldPos);
    vec3 lightDir = normalize(uLightDir);
    vec3 halfVec = normalize( cameraDir + lightDir  );

    if(uType == 0.0){
        color = vec3(DistributionGGX(vNormal, halfVec, uRoughness));
    }else if(uType == 1.0){
        float k = (uRoughness + 1.0) * (uRoughness + 1.0) / 8.0;
        color = vec3(GeometrySmith(vNormal, cameraDir, lightDir, k));
    }else{
        vec3 F0 = vec3(0.02);
        // lightDir = normalize(vec3(0., 5., 8.) - vWorldPos);
        // halfVec = normalize( cameraDir + lightDir  );

        color = fresnelSchlick(max(dot(cameraDir, halfVec), 0.0),F0);
        // color = vec3( pow(1.0 - max(dot(cameraDir, halfVec), 0.0), 5.0) );
    }
    // color = normalize(lightDir + vec3(1.0));
    gl_FragColor = vec4(color, 1.0);
}  