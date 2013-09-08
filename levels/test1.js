(function() {
"use strict";


function createActors(state) {
	var actorLayer = state.level.map.layers["Actors"],
		x, y, row, tile, grid;

	grid = state.texture.grid;

	for (y=0; y < actorLayer.height; ++y) {
		row = actorLayer[y];

		for (x=0; x < actorLayer.width; ++x) {
			tile = row[x];
			if (tile && tile.ix >= 0) {
				// Jiko.log(x * grid, y * grid, state.texture, tile.ix);
				var actor = Jiko.Actor.makeActor(x * grid, y * grid, state.texture, tile.ix);
				state.level.actors.push(actor);
			}
		}
	}
}



function setup(state) {
	Jiko.log("setting up level test1");
	createActors(state);
}


function start(state) {
	Jiko.log("start level test1");
}


function tick(state) {
}


function finish(state) {
}


Jiko.Level.delegate("test1",
	Jiko.api(setup, start, tick, finish)
);


}());
