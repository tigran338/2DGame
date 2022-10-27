/*
 * Gothicvania Interiors Demo Code
 * by Ansimuz
 * Get more free assets and code like these at: www.pixelgameart.org
 * Visit my store for premium content at https://ansimuz.itch.io/
 * */

var game;
var player;
var folkIndex = 0;
var gameWidth = 430;
var gameHeight = 208;
var background;
var foreground;
var globalMap;
var townFolks;

window.onload = function () {
    game = new Phaser.Game(gameWidth, gameHeight, Phaser.AUTO, "");
    game.state.add('Boot', boot);
    game.state.add('Preload', preload);
    game.state.add('TitleScreen', titleScreen);
    game.state.add('PlayGame', playGame);
    //
    game.state.start('Boot');
}

var boot = function (game) {

}
boot.prototype = {
    preload: function () {
        this.game.load.image('loading', 'assets/sprites/loading.png');
    },
    create: function () {
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.renderer.renderSession.roundPixels = true;
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
        game.load.image("foreground", 'assets/environment/foreground.png');
        // tileset
        game.load.image('tileset', 'assets/environment/tileset.png');
        game.load.image('collisions', 'assets/environment/collisions.png');
        game.load.tilemap('map', 'assets/maps/map.json', null, Phaser.Tilemap.TILED_JSON);
        // atlas sprite
        game.load.atlasJSONArray('atlas', 'assets/atlas/atlas.png', 'assets/atlas/atlas.json');
        game.load.atlasJSONArray('atlas-props', 'assets/atlas/atlas-props.png', 'assets/atlas/atlas-props.json');
        // audio
        game.load.audio('music', ['assets/sounds/rpg_town_01-ext.mp3']);
        game.load.audio('switch', ['assets/sounds/switch.ogg']);
    },
    create: function () {
        //this.game.state.start('PlayGame');
        this.game.state.start('TitleScreen');
    }
}

var titleScreen = function (game) {

};

titleScreen.prototype = {
    create: function () {
        background = game.add.tileSprite(0, 0, gameWidth, gameHeight, 'background');

        this.title = game.add.image(gameWidth / 2, 100 - 30, 'title');
        this.title.anchor.setTo(0.5);
        var credits = game.add.image(gameWidth / 2, game.height - 12, 'credits');
        credits.anchor.setTo(0.5);
        this.pressEnter = game.add.image(game.width / 2, game.height - 40, 'enter');
        this.pressEnter.anchor.setTo(0.5);

        game.time.events.loop(700, this.blinkText, this);

        var startKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        startKey.onDown.add(this.startGame, this);

        this.state = 1;
    },

    blinkText: function () {
        if (this.pressEnter.alpha) {
            this.pressEnter.alpha = 0;
        } else {
            this.pressEnter.alpha = 1;
        }
    },
    update: function () {
        background.tilePosition.x -= 0.2;
    },
    startGame: function () {
        if (this.state == 1) {
            this.state = 2;
            this.title2 = game.add.image(game.width / 2, 40, 'instructions');
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
        this.bindKeys();
        this.createBackgrounds();
        this.createTileMap();
         this.decorWorld();
        this.populate();

        // foreground tiles
        this.layer_foreground = globalMap.createLayer("Foreground Layer");
        this.layer_foreground.resizeWorld();

        this.createForeground();

        var changeKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        changeKey.onDown.add(this.switchCharacter, this);
        // music
        this.music = game.add.audio('music');
        this.music.loop = true;
       this.music.play();
        //
        this.switchSound = game.add.audio('switch');

    },

    decorWorld: function () {
        this.addProp(4 * 16, 7 * 16 , 'candle');
        this.addProp(54 * 16, 7 * 16 , 'candle');

        this.addProp(29 * 16, 0 * 16 , 'chandelier');
        this.addProp(62 * 16, 0 * 16 , 'chandelier');

        this.addProp(66 * 16, 8 * 16 + 10 , 'chest');

        this.addProp(10 * 16, 8 * 16 + 5 , 'crate');

        this.addProp(54 * 16, 4 * 16  , 'platform');
        this.addProp(57 * 16, 2 * 16  , 'platform');

        this.addProp(10 * 16, 8 * 16 + 5 , 'crate');

        this.addProp(59 * 16, 7 * 16 - 6 , 'table');

        this.addProp(49 * 16, 3 * 16 + 2   , 'wardrobe');

        this.addProp(15  * 16, 7 * 16 - 6    , 'weapons-rack');
        this.addProp(19  * 16, 7 * 16 - 6    , 'weapons-rack-empty');

    },

    addProp: function (x, y, item) {
        game.add.image(x, y, 'atlas-props', item);
    },

    bindKeys: function () {
        this.wasd = {
            left: game.input.keyboard.addKey(Phaser.Keyboard.LEFT),
            right: game.input.keyboard.addKey(Phaser.Keyboard.RIGHT)
        }
        game.input.keyboard.addKeyCapture([
            Phaser.Keyboard.LEFT,
            Phaser.Keyboard.RIGHT,
            Phaser.Keyboard.SPACEBAR
        ]);
    },

    createBackgrounds: function () {
        background = game.add.tileSprite(0, 0, gameWidth, gameHeight, 'background');
        background.fixedToCamera = true;
    },

    createForeground: function () {
        foreground = game.add.tileSprite(0, 0, gameWidth, gameHeight, 'foreground');
        foreground.fixedToCamera = true;
    },

    createTileMap: function () {
        // tiles
        globalMap = game.add.tilemap('map');
        globalMap.addTilesetImage('tileset');
        globalMap.addTilesetImage('collisions');
        //
        this.layer = globalMap.createLayer('Main Layer');
        this.layer.resizeWorld();
        this.layer_collisions = globalMap.createLayer("Collisions Layer");
        this.layer_collisions.resizeWorld();


        // collisions
        globalMap.setCollision([1]);
        this.layer_collisions.visible = false;
        this.layer_collisions.debug = false;
    },

    populate: function () {
        //groups
        townFolks = game.add.group();
        townFolks.enableBody = true;

        this.addMan(4, 8);
        this.addOldWoman(60, 8);
        this.addYoungWoman(30, 8);

        player = townFolks.getAt(folkIndex);
        game.camera.follow(player, Phaser.Camera.FOLLOW_PLATFORMER);

    },

    addMan: function (x, y) {
        var temp = new FolkMan(game, x, y);
        game.add.existing(temp);
        townFolks.add(temp);
    },

    addOldWoman: function (x, y) {
        var temp = new FolkOldWoman(game, x, y);
        game.add.existing(temp);
        townFolks.add(temp);
    },

    addYoungWoman: function (x, y) {
        var temp = new FolkYoungWoman(game, x, y);
        game.add.existing(temp);
        townFolks.add(temp);
    },

    update: function () {
        game.physics.arcade.collide(townFolks, this.layer_collisions);

        this.controlCharacter();
        this.parallaxBackground();

        //this.debugGame();

    },

    parallaxBackground: function () {
        foreground.tilePosition.x = this.layer.x * -1.2;
        background.tilePosition.x = this.layer.x * -.9;
    },

    controlCharacter: function () {

        var speed = 100;

        if (folkIndex == 1) {
            speed = 50;
        } else if (folkIndex == 2) {
            speed = 120;
        }

        if (player) {

            if (this.wasd.left.isDown) {
                player.body.velocity.x = -speed;
                player.scale.x = 1;
                player.animations.play('walk');
            } else if (this.wasd.right.isDown) {
                player.body.velocity.x = speed;
                player.scale.x = -1;
                player.animations.play('walk');
            } else {
                player.body.velocity.x = 0;
                player.animations.play('idle');
            }

        }

    },

    switchCharacter: function () {

        var total = townFolks.children.length;

        if (folkIndex >= total - 1) {
            folkIndex = 0;
        } else {

            folkIndex++;
        }

        player.body.velocity.x = 0;
        player.animations.play('idle');

        player = townFolks.getAt(folkIndex);
        game.camera.follow(player, Phaser.Camera.FOLLOW_PLATFORMER);

        this.switchSound.play();
    },

    debugGame: function () {
        townFolks.forEachAlive(this.renderGroup, this);

    },

    renderGroup: function (member) {
        game.debug.body(member);

    }

}

// townfolk entities

// Man

FolkMan = function (game, x, y) {
    x *= 16;
    y *= 16;
    Phaser.Sprite.call(this, game, x, y, 'atlas', 'man-idle-1');
    this.animations.add('idle', Phaser.Animation.generateFrameNames('man-idle-b-', 1, 4, '', 0), 8, true);
    this.animations.add('walk', Phaser.Animation.generateFrameNames('man-walk-', 1, 8, '', 0), 8, true);
    this.animations.play('idle');
    this.anchor.setTo(0.5);
    game.physics.arcade.enable(this);
    this.body.gravity.y = 500;
    this.body.setSize(18, 49, 13, 8);
}
FolkMan.prototype = Object.create(Phaser.Sprite.prototype);
FolkMan.prototype.constructor = FolkMan;

// OLD WOMAN

FolkOldWoman = function (game, x, y) {
    x *= 16;
    y *= 16;
    Phaser.Sprite.call(this, game, x, y, 'atlas', 'old-woman-idle-1');
    this.animations.add('idle', Phaser.Animation.generateFrameNames('old-woman-idle-', 1, 4, '', 0), 6, true);
    this.animations.add('walk', Phaser.Animation.generateFrameNames('old-woman-walk-', 1, 7, '', 0), 6, true);
    this.animations.play('idle');
    this.anchor.setTo(0.5);
    game.physics.arcade.enable(this);
    this.body.gravity.y = 500;
    this.body.setSize(20, 36, 13, 6);
}
FolkOldWoman.prototype = Object.create(Phaser.Sprite.prototype);
FolkOldWoman.prototype.constructor = FolkOldWoman;

// YOUNG WOMAN

FolkYoungWoman = function (game, x, y) {
    x *= 16;
    y *= 16;
    Phaser.Sprite.call(this, game, x, y, 'atlas', 'young-woman-idle-1');
    this.animations.add('idle', Phaser.Animation.generateFrameNames('young-woman-idle-', 1, 8, '', 0), 8, true);
    this.animations.add('walk', Phaser.Animation.generateFrameNames('young-woman-skip-', 1, 8, '', 0), 8, true);
    this.animations.play('idle');
    this.anchor.setTo(0.5);
    game.physics.arcade.enable(this);
    this.body.gravity.y = 500;
    this.body.setSize(17, 44, 12, 9);
}
FolkYoungWoman.prototype = Object.create(Phaser.Sprite.prototype);
FolkYoungWoman.prototype.constructor = FolkYoungWoman;