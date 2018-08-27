import { Program } from 'tubugl-core/src/program';
import { mat4 } from 'gl-matrix/src/gl-matrix';
import { PerspectiveCamera } from 'tubugl-camera/src/perspectiveCamera';
import { Color } from '../vendors/utils/color';
import URI from 'urijs';

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
		this._isSpecularColor = true;
		this._lightState = 0;
		this._shininess = 1.5;
		this._specular = 1;

		this._uLightColor = new Color('#333333');
		this._uMaterialColor = new Color('#ff0000');

		this._createProgram(params.vertexShaderSrc, params.fragmentShaderSrc);
		this._createBuffer(params.data);
		this._createMatrix();
		this._createLightDirection();
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

	_createLightDirection() {
		this._lightDirection = { x: 0, y: 0, z: -1 };
	}

	_getUniformLocation() {
		const gl = this._gl;
		this._uMVPMatirxLocation = gl.getUniformLocation(this._program.id, 'uMVPMatrix');
		this._uNormalMatrixLocation = gl.getUniformLocation(this._program.id, 'uNormalMatrix');
		this._uModelMatrixLocation = gl.getUniformLocation(this._program.id, 'uModelMatrix');
		this._uCameraPositionLocation = gl.getUniformLocation(this._program.id, 'uCameraPosition');
		this._uLightDirectionLocation = gl.getUniformLocation(this._program.id, 'uLightDirection');
		this._uLightStateLocation = gl.getUniformLocation(this._program.id, 'uLightState');
		this._uShininessLocation = gl.getUniformLocation(this._program.id, 'uShininess');
		this._uLightSpecularLocation = gl.getUniformLocation(this._program.id, 'uSpecular');
		this._uLightColorLocation = gl.getUniformLocation(this._program.id, 'uLightColor');
		this._uMaterialColorLocation = gl.getUniformLocation(this._program.id, 'uMaterialColor');
		this._uIsSpecularColorLocation = gl.getUniformLocation(
			this._program.id,
			'uIsSpecularColor'
		);
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
		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
		gl.vertexAttribPointer(this.aPositionLocation, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.aPositionLocation);

		// bind normalPosition buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
		gl.vertexAttribPointer(this.aNormalLocation, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.aNormalLocation);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

		gl.uniformMatrix4fv(this._uMVPMatirxLocation, false, this._mvpMatrix);
		gl.uniformMatrix4fv(this._uNormalMatrixLocation, false, this._normalMatrix);
		gl.uniformMatrix4fv(this._uModelMatrixLocation, false, this._modelMatrix);
		gl.uniform3f(
			this._uLightDirectionLocation,
			this._lightDirection.x,
			this._lightDirection.y,
			this._lightDirection.z
		);
		gl.uniform3f(
			this._uCameraPositionLocation,
			camera.position.x,
			camera.position.y,
			camera.position.z
		);
		gl.uniform3f(
			this._uLightColorLocation,
			this._uLightColor.gl[0],
			this._uLightColor.gl[1],
			this._uLightColor.gl[2]
		);
		gl.uniform3f(
			this._uMaterialColorLocation,
			this._uMaterialColor.gl[0],
			this._uMaterialColor.gl[1],
			this._uMaterialColor.gl[2]
		);
		gl.uniform1f(this._uLightStateLocation, this._lightState);
		gl.uniform1f(this._uShininessLocation, this._shininess);
		gl.uniform1f(this._uLightSpecularLocation, this._specular);
		gl.uniform1f(this._uIsSpecularColorLocation, this._isSpecularColor);

		gl.drawElements(gl.TRIANGLES, this._cnt, gl.UNSIGNED_INT, 0);
	}

	updateModelMatrix() {
		this._modelMatrix = mat4.fromTranslation(this._modelMatrix, [0, 7.78, 0]);

		mat4.invert(this._modelInverse, this._modelMatrix);
		mat4.transpose(this._normalMatrix, this._modelInverse);
	}

	addGui(gui) {
		const url = window.location.href;
		const URIparse = URI.parse(url);
		const res = URI.parseQuery(URIparse.query);
		let state = res.state;

		let stateArr = [
			'diffuseReflection',
			'specularHighlights',
			'specularHighlightsAtSilhouettes',
			'phong'
		];

		let isState = false;
		for (let ii = 0; ii < stateArr.length; ii++) {
			if (state === stateArr[ii]) {
				this._lightState = 1;
				isState = true;
			}
		}

		if (!isState) {
			state = 'diffuseReflection';
			this._lightState = 0;
		}

		let current = { state: state };

		gui.add(current, 'state', stateArr)
			.name('state')
			.onChange(value => {
				switch (value) {
					case 'diffuseReflection':
						this._lightState = 0;
						break;
					case 'specularHighlights':
						this._lightState = 1;
						break;
					case 'specularHighlightsAtSilhouettes':
						this._lightState = 2;
						break;
					case 'phong':
						this._lightState = 3;
						break;
				}
			});

		gui.add(this, '_shininess', 0, 5)
			.step(0.1)
			.name('shinines');
		gui.add(this, '_specular', 0, 1)
			.step(0.01)
			.name('specular');

		this._lightDirectionGui = gui.addFolder('light direction');
		this._lightDirectionGui.add(this._lightDirection, 'x', -1, 1).step(0.01);
		this._lightDirectionGui.add(this._lightDirection, 'y', -1, 1).step(0.01);
		this._lightDirectionGui.add(this._lightDirection, 'z', -1, 1).step(0.01);

		let phongMaterialFolder = gui.addFolder('phongMaterial');
		phongMaterialFolder.add(this, '_isSpecularColor').name('isSpecular');
		phongMaterialFolder.addColor(this._uLightColor, 'color').name('lightColor');
		phongMaterialFolder.addColor(this._uMaterialColor, 'color').name('materialColor');
	}
}
