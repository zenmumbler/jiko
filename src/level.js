(function() {
"use strict";

function Level() {
	this.map = null;
	this.delegate = null;
	this.actors = [];

	this.start = function(state) {
		this.delegate.setup(state);
		this.delegate.start(state);
	};

	this.tick = function(state) {
		this.delegate.tick(state);
		this.actors.forEach(function(actor) { actor.tick(); });
	};
}



// ------------ Level Loading ------------

var delegateFutures = {};

function load(name) {
	var level = new Level();

	delegateFutures[name] = Q.defer();

	return Q.all([
		Jiko.Map.loadTileMap("levels/" + name + ".xml").then(function(map){ level.map = map; }),
		Jiko.Util.loadScript("levels/" + name + ".js"),
		delegateFutures[name].promise.then(function(delegate) { level.delegate = delegate; })
	])
	.then(function() {
		delete delegateFutures[name];
		return level;
	});
}

function delegate(name, del) {
	delegateFutures[name].resolve(del);
}


// API
Jiko.Level = Jiko.api(
	load,
	delegate
);


}());
