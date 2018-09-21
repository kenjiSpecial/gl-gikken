import { Program } from 'tubugl-core/src/program';
import { mat4 } from 'gl-matrix/src/gl-matrix';
import { PerspectiveCamera } from 'tubugl-camera/src/perspectiveCamera';
// import { sphere, Sphere } from './sphere';

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
		this._time = 0;

		this._createProgram(params.vertexShaderSrc, params.fragmentShaderSrc);
		this._createBuffer(params.data);
		this._createMatrix();
		this._getUniformLocation();

		// this.updateModelMatrix();
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

		console.log(data);
		// console.log(Sphere());
		// let { vertices, textures, normals, indices } = Sphere();

		this.positionBuffer = gl.createBuffer();
		this.aPositionLocation = gl.getAttribLocation(this._program.id, 'position');
		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

		this.normalBuffer = gl.createBuffer();
		this.aNormalLocation = gl.getAttribLocation(this._program.id, 'normal');
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

		this.uvBuffer = gl.createBuffer();
		this.aUvLocation = gl.getAttribLocation(this._program.id, 'uv');
		gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textures), gl.STATIC_DRAW);

		this.indexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(indices), gl.STATIC_DRAW);

		this._cnt = indices.length;
	}

	_createMatrix() {
		// this._modelMatrix = mat4.create();

		// this._modelMatrixArr = [];
		// this._normalMatrixArr = [];

		// for (let xx = -4; xx < 5; xx++) {
		// 	this._modelMatrixArr.push([]);
		// 	this._normalMatrixArr.push([]);

		// 	for (let yy = -4; yy < 5; yy++) {
				let xpos = 6 * xx;
				let ypos = 6 * yy;

				let modelMatrix = mat4.create();
				let modelInverse = mat4.create();
				let normalMatrix = mat4.create();

				mat4.fromTranslation(modelMatrix, [xpos, ypos, 0]);

				mat4.invert(modelInverse, modelMatrix);
				mat4.transpose(normalMatrix, modelInverse);
				this._modelMatrix = modelMatrix;
				this._normalMatrix = normalMatrix;

				// this._modelMatrixArr[xx + 4][yy + 4] = modelMatrix;
				// this._normalMatrixArr[xx + 4][yy + 4] = normalMatrix;
		// 	}
		// }
		this._mvMatrix = mat4.create();
		this._mvpMatrix = mat4.create();

		this._modelInverse = mat4.create();
		this._normalMatrix = mat4.create();
	}

	_getUniformLocation() {
		const gl = this._gl;
		this._uMmodelMatirxLocation = gl.getUniformLocation(this._program.id, 'uModelMatrix');
		this._uViewMatirxLocation = gl.getUniformLocation(this._program.id, 'uViewMatrix');
		this._uProjectionMatirxLocation = gl.getUniformLocation(
			this._program.id,
			'uProjectionMatrix'
		);
		this._uCameraPosLocation = gl.getUniformLocation(this._program.id, 'uCameraPos');
		this._uNormalMatrixLocation = gl.getUniformLocation(this._program.id, 'uNormalMatrix');
		this._uAlbedoLocation = gl.getUniformLocation(this._program.id, 'uAlbedo');
		this._uMetallicLocation = gl.getUniformLocation(this._program.id, 'uMetallic');
		this._uRoughnessLocation = gl.getUniformLocation(this._program.id, 'uRoughness');
		this._uLightPosLocation = gl.getUniformLocation(this._program.id, 'uLightPos');

		this._uColorTexLocation = gl.getUniformLocation(this._program.id, 'uColorTex');
		this._uAoTexLocation = gl.getUniformLocation(this._program.id, 'uAoTex');
		this._uNormalTexLocation = gl.getUniformLocation(this._program.id, 'uNormalTex');
		this._uRoughnessTexLocation = gl.getUniformLocation(this._program.id, 'uRoughnessTex');
	}

	/**
	 *
	 * @param {PerspectiveCamera} camera
	 */
	render(camera, del) {
		const gl = this._gl;

		this._time += del / 1000;

		// mat4.multiply(this._mvMatrix, camera.viewMatrix, this._modelMatrix);
		// mat4.multiply(this._mvpMatrix, camera.projectionMatrix, this._mvMatrix);

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

		// gl.uniformMatrix4fv(this._uMVPMatirxLocation, false, this._mvpMatrix);
		gl.uniform3f(
			this._uLightPosLocation,
			10 * Math.cos(this._time),
			10 * Math.sin(this._time),
			5
		);

		gl.uniformMatrix4fv(this._uViewMatirxLocation, false, camera.viewMatrix);
		gl.uniformMatrix4fv(this._uProjectionMatirxLocation, false, camera.projectionMatrix);

		gl.uniform3f(
			this._uCameraPosLocation,
			camera.position.x,
			camera.position.y,
			camera.position.z
		);
		gl.uniform3f(this._uAlbedoLocation, 0.5, 0.0, 0.0);
		// gl.uniform1f(this._uMetallicLocation, 0.1);

		// active texture

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this._textures[this._textureType].color);
		gl.uniform1i(this._uColorTexLocation, 0);

		if (this._uAoTexLocation) {
			gl.activeTexture(gl.TEXTURE1);
			gl.bindTexture(gl.TEXTURE_2D, this._textures[this._textureType].ao);
			gl.uniform1i(this._uAoTexLocation, 1);
		}

		if(this._uNormalTexLocation){
			gl.activeTexture(gl.TEXTURE2);
			gl.bindTexture(gl.TEXTURE_2D, this._textures[this._textureType].normal);
			gl.uniform1i(this._uNormalTexLocation, 2);
		}


		if(this._uRoughnessTexLocation){
			gl.activeTexture(gl.TEXTURE3);
			gl.bindTexture(gl.TEXTURE_2D, this._textures[this._textureType].roughness);
			gl.uniform1i(this._uRoughnessTexLocation, 3);
		}

		// for (let xx = 0; xx < 9; xx++) {
		// 	for (let yy = 0; yy < 9; yy++) {
				const modelMat = this._modelMatrix; //Arr[xx][yy];
				const normalMat = this._normalMatrix; //Arr[xx][yy];

				gl.uniform1f(this._uRoughnessLocation, 0.1 * xx + 0.1);
				gl.uniform1f(this._uMetallicLocation, 0.1 * yy + 0.1);

				gl.uniformMatrix4fv(this._uMmodelMatirxLocation, false, modelMat);
				gl.uniformMatrix4fv(this._uNormalMatrixLocation, false, normalMat);
				gl.drawElements(gl.TRIANGLES, this._cnt, gl.UNSIGNED_INT, 0);
		// 	}
		// }
	}

	addTexture(textures) {
		this._textures = textures;
		console.log(this._textures.gold);
	}

}
