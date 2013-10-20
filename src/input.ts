// input.ts -- input devices

module Jiko.Input {
	var keys: boolean[] = [],
		bindings: { [name: string]: number } = {};

	function keyDown(event: KeyboardEvent) {
		keys[event.which] = true;
		if (! event.metaKey)
			event.preventDefault();
	}

	function keyUp(event: KeyboardEvent) {
		keys[event.which] = false;
		if (! event.metaKey)
			event.preventDefault();
	}

	function blur() {
		keys = [];
	}

	function focus() {
	}

	export function init() {
		Jiko.listen(window, "keydown", keyDown);
		Jiko.listen(window, "keyup", keyUp);
		Jiko.listen(window, "blur", blur);
		Jiko.listen(window, "focus", focus);
	}

	export function bind(map: typeof bindings) { bindings = map; }

	export function pressed(name: string) {
		return keys[bindings[name] || 0] || false;
	}


	// key code enum
	export enum Keys {
		UP = 38,
		DOWN = 40,
		LEFT = 37,
		RIGHT = 39,

		SPACE = 32,
		RETURN = 13
	}
}
