var Jiko;
(function (Jiko) {
    (function (Util) {
        function log() {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            console.info.apply(console, args);
        }
        Util.log = log;

        function elem(sel) {
            return typeof sel == "string" ? document.querySelector(sel) : sel;
        }
        Util.elem = elem;

        function listen(sel, name, handler) {
            elem(sel).addEventListener(name, handler, false);
        }
        Util.listen = listen;

        function load(opts) {
            var xhr = new XMLHttpRequest(), response = Q.defer();

            function fail() {
                var args = [];
                for (var _i = 0; _i < (arguments.length - 0); _i++) {
                    args[_i] = arguments[_i + 0];
                }
                console.info("ASSETS FAIL");
                response.reject.apply(response, args);
            }

            function load() {
                if (xhr.status == 200 || (xhr.status === 0 && xhr.response))
                    response.resolve(xhr);
                else
                    fail("Failed to load asset with options", opts);
            }

            try  {
                xhr.open("GET", opts.url + "?D=" + Date.now(), true);
                if (opts.configRequest)
                    opts.configRequest(xhr);
                xhr.onload = load;
                xhr.onerror = fail;
            } catch (e) {
                fail(e.message, e);
            }

            xhr.send();
            return response.promise;
        }
        Util.load = load;

        function loadScript(url) {
            var defer = Q.defer(), script = document.createElement("script");

            script.src = url + "?D=" + Date.now();
            script.onload = function () {
                defer.resolve(void 0);
            };
            script.onerror = function () {
                defer.reject("Could not load script at " + url);
            };

            document.head.appendChild(script);
            return defer.promise;
        }
        Util.loadScript = loadScript;

        var TextFile = (function () {
            function TextFile(data) {
                this.data = data;
            }
            TextFile.prototype.line = function () {
                if (!this.data)
                    return null;

                var endl = this.data.indexOf("\n");
                if (endl < 0)
                    endl = this.data.length;

                var ln = this.data.slice(0, endl);
                this.data = this.data.slice(endl + 1);
                return ln;
            };

            TextFile.prototype.perLine = function (fn) {
                for (var l = this.line(); l != null; l = this.line())
                    fn(l);
            };
            return TextFile;
        })();
        Util.TextFile = TextFile;
    })(Jiko.Util || (Jiko.Util = {}));
    var Util = Jiko.Util;
})(Jiko || (Jiko = {}));

var Jiko;
(function (Jiko) {
    Jiko.log = Jiko.Util.log, Jiko.elem = Jiko.Util.elem, Jiko.listen = Jiko.Util.listen;
})(Jiko || (Jiko = {}));
var Jiko;
(function (Jiko) {
    (function (Map) {
        function fill(arr, num, val) {
            while (--num > -1)
                arr[num] = val;
            return arr;
        }

        var Tile = (function () {
            function Tile(ix, flipX) {
                this.ix = ix;
                this.flipX = flipX;
            }
            return Tile;
        })();
        Map.Tile = Tile;

        function makeTileLayer(name, w, h) {
            var layer = [];

            layer.name = name;
            layer.width = w;
            layer.height = h;

            for (var r = 0; r < h; ++r)
                layer.push(fill([], w, null));

            return layer;
        }
        Map.makeTileLayer = makeTileLayer;

        var TileMap = (function () {
            function TileMap() {
                this.width = 0;
                this.height = 0;
                this.layers = {};
            }
            TileMap.prototype.makeLayer = function (name) {
                return this.layers[name] = makeTileLayer(name, this.width, this.height);
            };
            return TileMap;
        })();
        Map.TileMap = TileMap;

        function pyxelXMLTileMap(data) {
            var tileMap = new TileMap(), slice = Array.prototype.slice, forEach = Array.prototype.forEach;

            function eachAttr(node, fn) {
                slice.call(node.attributes, 0).forEach(function (attr) {
                    fn(attr.name, attr.value);
                });
            }

            function attr(node, attrName) {
                return node.attributes[attrName].value;
            }

            eachAttr(data.childNodes[0], function (key, val) {
                if (key == "tileswide")
                    tileMap.width = parseInt(val);
                else if (key == "tileshigh")
                    tileMap.height = parseInt(val);
                else
                    console.info("ignored tilemap directive ", key);
            });

            forEach.call(data.querySelectorAll("layer"), function (layerNode) {
                var layer = tileMap.makeLayer(attr(layerNode, "name"));

                forEach.call(layerNode.querySelectorAll("tile"), function (tile) {
                    var x = parseInt(attr(tile, "x")), y = parseInt(attr(tile, "y")), ix = parseInt(attr(tile, "tile")), flipX = attr(tile, "flipX") == "true";

                    if (ix > -1)
                        layer[y][x] = new Tile(ix, flipX);
                });
            });

            return tileMap;
        }

        function loadTileMap(url) {
            return Jiko.Util.load({ url: url }).then(function (xhr) {
                var ext = url.substr(-3).toLowerCase();
                if (ext == "xml")
                    return pyxelXMLTileMap(xhr.responseXML);

                return null;
            });
        }
        Map.loadTileMap = loadTileMap;
    })(Jiko.Map || (Jiko.Map = {}));
    var Map = Jiko.Map;
})(Jiko || (Jiko = {}));
var Jiko;
(function (Jiko) {
    (function (Levels) {
        var State = (function () {
            function State() {
                this.level = null;
                this.texture = null;
            }
            return State;
        })();
        Levels.State = State;

        var Level = (function () {
            function Level() {
                this.map = null;
                this.delegate = null;
                this.actors = [];
            }
            Level.prototype.start = function (state) {
                this.delegate.setup(state);
                this.delegate.start(state);
            };

            Level.prototype.tick = function (state) {
                this.delegate.tick(state);
                this.actors.forEach(function (actor) {
                    return actor.tick();
                });
            };
            return Level;
        })();
        Levels.Level = Level;

        var delegateFutures = {};

        function load(name) {
            var level = new Level();

            delegateFutures[name] = Q.defer();

            return Q.all([
                Jiko.Map.loadTileMap("levels/" + name + ".xml").then(function (map) {
                    level.map = map;
                }),
                Jiko.Util.loadScript("levels/" + name + ".js"),
                delegateFutures[name].promise.then(function (delegate) {
                    level.delegate = delegate;
                })
            ]).then(function () {
                delete delegateFutures[name];
                return level;
            });
        }
        Levels.load = load;

        function delegate(name, del) {
            delegateFutures[name].resolve(del);
        }
        Levels.delegate = delegate;
    })(Jiko.Levels || (Jiko.Levels = {}));
    var Levels = Jiko.Levels;
})(Jiko || (Jiko = {}));
var Jiko;
(function (Jiko) {
    (function (Input) {
        var keys = [], bindings = {};

        function keyDown(event) {
            keys[event.which] = true;
            if (!event.metaKey)
                event.preventDefault();
        }

        function keyUp(event) {
            keys[event.which] = false;
            if (!event.metaKey)
                event.preventDefault();
        }

        function blur() {
            keys = [];
        }

        function focus() {
        }

        function init() {
            Jiko.listen(window, "keydown", keyDown);
            Jiko.listen(window, "keyup", keyUp);
            Jiko.listen(window, "blur", blur);
            Jiko.listen(window, "focus", focus);
        }
        Input.init = init;

        function bind(map) {
            bindings = map;
        }
        Input.bind = bind;

        function pressed(name) {
            return keys[bindings[name] || 0] || false;
        }
        Input.pressed = pressed;

        (function (Keys) {
            Keys[Keys["UP"] = 38] = "UP";
            Keys[Keys["DOWN"] = 40] = "DOWN";
            Keys[Keys["LEFT"] = 37] = "LEFT";
            Keys[Keys["RIGHT"] = 39] = "RIGHT";

            Keys[Keys["SPACE"] = 32] = "SPACE";
            Keys[Keys["RETURN"] = 13] = "RETURN";
        })(Input.Keys || (Input.Keys = {}));
        var Keys = Input.Keys;
    })(Jiko.Input || (Jiko.Input = {}));
    var Input = Jiko.Input;
})(Jiko || (Jiko = {}));
var Jiko;
(function (Jiko) {
    (function (Image) {
        function loadImage(url) {
            var d = Q.defer(), image = document.createElement("img");

            image.onload = function () {
                d.resolve(image);
            };
            image.onerror = function () {
                d.reject("The texture `" + url + "` could not be loaded.");
            };

            image.src = url;
            return d.promise;
        }
        Image.loadImage = loadImage;

        var TiledTexture = (function () {
            function TiledTexture(source, gridSize) {
                this.gridSize = gridSize;
                this.tileXY = [];
                var sw = source.width, sh = source.height, tw = Math.ceil(sw / gridSize), th = Math.ceil(sh / gridSize);

                var texture = document.createElement("canvas");
                texture.width = source.width;
                texture.height = source.height * 2;

                var texCtx = texture.getContext("2d");
                texCtx.drawImage(source, 0, 0);

                texCtx.scale(-1, 1);
                for (var j = 0; j < th; ++j) {
                    var oy = j * gridSize;
                    for (var i = 0; i < tw; ++i) {
                        var ox = i * gridSize;

                        texCtx.drawImage(source, ox, oy, gridSize, gridSize, -ox - gridSize, oy + sh, gridSize, gridSize);
                    }
                }
                texCtx.scale(-1, 1);

                this.image = texture;
                this.horizFlipOffset = tw * th;
                th *= 2;

                for (var num = tw * th, ix = 0; ix < num; ++ix) {
                    var x = gridSize * (ix % tw), y = gridSize * Math.floor(ix / tw);

                    this.tileXY.push({ x: x, y: y });
                }
            }
            return TiledTexture;
        })();
        Image.TiledTexture = TiledTexture;

        function loadTiledTexture(url, gridSize) {
            return loadImage(url).then(function (img) {
                return new TiledTexture(img, gridSize);
            });
        }
        Image.loadTiledTexture = loadTiledTexture;
    })(Jiko.Image || (Jiko.Image = {}));
    var Image = Jiko.Image;
})(Jiko || (Jiko = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Jiko;
(function (Jiko) {
    (function (_Actor) {
        

        var Actor = (function () {
            function Actor(options, ctrl) {
                this.options = options;
                this.ctrl = ctrl;
                this.tilex = 0;
                this.x = 0;
                this.y = 0;
                this.tilex = options.ix || 0;
                this.x = options.x || 0.0;
                this.y = options.y || 0.0;
                this.ctrl.actor = this;
            }
            Actor.prototype.tick = function () {
                this.ctrl.tick();
            };
            Actor.prototype.collide = function (other) {
                this.ctrl.collide(other);
            };
            Actor.prototype.render = function (ctx) {
                this.ctrl.render(ctx);
            };
            Actor.prototype.type = function () {
                return this.ctrl.type;
            };

            Actor.prototype.moveUnconstrained = function (dx, dy) {
                this.x += dx;
                this.y += dy;
            };
            Actor.prototype.moveUnconstrainedAbs = function (x, y) {
                this.x = x;
                this.y = y;
            };
            return Actor;
        })();
        _Actor.Actor = Actor;

        var DefaultActorController = (function () {
            function DefaultActorController() {
                this.type = "generic";
                this.actor = null;
            }
            DefaultActorController.prototype.tick = function () {
            };
            DefaultActorController.prototype.collide = function (other) {
            };
            DefaultActorController.prototype.render = function (ctx) {
                var tex = this.actor.options.texture, txy = tex.tileXY[this.actor.tilex], gridSize = tex.gridSize;

                ctx.drawImage(tex.image, txy.x, txy.y, gridSize, gridSize, this.actor.x, this.actor.y, gridSize, gridSize);
            };
            return DefaultActorController;
        })();

        var JikoActorController = (function (_super) {
            __extends(JikoActorController, _super);
            function JikoActorController() {
                _super.apply(this, arguments);
                this.type = "jiko";
            }
            JikoActorController.prototype.tick = function () {
                if (Jiko.Input.pressed("move-left") && this.actor.x > 16)
                    this.actor.moveUnconstrained(-1, 0);
                else if (Jiko.Input.pressed("move-right") && this.actor.x < 200)
                    this.actor.moveUnconstrained(1, 0);
            };
            return JikoActorController;
        })(DefaultActorController);

        function makeActor(x, y, texture, tilex) {
            return new Actor({
                x: x, y: y, ix: tilex,
                texture: texture
            }, new ((tilex == 53) ? JikoActorController : DefaultActorController));
        }
        _Actor.makeActor = makeActor;
    })(Jiko.Actor || (Jiko.Actor = {}));
    var Actor = Jiko.Actor;
})(Jiko || (Jiko = {}));

var Jiko;
(function (Jiko) {
    (function (Temp) {
        var WorldView = (function () {
            function WorldView(state, renderTarget) {
                this.state = state;
                this.renderTarget = renderTarget;
            }
            WorldView.prototype.renderTileLayer = function (ctx, tl) {
                var x, y, tile, row, tex = this.state.texture, gridSize = tex.gridSize;

                for (y = 0; y < tl.height; ++y) {
                    row = tl[y];

                    for (x = 0; x < tl.width; ++x) {
                        tile = row[x];
                        if (tile && tile.ix >= 0) {
                            var txy = tile.flipX ? tex.tileXY[tile.ix + tex.horizFlipOffset] : tex.tileXY[tile.ix];
                            ctx.drawImage(tex.image, txy.x, txy.y, gridSize, gridSize, x * gridSize, y * gridSize, gridSize, gridSize);
                        }
                    }
                }
            };

            WorldView.prototype.render = function () {
                var map = this.state.level.map, ctx = this.renderTarget.ctx;

                this.renderTileLayer(ctx, map.layers["BG Static"]);
                this.renderTileLayer(ctx, map.layers["BG Building"]);
                this.renderTileLayer(ctx, map.layers["BG Props"]);

                this.state.level.actors.forEach(function (actor) {
                    return actor.render(ctx);
                });

                this.renderTileLayer(ctx, map.layers["FG Props"]);
            };
            return WorldView;
        })();

        var RenderTarget = (function () {
            function RenderTarget(sel, scale) {
                this.canvas = Jiko.elem(sel);
                this.ctx = this.canvas.getContext("2d");

                this.ctx.webkitImageSmoothingEnabled = false;
                this.ctx.mozImageSmoothingEnabled = false;
                this.ctx.imageSmoothingEnabled = false;
                this.ctx.scale(scale, scale);
            }
            return RenderTarget;
        })();

        function Game(state) {
            var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame;

            var renderTarget = new RenderTarget("canvas", 3.0), view = new WorldView(state, renderTarget);

            function step() {
                state.level.tick(state);
                view.render();

                requestAnimationFrame(step);
            }

            state.level.start(state);
            step();
        }
        Temp.Game = Game;
    })(Jiko.Temp || (Jiko.Temp = {}));
    var Temp = Jiko.Temp;
})(Jiko || (Jiko = {}));

window.onload = function () {
    var state = new Jiko.Levels.State();

    Q.all([
        Jiko.Image.loadTiledTexture("gfx/jiko-tiles.png", 16).then(function (tex) {
            return state.texture = tex;
        }),
        Jiko.Levels.load("test1").then(function (level) {
            return state.level = level;
        })
    ]).then(function () {
        Jiko.Input.init();
        Jiko.Input.bind({
            "move-left": 37 /* LEFT */,
            "move-right": 39 /* RIGHT */,
            "move-up": 38 /* UP */,
            "move-down": 40 /* DOWN */,
            "act": 32 /* SPACE */
        });

        Jiko.Temp.Game(state);
    });
};
//# sourceMappingURL=jiko.js.map
