import { Mesh } from './mesh';
// import { Program } from 'tubugl-core/src/progcram';

export class MaterialBallMesh extends Mesh {
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
		super(params);
		// this.createIrraianceProgram();
	}

	addGui(gui) {
		const materialBallGui = gui.addFolder('materialBall');
	}
}
