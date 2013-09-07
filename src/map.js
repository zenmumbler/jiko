(function() {
"use strict";
// Part of jiko - © 2013 Arthur Langereis & Taco Ekkel

function fill(arr, num, val) {
	while(--num > -1)
		arr[num] = val;
	return arr;
}


function makeTile(data) {
	return Jiko.extend({
		ix: 0, flipX: false
	}, data);
}


function TileLayer(name, w, h) {
	this.name = name;
	this.width = w;
	this.height = h;

	// generate empty w * h array of arrays
	for (var r=0; r < this.height; ++r)
		this.push(fill([], this.width, null));
}
TileLayer.prototype = [];


function TileMap() {
	this.width = this.height = 0;
	this.layers = {};

	this.makeLayer = function(name) {
		return this.layers[name] = new TileLayer(name, this.width, this.height);
	};
}


// -- unused and not working anymore
function pyxelTextTileMap(data) {
	var tileMap = new TileMap(),
		layer;

	new Jiko.Util.TextFile(data)
	.perLine(function(ln) {
		var toks;
		if (layer) {
			if (! ln) {
				layer = null;
				return;
			}
			toks = ln.replace(/^,|,$/g, '').split(",");

			// each line is an array of Tiles
			layer.push(toks.map(function(t) {
				return makeTile({ ix: parseInt(t) });
			}));
		}
		else {
			if (! ln) return;

			toks = ln.split(" ");
			if (toks[0] == "tileswide")
				tileMap.width = parseInt(toks[1]);
			else if (toks[0] == "tileshigh")
				tileMap.height = parseInt(toks[1]);
			else if (toks[0] == "layer")
				layer = tileMap.layers[parseInt(toks[1])] = [];
			else
				console.info("ignored directive ", toks[0]);
		}
	});

	return tileMap;
}


function pyxelXMLTileMap(data) {
	var tileMap = new TileMap();

	function eachAttr(node, fn) {
		[].slice.call(node.attributes, 0).forEach(function(attr) { fn(attr.name, attr.value); });
	}

	function attr(node, attrName) {
		return node.attributes[attrName].value;
	}

	eachAttr(data.childNodes[0], function(key, val) {
		if (key == "tileswide")
			tileMap.width = parseInt(val);
		else if (key == "tileshigh")
			tileMap.height = parseInt(val);
		else
			console.info("ignored tilemap directive ", key);
	});

	[].forEach.call(data.querySelectorAll("layer"), function(layerNode) {
		// precreate empty tilemap so we can just overwrite values
		var layer = tileMap.makeLayer(attr(layerNode, "name"));

		[].forEach.call(layerNode.querySelectorAll("tile"), function(tile) {
			var x = parseInt(attr(tile, "x")),
				y = parseInt(attr(tile, "y")),
				ix = parseInt(attr(tile, "index")),
				flipX = attr(tile, "flipX") == "true";

			if (ix > -1)
				layer[y][x] = makeTile({ ix: ix, flipX: flipX });
		});
	});

	return tileMap;
}


function loadTileMap(url) {
	return Jiko.Util.load({url:url})
	.then(function(xhr) {
		var ext = url.substr(-3).toLowerCase();
		if (ext == "txt")
			return pyxelTextTileMap(xhr.responseText);
		if (ext == "xml")
			return pyxelXMLTileMap(xhr.responseXML);

		return Q.defer().reject("Don't know how to read map data @ ", url);
	});
}



// API
Jiko.Map = {
	TileLayer: TileLayer,
	TileMap: TileMap,

	makeTile: makeTile,
	loadTileMap: loadTileMap
};


}());
