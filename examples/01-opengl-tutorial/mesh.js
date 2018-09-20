import { Program } from 'tubugl-core/src/program';
import { mat4 } from 'gl-matrix/src/gl-matrix';
import { PerspectiveCamera } from 'tubugl-camera/src/perspectiveCamera';

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
		this._textureType = 'gold';
		this._createProgram(params.vertexShaderSrc, params.fragmentShaderSrc);
		this._createBuffer(params.data);
		this._createMatrix();
		this._getUniformLocation();

		this.updateModelMatrix();
	}

	/**
	 *
	 * @param {string} vertextShaderSrc
	 * @param {string} fragmentShaderSrc
	 */
	_createProgram(vertextShaderSrc, fragmentShaderSrc) {
		const gl = this._gl;
		this._program = new Program(gl, vertextShaderSrc, fragmentShaderSrc);
		// let location = gl.getUniformLocation(this._program.id, 'uColorTex');
		// console.log(location);
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

		this.uvBuffer = gl.createBuffer();
		this.aUvLocation = gl.getAttribLocation(this._program.id, 'uv');
		gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.texcoords), gl.STATIC_DRAW);

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
		this._uMVPMatirxLocation = gl.getUniformLocation(this._program.id, 'uMVPMatrix');
		this._uNormalMatrixLocation = gl.getUniformLocation(this._program.id, 'uNormalMatrix');

		this._uColorTexLocation = gl.getUniformLocation(this._program.id, 'uColorTex');
		this._uAoTexLocation = gl.getUniformLocation(this._program.id, 'uAoTex');
		console.log(this._uAoTexLocation);
	}

	/**
	 *
	 * @param {PerspectiveCamera} camera
	 */
	render(camera) {
		const gl = this._gl;

		mat4.multiply(this._mvMatrix, camera.viewMatrix, this._modelMatrix);
		mat4.multiply(this._mvpMatrix, camera.projectionMatrix, this._mvMatrix);

		this._program.use();

		// bind position buffer

		if (this.aPositionLocation > -1) {
			gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
			gl.vertexAttribPointer(this.aPositionLocation, 3, gl.FLOAT, false, 0, 0);
			gl.enableVertexAttribArray(this.aPositionLocation);
		}

		// bind normalPosition buffer
		if (this.aNormalLocation > -1) {
			gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
			gl.vertexAttribPointer(this.aNormalLocation, 3, gl.FLOAT, false, 0, 0);
			gl.enableVertexAttribArray(this.aNormalLocation);
		}

		// bind uv buffer
		if (this.aUvLocation > -1) {
			gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
			gl.vertexAttribPointer(this.aUvLocation, 2, gl.FLOAT, false, 0, 0);
			gl.enableVertexAttribArray(this.aUvLocation);
		}

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

		gl.uniformMatrix4fv(this._uMVPMatirxLocation, false, this._mvpMatrix);
		gl.uniformMatrix4fv(this._uNormalMatrixLocation, false, this._normalMatrix);

		// active texture

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this._textures[this._textureType].color);
		gl.uniform1i(this._uColorTexLocation, 0);

		if (this._uAoTexLocation) {
			gl.activeTexture(gl.TEXTURE1);
			gl.bindTexture(gl.TEXTURE_2D, this._textures[this._textureType].ao);
			gl.uniform1i(this._uAoTexLocation, 1);
		}

		gl.drawElements(gl.TRIANGLES, this._cnt, gl.UNSIGNED_INT, 0);
	}

	addTexture(textures) {
		this._textures = textures;
		console.log(this._textures.gold);
	}

	updateModelMatrix() {
		this._modelMatrix = mat4.fromTranslation(this._modelMatrix, [0, 7.78, 0]);

		mat4.invert(this._modelInverse, this._modelMatrix);
		mat4.transpose(this._normalMatrix, this._modelInverse);
	}
}
