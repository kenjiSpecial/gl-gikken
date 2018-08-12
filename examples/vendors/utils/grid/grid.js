import vertexShaderSrc from './shaders/grid.vert.glsl';
import fragmentShaderSrc from './shaders/grid.frag.glsl';
import { Program } from '../../../../node_modules/tubugl-core/src/program';
import { PerspectiveCamera } from '../../../../node_modules/tubugl-camera/src/perspectiveCamera';
import { mat4 } from 'gl-matrix';

export class Grid {
	/**
	 *
	 * @param {WebGLRenderingContext} gl
	 * @param {number} size
	 * @param {number} division
	 * @param {number[]} color
	 */
	constructor(gl, size = 100, division = 10, color = [1, 1, 1]) {
		this._gl = gl;
		this._size = size;
		this._division = division;
		this._color = color;

		this._createProgram();
		this._createBuffer();
		this._createMatrix();
		this._getUniformLocation();
	}

	_createProgram() {
		const gl = this._gl;
		this._program = new Program(gl, vertexShaderSrc, fragmentShaderSrc);
	}

	_createBuffer() {
		let points = [];

		const halfSize = this._size / 2;
		for (let xx = 0; xx <= this._division; xx++) {
			let xPos = -halfSize + (xx / this._division) * this._size;
			let z0 = -halfSize;
			let z1 = halfSize;

			points.push(xPos, 0, z0);
			points.push(xPos, 0, z1);
		}

		for (let zz = 0; zz <= this._division; zz++) {
			let zPos = -halfSize + (zz / this._division) * this._size;
			let x0 = -halfSize;
			let x1 = halfSize;

			points.push(x0, 0, zPos);
			points.push(x1, 0, zPos);
		}

		const gl = this._gl;

		this.positionBuffer = gl.createBuffer();
		this.aPositionLocation = gl.getAttribLocation(this._program.id, 'position');
		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);

		this.cnt = points.length / 3;
	}

	_createMatrix() {
		this._modelMatrix = mat4.create();
		this._mvMatrix = mat4.create();
		this._mvpMatrix = mat4.create();
	}

	_getUniformLocation() {
		const gl = this._gl;

		this._uMVPMatrixLocation = gl.getUniformLocation(this._program.id, 'uMVPMatrix');
		this._uColorLocation = gl.getUniformLocation(this._program.id, 'uColor');
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
		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
		gl.vertexAttribPointer(this.aPositionLocation, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.aPositionLocation);

		gl.uniformMatrix4fv(this._uMVPMatrixLocation, false, this._mvpMatrix);
		gl.uniform3f(this._uColorLocation, this._color[0], this._color[1], this._color[2]);

		gl.drawArrays(gl.LINES, 0, this.cnt);
	}
}
