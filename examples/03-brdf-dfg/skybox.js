import vertexShaderSrc from './components/shaders/skybox/shader.vert.glsl';
import fragmentShaderSrc from './components/shaders/skybox/shader.frag.glsl';

import prefilterFragmentSrc from './components/shaders/skybox/prefilter.frag.glsl';

import layoutVertexShaderSrc from './components/shaders/skybox/layout.vert.glsl';
import layoutFragmentShaderSrc from './components/shaders/skybox/layout.frag.glsl';

import irradianceCovolutionVertexShaderSrc from './components/shaders/skybox/irradiance-convolution.vert.glsl';
import irradianceCovolutionFragmentShaderSrc from './components/shaders/skybox/irradiance-convolution.frag.glsl';

import prefilterVertexShaderSrc from './components/shaders/skybox/prefilter.vert.glsl';
import prefilterFragmentShaderSrc from './components/shaders/skybox/prefilter.frag.glsl';

import brdfVertShaderSrc from './components/shaders/skybox/brdf.vert.glsl';
import brdfFragShaderSrc from './components/shaders/skybox/brdf.frag.glsl';

import { Program } from 'tubugl-core/src/program';
import { mat4 } from 'gl-matrix/src/gl-matrix';
import { createSimpleBox, createSimplePlane } from '../vendors/utils/generator';
import { createEmptyCubemap, createEmptyLodCubemap, createTexture } from '../vendors/utils/funcs';

export class SkyBox {
	/**
	 *
	 * @param {object} params
	 * @param {WebGLRenderingContext} params.gl
	 */
	constructor(params = {}) {
		this._gl = params.gl;
		this.isIrradianceCubemap = false;

		this.createProgram();
		this.makeBuffer();
		this.createMatrix();
		this.getUniformLocation();

		let viewArray = [
			[[1, 0, 0], [0, -1, 0]],
			[[-1, 0, 0], [0, -1, 0]],
			[[0, 1, 0], [0, 0, 1]],
			[[0, -1, 0], [0, 0, -1]],
			[[0, 0, 1], [0, -1, 0]],
			[[0, 0, -1], [0, -1, 0]]
		];

		this.captureView(params.sphereMesh, viewArray);
		this.createIrradianceCubemapTexture(viewArray);
		this.createEnvViewMapTexture(viewArray);
		this.createLTUTexture();

		this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
	}

	createProgram() {
		const gl = this._gl;
		this._program = new Program(gl, vertexShaderSrc, fragmentShaderSrc);
		this.irradianceProgram = new Program(
			gl,
			irradianceCovolutionVertexShaderSrc,
			irradianceCovolutionFragmentShaderSrc
		);
		this.prefilterProgram = new Program(
			gl,
			prefilterVertexShaderSrc,
			prefilterFragmentShaderSrc
		);
		this.brdfProgram = new Program(gl, brdfVertShaderSrc, brdfFragShaderSrc);
	}

	captureView(sphereMesh, viewArray) {
		const gl = this._gl;

		this._textures = [];

		const targetTextureWidth = 1024;
		const targetTextureHeight = 1024;

		let viewMatrix = mat4.create();
		let projectionMatrix = mat4.create();
		const level = 0;
		const framebuffer = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

		this._cubemap = createEmptyCubemap(gl, targetTextureWidth, targetTextureHeight);

		mat4.perspective(projectionMatrix, (90 / 180) * Math.PI, 1, 0.1, 10);

		let startTime = Date.now();
		for (let ii = 0; ii < viewArray.length; ii++) {
			mat4.lookAt(viewMatrix, [0, 0, 0], viewArray[ii][0], viewArray[ii][1]);

			const attachmentPoint = gl.COLOR_ATTACHMENT0;
			gl.framebufferTexture2D(
				gl.FRAMEBUFFER,
				attachmentPoint,
				gl.TEXTURE_CUBE_MAP_POSITIVE_X + ii,
				this._cubemap,
				level
			);

			gl.viewport(0, 0, targetTextureWidth, targetTextureHeight);
			gl.clearColor(0, 0, 0, 1);
			gl.enable(gl.DEPTH_TEST);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

			sphereMesh.render({ viewMatrix, projectionMatrix });
		}
		let duration = Date.now() - startTime;
		console.log('rendering cubemap: ', duration);
	}

	createIrradianceCubemapTexture(viewArray) {
		const gl = this._gl;
		const textureSize = 32;

		let viewMatrix = mat4.create();
		let projectionMatrix = mat4.create();
		const level = 0;
		const framebuffer = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

		this.irradianceCubemap = createEmptyCubemap(gl, textureSize, textureSize);
		mat4.perspective(projectionMatrix, (90 / 180) * Math.PI, 1, 0.1, 10);
		let startTime = Date.now();
		for (let ii = 0; ii < viewArray.length; ii++) {
			mat4.lookAt(viewMatrix, [0, 0, 0], viewArray[ii][0], viewArray[ii][1]);

			const attachmentPoint = gl.COLOR_ATTACHMENT0;
			gl.framebufferTexture2D(
				gl.FRAMEBUFFER,
				attachmentPoint,
				gl.TEXTURE_CUBE_MAP_POSITIVE_X + ii,
				this.irradianceCubemap,
				level
			);

			gl.viewport(0, 0, textureSize, textureSize);
			gl.clearColor(0, 0, 0, 1);
			gl.enable(gl.DEPTH_TEST);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

			this.renderIrradiance({
				viewMatrix,
				projectionMatrix
			});
		}

		let duration = Date.now() - startTime;

		console.log('rendering irradiance convolution cubemap: ', duration);
	}

	createEnvViewMapTexture(viewArray) {
		const gl = this._gl;
		let textureSize = 256;

		let viewMatrix = mat4.create();
		let projectionMatrix = mat4.create();
		const maxMipLevels = 9;
		const depthBuffer = gl.createRenderbuffer();
		gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);

		const framebuffer = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
		this.envmapCubemap = createEmptyLodCubemap(gl, textureSize, textureSize, 0, maxMipLevels);

		mat4.perspective(projectionMatrix, (90 / 180) * Math.PI, 1, 0.1, 10);
		const attachmentPoint = gl.COLOR_ATTACHMENT0;
		for (let mip = 0; mip < maxMipLevels; mip++) {
			const mipWidth = textureSize * Math.pow(0.5, mip);
			const mipHeight = textureSize * Math.pow(0.5, mip);

			gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, mipWidth, mipHeight);
			gl.framebufferRenderbuffer(
				gl.FRAMEBUFFER,
				gl.DEPTH_ATTACHMENT,
				gl.RENDERBUFFER,
				depthBuffer
			);
			gl.viewport(0, 0, mipWidth, mipHeight);
			const roughness = mip / (maxMipLevels - 1);
			// console.log('mipWidth', mipWidth, 'roughness', roughness, 'mip', mip);

			for (let ii = 0; ii < viewArray.length; ii++) {
				mat4.lookAt(viewMatrix, [0, 0, 0], viewArray[ii][0], viewArray[ii][1]);
				gl.framebufferTexture2D(
					gl.FRAMEBUFFER,
					attachmentPoint,
					gl.TEXTURE_CUBE_MAP_POSITIVE_X + ii,
					this.envmapCubemap,
					mip
				);

				gl.clearColor(0, 0, 0, 1);
				gl.enable(gl.DEPTH_TEST);
				gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

				this.prefilterProgram.use();

				gl.enable(gl.CULL_FACE);
				gl.cullFace(gl.FRONT);

				const attributePositionLocation = this.prefilterProgram.attrib.position.location;
				gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
				gl.vertexAttribPointer(attributePositionLocation, 3, gl.FLOAT, false, 0, 0);
				gl.enableVertexAttribArray(attributePositionLocation);

				gl.uniformMatrix4fv(
					this.prefilterProgram.uniform.uViewMatrix.location,
					false,
					viewMatrix
				);

				gl.uniformMatrix4fv(
					this.prefilterProgram.uniform.uProjectionMatrix.location,
					false,
					projectionMatrix
				);

				gl.activeTexture(gl.TEXTURE0);
				gl.bindTexture(gl.TEXTURE_CUBE_MAP, this._cubemap);
				gl.uniform1i(this.prefilterProgram.uniform.uEnvironmentMap.location, 0);

				gl.uniform1f(this.prefilterProgram.uniform.roughness.location, roughness);

				gl.drawArrays(gl.TRIANGLES, 0, this._cnt);
			}
		}

		gl.bindRenderbuffer(gl.RENDERBUFFER, null);
	}

	createLTUTexture() {
		// console.log('createLTUTextures');
		const { positions, uvs } = createSimplePlane(2, 2);
		const textureSize = 256;

		const gl = this._gl;
		gl.viewport(0, 0, textureSize, textureSize);
		this.lTUtexture = createTexture(gl, textureSize, textureSize);

		const framebuffer = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

		const attachmentPoint = gl.COLOR_ATTACHMENT0;
		gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, this.lTUtexture, 0);

		this.brdfProgram.use();

		this.vao = gl.create;
		const positionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
		gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(0);

		const uvBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);
		gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(1);

		gl.clearColor(0, 0, 0, 1);
		gl.enable(gl.DEPTH_TEST);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.disable(gl.CULL_FACE);

		gl.drawArrays(gl.TRIANGLES, 0, 6);
	}

	makeBuffer() {
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

		this._cnt = positions.length / 3;
	}

	createMatrix() {
		this._modelMatrix = mat4.create();
		this._mvMatrix = mat4.create();
		this._mvpMatrix = mat4.create();

		this._modelInverse = mat4.create();
		this._normalMatrix = mat4.create();
	}

	getUniformLocation() {
		const gl = this._gl;

		this._uTextureLocation = gl.getUniformLocation(this._program.id, 'uTexture');
		this._uViewMatrixLocation = gl.getUniformLocation(this._program.id, 'uViewMatrix');
		this._uProjectionMatrixLocation = gl.getUniformLocation(
			this._program.id,
			'uProjectionMatrix'
		);
	}

	updateModelMatrix() {
		const scale = 10;
		this._modelMatrix = mat4.fromScaling(this._modelMatrix, [scale, scale, scale]);
	}

	updateCubemap(isIrradianceCubemap) {
		this.isIrradianceCubemap = isIrradianceCubemap;
	}

	/**
	 *
	 * @param {PerspectiveCamera} camera
	 */
	render(camera) {
		const gl = this._gl;

		this._program.use();

		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.FRONT);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
		gl.vertexAttribPointer(this.aPositionLocation, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.aPositionLocation);

		// gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
		// gl.vertexAttribPointer(this.aUvLocation, 2, gl.FLOAT, false, 0, 0);
		// gl.enableVertexAttribArray(this.aUvLocation);

		gl.uniformMatrix4fv(this._uViewMatrixLocation, false, camera.viewMatrix);
		gl.uniformMatrix4fv(this._uProjectionMatrixLocation, false, camera.projectionMatrix);

		gl.activeTexture(gl.TEXTURE0);

		if (this.isIrradianceCubemap) gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.irradianceCubemap);
		else gl.bindTexture(gl.TEXTURE_CUBE_MAP, this._cubemap);

		gl.uniform1i(this._uTextureLocation, 0);

		gl.drawArrays(gl.TRIANGLES, 0, this._cnt);
	}

	renderIrradiance(camera) {
		const gl = this._gl;

		this.irradianceProgram.use();

		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.FRONT);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
		gl.vertexAttribPointer(this.aPositionLocation, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.aPositionLocation);

		gl.uniformMatrix4fv(
			this.irradianceProgram.uniform.uViewMatrix.location,
			false,
			camera.viewMatrix
		);
		gl.uniformMatrix4fv(
			this.irradianceProgram.uniform.uProjectionMatrix.location,
			false,
			camera.projectionMatrix
		);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, this._cubemap);
		gl.uniform1i(this.irradianceProgram.uniform.uTexture.location, 0);

		gl.drawArrays(gl.TRIANGLES, 0, this._cnt);
	}

	renderSpecularMap() {}

	initCubemapLayout() {
		this.layout = {};

		this.initCubemapLayoutProgram();
		this.initCubemapLayoutBuffer();
		this.getLayoutUniformLocation();
		this.calculateMinAndMaxPosition();
	}

	initCubemapLayoutProgram() {
		const gl = this._gl;
		this.layout.program = new Program(gl, layoutVertexShaderSrc, layoutFragmentShaderSrc);
	}

	getLayoutUniformLocation() {
		const gl = this._gl;

		this.layout.location = {
			uMinPosition: gl.getUniformLocation(this.layout.program.id, 'uMinPosition'),
			uMaxPosition: gl.getUniformLocation(this.layout.program.id, 'uMaxPosition'),
			uTexture: gl.getUniformLocation(this.layout.program.id, 'uTexture')
		};
	}

	calculateMinAndMaxPosition() {
		if (!this.layout) return;

		let minX, maxX, minY, maxY;
		let margin = 15;
		if (window.innerHeight / window.innerWidth > 3 / 4) {
			minX = margin;
			maxX = window.innerWidth - margin * 2;

			let height = ((window.innerWidth - margin * 2) * 3) / 4;
			let marginTop = (window.innerHeight - height) / 2;
			minY = marginTop;
			maxY = marginTop + height;
		} else {
			minY = margin;
			maxY = window.innerHeight - margin * 2;

			let width = ((window.innerHeight - margin * 2) * 4) / 3;
			let marginLeft = (window.innerWidth - width) / 2;

			minX = marginLeft;
			maxX = marginLeft + width;
		}

		this.layout.min = {
			x: (minX / window.innerWidth) * 2 - 1,
			y: (-minY / window.innerHeight) * 2 + 1
		};
		this.layout.max = {
			x: (maxX / window.innerWidth) * 2 - 1,
			y: (-maxY / window.innerHeight) * 2 + 1
		};
	}

	initCubemapLayoutBuffer() {
		const gl = this._gl;
		let { layoutPosition, positions } = createSimpleBox(1, 1, 1);

		this.layout.positionBuffer = gl.createBuffer();
		this.layout.aPositionLocation = gl.getAttribLocation(this.layout.program.id, 'position');
		gl.bindBuffer(gl.ARRAY_BUFFER, this.layout.positionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, layoutPosition, gl.STATIC_DRAW);

		this.layout.normalBuffer = gl.createBuffer();
		this.layout.aNormalLocation = gl.getAttribLocation(this.layout.program.id, 'normal');
		gl.bindBuffer(gl.ARRAY_BUFFER, this.layout.normalBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

		this.layout.cnt = layoutPosition.length / 2;
	}

	/**
	 * render cubemap layout
	 */
	renderCubeMapLayout() {
		const gl = this._gl;

		if (!this.layout) {
			this.initCubemapLayout();
		}
		this.layout.program.use();

		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK);

		// bind position buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, this.layout.positionBuffer);
		gl.vertexAttribPointer(this.layout.aPositionLocation, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.layout.aPositionLocation);

		// bind normal buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, this.layout.normalBuffer);
		gl.vertexAttribPointer(this.layout.aNormalLocation, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.layout.aNormalLocation);

		gl.uniform2f(this.layout.location.uMinPosition, this.layout.min.x, this.layout.min.y);
		gl.uniform2f(this.layout.location.uMaxPosition, this.layout.max.x, this.layout.max.y);

		gl.activeTexture(gl.TEXTURE0);
		if (this.isIrradianceCubemap) gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.irradianceCubemap);
		else gl.bindTexture(gl.TEXTURE_CUBE_MAP, this._cubemap);

		gl.uniform1i(this.layout.location.uTexture, 0);

		gl.drawArrays(gl.TRIANGLES, 0, this.layout.cnt);
	}

	resize() {
		this.calculateMinAndMaxPosition();
	}
}
