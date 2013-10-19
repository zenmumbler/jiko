// Part of jiko - © 2013 Arthur Langereis & Taco Ekkel

module "Util" {
	export function log(...args) {
		console.info.apply(console, args);
	}

	export function elem(sel) {
		return (typeof sel == "string") ? document.querySelector(sel) : sel;
	}


	export function listen(sel, name, handler) {
		elem(sel).addEventListener(name, handler, false);
	}


	export function load(opts) {
		var xhr = new XMLHttpRequest(),
			response = Q.defer();

		function fail() {
			console.info("ASSETS FAIL");
			response.reject.apply(response, arguments);
		}

		function load() {
			if (xhr.status == 200 || (xhr.status === 0 && xhr.response))
				response.resolve(xhr);
			else
				fail("Failed to load asset with options", opts);
		}

		try {
			xhr.open("GET", opts.url + "?D=" + Date.now(), true);
			if (opts.configRequest)
				opts.configRequest(xhr);
			xhr.onload = load;
			xhr.onerror = fail;
		} catch (e) {
			fail(e.message, e);
		}

		xhr.send();
		return response.promise;
	}


	export function loadScript(url) {
		var defer = Q.defer(),
			script = document.createElement("script");

		script.src = url + "?D=" + Date.now();
		script.onload = function() { defer.resolve(); };
		script.onerror = function() { defer.reject("Could not load script at " + url); };

		document.head.appendChild(script);
		return defer.promise;
	}

	import {Name} from "@name";

	export class TextFile {
		constructor(data) {
			this.data = data;
		}

		line() {
			if (! this.data)
				return null;

			var endl = this.data.indexOf("\n");
			if (endl < 0)
				endl = this.data.length;

			var ln = this.data.slice(0, endl);
			this.data = this.data.slice(endl + 1);
			return ln;
		};

		perLine(fn) {
			for (var l = line(); l != null; l = line())
				fn(l);
		};
	}

}
