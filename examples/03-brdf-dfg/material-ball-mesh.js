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
		params.textureType = 'dirtyGold';

		super(params);
	}

	addGui(gui) {
		const materialBallGui = gui.addFolder('materialBall');
		materialBallGui.add(this, '_textureType', ['fabric', 'chipped', 'brick', 'dirtyGold']);
		materialBallGui.open();
	}
}
