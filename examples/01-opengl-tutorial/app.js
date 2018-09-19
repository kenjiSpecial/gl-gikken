import TweenLite from 'gsap/src/uncompressed/TweenLite';
import dat from '../vendors/dat.gui.min.js';
import Stats from '../vendors/stats.min.js';

import { PerspectiveCamera } from 'tubugl-camera/src/perspectiveCamera';
import { CameraController } from 'tubugl-camera/src/cameraController';
import { Mesh } from './mesh.js';

import vertexShaderSrc from './components/shaders/shader.vert.glsl';
import fragmentShaderSrc from './components/shaders/shader.frag.glsl';
import { Grid } from '../vendors/utils/grid/grid.js';

import { loadCubeMap, loadTextures } from '../vendors/utils/funcs';

import { 
	environmentMoonlessImagesUrls,
	environmentPortlandImagesUrls, 
	environmentRoadImagesUrls 
} from '../vendors/utils/enviroment-maps';

import {
	barkImagesUrls,
	goldImagesUrls,
	stoneImagesUrls
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
		this.gl = this.canvas.getContext('webgl');

		this.glState = {
			hasLODExtension: this.gl.getExtension('EXT_shader_texture_lod'),
			hasDerivativesExtension: this.gl.getExtension('OES_standard_derivatives'),
			hasSRGBExt: this.gl.getExtension('EXT_SRGB'),
			hasIndexUnit: this.gl.getExtension('OES_element_index_uint'),
			uniforms: {
				textures: {

				}
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

	_addGui() {
		this.gui = new dat.GUI();
		this.playAndStopGui = this.gui.add(this, '_playAndStop').name('pause');
	}

	_createCamera() {
		this._camera = new PerspectiveCamera(this._width, this._height, 45, 1, 10000);
		this._camera.position.x = 30;
		this._camera.position.y = 30;
		this._camera.position.z = 30;

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

	_loadTextures() {
		loadTextures(this.gl, this.glState, 'gold', goldImagesUrls, this._loadTextureDone.bind(this) );
	}

	_loadTextureDone() {
		// console.log('loadTextureDone');
		this.loop();
	}

	_loadEnv() {
		this._loadCnt = 0;
		
		// loadCubeMap(this.gl, this.glState, this._loadEnvDone.bind(this), 'uEnvironmentMoonless', environmentMoonlessImagesUrls, 0);
		// loadCubeMap(this.gl, this.glState, this._loadEnvDone.bind(this), 'uEnvironmentPortland', environmentPortlandImagesUrls, 1);
		// loadCubeMap(this.gl, this.glState, this._loadEnvDone.bind(this), 'uEnvironmentRoad', environmentRoadImagesUrls, 2);

	}

	start() {
		// this.isLoop = true;
		// TweenLite.ticker.addEventListener('tick', this.loop, this);
		this._startIndex = 0;
		this._loadTextures();

	}

	renderOnce() {
		this.isLoop = false;
		this.loop();
	}

	createMesh(data) {
		this._mesh = new Mesh({
			gl: this.gl,
			vertexShaderSrc: vertexShaderSrc,
			fragmentShaderSrc: fragmentShaderSrc,
			data: data
		});
	}

	loop() {
		if (this._stats) this._stats.update();
		const gl = this.gl;

		gl.viewport(0, 0, this._width, this._height);
		gl.clearColor(0, 0, 0, 1);
		gl.enable(gl.DEPTH_TEST);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		this._grid.render(this._camera);
		this._mesh.render(this._camera);
	}

	animateOut() {
		TweenLite.ticker.removeEventListener('tick', this.loop, this);
	}

	pause() {
		this.isLoop = false;
		TweenLite.ticker.removeEventListener('tick', this.loop, this);
	}

	mouseMoveHandler(mouse) {
		if (!this._isMouseDown) return;

		this._prevMouse = mouse;

		this.loop();
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

		this.loop();
	}

	destroy() {}
}
