'use strict';

import App from './app';
import { getAjaxJson } from '../vendors/utils/funcs';
import materialballJsonUrl from '../assets/data/3dcoat-materialball.json';

var urlParams = new URLSearchParams(window.location.search);
const isDebug = !(urlParams.has('NoDebug') || urlParams.has('NoDebug/'));

let app;

(() => {
	init();
	start();
})();

function init() {
	app = new App({
		isDebug: isDebug
	});

	document.body.appendChild(app.canvas);
	document.addEventListener('mousemove', onDocumentMouseMove, false);
	document.addEventListener('mousedown', onDocumentMouseDown, false);
	document.addEventListener('mouseup', onDocumentMouseUp, false);
}

function start() {
	// console.log(materialballJsonUrl);
	getAjaxJson(materialballJsonUrl).then(rel => {
		app.createMesh(rel);
		app.start();
	});
}

function onDocumentMouseMove(event) {
	const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
	const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

	app.mouseMoveHandler({ x: mouseX, y: mouseY });
}

function onDocumentMouseDown(event) {
	const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
	const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

	app.mouseDownHandler({ x: mouseX, y: mouseY });
}

function onDocumentMouseUp() {
	app.mouseupHandler();
}

window.addEventListener('resize', function() {
	app.resize(window.innerWidth, window.innerHeight);
});

window.addEventListener('mousewheel', function() {
	app.loop();
});

window.addEventListener('keydown', function(ev) {
	app.onKeyDown(ev);
});
