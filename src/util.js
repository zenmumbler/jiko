(function(){
"use strict";
// Part of jiko - © 2013 Arthur Langereis & Taco Ekkel

function log() {
	console.info.apply(console, arguments);
}


function extend(base, additions) {
	for (var k in additions)
		if (additions.hasOwnProperty(k))
			base[k] = additions[k];
	return base;
}


function elem(sel) {
	return (typeof sel == "string") ? document.querySelector(sel) : sel;
}


function listen(sel, name, handler) {
	elem(sel).addEventListener(name, handler, false);
}


function load(opts) {
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
		xhr.open("GET", opts.url, true);
		if (opts.configRequest)
			opts.configRequest(xhr);
		xhr.onload = load;
		xhr.onerror = fail;
	} catch (e) {
		fail(e.message, e);
	}

	xhr.send();
	return response.promise;
};


function TextFile(data) {
	function line() {
		if (! data)
			return null;

		var endl = data.indexOf("\n");
		if (endl < 0)
			endl = data.length;

		var ln = data.slice(0, endl);
		data = data.slice(endl + 1);
		return ln;
	}

	this.perLine = function(fn) {
		for (var l = line(); l != null; l = line())
			fn(l);
	};
}


// API
Jiko.Util = {
	TextFile: TextFile,

	log: log,
	extend: extend,
	elem: elem,
	listen: listen,
	load: load
};

// mirror often used stuff in the Jiko ns
Jiko.log = Jiko.Util.log;
Jiko.extend = Jiko.Util.extend;
Jiko.elem = Jiko.Util.elem;
Jiko.listen = Jiko.Util.listen;

}());
