/*
 * snake, html5 snake game with pixi.js
 *
 * http://oguzhaneroglu.com/games/snake/
 * https://github.com/rohanrhu/snake
 *
 * Copyright (C) 2017, Oğuzhan Eroğlu <rohanrhu2@gmail.com>
 * Licensed under MIT
 */

var SnakeGame = {};

SnakeGame.Game = function (parameters) {
    this.app = parameters.app;

    this.width = 0;
    this.height = 0;

    this.x = 0;
    this.y = 0;

    this.meal_color = {
        r: 255,
        g: 255,
        b: 255
    };

    this.snake = null;

    this.meals = [];
};

SnakeGame.Game.prototype.setSnake = function (snake) {
    this.snake = snake;
    this.snake.game = this;
};

SnakeGame.Game.prototype.step = function (parameters) {
    var t_Game = this;

    this.meal_color.r = parseInt(((Math.sin(Math.PI * 2 * (new Date).getTime() / 1000) + 1) / 2) * 255);
    this.meal_color.g = parseInt(((Math.cos(Math.PI * 2 * (new Date).getTime() / 1000) + 1) / 2) * 255);
    this.meal_color.b = parseInt((Math.cos(Math.PI * 2 * (new Date).getTime() / 1000) + 0.5) * 255);

    t_Game.meals.forEach(function (m, mi) {
        m.meal.clear();
        m.meal.beginFill(rgbToHex(t_Game.meal_color.r, t_Game.meal_color.g, t_Game.meal_color.b));
        m.meal.drawRect(m.x, m.y, t_Game.snake.length, t_Game.snake.length);
    });
};

SnakeGame.Game.prototype.placeMeals = function () {
    if (this.meals.length < 1) {
        var meal = new PIXI.Graphics();
        this.app.stage.addChild(meal);

        this.meals.push({
            x: randomInt(15, this.app.renderer.view.width) - 15,
            y: randomInt(15, this.app.renderer.view.height) - 15,
            meal: meal
        });
    }
};

SnakeGame.Snake = function () {
    var t_Snake = this;

    t_Snake.x = 0;
    t_Snake.y = 0;
    t_Snake.length = 10;
    t_Snake.game = null;
    t_Snake.piece_size = 20;
    t_Snake.ep = null;
    t_Snake.addition = 0.2;
    t_Snake.wa = 0;
    t_Snake.d = null;
    t_Snake.rds = {
        'l': 'r',
        'r': 'l',
        'd': 'u',
        'u': 'd'
    };
    t_Snake.ss = [
        ['r', 5],
        ['d', 8],
        ['l', 3],
        ['d', 4],
        ['r', 8]
    ];
    t_Snake.points_factor = 10;
    t_Snake.points = 0;
    t_Snake.ss.forEach(function (s, i) {
        t_Snake.points += s[1]*t_Snake.points_factor;
    });

    this.default_color = {
        r: 55,
        g: 130,
        b: 57
    };
    this.color = {
        r: this.default_color.r,
        g: this.default_color.g,
        b: this.default_color.b
    };
};

SnakeGame.Snake.prototype.init = function () {
    this.snline = new PIXI.Graphics();
    this.game.app.stage.addChild(this.snline);

    this.x = 50;
    this.y = 50;
};

SnakeGame.Snake.prototype.rotate = function (rotation) {
    if (
        (this.d == rotation)
        ||
        ((this.d == 'l') && (rotation == 'r'))
        ||
        ((this.d == 'r') && (rotation == 'l'))
        ||
        ((this.d == 'u') && (rotation == 'd'))
        ||
        ((this.d == 'd') && (rotation == 'u'))
    ) {
        return false;
    }

    if (this.ss.length > 1) {
        if (
            (this.rds[this.ss[this.ss.length-2][0]] == rotation)
            &&
            (this.ss[this.ss.length-1][1] < 1)
        ) {
            return false;
        }
    }

    this.ss.push([rotation, 0]);

    return true;
};

SnakeGame.Snake.prototype.selfCollision = function () {
    var t_Snake = this;

    var collision = false;

    var stx = this.x;
    var sty = this.y;

    var sbx = stx;
    var sby = sty;

    this.ss.slice(0, this.ss.length-2).forEach(function (s, i) {
        if (s[0] == 'l') {
            stx += (t_Snake.length * s[1]) * -1;
        } else if (s[0] == 'r') {
            stx += t_Snake.length * s[1];
        } else if (s[0] == 'u') {
            sty += (t_Snake.length * s[1]) * -1;
        } else if (s[0] == 'd') {
            sty += t_Snake.length * s[1];
        }

        var diff_x = parseInt(Math.abs(t_Snake.ep.x - stx));
        var diff_y = parseInt(Math.abs(t_Snake.ep.y - sty));

        if ((s[0] == 'u') || (s[0] == 'd')) {
            if (diff_x < (t_Snake.length/2)) {
                if (s[0] == 'u') {
                    if ((t_Snake.ep.y >= sty) && (t_Snake.ep.y <= sby)) {
                        collision = true;
                        return false;
                    }
                } else if (s[0] == 'd') {
                    if ((t_Snake.ep.y >= sby) && (t_Snake.ep.y <= sty)) {
                        collision = true;
                        return false;
                    }
                }
            }
        } else if ((s[0] == 'l') || (s[0] == 'r')) {
            if (diff_y < (t_Snake.length/2)) {
                if (s[0] == 'l') {
                    if ((t_Snake.ep.x >= stx) && (t_Snake.ep.x <= sbx)) {
                        collision = true;
                        return false;
                    }
                } else if (s[0] == 'r') {
                    if ((t_Snake.ep.x >= sbx) && (t_Snake.ep.x <= stx)) {
                        collision = true;
                        return false;
                    }
                }
            }
        }

        sbx = stx;
        sby = sty;
    });

    return collision;
};

SnakeGame.Snake.prototype.borderCollision = function () {
    var t_Snake = this;

    if (
        (t_Snake.ep.x <= 0)
        ||
        (t_Snake.ep.x >= t_Snake.game.app.renderer.view.width)
        ||
        (t_Snake.ep.y <= 0)
        ||
        (t_Snake.ep.y >= t_Snake.game.app.renderer.view.height)
    ) {
        return true;
    }

    return false;
};

SnakeGame.Snake.prototype.mealCollision = function (parameters) {
    var t_Snake = this;

    var collision = false;

    t_Snake.game.meals.forEach(function (m, mi) {
        var mx = m.x + t_Snake.length/2;
        var my = m.y + t_Snake.length/2;

        var dx = Math.abs(mx - t_Snake.ep.x);
        var dy = Math.abs(my - t_Snake.ep.y);

        if (
            (dx <= (t_Snake.length))
            &&
            (dy <= (t_Snake.length))
        ) {
            t_Snake.game.meals.splice(mi, 1);
            m.meal.clear();
            t_Snake.game.app.stage.removeChild(m.meal);

            var ls = t_Snake.ss[0];
            if (ls[1] <= 0) {
                t_Snake.ss.splice(0, 1);
                ls = t_Snake.ss[0];
            }

            t_Snake.addition += 0.01;

            t_Snake.wa += 5;

            t_Snake.points += t_Snake.length*5;

            collision = true;
            return false;
        }
    });

    return collision;
};

SnakeGame.Snake.prototype.step = function (parameters) {
    var t_Snake = this;

    t_Snake.snline.clear();

    t_Snake.snline.x = t_Snake.x;
    t_Snake.snline.y = t_Snake.y;

    t_Snake.snline.moveTo(0, 0);
    t_Snake.snline.lineStyle(t_Snake.length, rgbToHex(t_Snake.color.r, t_Snake.color.g, t_Snake.color.b), 1);

    var rx = 0;
    var ry = 0;

    t_Snake.ss.forEach(function (s, i) {
        if (s[0] == 'l') {
            rx += (t_Snake.length * s[1]) * -1;
        } else if (s[0] == 'r') {
            rx += t_Snake.length * s[1];
        } else if (s[0] == 'u') {
            ry += (t_Snake.length * s[1]) * -1;
        } else if (s[0] == 'd') {
            ry += t_Snake.length * s[1];
        }

        t_Snake.snline.lineTo(rx, ry);
    });

    t_Snake.ep = {
        x: t_Snake.x + rx,
        y: t_Snake.y + ry
    };

    t_Snake.d = t_Snake.ss[t_Snake.ss.length-1][0];

    var a = t_Snake.addition*parameters.delta;

    var decr = function (i, d) {
        if (t_Snake.wa > 0) {
            t_Snake.color.r = parseInt(((Math.sin(Math.PI * 2 * (new Date).getTime() / 1000) + 1) / 2) * 255);
            t_Snake.color.g = parseInt(((Math.cos(Math.PI * 2 * (new Date).getTime() / 1000) + 1) / 2) * 255);
            t_Snake.color.b = parseInt((Math.cos(Math.PI * 2 * (new Date).getTime() / 1000) + 0.5) * 255);

            t_Snake.wa -= d;
            return;
        } else {
            t_Snake.color = {
                r: t_Snake.default_color.r,
                g: t_Snake.default_color.g,
                b: t_Snake.default_color.b
            };
            t_Snake.wa = 0;
        }

        if (i > t_Snake.ss.length-1) {
            return;
        }

        var s0 = t_Snake.ss[i][1] - d;
        t_Snake.ss[i][1] = s0;

        var cd = t_Snake.length;

        if (s0 < 0) {
            cd *= d + s0
        } else {
            cd *= d;
        }

        if (t_Snake.ss[i][0] == 'l') {
            t_Snake.x -= cd;
        } else if (t_Snake.ss[i][0] == 'r') {
            t_Snake.x += cd;
        } else if (t_Snake.ss[i][0] == 'u') {
            t_Snake.y -= cd;
        } else if (t_Snake.ss[i][0] == 'd') {
            t_Snake.y += cd;
        }
        
        if (t_Snake.ss[i][1] <= 0)  {
            t_Snake.ss.splice(i, 1);
        }

        if (s0 < 0) {
            decr(i, s0*-1);
        }
    };

    decr(0, a);

    t_Snake.ss[t_Snake.ss.length-1][1] += a;
};

var Game = function (parameters) {
    var t_Game = this;

    t_Game.parameters = parameters;

    t_Game.events = {};
    t_Game.events.finish = function () {};
    t_Game.events.begin = function () {};
    t_Game.events.pause = function () {};
    t_Game.events.continue = function () {};

    t_Game.playing = false;

    t_Game.app = new PIXI.Application(800, 600, {
        view: t_Game.parameters.view
    });

    t_Game.app.renderer.view.style.position = "fixed";
    t_Game.app.renderer.view.style.display = "block";
    t_Game.app.renderer.view.style.left = "0px";
    t_Game.app.renderer.view.style.top = "0px";

    var onResize = function (event) {
        t_Game.app.renderer.resize(window.innerWidth, window.innerHeight);
    };

    onResize();

    window.addEventListener('resize', onResize);

    t_Game.app.renderer.autoResize = true;
    t_Game.app.renderer.resize(window.innerWidth, window.innerHeight);

    var bg_texture = PIXI.Texture.fromImage('images/bg.png');
    var bg_sprite = new PIXI.TilingSprite(bg_texture, t_Game.app.renderer.width, t_Game.app.renderer.height);

    var bgLayer = new PIXI.Graphics();
    bgLayer.beginFill(0x000000, 0.75);
    bgLayer.drawRect(0, 0, t_Game.app.renderer.width, t_Game.app.renderer.height);

    t_Game.app.stage.addChild(bg_sprite);
    t_Game.app.stage.addChild(bgLayer);

    var style = new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 36,
        fill: '#157518',
        wordWrap: true,
        wordWrapWidth: 200
    });

    var snakeText = new PIXI.Text('snake', style);
    snakeText.x = 20;
    snakeText.y = 20;

    t_Game.app.stage.addChild(snakeText);

    var pointsText = new PIXI.Text('Points: 0', {
        fontFamily: 'Arial',
        fontSize: 13,
        fill: '#ffffff'
    });
    pointsText.x = 20;
    pointsText.y = 60;

    t_Game.app.stage.addChild(pointsText);

    var fpsText = new PIXI.Text('FPS: 0', {
        fontFamily: 'Arial',
        fontSize: 13,
        fill: '#ffffff'
    });
    fpsText.x = 20;
    fpsText.y = 80;

    t_Game.app.stage.addChild(fpsText);

    var infoText = new PIXI.Text('Shortcuts:\np: pause\nn: new game', {
        fontFamily: 'Arial',
        fontSize: 13,
        fill: '#ffffff'
    });
    infoText.x = 20;
    infoText.y = 100;

    t_Game.app.stage.addChild(infoText);

    var oguzhan = new PIXI.Text('by Oğuzhan Eroğlu', {
        fontFamily: 'Arial',
        fontSize: 13,
        fill: '#ffffff'
    });
    oguzhan.x = 125;
    oguzhan.y = 38;

    t_Game.app.stage.addChild(oguzhan);

    t_Game.newGame = function () {
        if (t_Game.game !== undefined) {
            t_Game.snake.snline.clear();
            t_Game.game.meals.forEach(function (m, mi) {
                m.meal.clear();
            });
        }

        t_Game.game = new SnakeGame.Game({
            app: t_Game.app
        });
        t_Game.snake = new SnakeGame.Snake();

        t_Game.game.setSnake(t_Game.snake);
        t_Game.snake.init();

        var time = 0;

        t_Game.ticker = new PIXI.ticker.Ticker();

        var then = Date.now;
        var now;

        t_Game.ticker.add(function (delta) {
            fpsText.setText('FPS: ' + parseInt(t_Game.ticker.FPS));
            pointsText.setText('Points: ' + parseInt(t_Game.snake.points));

            t_Game.game.placeMeals();
            t_Game.game.step({delta: delta});
            t_Game.snake.step({delta: delta});
            t_Game.snake.mealCollision({delta: delta});

            if (t_Game.snake.selfCollision() || t_Game.snake.borderCollision()) {
                t_Game.finish();
            }
        });
    };

    t_Game.finish = function () {
        t_Game.playing = false;
        t_Game.ticker.stop();
        t_Game.events.finish({
            points: t_Game.snake.points
        });
    };

    t_Game.stop = function () {
        t_Game.playing = false;
        t_Game.ticker.stop();
    };

    t_Game.pause = function () {
        t_Game.playing = false;
        t_Game.ticker.stop();
        t_Game.events.pause({
            points: t_Game.snake.points
        });
    };

    t_Game.continue = function () {
        t_Game.play();
        t_Game.events.continue();
    };

    t_Game.play = function () {
        t_Game.playing = true;
        t_Game.ticker.start();
        t_Game.events.begin();
    };

    var handler = function (event) {
        if([32, 37, 38, 39, 40].indexOf(event.keyCode) > -1) {
            event.preventDefault();
        }

        if (event.keyCode == 37) { // LEFT
            t_Game.snake.rotate('l');
        } else if (event.keyCode == 39) { // RIGHT
            t_Game.snake.rotate('r');
        } else if (event.keyCode == 38) { // UP
            t_Game.snake.rotate('u');
        } else if (event.keyCode == 40) { // DOWN
            t_Game.snake.rotate('d');
        } else if (event.keyCode == 13) { // ENTER
            if (!t_Game.playing) {
                t_Game.newGame();
                t_Game.play();
            }
        } else if (event.keyCode == 80) { // P
            if (t_Game.playing) {
                t_Game.pause();
            } else {
                t_Game.continue();
            }
        } else if (event.keyCode == 78) { // N
            t_Game.stop();
            t_Game.newGame();
            t_Game.play();
        }
    };

    window.addEventListener('keydown', handler);
    if (parent && inIframe()) {
        parent.window.addEventListener('keydown', handler);
    }

    t_Game.app.renderer.view.addEventListener('touchstart', function (event) {
        if (t_Game.snake.d == 'l') {
            t_Game.snake.rotate('u');
        } else if (t_Game.snake.d == 'r') {
            t_Game.snake.rotate('d');
        } else if (t_Game.snake.d == 'd') {
            t_Game.snake.rotate('l');
        } else if (t_Game.snake.d == 'u') {
            t_Game.snake.rotate('r');
        }
    }, false);
};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function inIframe() {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}

function rgbToHex(r, g, b) {
    return parseInt("0x" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1));
}