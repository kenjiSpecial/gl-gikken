precision highp float;

uniform vec3 uCameraPosition;
uniform vec3 uLightDirection;
uniform bool uSchlick;

uniform float uSchlickR0;
uniform float uLightState;
uniform float uShininess; 
uniform float uSpecular;

uniform vec3 uLightAmbientColor;
uniform vec3 uLightColor;
uniform vec3 uMaterialColor;

uniform bool uIsDiffuseColor;
uniform bool uIsSpecularColor;


varying vec3 vNormal;
varying vec3 vPosition;

#define DIFFUSE_REFLECTION 1.0
#define SPECULAR_REFLECT 2.0
#define SPECULAR_REFLECT_AT_SILHOUETTE 3.0

void main() {
    vec3 color;
    if(uLightState < DIFFUSE_REFLECTION){
        float diffuseReflection = max(0.0, dot(-normalize(uLightDirection), vNormal));
        color = vec3(diffuseReflection);
    }else if(uLightState < SPECULAR_REFLECT){
        vec3 viewDirection = normalize(uCameraPosition - vPosition);
        float spec = pow(max(0.0, dot(
                reflect(uLightDirection, vNormal), 
                viewDirection)), uShininess);
        color = vec3(spec) * uSpecular;
    }else if(uLightState < SPECULAR_REFLECT_AT_SILHOUETTE){

        vec3 viewDirection = normalize(uCameraPosition - vPosition);
        vec3 halfVector = normalize(viewDirection + normalize(-uLightDirection));
        float HdV = max(0.001, dot(halfVector, viewDirection));
        float w = pow(1.0 - HdV, 5.0);
        float spec = pow(max(0.0, dot(
                    reflect(uLightDirection, vNormal), 
                    viewDirection)), uShininess);

        color = vec3(spec) * mix(uSpecular, 1., w);
    
    }else{

        vec3 ambientLightColor;

        // if (uIsAmbientColor) ambientLightColor = uLightAmbientColor * uMaterialColor;
        // else                 ambientLightColor = vec3(0.);
        

        vec3 diffuseColor;
        if (uIsDiffuseColor) diffuseColor = uMaterialColor * uLightColor * max(0.0, dot(-normalize(uLightDirection), vNormal));
        else                 diffuseColor = vec3(0.);

        vec3 specularReflection;
        if(uIsSpecularColor){
            vec3 viewDirection = normalize(uCameraPosition - vPosition);
            vec3 halfVector = normalize(viewDirection + normalize(-uLightDirection));
            float HdV = max(0.001, dot(halfVector, viewDirection));
            float w = pow(1.0 - HdV, 5.0);
            float spec = pow(max(0.0, dot(
                        reflect(uLightDirection, vNormal), 
                        viewDirection)), uShininess);

            specularReflection = spec * uSpecular * uLightColor;
        }else{
            specularReflection = vec3(0.0);
        }

        color = diffuseColor + specularReflection;
        
    }

    
    gl_FragColor = vec4(color, 1.0);
}  