(function() {
"use strict";
// Part of jiko - © 2013 Arthur Langereis & Taco Ekkel

var keys = [],
	bindings = {};

function keyDown(event) {
	keys[event.which] = true;
	if (! event.metaKey)
		event.preventDefault();
}

function keyUp(event) {
	keys[event.which] = false;
	if (! event.metaKey)
		event.preventDefault();
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
};

function bind(map) { bindings = map; };

function pressed(name) {
	return keys[bindings[name] || 0] || false;
};


// API
Jiko.Input = Jiko.api(
	init,
	bind,
	pressed
);

// key code enum
Jiko.Input.Keys = {
	UP: 38,
	DOWN: 40,
	LEFT: 37,
	RIGHT: 39,

	SPACE: 32,
	RETURN: 13
};


}());
