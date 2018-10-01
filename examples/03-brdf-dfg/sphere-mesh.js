import { Mesh } from './mesh';
import { getSphere } from './sphere';

export class SphereMesh extends Mesh {
	/**
	 *
	 * @param {object} params
	 * @param {WebGLRenderingContext} params.gl
	 * @param {string} params.vertexShaderSrc
	 * @param {string} params.fragmentShaderSrc
	 * @param {object} params.sphere
	 * @param {number} params.sphere.radius;
	 * @param {number} params.sphere.segment
	 *
	 */
	constructor(params) {
		params.data = getSphere();
		super(params);
	}

	_createBuffer(data) {
		super._createBuffer(data);
		console.log(data);
	}

	getUniformLocation() {
		const gl = this._gl;

		// this._uModelMatirxLocation = gl.getUniformLocation(this._program.id, 'uModelMatrix');
		this._uViewMatrixLocation = gl.getUniformLocation(this._program.id, 'uViewMatrix');
		this._uProjectionMatrixLocation = gl.getUniformLocation(
			this._program.id,
			'uProjectionMatrix'
		);
		this._uNormalMatrixLocation = gl.getUniformLocation(this._program.id, 'uNormalMatrix');
		this._uColorTextureLocation = gl.getUniformLocation(this._program.id, 'uColorTex');
	}

	/**
	 *
	 * @param {WebGLRenderingContext} gl
	 */
	updateDrawStatus(gl) {
		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.FRONT);
	}

	updateUniforms(gl, camera) {
		gl.uniformMatrix4fv(this._uViewMatrixLocation, false, camera.viewMatrix);
		gl.uniformMatrix4fv(this._uProjectionMatrixLocation, false, camera.projectionMatrix);
		gl.uniformMatrix4fv(this._uNormalMatrixLocation, false, this._normalMatrix);

		if (this._uColorTextureLocation) {
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, this.bgTexture);
			gl.uniform1i(this._uColorTextureLocation, 0);
		}
	}

	setTexture(bgTexture) {
		this.bgTexture = bgTexture;
	}

	// render(camera) {}
}
