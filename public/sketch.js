var socket;




//Game varaibles
var gameHeight;
var gameWidth;
var floorPos_y;
var scrollPos;
var realPos;
var limitJump;
var placeOnFloor;

//Character physics
var character = {
    x: 32,
    y: 0
};  

var isLeft;
var isRight;
var isJumping;
var isFalling;
var isOnPlatform;

//Game features
var score;
var isWon = false;
var isLost = false;
var lives;

//Game objects
var enemies;
var enemiesPre;

var platforms;
var platformsPre;

var chests;
var chestClosed;

var canyon;

//IMAGES
let idle;
let jumpleft;
let jumpright;
let fallleft;
let fallright;

let packageRun;
let runIndex;

let backgroundImg;
let greenground;
let borderImg;
let terrain;
let platformImg;

let packageSaw;
let sawIndex;














function setup(){




  socket = io.connect(window.location.origin);
  createCanvas(windowWidth, windowHeight);
  noCursor();

  socket.on('ping', function (data) {
    console.log(data);
  });

  socket.on('outputData',
    function(data){

      console.log(data);

      // r = map(data.args[0].value, 0, 1, 0, 255);
      // g = map(data.args[1].value, 0, 1, 0, 255);
      // b = map(data.args[2].value, 0, 1, 0, 255);

      for(var n = 0; n < data.args.length; n++){
        println(n + ": " + data.args[n].value);
      }
    }
  );





  gameWidth = 1024;
  gameHeight = 400;
  createCanvas(gameWidth, gameHeight);

  floorPos_y = height - 57;
  placeOnFloor = floorPos_y - 32;

  //GAME STYLES
  backgroundImg = loadImage("./assets/background/Purple.png");
  bgtimesx = Math.floor(width / 64) + 1;
  bgtimesy = Math.floor(height / 64) + 1;

  greenground = loadImage('./assets/greenground.png');
  ggtimesx = Math.floor(width / 32) + 1;

  borderImg = loadImage('./assets/border.png');
  bitimesx = Math.floor(width / 48) + 1;

  terrain = loadImage("./assets/terrain.png");

  //MAIN CHARACTER
  idle = loadImage('./assets/idle.png');
  jumpleft = loadImage('./assets/jump.png');
  jumpright = loadImage('./assets/jump.png');
  fallleft = loadImage('./assets/fall.png');
  fallright = loadImage('./assets/fall.png');












}

var r = 100;
var g = 100;
var b = 100;

function draw() {
  background(r, g, b);

}

function mouseMoved() {
  socket.emit('inputData', { x: mouseX, y:mouseY });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
