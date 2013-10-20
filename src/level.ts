// level.ts - level loading

module Jiko.Levels {

	export class State {
		level: Level = null;
		texture: Image.TiledTexture = null;
	}

	export interface LevelDelegate {
		setup(state: State): void;
		start(state: State): void;
		tick(state: State): void;
		finish(state: State): void;
	}

	export class Level {
		map: Jiko.Map.TileMap = null;
		delegate: LevelDelegate = null;
		actors: Actors.Actor[] = [];

		start(state: State) {
			this.delegate.setup(state);
			this.delegate.start(state);
		}

		tick(state: State) {
			this.delegate.tick(state);
			this.actors.forEach(actor => actor.tick());
		}
	}



	// ------------ Level Loading ------------

	var delegateFutures: { [levelName: string]: Q.Deferred<LevelDelegate>; } = {};

	export function load(name: string) {
		var level = new Level();

		delegateFutures[name] = Q.defer<LevelDelegate>();

		return Q.all([
			Jiko.Map.loadTileMap("levels/" + name + ".xml").then(map => { level.map = map; }),
			Jiko.Util.loadScript("levels/" + name + ".js"),
			delegateFutures[name].promise.then(delegate => { level.delegate = delegate; })
		])
		.then(function() {
			delete delegateFutures[name];
			return level;
		});
	}

	export function delegate(name: string, del: LevelDelegate) {
		delegateFutures[name].resolve(del);
	}
}
