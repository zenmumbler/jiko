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


function api(/* functionRefs */) {
	var intf = {},
		fns = [].slice.call(arguments, 0);

	fns.forEach(function(fn) {
		if (fn.name)
			intf[fn.name] = fn;
		else
			log("interface: cannot expose anonymous function", fn);
	});
	return intf;
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


function loadScript(url) {
	var defer = Q.defer(),
		script = document.createElement("script");

	script.src = url + "?D=" + Date.now();
	script.onload = function() { defer.resolve(); };
	script.onerror = function() { defer.reject("Could not load script at " + url); };

	document.head.appendChild(script);
	return defer.promise;
}


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
Jiko.Util = api(
	TextFile,

	log,
	extend,
	api,
	elem,
	listen,
	load,
	loadScript
);

// put often used stuff in the Jiko ns
extend(Jiko, api(
	log,
	extend,
	api,
	elem,
	listen
));

}());
