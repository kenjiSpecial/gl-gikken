precision highp float;

varying vec3 vNormal;
varying vec3 vPos;

uniform samplerCube uCubeTexture;
uniform vec3 uCameraPos;

vec3 getColor(){
    vec3 up = vec3(0.0, 1.0, 0.0);
    vec3 right = normalize(cross(up, vNormal));
    up = cross(vNormal,right);

    vec3 sampledColour = vec3(0.,0.,0.);
    float index = 0.;

    for(float phi = 0.; phi < 6.283; phi += 0.025 * 4.){
        for(float theta = 0.; theta < 1.57; theta += 0.1 * 4.){
            vec3 temp = cos(phi) * right + sin(phi) * up;
            vec3 sampleVector = cos(theta) * vNormal + sin(theta) * temp;
            sampledColour += textureCube( uCubeTexture, sampleVector ).rgb * 
                                      cos(theta) * sin(theta);
            index = index + 1.;
        }
    }

    return  3.141592 * sampledColour / index;
}

void main() {
    gl_FragColor = vec4(getColor(), 1.0);
} 