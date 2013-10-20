// Part of jiko - © 2013 Arthur Langereis & Taco Ekkel

module Jiko.Map {
	function fill(arr: Array<any>, num: number, val: any) {
		while(--num > -1)
			arr[num] = val;
		return arr;
	}

	export class Tile {
		constructor(public ix: number, public flipX: boolean) {}
	}

	export interface TileLayer extends Array<Tile[]> {
		name: string;
		width: number;
		height: number;
	}

	export function makeTileLayer(name: string, w: number, h: number) {
		var layer = <TileLayer>[];

		layer.name = name;
		layer.width = w;
		layer.height = h;

		// generate empty w * h array of arrays
		for (var r=0; r < h; ++r)
			layer.push(fill([], w, null));

		return layer;
	}


	export class TileMap {
		width = 0;
		height = 0;
		layers: { [name: string]: TileLayer; } = {};

		makeLayer(name: string) {
			return this.layers[name] = makeTileLayer(name, this.width, this.height);
		}
	}


	function pyxelXMLTileMap(data: Document) {
		var tileMap = new TileMap(),
			slice = Array.prototype.slice,
			forEach = Array.prototype.forEach;

		function eachAttr(node: Node, fn: (name: string, val: string) => void) {
			slice.call(node.attributes, 0).forEach((attr: Attr) => { fn(attr.name, attr.value); });
		}

		function attr(node: Node, attrName: string) {
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

		forEach.call(data.querySelectorAll("layer"), function(layerNode: Element) {
			// precreate empty tilemap so we can just overwrite values
			var layer = tileMap.makeLayer(attr(layerNode, "name"));

			forEach.call(layerNode.querySelectorAll("tile"), function(tile: Node) {
				var x = parseInt(attr(tile, "x")),
					y = parseInt(attr(tile, "y")),
					ix = parseInt(attr(tile, "tile")),
					flipX = attr(tile, "flipX") == "true";

				if (ix > -1)
					layer[y][x] = new Tile(ix, flipX);
			});
		});

		return tileMap;
	}


	export function loadTileMap(url: string): Q.IPromise<TileMap> {
		return Util.load({url:url})
		.then(function(xhr: XMLHttpRequest) {
			var ext = url.substr(-3).toLowerCase();
			if (ext == "xml")
				return pyxelXMLTileMap(xhr.responseXML);

			return Q.defer().reject("Don't know how to read map data @ " + url);
		});
	}
}