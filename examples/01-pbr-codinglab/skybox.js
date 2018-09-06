import vertexShaderSrc from './components/shaders/shader.vert.glsl';
import fragmentShaderSrc from './components/shaders/shader.frag.glsl';

import { Program } from 'tubugl-core/src/program';
import { mat4 } from 'gl-matrix/src/gl-matrix';
import  { createSimpleBox } from '../vendors/utils/generator';

export class SkyBox {
    /**
     * 
     * @param {object} params 
     * @param {WebGLRenderingContext} params.gl
     */
    constructor(params = {}){
        this._gl = params.gl;
        this._createProgram();

    }

    _createProgram(){
        const gl = this._gl;
        this._program = new Program(gl, vertexShaderSrc, fragmentShaderSrc);
    }

    _makeBuffer() {
        const {normals, positions, uvs} = createSimpleBox(1, 1, 1);

        const gl = this._gl;

        this.positionBuffer = gl.createBuffer();
        this.aPositionLocation = gl.getAttribLocation(this._program.id, 'position');
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bindBuffer(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

        this.normalBuffer = gl.createBuffer();
        this.aNormalLocation = gl.getAttribLocation(this._program.id, 'normal');
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.bindBuffer(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
        
        this.uvBuffer = gl.createBuffer();
        this.aUvLocation = gl.getAttribLocation(this._program.id, 'uv');
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.bindBuffer(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);

        this._cnt = positions.length / 3;
    }

    _createMatrix() {
		this._modelMatrix = mat4.create();
		this._mvMatrix = mat4.create();
		this._mvpMatrix = mat4.create();

		this._modelInverse = mat4.create();
		this._normalMatrix = mat4.create();
    }
    
    _getUniformLocation(){
        const gl = this._gl;
        this._uMVPMatirxLocation = gl.getUniformLocation(this._program.id, 'uMVPMatrix');
        this._uTextureLocation = gl.getUniformLocation(this._program.id, 'uTexture');
    }

    updateModelMatrix() {
        this._modelMatrix = mat4.fromScaling(this._modelMatrix, [300, 300, 300]);
    }
}