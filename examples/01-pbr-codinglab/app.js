import TweenLite from 'gsap/src/uncompressed/TweenLite';
import dat from '../vendors/dat.gui.min.js';
import Stats from '../vendors/stats.min.js';

import { PerspectiveCamera } from 'tubugl-camera/src/perspectiveCamera';
import { CameraController } from 'tubugl-camera/src/cameraController';
import { Mesh } from './mesh.js';
import { SkyBox } from './skybox';

import vertexShaderSrc from './components/shaders/shader.vert.glsl';
import fragmentShaderSrc from './components/shaders/shader.frag.glsl';
import { Grid } from '../vendors/utils/grid/grid.js';

import { loadCubeMap } from '../vendors/utils/funcs';

import { 
	environmentMoonlessImagesUrls,
	environmentPortlandImagesUrls, 
	environmentRoadImagesUrls 
} from '../vendors/utils/enviroment-maps';



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

		this._textNames = [
			'Moonless',
			'Portland',
			'Road',
		];
		this._text = 'Moonless';
		this._textName = 'uEnvironmentMoonless';

		this.glState = {
			hasLODExtension: this.gl.getExtension('EXT_shader_texture_lod'),
			hasDerivativesExtension: this.gl.getExtension('OES_standard_derivatives'),
			hasSRGBExt: this.gl.getExtension('EXT_SRGB'),
			hasIndexUnit: this.gl.getExtension('OES_element_index_uint'),
			uniforms: {
				textures : {
					
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
		// this.playAndStopGui = this.gui.add(this, '_playAndStop').name('pause');
		this.gui.add(this, '_text', this._textNames).name('texture').onChange(()=>{
			this._textName = `uEnvironment${this._text}`;
			console.log(this._textName);
			this.loop();
		});
	}

	_createCamera() {
		this._camera = new PerspectiveCamera(this._width, this._height, 45, 1, 10000);
		this._camera.position.x = 20;
		this._camera.position.y = 20;
		this._camera.position.z = 40;

		this._camera.lookAt([0, 0, 0]);
	}

	_createSkyBox() {
		this._skybox = new SkyBox({ gl: this.gl });
	}

	_createCameraController() {
		this._cameraController = new CameraController(this._camera, this.canvas);
		this._cameraController.minDistance = 10;
		this._cameraController.maxDistance = 80;
	}

	_createGrid() {
		this._grid = new Grid(this.gl);
	}

	_loadEnv() {
		this._loadCnt = 0;
		
		loadCubeMap(this.gl, this.glState, this._loadEnvDone.bind(this), 'uEnvironmentMoonless', environmentMoonlessImagesUrls, 0);
		loadCubeMap(this.gl, this.glState, this._loadEnvDone.bind(this), 'uEnvironmentPortland', environmentPortlandImagesUrls, 1);
		loadCubeMap(this.gl, this.glState, this._loadEnvDone.bind(this), 'uEnvironmentRoad', environmentRoadImagesUrls, 2);

	}

	_loadEnvDone(){
		this._loadCnt++;

		if(this._loadCnt == 3) {
			console.log(this.glState);
			this._createSkyBox();
			this.loop();
		}
	}

	_loadDiffuse() {
		// loadCubeMap(this.gl, 'diffuse', this.glState, this._loadSpecular.bind(this));
	}

	_loadSpecular() {
		// loadCubeMap(this.gl, 'specular', this.glState, this._loadedAssets.bind(this));
	}

	_loadedAssets() {
		console.log(this.glState.uniforms);
		this._createSkyBox();

		this.play();
	}

	start() {
		this._loadEnv();
	}

	play() {
		this.isLoop = false;
		
		this.loop();
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

		gl.enable(gl.CULL_FACE);

		// this._grid.render(this._camera);
		if(this._skybox) this._skybox.render(this._camera, this.glState, this._textName);
		if(this._mesh) this._mesh.render(this._camera, this.glState, this._textName);
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
