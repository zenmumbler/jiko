// util.ts - Jiko utility funcs

module Jiko.Util {
	export function log(...args: any[]): void {
		console.info.apply(console, args);
	}

	export function elem(sel: string): Element;
	export function elem(el: Element): Element;

	export function elem(sel: any): Element {
		return typeof sel == "string" ? document.querySelector(sel) : sel;
	}

	export function listen(sel: any, name: string, handler: EventListener): void {
		elem(sel).addEventListener(name, handler, false);
	}

	export interface URLLoadOptions {
		url: string;
		configRequest?: Function;
	}

	export function load(opts: URLLoadOptions): Q.IPromise<XMLHttpRequest> {
		var xhr = new XMLHttpRequest(),
			response = Q.defer<XMLHttpRequest>();

		function fail(...args: any[]) {
			console.info("ASSETS FAIL");
			response.reject.apply(response, args);
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


	export function loadScript(url: string) {
		var defer = Q.defer<void>(),
			script = document.createElement("script");

		script.src = url + "?D=" + Date.now();
		script.onload = () => { defer.resolve(void 0); };
		script.onerror = () => { defer.reject("Could not load script at " + url); };

		document.head.appendChild(script);
		return defer.promise;
	}


	export class TextFile {
		private data: string;

		constructor(data: string) {
			this.data = data;
		}

		private line(): string {
			if (! this.data)
				return null;

			var endl = this.data.indexOf("\n");
			if (endl < 0)
				endl = this.data.length;

			var ln = this.data.slice(0, endl);
			this.data = this.data.slice(endl + 1);
			return ln;
		}

		perLine(fn: (_:string) => void) {
			for (var l = this.line(); l != null; l = this.line())
				fn(l);
		}
	}
}


module Jiko {
	// alias some common methods to main Jiko namespace
	export var
		log = Jiko.Util.log,
		elem = Jiko.Util.elem,
		listen = Jiko.Util.listen;
}
