import chroma from 'chroma-js';

export class Color {
	/**
	 *
	 * @param {string} value color value as string
	 */
	constructor(value) {
		this.color = value;
	}
	set color(value) {
		this._value = value;
		this._gl = chroma(this._value).gl();
	}
	get color() {
		return this._value;
	}
	/**
	 * @returns {Array}
	 */
	get gl() {
		return this._gl;
	}
}
