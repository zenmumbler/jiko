// Part of jiko - © 2013 Arthur Langereis & Taco Ekkel

module Jiko.Image {
	export function loadImage(url: string) {
		var d = Q.defer<HTMLImageElement>(),
			image = document.createElement("img");
		
		image.onload = () => { d.resolve(image); };
		image.onerror = () => { d.reject("The texture `" + url + "` could not be loaded."); };

		image.src = url;
		return d.promise;
	}

	export interface DrawableElement extends HTMLElement {
		width: number;
		height: number;
	}

	export class TiledTexture {
		image: DrawableElement;
		tileXY: Array<{ x: number; y: number; }> = [];
		horizFlipOffset: number;

		constructor(source: DrawableElement, public gridSize: number) {
			var sw = source.width,
				sh = source.height,
				tw = Math.ceil(sw / gridSize),
				th = Math.ceil(sh / gridSize);

			var texture = document.createElement("canvas");
			texture.width = source.width;
			texture.height = source.height * 2;

			var texCtx = texture.getContext("2d");
			texCtx.drawImage(source, 0, 0);

			// draw every tile horizontally mirrored below the full set of first tiles
			texCtx.scale(-1, 1);
			for (var j=0; j<th; ++j) {
				var oy = j * gridSize;
				for (var i=0; i<tw; ++i) {
					var ox = i * gridSize;

					texCtx.drawImage(source, ox, oy, gridSize, gridSize, -ox-gridSize, oy + sh, gridSize, gridSize);
				}
			}
			texCtx.scale(-1, 1);

			// exposed image is the extended version
			this.image = texture;
			this.horizFlipOffset = tw * th;
			th *= 2;

			// map tile indexes (including the extended ones for flipped tiles)
			// to their corresponding x,y coord pairs inside the texture
			for (var num = tw * th, ix = 0; ix < num; ++ix) {
				var x = gridSize * (ix % tw),
					y = gridSize * Math.floor(ix / tw);

				this.tileXY.push({x:x, y:y});
			}
		}
	}


	export function loadTiledTexture(url: string, gridSize: number) {
		return loadImage(url)
		.then(function(img: DrawableElement) {
			return new TiledTexture(img, gridSize);
		});
	}
}
