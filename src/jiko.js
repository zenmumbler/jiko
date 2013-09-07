(function(){
"use strict";
// Part of jiko - © 2013 Arthur Langereis & Taco Ekkel


function WorldView(state, renderTarget) {
	var map = state.map,
		tex = state.texture,
		gridSize = tex.grid;

	function renderTileLayer(ctx, tl) {
		var x, y, row, tile;

		for (y=0; y < tl.height; ++y) {
			row = tl[y];

			for (x=0; x < tl.width; ++x) {
				tile = row[x];
				if (tile && tile.ix >= 0) {
					var txy = tile.flipX ? tex.tileXY[tile.ix + tex.horizFlipOffset] : tex.tileXY[tile.ix];
					ctx.drawImage(tex.image, txy.x, txy.y, gridSize, gridSize, x * gridSize, y * gridSize, gridSize, gridSize);
				}
			}
		}
	}

	this.render = function() {
		var ctx = renderTarget.ctx;

		renderTileLayer(ctx, map.layers["BG Static"]);
		renderTileLayer(ctx, map.layers["BG Building"]);
		renderTileLayer(ctx, map.layers["BG Props"]);

		state.actors.forEach(function(actor) { actor.render(ctx); });

		renderTileLayer(ctx, map.layers["FG Props"]);
	};
}


function RenderTarget(sel, scale) {
	this.canvas = Jiko.elem(sel);
	this.ctx = this.canvas.getContext("2d");

	this.ctx.webkitImageSmoothingEnabled = false;
	this.ctx.mozImageSmoothingEnabled = false;
	this.ctx.imageSmoothingEnabled = false;
	this.ctx.scale(scale, scale);
}


function State() {
	this.level = null;
	this.texture = null;
	this.actors = [];
}


function Game(state) {
	var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame;

	var renderTarget = new RenderTarget("canvas", 3.0),
		view = new WorldView(state, renderTarget);

	function step() {
		state.actors.forEach(function(actor) { actor.tick(); });
		view.render();

		requestAnimationFrame(step);
	}

	step();
}


function createActors(state) {
	var actorLayer = state.map.layers["Actors"],
		x, y, row, tile, grid;

	grid = state.texture.grid;

	for (y=0; y < actorLayer.height; ++y) {
		row = actorLayer[y];

		for (x=0; x < actorLayer.width; ++x) {
			tile = row[x];
			if (tile && tile.ix >= 0) {
				console.info(x * grid, y * grid, state.texture, tile.ix);
				var actor = Jiko.Actor.makeActor(x * grid, y * grid, state.texture, tile.ix);
				state.actors.push(actor);
			}
		}
	}
}


window.onload = function() {
	var state = new State();

	Q.all([
		Jiko.Image.loadTiledTexture("gfx/jiko-tiles.png", 16).then(function(tex){ state.texture = tex; }),
		Jiko.Map.loadTileMap("levels/test1.xml").then(function(m){ state.map = m; })
	])
	.then(function(){
		Jiko.Input.init();
		Jiko.Input.bind({
			"move-left" : Jiko.Input.Keys.LEFT,
			"move-right": Jiko.Input.Keys.RIGHT,
			"move-up"   : Jiko.Input.Keys.UP,
			"move-down" : Jiko.Input.Keys.DOWN,
			"act"       : Jiko.Input.Keys.SPACE
		});

		createActors(state);
		Game(state);
	});
};


}());
