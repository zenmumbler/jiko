// Part of jiko - © 2013 Arthur Langereis & Taco Ekkel

module Jiko.Actors {
	/*
	- animation
		[] frame index + duration + frame offset
	- 1 tile = 1m x 1m
	- 
	*/

	export interface ActorController {
		type: string;
		actor: Actor;

		tick(): void;
		collide(other: Actor): void;
		render(ctx: CanvasRenderingContext2D): void;
	}

	export class Actor {
		tilex = 0;
		x = 0; y = 0;

		constructor(public options: any, public ctrl: ActorController) {
			this.tilex = options.ix || 0;
			this.x = options.x || 0.0; // wu
			this.y = options.y || 0.0;
			this.ctrl.actor = this;
		}

		tick() { this.ctrl.tick(); }
		collide(other: Actor) { this.ctrl.collide(other); }
		render(ctx: CanvasRenderingContext2D) { this.ctrl.render(ctx); }
		type() { return this.ctrl.type; }

		moveUnconstrained(dx: number, dy: number) {
			this.x += dx;
			this.y += dy;
		}
		moveUnconstrainedAbs(x: number, y: number) {
			this.x = x;
			this.y = y;
		}
	}

	class DefaultActorController implements ActorController {
		type = "generic";
		actor: Actor = null;

		tick() {}
		collide(other: Actor) {}
		render(ctx: CanvasRenderingContext2D) {
			var tex: Jiko.Image.TiledTexture = this.actor.options.texture,
				txy = tex.tileXY[this.actor.tilex],
				gridSize = tex.gridSize;

			ctx.drawImage(tex.image, txy.x, txy.y, gridSize, gridSize, this.actor.x, this.actor.y, gridSize, gridSize);
		}
	}


	class JikoActorController extends DefaultActorController {
		type = "jiko";

		tick() {
			if (Jiko.Input.pressed("move-left") && this.actor.x > 16)
				this.actor.moveUnconstrained(-1, 0);
			else if (Jiko.Input.pressed("move-right") && this.actor.x < 200)
				this.actor.moveUnconstrained(1, 0);
		}
	}


	export function makeActor(x: number, y: number, texture: Image.TiledTexture, tilex: number) {
		return new Actor({
			x: x, y: y, ix: tilex,
			texture: texture
		}, new ((tilex == 53) ? JikoActorController : DefaultActorController));
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
}
