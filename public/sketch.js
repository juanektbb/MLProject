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

  //Run left 
  packageRun = [];
  for(var i = 0; i < 12; i++)
      packageRun.push(loadImage('./assets/run-right/run'+ i +'.png'));
  runIndex = 0;

  //CHESTS
  chestClosed = loadImage("./assets/chestclosed.png");
  platformImg = loadImage("./assets/platform.png");

  //ENEMIES
  packageSaw = [];
  for(var i = 0; i < 8; i++)
      packageSaw.push(loadImage("./assets/saw/saw" + i + ".png"));
  sawIndex = 0;
  
  //Calling main function 
  lives = 3;
  startGame();

}




/* ----------------------------------------------------------- */

/****************************
        DRAW FUNCTION
****************************/
function draw() {
  
    //User is on platform
    isOnPlatform = false;
    
    //CREATE BACKGROUND WITH IMAGES
    for(var i = 0; i < bgtimesx; i++){
        for(var j = 0; j < bgtimesy; j++){
            image(backgroundImg, i * 64, j * 64);
        }
    }

    //DRAW ENEMIES - CANVAS POSITION
    push();
    translate(scrollPos, 0);
        for(var i = 0; i < enemies.length; i++){
            enemies[i].display();
            enemies[i].move();
            enemies[i].checkCharCollision();
        }
    pop();

    //DRAW GREEN GROUND - CANVAS POSITION
    for(var i = 0; i < ggtimesx; i++){
        image(greenground, i * 32, floorPos_y);
    }

    //DRAW BORDER BOTTOM - CANVAS POSITION
    for(var i = 0; i < bitimesx; i++){
        image(borderImg, i * 48, floorPos_y + 48);
    }

  //DRAW CANYONS - CANVAS POSITION
    push();
    translate(scrollPos, 0);
        drawCanyon(canyon);
    pop();
        
  //DRAW CHESTS - CANVAS POSITION
    push();
    translate(scrollPos, 0); 
        drawChests(chests);
    pop();
    
    //DRAW PLATFORMS - CANVAS POSITION
    push();
    translate(scrollPos, 0);
        for(var i = 0; i < platforms.length; i++){
            platforms[i].display();
            platforms[i].checkCharOn();
        }
    pop();

    //MAIN CHARACTER
    drawGameChar();


    /**********************
        CHECK FUNCTIONS
    **********************/
    checkCanyon(canyon);

    checkChests(chests);
    
    checkPlayerWon(chests);
    
    checkPlayerDie();


    /**************************
            GAME STATUS
    **************************/  
    //GAME OVER
    if(isLost == true){
        fill(176, 0, 0);
        noStroke();
        rect(200,200,624,176);
        
        textSize(50);
        fill(255);
        strokeWeight(3);
        
        text("GAME OVER - You lost \n (Press space to continue)", gameWidth/2, gameHeight/2);
        textAlign(CENTER,CENTER);
        strokeWeight(1);
        return;
    }
    
    //PLAYER WON
    if(isWon == true){
        fill(119, 242, 147);
        noStroke();
        rect(200,200,624,176);
        
        textSize(50);
        fill(0);
        strokeWeight(3);
        stroke(0);
        
        text("YOU WON \n (Press space to continue)", gameWidth/2,gameHeight/2);
        textAlign(CENTER,CENTER);
        strokeWeight(1);
        return; 
    }


    /*************************
            GAME LOGIC
    *************************/  
  //Logic to make the game character move left or the background scroll
  if(isLeft){
        if(character.x > width * 0.2){
            character.x = character.x - 3;
        }else{
            scrollPos += 3;
        }
  }

    //Logic to make the game character move right or the background scroll
  if(isRight){
        if(character.x < width * 0.8){
            character.x = character.x + 3;
        }else{
            scrollPos -= 3;
        }
  }
    
    //Gravity
    if(character.y < placeOnFloor && isOnPlatform == false && isJumping == false){
        character.y += 3;
    }else{
        isFalling = false;
  }

    //Jump - Power up
  if(isJumping == true && isFalling == false && character.y > limitJump){
        character.y -= 3;
        isFalling = false;
  }
    
    //Limit of jumping - Character falls
    if(character.y < limitJump){
        isFalling = true;
        isJumping = false;
    }

  //Update real position for collision detection
  realPos = character.x - scrollPos;


  /*********************************
            SCREEN INFORMATION
    *********************************/
    textSize(20);
    fill(0);
    stroke(1);
    text("Treasures: "+score+" / "+chests.length, 12.5,25);
    text("Lives: ", 12.5,50);
    
    //Drawing hearts in the screen
    for(var l = 0; l < lives; l++){
        noStroke();     
        fill(255,0,0);
        ellipse(75 + 18*l,40,8,8);
        ellipse(83 + 18*l,40,8,8);
        triangle(71 + 18*l,40,
            87 + 18*l,40,
            79 + 18*l,51);  
    }



}


/* ----------------------------------------------------------- */

/****************************
    KEY CONTROL FUNCTIONS
****************************/
function keyPressed(){
    //Left arrow
  if(keyCode == 37)
    isLeft = true;
  
    //Right arrow
  if(keyCode == 39)
    isRight = true;
  
    //Jumping
    if((keyCode === 32 && character.y == placeOnFloor) ||
        (keyCode === 32 && isOnPlatform == true)){
        
        //IsJumping is true and limit jump is 92
        if(isFalling == false){
            isJumping = true;
            limitJump = character.y - 92;
        }
    }
}

function keyReleased(){
    //Left arrow
  if(keyCode == 37)
    isLeft = false;
  
    //Right arrow
  if(keyCode == 39)
    isRight = false;
}

/* ----------------------------------------------------------- */

/**************************
    CHARACTER FUNCTIONS
**************************/
function drawGameChar(){
  
    //CHARACTER LEFT
    if(isLeft == true && isJumping == false && isRight == false){
        characterRunsLeft(character.x, character.y);
        
    //CHARACTER RIGHT    
    }else if(isRight == true && isJumping == false && isLeft == false){
        characterRunsRight(character.x, character.y);
        
    //CHARACTER JUMPING  
    }else if(isJumping == true && isRight == false && isLeft == false || isFalling == true && isOnPlatform == false){
        image(fallleft, character.x, character.y, 32, 32);            
        
    //CHARACTER JUMPING LEFT    
    }else if(isLeft == true && isJumping == true){
        image(jumpleft, character.x, character.y, 32, 32);
              
    //CHARACTER JUMPING RIGHT
    }else if(isRight == true && isJumping == true){
        image(jumpright, character.x, character.y, 32, 32);
        
    //CHARACTER FRONT    
    }else{
        image(idle, character.x, character.y, 32, 32);
    }

}

//FUNCTION ANIMATION RUNNING LEFT
function characterRunsLeft(x, y){
    image(packageRun[runIndex], x, y, 32, 32);

    if(runIndex == packageRun.length - 1){
        runIndex = 0;
    }else{
        runIndex++;
    }
}

//FUNCTION ANIMATION RUNNING RIGHT
function characterRunsRight(x, y){
    image(packageRun[runIndex], x, y, 32, 32);

    if(runIndex == packageRun.length - 1){
        runIndex = 0;
    }else{
        runIndex++;
    }
}


/****************************
        SAW FUNCTIONS
****************************/
//ANIMATE SAW MOVEMENT
function animateSaw(x, y){
    image(packageSaw[sawIndex], x, y);

    if(sawIndex == packageSaw.length - 1){
        sawIndex = 0;
    }else{
        sawIndex++;
    }
}


/*******************************************
    CANYON RENDERING AND CHECK FUNCTIONS
*******************************************/
function drawCanyon(t_canyon){
    for(var cy = 0; cy < canyon.length; cy++){
        var canyonsx = Math.floor(t_canyon[cy].width / 22); //How many textures

        //Repeat canyon texture
        for(var i = 0; i < canyonsx; i++){
            for(var j = 0; j < 3; j++){
                image(terrain, t_canyon[cy].x + (i * 22), floorPos_y + 1 + (j * 30));
            }
        }
    }
}

//CHECK IF POSITION IS CORRECT FOR FALLING
function checkCanyon(t_canyon){
    for(var cy = 0; cy < canyon.length; cy++){
        //MAKE CHARACTER FALL
        if(realPos + 15 > t_canyon[cy].x && realPos + 15 < t_canyon[cy].x + t_canyon[cy].width && character.y + 70 >= placeOnFloor + 69){
            character.y += 5;
        }
    
        //NO GOING INTO THE GROUND WHEN FALLING IN THE CANYON
        if(realPos > t_canyon[cy].x - 10 && realPos + 48 < t_canyon[cy].x + t_canyon[cy].width + 10 && character.y + 70 > placeOnFloor + 69){
            isLeft = false; 
            isRight = false;
        }
    }
}


/*******************************************
    CHESTS RENDERING AND CHECK FUNCTIONS
*******************************************/
function drawChests(t_chest){
    for(var b = 0; b < chests.length; b++){
        if(t_chest[b].isFound == false){  
            image(chestClosed, t_chest[b].x, t_chest[b].y);
        }
    }
}

//CHECK IF POSITION IS CORRECT FOR PICKING
function checkChests(t_chest){
    for(var b = 0; b < chests.length; b++){

        //IF IT IS NOT FOUND, TRIGGER TO GET
        if(t_chest[b].isFound == false){ 

            //IF CHARACTER IS IN CORRECT POSITION FOR PICKING UP
            if(realPos + 25 > t_chest[b].x && realPos + 25 < t_chest[b].x + 39 &&
               character.y + 40 > t_chest[b].y && character.y + 40 < t_chest[b].y + 61){
                t_chest[b].isFound = true;
                score += 1;
            }

        }

    }
}



























function mouseMoved() {
  socket.emit('inputData', { x: mouseX, y:mouseY });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
