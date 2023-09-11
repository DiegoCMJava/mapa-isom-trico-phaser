
let directions = {
    west: { offset: 0, x: -2, y: 0, opposite: 'east' },
    northWest: { offset: 32, x: -2, y: -1, opposite: 'southEast' },
    north: { offset: 64, x: 0, y: -2, opposite: 'south' },
    northEast: { offset: 96, x: 2, y: -1, opposite: 'southWest' },
    east: { offset: 128, x: 2, y: 0, opposite: 'west' },
    southEast: { offset: 160, x: 2, y: 1, opposite: 'northWest' },
    south: { offset: 192, x: 0, y: 2, opposite: 'north' },
    southWest: { offset: 224, x: -2, y: 1, opposite: 'northEast' }
};

let anims = {
    idle: {
        startFrame: 0,
        endFrame: 4,
        speed: 0.2
    },
    walk: {
        startFrame: 4,
        endFrame: 12,
        speed: 0.15
    },
    attack: {
        startFrame: 12,
        endFrame: 20,
        speed: 0.11
    },
    die : {
        startFrame: 20,
        endFrame: 28,
        speed: 0.2
    },
    shoot: {
        startFrame: 28,
        endFrame: 32,
        speed: 0.1
    }
};

let skeletons = [];

let tileWidthHalf;
let tileHeightHalf;

let d = 0;

let scene;

class Skeleton extends Phaser.GameObjects.Image {
    constructor(scene, x, y, motion, direction, distance) {
        super(scene, x, y, 'skeleton', direction.offset);

        this.startX = x;
        this.startY = y;
        this.distance = distance;

        this.motion = motion;
        this.anim = anims[motion];
        this.direction = directions[direction];
        this.speed = 0.15;
        this.f = this.anim.startFrame;

        this.depth = y + 64;

        scene.time.delayedCall(this.anim.speed * 1000, this.changeFrame, [], this);
    };

    changeFrame() {
        this.f++;

        let delay = this.anim.speed;

        if (this.f === this.anim.endFrame) {
            switch (this.motion) {
                case 'walk':
                    this.f = this.anim.startFrame;
                    this.frame = this.texture.get(this.direction.offset + this.f);
                    scene.time.delayedCall(delay * 1000, this.changeFrame, [], this)
                    break;

                case 'idle':
                    delay = 0.5 + Math.random();
                    scene.time.delayedCall(delay * 1000, this.resetAnimation, [], this);
                    break;
                case 'attack':
                    delay = Math.random()  * 2;
                    scene.time.delayedCall(delay * 1000, this.resetAnimation, [], this);
                    break;
                    case 'die':
                    delay = 6 + Math.random() * 6;
                    scene.time.delayedCall(delay * 1000, this.resetAnimation, [], this);
                    break;
            }
        }
        else {
            this.frame = this.texture.get(this.direction.offset + this.f);
            scene.time.delayedCall(delay * 1000, this.changeFrame, [], this)
        };
    };
    resetAnimation() {
        this.f = this.anim.startFrame;
        this.frame = this.texture.get(this.direction.offset + this.f);
        scene.time.delayedCall(this.anim.speed * 1000, this.changeFrame, [], this);
    };

    update() {
        if (this.motion === 'walk') {
            this.x += this.direction.x * this.speed;

            if (this.direction.y !== 0){
                this.y += this.direction.y * this.speed;
                this.depth = this.y + 64;
            }
            if (Phaser.Math.Distance.Between(this.startX, this.startY, this.x, this.y) >= this.distance){
                this.direction = directions[this.direction.opposite];
                this.f = this.anim.startFrame;
                this.frame =  this.texture.get(this.direction.offset + this.f);
                this.startX = this.x;
                this.startY = this.y;
            }
        }
    };
};

class Examples extends Phaser.Scene {

    constructor() {
        super();
    };

    preload() {
        this.load.json('map', 'assets/iso/isometric-grass-and-water.json');
        this.load.spritesheet('tiles', 'assets/iso/isometric-grass-and-water.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('skeleton', 'assets/iso/skeleton8.png', { frameWidth: 128, frameHeight: 128 });
    };

    create() {
        scene = this;
        this.buildMap();

        skeletons.push(this.add.existing(new Skeleton(this, 600, 180, 'die', 'north', 0))); //460 180
        skeletons.push(this.add.existing(new Skeleton(this, 600, 400, 'walk', 'south', 230))); 
        skeletons.push(this.add.existing(new Skeleton(this, 900, 500, 'attack', 'northEast', 0 )));
        skeletons.push(this.add.existing(new Skeleton(this, 990, 480, 'attack', 'southWest', 0 )));
    };

    update() {
        skeletons.forEach(function (skeleton) {
            skeleton.update();
        });
    };


    buildMap() {
        const data = scene.cache.json.get('map');

        const tilewidth = data.tilewidth;
        const tileheight = data.tileheight;

        tileWidthHalf = tilewidth / 2;
        tileHeightHalf = tileheight / 2;

        const layer = data.layers[0].data;

        const mapwidth = data.layers[0].width;
        const mapheight = data.layers[0].height;

        const centerX = mapwidth * tileWidthHalf;
        const centerY = 16;

        let i = 0;
        for (let y = 0; y < mapheight; y++) {
            for (let x = 0; x < mapwidth; x++) {
                const id = layer[i] - 1;

                const tx = (x - y) * tileWidthHalf;
                const ty = (x + y) * tileHeightHalf;

                const tile = scene.add.image(centerX + tx, centerY + ty, 'tiles', id);

               tile.depth = centerY + ty;

                i++;

            }

        }
    };
};

const config = {
    type: Phaser.AUTO,
    width: 1500,
    height: 800,
    parent: 'phaser-example',
    // pixelArt: true,
    backgroundColor: '#1a1a2d', //#1a1a2d #A9CCE3
    /*  physics: {
          default: 'arcade'
      },
      */
    scene: Examples

};

// instacia del juego 
const game = new Phaser.Game(config);
