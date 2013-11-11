// jiko.ts - Jiko main

interface CanvasRenderingContext2D {
	webkitImageSmoothingEnabled: boolean;
	mozImageSmoothingEnabled: boolean;
	imageSmoothingEnabled: boolean;
}

interface Window {
	mozRequestAnimationFrame(callback: FrameRequestCallback): number;
	webkitRequestAnimationFrame(callback: FrameRequestCallback): number;
}

module Jiko.Temp {

	class WorldView {
		constructor(public state: Levels.State, public renderTarget: RenderTarget) {}

		private renderTileLayer(ctx: CanvasRenderingContext2D, tl: Map.TileLayer) {
			var x: number, y: number,
				tile: Map.Tile,
				row: Map.Tile[],
				tex = this.state.texture,
				gridSize = tex.gridSize;

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

		render() {
			var map = this.state.level.map,
				ctx = this.renderTarget.ctx;

			this.renderTileLayer(ctx, map.layers["BG Static"]);
			this.renderTileLayer(ctx, map.layers["BG Building"]);
			this.renderTileLayer(ctx, map.layers["BG Props"]);

			this.state.level.actors.forEach((actor: Actor.Actor) => actor.render(ctx));

			this.renderTileLayer(ctx, map.layers["FG Props"]);
		}
	}


	class RenderTarget {
		canvas: HTMLCanvasElement;
		ctx: CanvasRenderingContext2D;

		constructor(sel: string, scale: number) {
			this.canvas = <HTMLCanvasElement>Jiko.elem(sel);
			this.ctx = this.canvas.getContext("2d");
	
			this.ctx.webkitImageSmoothingEnabled = false;
			this.ctx.mozImageSmoothingEnabled = false;
			this.ctx.imageSmoothingEnabled = false;
			this.ctx.scale(scale, scale);
		}
	}


	export function Game(state: Levels.State) {
		var requestAnimationFrame: any = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame;

		var renderTarget = new RenderTarget("canvas", 3.0),
			view = new WorldView(state, renderTarget);

		function step() {
			state.level.tick(state);
			view.render();

			requestAnimationFrame(step);
		}

		state.level.start(state);
		step();
	}

}


window.onload = () => {
	var state = new Jiko.Levels.State();

	Q.all([
		Jiko.Image.loadTiledTexture("gfx/jiko-tiles.png", 16).then((tex: Jiko.Image.TiledTexture) => state.texture = tex),
		Jiko.Levels.load("test1").then((level: Jiko.Levels.Level) => state.level = level)
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

		Jiko.Temp.Game(state);
	});
};
