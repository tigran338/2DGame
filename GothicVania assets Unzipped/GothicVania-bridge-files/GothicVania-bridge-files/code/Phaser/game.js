/*
 * GothicVania Demo Code
 * @copyright    2017 Ansimuz
 * Buy a License for these assets at https://ansimuz.itch.io/
 * Get free assets and code at: www.pixelgameart.org
 * */

var game;
var background;
var middleground;
var foreground;
var gameWidth = 430;
var gameHeight = 272;
var crouchFlag = false;
var jumpingFlag = false;
var attackingflag = false;
var jumpAttackingflag = false;
var globalMap;
var hurtFlag = false;
var fireTimer;
var projectiles;
var player;

window.onload = function () {

    game = new Phaser.Game(gameWidth, gameHeight, Phaser.AUTO, "");
    game.state.add('Boot', boot);
    game.state.add('Preload', preload);
    game.state.add('TitleScreen', titleScreen);
    game.state.add('PlayGame', playGame);
    //
    game.state.start("Boot");
}

var boot = function (game) {
};
boot.prototype = {
    preload: function () {
        this.game.load.image('loading', 'assets/sprites/loading.png');
    },
    create: function () {
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.renderer.renderSession.roundPixels = true; // no blurring
        this.game.state.start('Preload');
    }
}

var preload = function (game) {
};
preload.prototype = {
    preload: function () {

        var loadingBar = this.add.sprite(game.width / 2, game.height / 2, 'loading');
        loadingBar.anchor.setTo(0.5);
        game.load.setPreloadSprite(loadingBar);
        // load title screen
        game.load.image('title', 'assets/sprites/title-screen.png');
        game.load.image('enter', 'assets/sprites/press-enter-text.png');
        game.load.image('credits', 'assets/sprites/credits-text.png');
        game.load.image('instructions', 'assets/sprites/instructions.png');
        // environment
        game.load.image('background', 'assets/environment/background.png');
        game.load.image('middleground', 'assets/environment/middleground.png');
        game.load.image('foreground', 'assets/environment/foreground.png');
        //tileset
        game.load.image('tileset', 'assets/environment/tileset.png');
        game.load.tilemap('map', 'assets/maps/map.json', null, Phaser.Tilemap.TILED_JSON);
        // atlas sprites
        game.load.atlasJSONArray('atlas', 'assets/atlas/atlas.png', 'assets/atlas/atlas.json');
        game.load.atlasJSONArray('atlas-props', 'assets/atlas/atlas-props.png', 'assets/atlas/atlas-props.json');
    },
    create: function () {
        this.game.state.start('TitleScreen');
    }
}

var titleScreen = function (game) {
};
titleScreen.prototype = {
    create: function () {
        background = game.add.tileSprite(0, 0, gameWidth, gameHeight, 'background');
        middleground = game.add.tileSprite(0, 80, gameWidth, gameHeight, 'middleground');
        background.tilePosition.x = 65;

        this.title = game.add.image(game.width / 2, 100, 'title');
        this.title.anchor.setTo(0.5, 0);
        var credits = game.add.image(game.width / 2, game.height - 10, 'credits');
        credits.anchor.setTo(0.5, 1);

        this.pressEnter = game.add.image(game.width / 2, game.height - 35, 'enter');
        this.pressEnter.anchor.setTo(0.5, 1);

        var startKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        startKey.onDown.add(this.startGame, this);

        game.time.events.loop(700, this.blinkText, this);

        this.state = 1;

        //this.game.state.start('PlayGame');

    },
    blinkText: function () {
        if (this.pressEnter.alpha) {
            this.pressEnter.alpha = 0;
        } else {
            this.pressEnter.alpha = 1;
        }
    }

    ,
    update: function () {
        middleground.tilePosition.x -= .2;
    },
    startGame: function () {
        if (this.state == 1) {
            this.state = 2;
            this.title2 = game.add.image(game.width / 2, 60, 'instructions');
            this.title2.anchor.setTo(0.5, 0);
            this.title.destroy();
        } else {
            this.game.state.start('PlayGame');
        }

    }
}

var playGame = function (game) {
};
playGame.prototype = {

    create: function () {
        this.createBackgrounds();
        this.createTilemap();
        this.createPlayer(7, 10);
        this.bindKeys();
        this.populate();
        this.decorWorld();
        this.createForegrounds();
        // camera follow
        game.camera.follow(this.player, Phaser.Camera.FOLLOW_PLATFORMER);
    },

    createBackgrounds: function () {
        background = game.add.tileSprite(0, 0, gameWidth, gameHeight, 'background');
        middleground = game.add.tileSprite(0, 37, gameWidth, gameHeight, 'middleground');
        background.fixedToCamera = true;
        middleground.fixedToCamera = true;
        background.tilePosition.x = 65;
    },

    createForegrounds: function () {
        foreground = game.add.tileSprite(0, 190, gameWidth, 84, 'foreground');
        foreground.fixedToCamera = true;
    },

    createTilemap: function () {
        // tilemap
        this.map = game.add.tilemap('map');
        this.map.addTilesetImage('tileset');
        this.layer = this.map.createLayer('Tile Layer 1');
        this.layer.resizeWorld();
        // collision
        this.map.setCollision(1);
        this.map.setCollisionBetween(23, 43);
        // some tiles are one way collision
        this.setOneWayCollision(183);
        this.setOneWayCollision(186);
        this.setOneWayCollision(188);
        this.setOneWayCollision(202);
        this.setOneWayCollision(203);
        // make map available to other objects
        globalMap = this.map;
    },

    setOneWayCollision: function (tileIndex) {
        tileIndex += 1;
        var x, y, tile;
        for (x = 0; x < this.map.width; x++) {
            for (y = 1; y < this.map.height; y++) {
                tile = this.map.getTile(x, y);
                if (tile !== null) {
                    if (tile.index == tileIndex) {
                        tile.setCollision(false, false, true, false);
                    }

                }
            }
        }
    },

    decorWorld: function () {
        // group colliding
        this.solidObjects = game.add.group();
        game.add.image(5 * 16, 7 * 16, 'atlas-props', 'street-lamp');
        game.add.image(53 * 16, 7 * 16, 'atlas-props', 'street-lamp');
        game.add.image(85 * 16, 7 * 16, 'atlas-props', 'street-lamp');
        game.add.image(138 * 16, 7 * 16, 'atlas-props', 'street-lamp');
        game.add.image(92 * 16, 7 * 16 + 9, 'atlas-props', 'statue');
        game.add.image(2 * 16, 11 * 16, 'atlas-props', 'block');
        game.add.image(0 * 16, 10 * 16, 'atlas-props', 'big-block');
        this.createTorch(18, 9);
        this.createTorch(103, 9);

        // items
        this.createItem(46, 3, 'potion-red/potion-red');
        this.createItem(68, 10, 'potion-green/potion-green');
        this.createItem(103, 4, 'potion-purple/potion-purple');

    },

    createItem: function (x, y, item) {
        x *= 16;
        y *= 16;
        var temp = game.add.sprite(x, y, 'atlas', item + "-1");
        temp.anchor.setTo(0.5);
        game.physics.arcade.enable(temp);
        temp.animations.add('idle', Phaser.Animation.generateFrameNames(item + "-", 1, 4, '', 0), 6, true);
        temp.animations.play('idle');

        this.items.add(temp);

    },

    populate: function () {
        // groups
        this.enemies = game.add.group();
        this.enemies.enableBody = true;
        //
        this.items = game.add.group();
        this.items.enableBody = true;
        //
        projectiles = game.add.group();
        projectiles.enableBody = true;

        // create enemies
        var bat = new Bat(game, 20, 8);
        game.add.existing(bat);
        this.enemies.add(bat);
        var bat = new Bat(game, 74, 10);
        game.add.existing(bat);
        this.enemies.add(bat);
        var bat = new Bat(game, 120, 4);
        game.add.existing(bat);
        this.enemies.add(bat);
        //
        var skeleton = new Skeleton(game, 39, 3);
        game.add.existing(skeleton);
        this.enemies.add(skeleton);
        var skeleton = new Skeleton(game, 105, 3);
        game.add.existing(skeleton);
        this.enemies.add(skeleton);
        var skeleton = new Skeleton(game, 39, 11);
        game.add.existing(skeleton);
        this.enemies.add(skeleton);
        //
        var sorcerer = new Sorcerer(game, 59, 10);
        game.add.existing(sorcerer);
        this.enemies.add(sorcerer);
        var sorcerer = new Sorcerer(game, 91, 10);
        game.add.existing(sorcerer);
        this.enemies.add(sorcerer);



        this.skeleton = skeleton;
        this.sorcerer = sorcerer;
        this.bat = bat;

        // timers
        fireTimer = game.time.create(false);
        fireTimer.loop(7000, this.castManager, this);
        fireTimer.start();

    },



    castManager: function () {
        for (var i = 0, len = this.enemies.children.length; i < len; i++) {

            var tempEnemy = this.enemies.children[i];

           // console.log(tempEnemy.alive);

            // all sorcerers cast the fireball
            if (tempEnemy.enemyType == 'sorcerer' && tempEnemy.alive) {
                tempEnemy.castball();
            }
        }
    },

    createTorch: function (x, y) {
        x *= 16;
        y *= 16;
        var temp = game.add.sprite(x, y, 'atlas', 'torch/torch-1');
        temp.animations.add('idle', Phaser.Animation.generateFrameNames('torch/torch-', 1, 4, '', 0), 12, true);
        temp.animations.play('idle');
    },

    createPlayer: function (x, y) {
        x *= 16;
        y *= 16;
        this.player = game.add.sprite(x, y, 'atlas', 'idle/player-idle-1');
        this.player.anchor.setTo(0.5);
        game.physics.arcade.enable(this.player);
        this.player.body.gravity.y = 500;
        this.player.body.setSize(16, 42, 56, 22);
        // animations
        var p = this.player;
        var speed = 10;
        p.animations.add('idle', Phaser.Animation.generateFrameNames('idle/player-idle-', 1, 4, '', 0), speed, true);
        p.animations.add('run', Phaser.Animation.generateFrameNames('run/player-run-', 1, 7, '', 0), speed, true);
        p.animations.add('jump', Phaser.Animation.generateFrameNames('jump/player-jump-', 1, 2, '', 0), 5, false);
        p.animations.add('fall', Phaser.Animation.generateFrameNames('jump/player-jump-', 3, 4, '', 0), speed, true);
        var crouchAnim = p.animations.add('crouch', Phaser.Animation.generateFrameNames('crouch/player-crouch-', 1, 2, '', 0), speed, false);
        var attackAnim = p.animations.add('attack', Phaser.Animation.generateFrameNames('player-attack/player-attack-', 1, 5, '', 0), speed + 10, false);
        var crouchAttackAnim = p.animations.add('crouchAttack', Phaser.Animation.generateFrameNames('crouch-attack/player-crouch-attack-', 1, 4, '', 0), speed + 10, false);
        var jumpAttackAnim = p.animations.add('jumpAttack', Phaser.Animation.generateFrameNames('jump-attack/player-jump-attack-', 1, 3, '', 0), speed + 10, false);
        p.animations.add('hurt', Phaser.Animation.generateFrameNames('hurt/player-hurt-', 1, 2, '', 0), 9, false);

        // anim functions
        crouchAnim.onComplete.add(function () {
            crouchFlag = true;
        });
        attackAnim.onComplete.add(function () {
            attackingflag = crouchFlag = false;
        });
        crouchAttackAnim.onComplete.add(function () {
            attackingflag = crouchFlag = false;
        });
        jumpAttackAnim.onComplete.add(function () {
            jumpAttackingflag = crouchFlag = false;
        });

        // default animation
        p.animations.play('idle');

        this.createHitbox();

        // make player available
        player = this.player;
    },

    createHitbox: function () {
        // create hitbox
        this.hitbox = game.add.sprite(0, 16, null);
        this.hitbox.anchor.setTo(0.5);
        game.physics.arcade.enable(this.hitbox);
        this.hitbox.body.setSize(42, 16, 0, 0);
        this.player.addChild(this.hitbox);
    },

    resetHurt: function () {
        hurtFlag = false;
    },

    bindKeys: function () {
        this.wasd = {
            jump: game.input.keyboard.addKey(Phaser.Keyboard.C),
            attack: game.input.keyboard.addKey(Phaser.Keyboard.X),
            left: game.input.keyboard.addKey(Phaser.Keyboard.LEFT),
            right: game.input.keyboard.addKey(Phaser.Keyboard.RIGHT),
            down: game.input.keyboard.addKey(Phaser.Keyboard.DOWN)
        }
        game.input.keyboard.addKeyCapture(
            [Phaser.Keyboard.LEFT,
                Phaser.Keyboard.RIGHT,
                Phaser.Keyboard.DOWN
            ]
        );
    },

    update: function () {

        game.physics.arcade.collide(this.player, this.layer);
        game.physics.arcade.collide(this.enemies, this.layer);
        game.physics.arcade.collide(this.player, this.solidObjects);
        game.physics.arcade.overlap(this.player, this.enemies, this.hurtPlayer, null, this);
        game.physics.arcade.overlap(this.player, projectiles, this.fireballHit, null, this);
        game.physics.arcade.overlap(this.hitbox, this.enemies, this.triggerAttack, null, this);
        game.physics.arcade.overlap(this.player, this.items, this.pickItem, null, this);

        this.movePlayer();
        this.parallaxBackground();
        this.hitBoxManager();
        this.hurtFlagManager();
        this.killManager();

       //this.debugGame();

    },

    fireballHit: function(player, projectile){
        if(crouchFlag){
            return;
        }
        this.hurtPlayer();
        projectile.kill();

    },

    killManager: function () {
        if (this.player.y > 20 * 16) {
            this.player.x = 7 * 16;
            this.player.y = 9 * 16;
        }
    },

    pickItem: function (player, item) {
        item.kill();
        var pick = new ItemFeedback(game, item.x, item.y);
        game.add.existing(pick);
    },

    triggerAttack: function (player, enemy) {
        if (this.wasd.attack.isDown) {
            enemy.kill();
            var death = new EnemyDeath(game, enemy.x, enemy.y - 16);
            game.add.existing(death);
        }

    },

    hitBoxManager: function () {
        if (this.player.scale.x == -1) {
            this.hitbox.x = 45;
        } else {
            this.hitbox.x = 37;
        }

    },

    hurtFlagManager: function () {
        // reset hurt when touching ground
        if (hurtFlag && this.player.body.onFloor()) {
            this.resetHurt();
        }
    },

    parallaxBackground: function () {
        middleground.tilePosition.x = this.layer.x * -0.5;
        foreground.tilePosition.x = this.layer.x * -1.2;
    },

    movePlayer: function () {

        if (hurtFlag) {
            return;
        }

        // reset jumpingflag
        if (this.player.body.onFloor()) {
            jumpingFlag = false;
        }

        // block states
        if (jumpingFlag) {

            if (this.wasd.attack.isDown) {
                this.player.animations.play('jumpAttack');
            } else if (this.player.body.velocity.y > 0 && !jumpAttackingflag) {
                this.player.animations.play('fall');
            }

            return;

        }
        if (attackingflag) {
            return;
        }

        var vel = 100;
        if (this.wasd.left.isDown) {
            this.player.body.velocity.x = -vel;
            this.player.scale.x = -1;
            if (this.player.body.velocity.y > 0) {
                this.player.animations.play('fall');
            } else {
                this.player.animations.play('run');
            }
        } else if (this.wasd.right.isDown) {
            this.player.body.velocity.x = vel;
            this.player.scale.x = 1;
            if (this.player.body.velocity.y > 0) {
                this.player.animations.play('fall');
            } else {
                this.player.animations.play('run');
            }
        } else {
            this.player.body.velocity.x = 0;
            if (this.wasd.down.isDown) {
                if (!crouchFlag) {
                    this.player.animations.play('crouch');
                }


            } else {
                if (this.player.body.velocity.y > 0) {
                    this.player.animations.play('fall');
                } else {
                    this.player.animations.play('idle');
                }

            }
        }

        // reset crouch state
        if (this.wasd.down.isUp) {
            crouchFlag = false;
        }

        // jump
        if (this.wasd.jump.isDown && this.player.body.onFloor()) {
            this.player.body.velocity.y = -220;
            this.player.animations.play('jump');
            jumpingFlag = true;
        }

        // attack
        if (this.wasd.attack.isDown && this.player.body.onFloor() && this.wasd.down.isDown) {
            this.player.body.velocity.x = 0;
            this.player.animations.play('crouchAttack');
            attackingflag = true;
        } else if (this.wasd.attack.isDown && this.player.body.onFloor()) {
            this.player.body.velocity.x = 0;
            this.player.animations.play('attack');
            attackingflag = true;
        }

    },

    hurtPlayer: function () {
        if (hurtFlag) {
            return;
        }
        hurtFlag = true;
        this.player.animations.play('hurt');
        this.player.body.velocity.y = -150;
        this.player.body.velocity.x = (this.player.scale.x == 1) ? -100 : 100;
    },

    debugGame: function () {
        //game.debug.spriteInfo(this.player, 30, 30);
        game.debug.body(this.bat);
        game.debug.body(this.skeleton);
        game.debug.body(this.sorcerer);
        game.debug.body(this.player);
        game.debug.body(this.hitbox);

        this.enemies.forEachAlive(this.renderGroup, this);
        //this.items.forEachAlive(this.renderGroup, this);

    }

}

// bat

Bat = function (game, x, y) {
    x *= 16;
    y *= 16;
    Phaser.Sprite.call(this, game, x, y, 'atlas', 'bat-flying/bat-flying-1');
    game.physics.arcade.enable(this);
    this.anchor.setTo(0.5);
    this.body.setSize(22, 14, 4, 26);
    this.animations.add('fly', Phaser.Animation.generateFrameNames('bat-flying/bat-flying-', 1, 4, '', 0), 18, true);
    this.animations.play('fly');
    var VTween = game.add.tween(this).to({
        y: y + 50
    }, 1000, Phaser.Easing.Linear.None, true, 0, -1);
    VTween.yoyo(true);
};

Bat.prototype = Object.create(Phaser.Sprite.prototype);
Bat.prototype.constructor = Bat;

Bat.prototype.update = function () {
    if (this.x > player.x) {
        this.scale.x = 1;
    } else {
        this.scale.x = -1;
    }
};

// skeleton

Skeleton = function (game, x, y) {
    x *= 16;
    y *= 16;
    Phaser.Sprite.call(this, game, x, y, 'atlas', 'skeleton/skeleton-1');
    game.physics.arcade.enable(this);
    this.anchor.setTo(0.5);
    this.body.setSize(16, 44, 16, 20);
    this.body.gravity.y = 500;
    this.animations.add('walk', Phaser.Animation.generateFrameNames('skeleton/skeleton-', 1, 6, '', 0), 9, true);
    this.animations.play('walk');
    this.body.velocity.x = 60 * game.rnd.pick([1, -1]);
    this.body.bounce.x = 1;
};

Skeleton.prototype = Object.create(Phaser.Sprite.prototype);
Skeleton.prototype.constructor = Skeleton;

Skeleton.prototype.update = function () {
    if (this.body.velocity.x < 0) {
        this.scale.x = 1;
    } else {
        this.scale.x = -1;
    }

    this.avoidFalls();
};

Skeleton.prototype.avoidFalls = function () {
    var direction, position_to_check, next_tile;
    direction = (this.body.velocity.x < 0) ? -1 : 1;
    position_to_check = new Phaser.Point(this.x + (direction * 16), this.bottom + 1);
    next_tile = globalMap.getTileWorldXY(position_to_check.x, position_to_check.y, 16, 16);
    // if about to fall switch direction
    if (next_tile === null && this.body.onFloor()) {
        this.body.velocity.x *= -1;
    }
};

// sorcerer

Sorcerer = function (game, x, y) {
    x *= 16;
    y *= 16;
    this.enemyType = 'sorcerer';
    Phaser.Sprite.call(this, game, x, y, 'atlas', 'sorcerer/sorcerer-1');
    game.physics.arcade.enable(this);
    this.anchor.setTo(0.5);
    this.body.setSize(18, 42, 14, 6);
    this.body.gravity.y = 500;
    this.animations.add('idle', ['sorcerer/sorcerer-1'], 9, true);
    this.animations.add('casting', Phaser.Animation.generateFrameNames('sorcerer/sorcerer-', 2, 3, '', 0), 9, true);
    this.animations.add('cast', ['sorcerer/sorcerer-4'], 9, true);
    this.animations.play('idle');

};

Sorcerer.prototype = Object.create(Phaser.Sprite.prototype);
Sorcerer.prototype.constructor = Sorcerer;

Sorcerer.prototype.update = function () {
    //console.log(fireTimer.running + ' - ' + fireTimer.duration);

    if(fireTimer.duration < 2000){
        this.animations.play('casting');
    }else if(fireTimer.duration > 2000 && fireTimer.duration < 5000){
        this.animations.play('idle');
    }else if(fireTimer.duration > 5000 && fireTimer.duration < 7000){
        this.animations.play('cast');
    }

};

Sorcerer.prototype.castball = function () {
    //console.log('cast ball');
    var fireball = new Fireball(game, this.x,this.y - 8);
    game.add.existing(fireball);
    projectiles.add(fireball);
};

// enemy death

EnemyDeath = function (game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'atlas', 'enemy-death/enemy-death-1');
    this.anchor.setTo(0.5);
    var anim = this.animations.add('death', Phaser.Animation.generateFrameNames('enemy-death/enemy-death-', 1, 5, '', 0), 9, false);
    this.animations.play('death');
    anim.onComplete.add(function () {
        this.kill();
    }, this);
};

EnemyDeath.prototype = Object.create(Phaser.Sprite.prototype);
EnemyDeath.prototype.constructor = EnemyDeath;

// fireball

Fireball = function(game,x,y){
    Phaser.Sprite.call(this, game, x, y, 'atlas', 'fireball/fireball-1');
    this.anchor.setTo(0.5);
    game.physics.arcade.enable(this);
    this.animations.add('fire', Phaser.Animation.generateFrameNames('fireball/fireball-', 1, 4, '', 0), 12, true);
    this.animations.play('fire');
    this.body.velocity.x = - 60;

    game.time.events.add(Phaser.Timer.SECOND * 6, this.destroy, this);
};
Fireball.prototype = Object.create(Phaser.Sprite.prototype);
Fireball.prototype.constructor = Fireball;

// item feedback

ItemFeedback = function (game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'atlas', 'item-feedback/item-feedback-1');
    this.anchor.setTo(0.5);
    var anim = this.animations.add('pick', Phaser.Animation.generateFrameNames('item-feedback/item-feedback-', 1, 5, '', 0), 14, false);
    this.animations.play('pick');
    anim.onComplete.add(function () {
        this.kill();
    }, this);
};

ItemFeedback.prototype = Object.create(Phaser.Sprite.prototype);
ItemFeedback.prototype.constructor = ItemFeedback;














