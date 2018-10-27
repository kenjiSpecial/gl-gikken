import TweenLite from 'gsap/src/uncompressed/TweenLite';
import dat from '../vendors/dat.gui.min.js';
import Stats from '../vendors/stats.min.js';

import { PerspectiveCamera } from 'tubugl-camera/src/perspectiveCamera';
import { CameraController } from 'tubugl-camera/src/cameraController';
import { Mesh } from './mesh.js';

import vertexShaderSrc from './components/shaders/shader.vert.glsl';
import fragmentShaderSrc from './components/shaders/shader.frag.glsl';

import sphereBgVertexShaderSrc from './components/shaders/sphere-bg/shader.vert.glsl';
import sphereBgFragmentShaderSrc from './components/shaders/sphere-bg/shader.frag.glsl';

import { Grid } from '../vendors/utils/grid/grid.js';
import { SphereMesh } from './sphere-mesh';
import { loadTexture, loadTextures } from '../vendors/utils/funcs.js';

import { hdr } from '../vendors/utils/enviroment-maps';
import { SkyBox } from './skybox.js';
import { MaterialBallMesh } from './material-ball-mesh';

import {
	chippedImagesUrls,
	fabricImagesUrls,
	brickImagesUrls,
	dirtyGoldImagesUrls
} from '../vendors/utils/textures';

export default class App {
	constructor(params = {}) {
		/**
		 * @type {boolean}
		 */
		this.isLoop = false;

		this._isMouseDown = false;

		this._width = params.width ? params.width : window.innerWidth;
		this._height = params.height ? params.height : window.innerHeight;

		this.canvas = document.createElement('canvas');
		this.gl = this.canvas.getContext('webgl2');

		this.glState = {
			// hasLODExtension: this.gl.getExtension('EXT_shader_texture_lod'),
			// hasDerivativesExtension: this.gl.getExtension('OES_standard_derivatives'),
			// hasSRGBExt: this.gl.getExtension('EXT_SRGB'),
			// hasIndexUnit: this.gl.getExtension('OES_element_index_uint'),
			uniforms: {
				textures: {}
			}
		};

		if (params.isDebug) {
			this._stats = new Stats();
			document.body.appendChild(this._stats.dom);
			this._addGui();
			this._createGrid();
		} else {
			let descId = document.getElementById('tubugl-desc');
			descId.style.display = 'none';
		}

		this._createCamera();
		this._createCameraController();

		this.resize(this._width, this._height);
	}
	calculateRendering() {
		if (this.isLoop) this.pause();

		console.log('---------');
		let count = 1000;
		let start, duration;
		const gl = this.gl;

		start = performance.now();
		for (let ii = 0; ii < count; ii++) {
			gl.viewport(0, 0, this._width, this._height);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			this.skybox.render(this._camera);
		}
		duration = performance.now() - start;

		console.log('skybox rendering', duration);
		start = performance.now();
		for (let ii = 0; ii < count; ii++) {
			gl.viewport(0, 0, this._width, this._height);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			this.sphereMesh.render(this._camera);
		}
		duration = performance.now() - start;

		console.log('sphereMesh rendering', duration);
		console.log('---------');
		console.log('');
	}
	_addGui() {
		this.calculateRendering = this.calculateRendering.bind(this);

		this.isSphereMesh = false;
		this.isCubemapLayoutRendering = false;
		this.isShowIrradianceConvolution = false;

		this.gui = new dat.GUI();
		this.playAndStopGui = this.gui.add(this, '_playAndStop').name('pause');

		let iblFolder = this.gui.addFolder('IBL');
		iblFolder.add(this, 'isSphereMesh').name('isSphere');
		iblFolder.add(this, 'isCubemapLayoutRendering').name('cubemapLayoutRendering');
		iblFolder
			.add(this, 'isShowIrradianceConvolution')
			.onChange(() => {
				this.skybox.updateCubemap(this.isShowIrradianceConvolution);
			})
			.name('showIrradianceConvolution');

		iblFolder.add(this, 'calculateRendering');
		iblFolder.open();
	}

	_createCamera() {
		this._camera = new PerspectiveCamera(this._width, this._height, 45, 0.01, 10000);
		this._camera.position.z = 60;
		this._camera.lookAt([0, 0, 0]);
	}

	_createCameraController() {
		this._cameraController = new CameraController(this._camera, this.canvas);
		this._cameraController.minDistance = 10;
		this._cameraController.maxDistance = 1000;
	}

	_createGrid() {
		this._grid = new Grid(this.gl);
	}
	loadTextures() {
		this.textureCnt = 5;

		loadTexture(
			this.gl,
			this.glState,
			'bgTexture',
			hdr.hangarImgUrl,
			this.onLoadTextureComplete.bind(this),
			true
		);

		loadTextures(
			this.gl,
			this.glState,
			'chipped',
			chippedImagesUrls,
			this.onLoadTextureComplete.bind(this)
		);

		loadTextures(
			this.gl,
			this.glState,
			'fabric',
			fabricImagesUrls,
			this.onLoadTextureComplete.bind(this)
		);

		loadTextures(
			this.gl,
			this.glState,
			'brick',
			brickImagesUrls,
			this.onLoadTextureComplete.bind(this)
		);

		loadTextures(
			this.gl,
			this.glState,
			'dirtyGold',
			dirtyGoldImagesUrls,
			this.onLoadTextureComplete.bind(this)
		);

		// this.TEXTURE_TOTAL_CNT = 4;
	}

	onLoadTextureComplete() {
		this.textureCnt--;
		if (this.textureCnt > 0) return;
		const bgTexture = this.glState.uniforms.textures.bgTexture;
		this.sphereMesh.setTexture(bgTexture);
		this._mesh.addTexture(this.glState.uniforms.textures);

		this.createSkyBox();
		console.log(this.skybox.irradianceCubemap);
		this._mesh.addIrradianceCubemap(this.skybox.irradianceCubemap);
		this._mesh.addPrefilterCubeMap(this.skybox.envmapCubemap);
		this._mesh.addBrdfLUTTexture(this.skybox.lTUtexture);

		this.isLoop = true;
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
		TweenLite.ticker.addEventListener('tick', this.loop, this);
	}

	createSkyBox() {
		this.skybox = new SkyBox({ gl: this.gl, sphereMesh: this.sphereMesh });
	}

	start() {
		this.loadTextures();
	}

	renderOnce() {
		this.isLoop = false;
		this.loop();
	}

	createBgSphereMesh() {
		this.sphereMesh = new SphereMesh({
			gl: this.gl,
			vertexShaderSrc: sphereBgVertexShaderSrc,
			fragmentShaderSrc: sphereBgFragmentShaderSrc
		});
	}

	createMesh(data) {
		this._mesh = new MaterialBallMesh({
			gl: this.gl,
			vertexShaderSrc: vertexShaderSrc,
			fragmentShaderSrc: fragmentShaderSrc,
			data: data
		});
		this._mesh.addGui(this.gui);
	}

	loop() {
		if (this._stats) this._stats.update();
		const gl = this.gl;

		gl.viewport(0, 0, this._width, this._height);
		gl.clearColor(0, 0, 0, 1);
		gl.enable(gl.DEPTH_TEST);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		if (this.isCubemapLayoutRendering) {
			if (this.skybox) this.skybox.renderCubeMapLayout();
		} else {
			if (this.isSphereMesh) {
				if (this.sphereMesh) this.sphereMesh.render(this._camera);
			} else {
				if (this.skybox) this.skybox.render(this._camera);
			}

			gl.clear(gl.DEPTH_BUFFER_BIT);

			// this._grid.render(this._camera);
			this._mesh.render(this._camera);
			// console.log(this._camera);
		}
	}

	animateOut() {
		TweenLite.ticker.removeEventListener('tick', this.loop, this);
	}

	pause() {
		this.isLoop = false;
		TweenLite.ticker.removeEventListener('tick', this.loop, this);
		if (this.playAndStopGui) this.playAndStopGui.name('play');
	}

	mouseMoveHandler(mouse) {
		if (!this._isMouseDown) return;

		this._prevMouse = mouse;
	}

	mouseDownHandler(mouse) {
		this._isMouseDown = true;
		this._prevMouse = mouse;
	}

	mouseupHandler() {
		this._isMouseDown = false;
	}

	onKeyDown(ev) {
		switch (ev.which) {
			case 27:
				this._playAndStop();
				break;
		}
	}

	_playAndStop() {
		this.isLoop = !this.isLoop;
		if (this.isLoop) {
			TweenLite.ticker.addEventListener('tick', this.loop, this);
			if (this.playAndStopGui) this.playAndStopGui.name('pause');
		} else {
			TweenLite.ticker.removeEventListener('tick', this.loop, this);
			if (this.playAndStopGui) this.playAndStopGui.name('play');
		}
	}

	resize(width, height) {
		this._width = width;
		this._height = height;

		this.canvas.width = this._width;
		this.canvas.height = this._height;
		this._camera.updateSize(this._width, this._height);
		this.gl.viewport(0, 0, this._width, this._height);
	}

	destroy() {}
}
