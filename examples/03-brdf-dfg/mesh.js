import { Program } from 'tubugl-core/src/program';
import { mat4 } from 'gl-matrix/src/gl-matrix';

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
		this._textureType = 'brick';
		this._time = 0;

		this._createProgram(params.vertexShaderSrc, params.fragmentShaderSrc);
		this._createBuffer(params.data);
		this._createMatrix();
		this.getUniformLocation();

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
	}

	_createBuffer(data) {
		const gl = this._gl;

		this.aPositionLocation = gl.getAttribLocation(this._program.id, 'position');

		if (this.aPositionLocation > -1) {
			this.positionBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.verts), gl.STATIC_DRAW);
		}

		this.aNormalLocation = gl.getAttribLocation(this._program.id, 'normal');
		if (this.aNormalLocation > -1) {
			this.normalBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.normals), gl.STATIC_DRAW);
		}

		// this.aUvLocation = gl.getAttribLocation(this._program.id, 'uv');
		this.aUvLocation = gl.getAttribLocation(this._program.id, 'uv');
		if (this.aUvLocation > -1) {
			this.uvBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
			// console.log(data.textcoords);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.texcoords), gl.STATIC_DRAW);
		}

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

	getUniformLocation() {
		this.uAlbedoTexLocation = this._program.uniform.uAlbedoTex.location;
		this.uAoTexLocation = this._program.uniform.uAoTex.location;
		this.uNormalTexLocation = this._program.uniform.uNormalTex.location;
		this.uRoughnessTexLocation = this._program.uniform.uRoughnessTex.location;
		this.uMetallicTexLocation = this._program.uniform.uMetallicTex.location;

		this.uLightPosLocation = this._program.uniform.uLightPos.location;
		this.uCameraPosLocation = this._program.uniform.uCameraPos.location;

		this.uModelMatrixLocation = this._program.uniform.uModelMatrix.location;
		this.uViewMatrixLocation = this._program.uniform.uViewMatrix.location;
		this.uProjectionMatrixLocation = this._program.uniform.uProjectionMatrix.location;
		this.uNormalMatrixLocation = this._program.uniform.uNormalMatrix.location;
	}

	/**
	 *
	 * @param {Camera} camera
	 */
	updateCameraMatrix(camera) {
		mat4.multiply(this._mvMatrix, camera.viewMatrix, this._modelMatrix);
		mat4.multiply(this._mvpMatrix, camera.projectionMatrix, this._mvMatrix);
	}

	/**
	 *
	 * @param {WebGLRenderingContext} gl
	 */
	updateAttribute(gl) {
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
		// console.log(this.aUvLocation);
		if (this.aUvLocation > -1) {
			gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
			// console.log(this.aUvLocation);
			gl.vertexAttribPointer(this.aUvLocation, 2, gl.FLOAT, false, 0, 0);
			gl.enableVertexAttribArray(this.aUvLocation);
		}

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
	}

	/**
	 *
	 * @param {WebGLRenderingContext} gl
	 * @param {Camera} camera
	 */
	updateUniforms(gl, camera) {
		/**
		gl.uniformMatrix4fv(this._uMVPMatirxLocation, false, this._mvpMatrix);
		gl.uniformMatrix4fv(this._uModelMatirxLocation, false, this._modelMatrix);
		gl.uniformMatrix4fv(this._uNormalMatrixLocation, false, this._normalMatrix);
		gl.uniform1f(this._uTypeLocation, this._typeId);
		gl.uniform3f(
			this._uCameraPosLocation,
			camera.position.x,
			camera.position.y,
			camera.position.z
		);
		gl.uniform3f(this._uLightDirLocation, this._light.x, this._light.y, this._light.z);
		gl.uniform1f(this._uRoughnessLocation, this._roughness); */

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.textures[this._textureType].albedo);
		gl.uniform1i(this.uAlbedoTexLocation, 0);
		// console.log(this.textures[this._textureType].albedo);

		if (this.uAoTexLocation) {
			gl.activeTexture(gl.TEXTURE1);
			gl.bindTexture(gl.TEXTURE_2D, this.textures[this._textureType].ao);
			gl.uniform1i(this.uAoTexLocation, 1);
		}

		if (this.uNormalTexLocation) {
			gl.activeTexture(gl.TEXTURE2);
			gl.bindTexture(gl.TEXTURE_2D, this.textures[this._textureType].normal);
			gl.uniform1i(this.uNormalTexLocation, 2);
		}

		if (this.uRoughnessTexLocation) {
			gl.activeTexture(gl.TEXTURE3);
			gl.bindTexture(gl.TEXTURE_2D, this.textures[this._textureType].roughness);
			gl.uniform1i(this.uRoughnessTexLocation, 3);
		}

		if (this.uMetallicTexLocation) {
			gl.activeTexture(gl.TEXTURE4);
			gl.bindTexture(gl.TEXTURE_2D, this.textures[this._textureType].metallic);
			gl.uniform1i(this.uMetallicTexLocation, 4);
		}

		const modelMat = this._modelMatrix; //Arr[xx][yy];
		const normalMat = this._normalMatrix; //Arr[xx][yy];

		gl.uniformMatrix4fv(this.uModelMatrixLocation, false, modelMat);
		gl.uniformMatrix4fv(this.uNormalMatrixLocation, false, normalMat);

		gl.uniform3f(
			this.uLightPosLocation,
			20 * Math.cos(this._time),
			20 * Math.sin(this._time),
			10
		);

		gl.uniformMatrix4fv(this.uViewMatrixLocation, false, camera.viewMatrix);
		gl.uniformMatrix4fv(this.uProjectionMatrixLocation, false, camera.projectionMatrix);

		gl.uniform3f(
			this.uCameraPosLocation,
			camera.position.x,
			camera.position.y,
			camera.position.z
		);
	}

	updateDrawStatus() {
		// if (this._side === 'double') {
		// 	this._gl.disable(this._gl.CULL_FACE);
		// } else if (this._side === 'front') {
		this._gl.enable(this._gl.CULL_FACE);
		this._gl.cullFace(this._gl.BACK);
		// } else {
		// this._gl.enable(this._gl.CULL_FACE);
		// this._gl.cullFace(this._gl.FRONT);
		// }
		// if (this._isDepthTest) this._gl.enable(this._gl.DEPTH_TEST);
		// else this._gl.disable(this._gl.DEPTH_TEST);
		// if (this._isTransparent) {
		// 	this._gl.blendFunc(this._gl.SRC_ALPHA, this._gl.ONE_MINUS_SRC_ALPHA);
		// 	this._gl.enable(this._gl.BLEND);
		// } else {
		// 	this._gl.blendFunc(this._gl.ONE, this._gl.ZERO);
		// 	this._gl.disable(this._gl.BLEND);
		// }
	}

	/**
	 * calling draw call
	 *
	 * @param {WebGLRenderingContext} gl
	 *
	 */
	draw(gl) {
		gl.drawElements(gl.TRIANGLES, this._cnt, gl.UNSIGNED_INT, 0);
	}

	/**
	 * render
	 * @param {PerspectiveCamera} camera
	 */
	render(camera) {
		const gl = this._gl;
		this._time += 1 / 60;

		this.updateCameraMatrix(camera);

		this._program.use();

		this.updateAttribute(gl);
		this.updateUniforms(gl, camera);
		this.updateDrawStatus(gl);
		this.draw(gl);
	}

	updateModelMatrix() {
		mat4.invert(this._modelInverse, this._modelMatrix);
		mat4.transpose(this._normalMatrix, this._modelInverse);
	}

	addGui(gui) {
		// gui.add(this, '_typeName', ['distribution', 'geometry', 'fresnel']).onChange(() => {
		// 	if (this._typeName == 'distribution') this._typeId = 0;
		// 	else if (this._typeName == 'geometry') this._typeId = 1;
		// 	else if (this._typeName == 'fresnel') this._typeId = 2;
		// });
		// gui.add(this, '_roughness', 0, 1).name('roughness');
		// let lightDirectionFolder = gui.addFolder('light direction');
		// lightDirectionFolder.add(this._light, 'x', -1, 1).step(0.01);
		// lightDirectionFolder.add(this._light, 'y', -1, 1).step(0.01);
		// lightDirectionFolder.add(this._light, 'z', -1, 1).step(0.01);

		gui.add(this, '_textureType', ['fabric', 'chipped', 'brick']);
	}

	addTexture(textures) {
		this.textures = textures;
	}
}
