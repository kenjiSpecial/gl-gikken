#define PI 3.1415
precision highp float;

uniform sampler2D uColorTex;
uniform sampler2D uAoTex;
uniform vec3 uCameraPos;

uniform vec3  uAlbedo;
uniform float uMetallic;
uniform float uRoughness;
uniform vec3 uLightPos;

varying vec3 vNormal;
varying vec3 vWorldPos;
varying vec2 vUv;

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

void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(uCameraPos - vWorldPos);

    vec3 F0 = vec3(0.04); 
    float metallic = uMetallic;
    float roughness = uRoughness;
    vec3 albedo = uAlbedo;
    // F0 = mix(F0, uAlbedo, metallic);

    // reflectance equation
    vec3 Lo = vec3(0.0);
    for(float i = 0.; i < 4.; i++) {
        vec3 lightPosition = uLightPos + vec3(i * 5. -2.5, i * 2. - 2.5, 0.0);
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

    vec3 ambient = vec3(0.03) * uAlbedo;

    vec3 color = ambient + Lo;

    // HDR tonemapping
    color = color / (color + vec3(1.0));
    // gamma correct
    color = pow(color, vec3(1.0/2.2));

    
    // gl_FragColor = vec4(vec3(  nominator * radiance), 1.0);
    // gl_FragColor = vec4(V /2.+ 1./2., 1.0);
    // gl_FragColor = vec4(F, 1.0);
    // gl_FragColor = vec4((normalize(V) + vec3(1.0))/2., 1.0);
    gl_FragColor = vec4(color, 1.0);
}  