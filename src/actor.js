(function(){
"use strict";
// Part of jiko - © 2013 Arthur Langereis & Taco Ekkel

/*
- animation
	[] frame index + duration + frame offset
- 1 tile = 1m x 1m
- 
*/


function Actor(options, ctrlFn) {
	this.tilex = options.ix || 0;
	this.x = options.x || 0.0; // wu
	this.y = options.y || 0.0;

	this.options = options;

	this.tick = function() { ctrl.tick(); };
	this.collide = function(other) { ctrl.collide(other); };
	this.render = function(ctx) { ctrl.render(ctx); };
	this.type = function() { return ctrl.type; };

	this.moveUnconstrained = function(dx, dy) {
		this.x += dx;
		this.y += dy;
	};
	this.moveUnconstrainedAbs = function(x, y) {
		this.x = x;
		this.y = y;
	};

	var ctrl = new ctrlFn(this);
}


function DefaultActorController(actor) {
	this.type = "generic";

	this.tick = function() {};
	this.collide = function(other) {};
	this.render = function(ctx) {
		var tex = actor.options.texture,
			txy = tex.tileXY[actor.tilex],
			gridSize = tex.grid;

		ctx.drawImage(tex.image, txy.x, txy.y, gridSize, gridSize, actor.x, actor.y, gridSize, gridSize);
	};
}


function JikoActorController(actor) {
	this.type = "jiko";

	this.tick = function() {
		if (Jiko.Input.pressed("move-left") && actor.x > 16)
			actor.moveUnconstrained(-1, 0);
		else if (Jiko.Input.pressed("move-right") && actor.x < 200)
			actor.moveUnconstrained(1, 0);
	};

	this.collide = function(other) {};
	this.render = function(ctx) {
		var tex = actor.options.texture,
			txy = tex.tileXY[actor.tilex],
			gridSize = tex.grid;

		ctx.drawImage(tex.image, txy.x, txy.y, gridSize, gridSize, actor.x, actor.y, gridSize, gridSize);
	};
}


function makeActor(x, y, texture, tilex) {
	return new Actor({
		x: x, y: y, ix: tilex,
		texture: texture
	}, (tilex == 53) ? JikoActorController : DefaultActorController);
}


// defineSprite(
// 	"jiko-tiles", // <-- name of grid image (texture) to use
// 	[{ // sequences
// 		name: "walk-left",
// 		frames: [
// 			{ tile: 1, offset: [0,0], time: 100 },  // offset in pixels rel from actor pos, time in ms
// 			{ tile: 2, offset: [0,0], time: 100 },
// 			{ tile: 3, offset: [0,0], time: 100 },
// 			{ tile: 4, offset: [0,0], time: 100 }
// 		]
// 	}]
// )


// API
Jiko.Actor = {
	makeActor: makeActor
};
	
}());
