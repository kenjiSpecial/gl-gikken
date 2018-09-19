// import { diffuseImagesUrls, specualarImageUrls, environmentImagesUrls } from './enviroment-maps';

export function getAjaxJson(url) {
	let promiseObj = new Promise(function(resolve, reject) {
		let xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		//    xhr.responseType = 'json';

		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					// console.log('xhr done successfully');

					var resp = xhr.responseText;
					var respJson = JSON.parse(resp);
					resolve(respJson);
				} else {
					reject(xhr.status);
					// console.log('xhr failed');
				}
			} else {
				// console.log('xhr processing going on');
			}
		};

		xhr.send();
	});

	return promiseObj;
}

export function loadCubeMap(gl, state, callback, uniformName, urls, num = 0, mipLevels = 1) {
	var texture = gl.createTexture();
	var textureNumber = num;
	var activeTextureEnum = gl.TEXTURE0 + num;

	gl.activeTexture(activeTextureEnum);
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	if (mipLevels < 2) {
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	} else {
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	}

	function onLoadEnvironmentImage(texture, face, image, j) {
		return function() {
			gl.activeTexture(activeTextureEnum);
			gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
			// todo:  should this be srgb?  or rgba?  what's the HDR scale on this?
			gl.texImage2D(
				face,
				j,
				state.hasSRGBExt ? state.hasSRGBExt.SRGB_EXT : gl.RGBA,
				state.hasSRGBExt ? state.hasSRGBExt.SRGB_EXT : gl.RGBA,
				gl.UNSIGNED_BYTE,
				image
			);

			imageCnt++;
			if (imageCnt === totalAssets) {
				callback();
			}
		};
	}

	let imageCnt = 0;
	let totalAssets = mipLevels * 6;

	for (let j = 0; j < mipLevels; j++) {
		let faces = [
			[urls[j][0], gl.TEXTURE_CUBE_MAP_POSITIVE_X],
			[urls[j][1], gl.TEXTURE_CUBE_MAP_NEGATIVE_X],
			[urls[j][2], gl.TEXTURE_CUBE_MAP_POSITIVE_Y],
			[urls[j][3], gl.TEXTURE_CUBE_MAP_NEGATIVE_Y],
			[urls[j][4], gl.TEXTURE_CUBE_MAP_POSITIVE_Z],
			[urls[j][5], gl.TEXTURE_CUBE_MAP_NEGATIVE_Z]
		];

		for (let ii = 0; ii < faces.length; ii++) {
			let face = faces[ii][1];
			let image = new Image();
			image.onload = onLoadEnvironmentImage(texture, face, image, j);
			image.src = faces[ii][0];
		}
	}

	state.uniforms[uniformName] = {
		funcName: 'uniform1i',
		vals: [textureNumber]
	};

	return 1;
}
