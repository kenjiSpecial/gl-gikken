precision highp float;

const float PI = 3.14159265359;

uniform samplerCube uTexture;

varying vec3 vNorm;

void main(){
    vec3 N = normalize(vNorm);

    vec3 irradiance = vec3(0.0);   
    
    // tangent space calculation from origin point
    vec3 up    = vec3(0.0, 1.0, 0.0);
    vec3 right = cross(up, N);
    up            = cross(N, right);

    float sampleDelta = 0.025;
    float nrSamples = 0.0;
    // float phi = 0.0;
    // float theta = 0.0;

    for(float phi = 0.0; phi < 2.0 * 3.14; phi +=	0.025 )
    {
        for(float theta = 0.0; theta < 0.5 * 3.14; theta += 0.025)
        {
            // spherical to cartesian (in tangent space)
            vec3 tangentSample = vec3(sin(theta) * cos(phi),  sin(theta) * sin(phi), cos(theta));
            // tangent space to world
            vec3 sampleVec = tangentSample.x * right + tangentSample.y * up + tangentSample.z * N; 

            irradiance += textureCube(uTexture, sampleVec).rgb * cos(theta) * sin(theta);
            nrSamples++;
        }
    }
    irradiance = PI * irradiance * (1.0 / float(nrSamples));
    
    gl_FragColor = vec4(irradiance, 1.0);
}