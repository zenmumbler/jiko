(function() {
"use strict";
// Part of jiko - © 2013 Arthur Langereis & Taco Ekkel

var keys = [],
	bindings = {};

function keyDown(event) {
	keys[event.which] = true;
}

function keyUp(event) {
	keys[event.which] = false;
}

function blur() {
	keys = [];
}

function focus() {
}

function init() {
	Jiko.listen(window, "keydown", keyDown);
	Jiko.listen(window, "keyup", keyUp);
	Jiko.listen(window, "blur", blur);
	Jiko.listen(window, "focus", focus);
	return Q.defer().resolve();
};

function bind(map) { bindings = map; };

function pressed(name) {
	return keys[bindings[name] || 0] || false;
};


// API
Jiko.Input = {
	init: init,
	bind: bind,
	pressed: pressed
};


}());