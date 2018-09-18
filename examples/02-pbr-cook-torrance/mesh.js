import { Program } from 'tubugl-core/src/program';
import { mat4 } from 'gl-matrix/src/gl-matrix';

import vertexShaderSrc from './components/shaders/shader.vert.glsl';
import fragmentShaderSrc from './components/shaders/shader.frag.glsl';


export class Mesh {
	/**
	 *
	 * @param {object} params
	 * @param {WebGLRenderingContext} params.gl
	 * @param {string} params.vertexShaderSrc
	 * @param {string} params.fragmentShaderSrc
	 * @param {array} params.data
	 *
	 */
	constructor(params = {}) {
		this._gl = params.gl;
		this._type = 1;
		this._roughness = 0.1;
		this._programmName = 'distribution'; // distribution

		this._createProgram(params.vertexShaderSrc);
		this._createBuffer(params.data);
		this._createMatrix();
		this._getUniformLocation();

		this.updateModelMatrix();
	}

	_createProgram() {
		const gl = this._gl;
		this._program = new Program(gl, vertexShaderSrc, fragmentShaderSrc);
	}

	_createBuffer(data) {
		const gl = this._gl;

		this.positionBuffer = gl.createBuffer();
		this.aPositionLocation = gl.getAttribLocation(this._program.id, 'position');
		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.verts), gl.STATIC_DRAW);

		this.normalBuffer = gl.createBuffer();
		this.aNormalLocation = gl.getAttribLocation(this._program.id, 'normal');
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.normals), gl.STATIC_DRAW);

		this.indexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(data.indices), gl.STATIC_DRAW);

		this._cnt = data.indices.length;
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
		this._uMMatirxLocation = gl.getUniformLocation(this._program.id, 'uMMatrix');
		this._uVMatirxLocation = gl.getUniformLocation(this._program.id, 'uVMatrix');
		this._uPMatirxLocation = gl.getUniformLocation(this._program.id, 'uPMatrix');

		this._uCameraPosLocation = gl.getUniformLocation(this._program.id, 'uCameraPos');

		this._uMVPMatirxLocation = gl.getUniformLocation(this._program.id, 'uMVPMatrix');
		this._uNormalMatrixLocation = gl.getUniformLocation(this._program.id, 'uNormalMatrix');
		this._uLightDirLocation = gl.getUniformLocation(this._program.id, 'uLightDir');
		this._uRoughnessLocation = gl.getUniformLocation(this._program.id, 'uRoughness');
		this._uTypeLocation = gl.getUniformLocation(this._program.id, 'uType');
	}

	/**
	 *
	 * @param {PerspectiveCamera} camera
	 */
	render(camera) {
		const gl = this._gl;

		// mat4.multiply(this._mvMatrix, camera.viewMatrix, this._modelMatrix);
		// mat4.multiply(this._mvpMatrix, camera.projectionMatrix, this._mvMatrix);
		// mat4.multiply(this._mvMatrix, camera.viewMatrix, this._modelMatrix);

		this._program.use();

		// bind position buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
		gl.vertexAttribPointer(this.aPositionLocation, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.aPositionLocation);

		// bind normalPosition buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
		gl.vertexAttribPointer(this.aNormalLocation, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.aNormalLocation);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

		gl.uniformMatrix4fv(this._uMMatirxLocation, false, this._modelMatrix);
		gl.uniformMatrix4fv(this._uVMatirxLocation, false, camera.viewMatrix);
		gl.uniformMatrix4fv(this._uPMatirxLocation, false, camera.projectionMatrix);

		gl.uniformMatrix4fv(this._uNormalMatrixLocation, false, this._normalMatrix);
		gl.uniform3f(this._uCameraPosLocation, camera.position.x, camera.position.y, camera.position.z);
		gl.uniform3f(this._uLightDirLocation, 0, -1, 0);
		gl.uniform1f(this._uRoughnessLocation, this._roughness);
		gl.uniform1f(this._uTypeLocation, this._type);

		gl.drawElements(gl.TRIANGLES, this._cnt, gl.UNSIGNED_INT, 0);
	}

	updateModelMatrix() {
		this._modelMatrix = mat4.fromTranslation(this._modelMatrix, [0, 7.78, 0]);

		mat4.invert(this._modelInverse, this._modelMatrix);
		mat4.transpose(this._normalMatrix, this._modelInverse);
	}

	addGui(gui) {
		gui.add(this, '_roughness', 0.0, 1.0).step(0.01).name('roughness');
		gui.add(this, '_programmName', ['distribution', 'geometry']).onChange(()=>{
			if(this._programmName === 'distribution') this._type = 0;
			else if(this._programmName === 'geometry') this._type = 1;
		});
	}
}
