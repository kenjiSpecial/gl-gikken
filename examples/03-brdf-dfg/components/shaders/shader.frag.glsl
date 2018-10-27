#version 300 es

#define PI 3.1415
precision highp float;

in vec3 vNormal;
in vec3 vWorldPos;
in vec2 vUv;

uniform sampler2D uAlbedoTex;
uniform sampler2D uAoTex;
uniform sampler2D uNormalTex;
uniform sampler2D uMetallicTex;
uniform sampler2D uRoughnessTex;

uniform samplerCube uIrradianceMap;
uniform samplerCube uPrefilterMap;
uniform sampler2D uBrdfLUTTex;

uniform vec3 uCameraPos;
uniform vec3 uLightPos;

out vec4 myOutputColor;


vec3 getNormalFromMap(){
    vec3 tangentNormal = texture(uNormalTex, vUv).xyz * 2.0 - 1.0;

    vec3 Q1  = dFdx(vWorldPos);
    vec3 Q2  = dFdy(vWorldPos);
    vec2 st1 = dFdx(vUv);
    vec2 st2 = dFdy(vUv);

    vec3 N   = normalize(vNormal);
    vec3 T  = normalize(Q1*st2.t - Q2*st1.t);
    vec3 B  = -normalize(cross(N, T));
    mat3 TBN = mat3(T, B, N);

    return normalize(TBN * tangentNormal);
}

float DistributionGGX(vec3 N, vec3 H, float roughness)
{
    float a = roughness*roughness;
    float a2 = a*a;
    float NdotH = max(dot(N, H), 0.0);
    float NdotH2 = NdotH*NdotH;

    float nom   = a2;
    float denom = (NdotH2 * (a2 - 1.0) + 1.0);
    denom = PI * denom * denom;

    return nom / max(denom, 0.001); // prevent divide by zero for roughness=0.0 and NdotH=1.0
}
// ----------------------------------------------------------------------------
float GeometrySchlickGGX(float NdotV, float roughness)
{
    float r = (roughness + 1.0);
    float k = (r*r) / 8.0;

    float nom   = NdotV;
    float denom = NdotV * (1.0 - k) + k;

    return nom / denom;
}
// ----------------------------------------------------------------------------
float GeometrySmith(vec3 N, vec3 V, vec3 L, float roughness)
{
    float NdotV = max(dot(N, V), 0.0);
    float NdotL = max(dot(N, L), 0.0);
    float ggx2 = GeometrySchlickGGX(NdotV, roughness);
    float ggx1 = GeometrySchlickGGX(NdotL, roughness);

    return ggx1 * ggx2;
}
// ----------------------------------------------------------------------------
vec3 fresnelSchlick(float cosTheta, vec3 F0)
{
    return F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);
}

// ----------------------------------------------------------------------------

vec3 fresnelSchlickRoughness(float cosTheta, vec3 F0, float roughness)
{
    return F0 + (max(vec3(1.0 - roughness), F0) - F0) * pow(1.0 - cosTheta, 5.0);
}   

// ----------------------------------------------------------------------------

void main() {
    vec3 albedo     = texture(uAlbedoTex, vUv).rgb; //pow(texture2D(uColorTex, vUv).rgb, 2.2);
    albedo.r = pow(albedo.r, 2.2);
    albedo.g = pow(albedo.g, 2.2);
    albedo.b = pow(albedo.b, 2.2);

    vec3 normal     = getNormalFromMap();
    float metallic  = texture(uMetallicTex, vUv).r;
    float roughness = texture(uRoughnessTex, vUv).r;
    float ao        = texture(uAoTex, vUv).r;

    vec3 N = normal; //normalize(vNormal);
    vec3 V = normalize(uCameraPos - vWorldPos);
    vec3 R = reflect(-V, N); 

    vec3 F0 = vec3(0.04); 
    F0 = mix(F0, albedo, metallic);

    // reflectance equation
    vec3 Lo = vec3(0.0);
    for(float i = 0.; i < 2.; i++) {
        vec3 lightPosition = uLightPos + vec3(i * 20., i * 20., 0.0);
        // calculate per-light radiance
        vec3 L = normalize(lightPosition - vWorldPos);
        // L = vec3(0., 0., 1.);
        vec3 H = normalize(V + L);
        float distance = length(lightPosition - vWorldPos);
        float attenuation = 1.0 / (distance * distance);
        vec3 radiance = vec3(300.) * attenuation;

        // Cook-Torrance BRDF
        float NDF = DistributionGGX(N, H, roughness);   
        float G   = GeometrySmith(N, V, L, roughness);      
        vec3 F    = fresnelSchlick(max(dot(H, V), 0.0), F0);
           
        vec3 nominator    = NDF * G * F; 
        float denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0) + 0.001; // 0.001 to prevent divide by zero.
        vec3 specular = nominator / denominator;
        
        // kS is equal to Fresnel
        vec3 kS = F;
        // for energy conservation, the diffuse and specular light can't
        // be above 1.0 (unless the surface emits light); to preserve this
        // relationship the diffuse component (kD) should equal 1.0 - kS.
        vec3 kD = vec3(1.0) - kS;
        // multiply kD by the inverse metalness such that only non-metals 
        // have diffuse lighting, or a linear blend if partly metal (pure metals
        // have no diffuse light).
        kD *= 1.0 - metallic;	  

        // scale light by NdotL
        float NdotL = max(dot(N, L), 0.0);        

        // add to outgoing radiance Lo
        Lo += (kD * albedo / PI + specular) * radiance * NdotL;  // note that we already multiplied the BRDF by the Fresnel (kS) so we won't multiply by kS again
    }   
    // vec3 color = ambient + Lo;
    // vec3 color = Lo;
    // ambient lighting (we now use IBL as the ambient term)
    vec3 F = fresnelSchlickRoughness(max(dot(N, V), 0.0), F0, roughness);

    vec3 kS = F;
    vec3 kD = 1.0 - kS;
    kD *= 1.0 - metallic;

    vec3 irradiance = texture(uIrradianceMap, N).rgb;
    vec3 diffuse      = irradiance * albedo;

    // sample both the pre-filter map and the BRDF lut and combine them together as per the Split-Sum approximation to get the IBL specular part.
    const float MAX_REFLECTION_LOD = 5.0;
    vec3 prefilteredColor = textureLod(uPrefilterMap, R,  roughness * MAX_REFLECTION_LOD).rgb;    
    vec2 brdf  = texture(uBrdfLUTTex, vec2(max(dot(N, V), 0.0), roughness)).rg;
    vec3 specular = prefilteredColor * (F * brdf.x + brdf.y);

    vec3 ambient = (kD * diffuse + specular) * ao;
    // vec3 ambient = vec3(0.03) * albedo * ao;

    vec3 color = Lo + ambient;

    // HDR tonemapping
    color = color / (color + vec3(1.0));
    // gamma correct
    color = pow(color, vec3(1.0/2.2));
 
    myOutputColor = vec4(color, 1.0);
    // gl_FragColor = vec4(albedo, 1.0);
    // gl_FragColor = vec4(vUv, 0.0, 1.0);
}  