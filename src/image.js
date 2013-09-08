(function() {
"use strict";
// Part of jiko - © 2013 Arthur Langereis & Taco Ekkel

function loadImage(url) {
	var d = Q.defer(),
		image = new Image();
	
	image.onload = function() { d.resolve(image); };
	image.onerror = function() { d.reject("The texture `" + url + "` could not be loaded."); };

	image.src = url;
	return d.promise;
};


function TiledTexture(image, gridSize) {
	this.grid = gridSize;	// each image tile is grid x grid pixels

	var sw = image.width, sh = image.height,
		tw = Math.ceil(sw / this.grid), th = Math.ceil(sh / this.grid);

	var texture = document.createElement("canvas");
	texture.width = image.width;
	texture.height = image.height * 2;

	var texCtx = texture.getContext("2d");
	texCtx.drawImage(image, 0, 0);

	// draw every tile horizontally mirrored below the full set of first tiles
	texCtx.scale(-1, 1);
	for (var j=0; j<th; ++j) {
		var oy = j * gridSize;
		for (var i=0; i<tw; ++i) {
			var ox = i * gridSize;

			texCtx.drawImage(image, ox, oy, gridSize, gridSize, -ox-gridSize, oy + sh, gridSize, gridSize);
		}
	}
	texCtx.scale(-1, 1);

	// exposed image is the extnded version
	this.image = texture;
	this.horizFlipOffset = tw * th;
	th *= 2;

	// map tile indexes (including the extended ones for flipped tiles)
	// to their corresponding x,y coord pairs inside the texture
	this.tileXY = [];

	for (var num = tw * th, ix = 0; ix < num; ++ix) {
		var x = this.grid * (ix % tw),
			y = this.grid * Math.floor(ix / tw);

		this.tileXY.push({x:x, y:y});
	}
}


function loadTiledTexture(url, gridSize) {
	// arguments can be passed as a single options object
	if (typeof url == "object") {
		gridSize = url.gridSize;
		url = url.url;
	}

	return loadImage(url)
	.then(function(img) {
		return new TiledTexture(img, gridSize);
	});
}


// -- unused for now
function TextureSet(data) {
	var self = data;
	return self;
}


// -- unused for now
function loadTextureSet(urls) {
	function name(url) {
		var slash = url.lastIndexOf('/'),
			dot = url.lastIndexOf('.');

		if (dot < 0) dot = url.length;
		return url.substring(slash + 1, dot);
	}

	var tset = {};

	return Q.all(urls.map(
		function(u) {
			return loadImage(u)
			.then(function(img) {
				tset[name(u)] = img;
			});
		}
	))
	.then(function() {
		return TextureSet(tset);
	});
}


// API
Jiko.Image = Jiko.api(
	TiledTexture,

	loadImage,
	loadTiledTexture
);

	
}());
