import vertexShaderSrc from './components/skybox/shader.vert.glsl';
import fragmentShaderSrc from './components/skybox/shader.frag.glsl';

import { Program } from 'tubugl-core/src/program';
import { mat4 } from 'gl-matrix/src/gl-matrix';
import { createSimpleBox } from '../vendors/utils/generator';

export class SkyBox {
	/**
	 *
	 * @param {object} params
	 * @param {WebGLRenderingContext} params.gl
	 */
	constructor(params = {}) {
		this._gl = params.gl;
		console.log(this._gl);

		this._createProgram();
		this._makeBuffer();
		this._createMatrix();
		this._getUniformLocation();
		this.updateModelMatrix();
	}

	_createProgram() {
		const gl = this._gl;
		this._program = new Program(gl, vertexShaderSrc, fragmentShaderSrc);
	}

	_makeBuffer() {
		const { normals, positions, uvs } = createSimpleBox(1, 1, 1);

		const gl = this._gl;

		this.positionBuffer = gl.createBuffer();
		this.aPositionLocation = gl.getAttribLocation(this._program.id, 'position');
		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

		this.normalBuffer = gl.createBuffer();
		this.aNormalLocation = gl.getAttribLocation(this._program.id, 'normal');
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);

		this.uvBuffer = gl.createBuffer();
		this.aUvLocation = gl.getAttribLocation(this._program.id, 'uv');
		gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);

		console.log(this.aNormalLocation);
		console.log(this.aUvLocation);

		// console.log(normals);
		console.log(positions);

		this._cnt = positions.length / 3;
		console.log(this._cnt);
	}

	_createMatrix() {
		this._modelMatrix = mat4.create();
		this._mvMatrix = mat4.create();
		this._mvpMatrix = mat4.create();

		this._modelInverse = mat4.create();
		this._normalMatrix = mat4.create();
	}

	_getUniformLocation() {
		const gl = this._gl;
		this._uMVPMatirxLocation = gl.getUniformLocation(this._program.id, 'uMVPMatrix');
		this._uTextureLocation = gl.getUniformLocation(this._program.id, 'uTexture');
	}

	updateModelMatrix() {
		this._modelMatrix = mat4.fromScaling(this._modelMatrix, [300, 300, 300]);
	}

	/**
	 *
	 * @param {PerspectiveCamera} camera
	 */
	render(camera, glState) {
		const gl = this._gl;

		this._program.use();

		gl.cullFace(gl.FRONT);

		mat4.multiply(this._mvMatrix, camera.viewMatrix, this._modelMatrix);
		mat4.multiply(this._mvpMatrix, camera.projectionMatrix, this._mvMatrix);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
		gl.vertexAttribPointer(this.aPositionLocation, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.aPositionLocation);

		gl.uniformMatrix4fv(this._uMVPMatirxLocation, false, this._mvpMatrix);

		gl.drawArrays(gl.TRIANGLES, 0, this._cnt);
	}
}
