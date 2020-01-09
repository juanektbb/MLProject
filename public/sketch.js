//Game varaibles
var lovelycanvas;
var gameHeight;
var gameWidth;
var floorPos_y;
var scrollPos;
var realPos;
var limitJump;
var placeOnFloor;
var lastDirection;

var widthCanvasDom;


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
let idleleft;
let idleright;
let jumpleft;
let jumpright;
let fallleft;
let fallright;

let packageRunLeft;
let runIndexLeft;

let packageRunRight;
let runIndexRight;

let backgroundImg;
let greenground;
let borderImg;
let terrain;
let platformImg;

let packageSaw;
let sawIndex;

/* ----------------------------------------------------------- */

//Control OSC
var socket;

var thisOSCData = 0;
var allowFrames = 0;

let box1;
let box2;
let box3;
let box4;
let box5;

let osc1;
let osc2;
let osc3;
let osc4;
let osc5;



var oscright = 0;
var oscleft = 0;



/*********************
    SETUP FUNCTION
*********************/
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
        console.log(data.args[n].value);

        if(allowFrames == 0){
            thisOSCData = data.args[n].value;
        }
        
      }

        if(data.address == "/one"){
            console.log("One 1");
            oscright = 1;
        }


        if(data.address == "/two"){
            console.log("Two 2");
            oscleft = 1;
        }


    }
  );



    osc1 = 1;
    osc2 = 2;
    osc3 = 3;
    osc4 = 4;
    osc5 = 5;
    

    box1 = document.getElementById("box-1");
    box2 = document.getElementById("box-2");
    box3 = document.getElementById("box-3");
    box4 = document.getElementById("box-4");
    box5 = document.getElementById("box-5");

    widthCanvasDom = document.getElementById("ready-canvas").offsetWidth;

    gameWidth = widthCanvasDom;
    gameHeight = 450;
    lovelycanvas = createCanvas(gameWidth, gameHeight);
    lovelycanvas.parent('ready-canvas');

    floorPos_y = height - 57;
    placeOnFloor = floorPos_y - 32;
    lastDirection = "right";

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
    idleleft = loadImage('./assets/idleleft.png');
    idleright = loadImage('./assets/idleright.png');
    jumpleft = loadImage('./assets/jumpleft.png');
    jumpright = loadImage('./assets/jumpright.png');
    fallleft = loadImage('./assets/fallleft.png');
    fallright = loadImage('./assets/fallright.png');

    //Run left 
    packageRunLeft = [];
    for(var i = 0; i < 12; i++)
        packageRunLeft.push(loadImage('./assets/run-left/run'+ i +'.png'));
    runIndexLeft = 0;

    //Run right
    packageRunRight = [];
    for(var i = 0; i < 12; i++)
        packageRunRight.push(loadImage('./assets/run-right/run'+ i +'.png'));
    runIndexRight = 0;

    //CHESTS
    chestClosed = loadImage("./assets/chestclosed.png");
    platformImg = loadImage("./assets/platform.png");

    //ENEMIES
    packageSaw = [];
    for(var i = 0; i < 8; i++)
        packageSaw.push(loadImage("./assets/saw/saw" + i + ".png"));
    sawIndex = 0;

    //Calling main function 
    lives = 30;
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


    //Jumping
    if((thisOSCData == osc2 && character.y == placeOnFloor) ||
        (thisOSCData == osc2 && isOnPlatform == true)){
        
        //IsJumping is true and limit jump is 92
        if(isFalling == false){
            isJumping = true;
            limitJump = character.y - 92;
        }
    }





    //Jumping
    if((thisOSCData == osc1 && character.y == placeOnFloor) ||
        (thisOSCData == osc1 && isOnPlatform == true)){
        
        //IsJumping is true and limit jump is 92
        if(isFalling == false){
            isJumping = true;
            limitJump = character.y - 92;
        }
    }



    //Jumping
    if((thisOSCData == osc3 && character.y == placeOnFloor) ||
        (thisOSCData == osc3 && isOnPlatform == true)){

        if(character.x > width * 0.2){
            character.x = character.x - 3;
        }else{
            scrollPos += 3;
        }
        
        //IsJumping is true and limit jump is 92
        if(isFalling == false){
            isJumping = true;
            limitJump = character.y - 92;
        }
    }







    //Logic to make the game character move left or the background scroll
    if(isLeft || thisOSCData == osc4){

        if(character.x > width * 0.2){
            character.x = character.x - 3;
        }else{
            scrollPos += 3;
        }
    }

    //Logic to make the game character move right or the background scroll
    if(isRight || thisOSCData == osc5){
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



    box1.style.backgroundColor = "#e6e6e6";
    box2.style.backgroundColor = "#e6e6e6";
    box3.style.backgroundColor = "#e6e6e6";
    box4.style.backgroundColor = "#e6e6e6";
    box5.style.backgroundColor = "#e6e6e6";


    switch(thisOSCData){
        case osc1:
            box1.style.backgroundColor = "red";
            break;
        case osc2:
            box2.style.backgroundColor = "red";
            break;
        case osc3:
            box3.style.backgroundColor = "red";
            break;
        case osc4:
            box4.style.backgroundColor = "red";
            break;
        case osc5:
            box5.style.backgroundColor = "red";
            break;
    }





    if(thisOSCData == 4){
        lastDirection = "left";
    }else if(thisOSCData == 5){
        lastDirection = "right";
    }



    allowFrames++;
    if(allowFrames == 2){
        allowFrames = 0;
        thisOSCData = 0;
    }


    


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
    if(keyCode == 37){
        isLeft = false;
        lastDirection = "left";
    }
  
    //Right arrow
    if(keyCode == 39){
        isRight = false;
        lastDirection = "right";
    }
    
}

/* ----------------------------------------------------------- */

/**************************
    CHARACTER FUNCTIONS
**************************/
function drawGameChar(){
  
    //CHARACTER LEFT
    if((isLeft == true && isJumping == false && isRight == false) || thisOSCData == osc4){
        characterRunsLeft(character.x, character.y);
        
    //CHARACTER RIGHT    
    }else if((isRight == true && isJumping == false && isLeft == false) || thisOSCData == osc5){
        characterRunsRight(character.x, character.y);
        
    //CHARACTER FALLING  
    }else if(isJumping == true && isRight == false && isLeft == false || isFalling == true && isOnPlatform == false){

        if(lastDirection == "left"){
            image(fallleft, character.x, character.y, 32, 32);  
        }else{
            image(fallright, character.x, character.y, 32, 32);
        }          
        
    //CHARACTER JUMPING LEFT    
    }else if((isLeft == true && isJumping == true) || (thisOSCData == osc2 && isJumping == true)){
        image(jumpleft, character.x, character.y, 32, 32);
              
    //CHARACTER JUMPING RIGHT
    }else if((isRight == true && isJumping == true) || (thisOSCData == osc2 && isJumping == true)){
        image(jumpright, character.x, character.y, 32, 32);
        
    //CHARACTER FRONT    
    }else{

        if(lastDirection == "left"){
            image(idleleft, character.x, character.y, 32, 32);
        }else{
            image(idleright, character.x, character.y, 32, 32);
        }
        
    }

}

//FUNCTION ANIMATION RUNNING LEFT
function characterRunsLeft(x, y){
    image(packageRunLeft[runIndexLeft], x, y, 32, 32);

    if(runIndexLeft == packageRunLeft.length - 1){
        runIndexLeft = 0;
    }else{
        runIndexLeft++;
    }
}

//FUNCTION ANIMATION RUNNING RIGHT
function characterRunsRight(x, y){
    image(packageRunRight[runIndexRight], x, y, 32, 32);

    if(runIndexRight == packageRunRight.length - 1){
        runIndexRight = 0;
    }else{
        runIndexRight++;
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


/* ----------------------------------------------------------- */

/***********************************************
    MAIN FUNCTIONALITY OF THE SETUP FUNCTION
***********************************************/
function startGame(){
    
    score = 0;
    character.x = 320;
    character.y = placeOnFloor; 

    //Control the background scrolling
    scrollPos = 0;

    //Real position of the character within the game. (Used for collision detection)
    realPos = character.x - scrollPos;

    //Control the movement of the character
    isLeft = false;
    isRight = false;
    isJumping = false;
    isFalling = false;

    //CHESTS DATA
    chests = [{x: 50, y: 273, size: 50, isFound: false},
              {x: 920, y: 69, size: 50, isFound: false},
              {x: 15, y: 63, size: 50, isFound: false},
    ]; 

    //CANYONS DATA
    canyon = [
        {x: 220, width: 66},
        {x: 600, width: 320}
    ];

    //ENEMIES DATA
    enemies = [];
    enemiesPre = [
        {epx: 10, epy: placeOnFloor + 14, epx1: 10, epx2: 180, epspeed: 2},
        {epx: 0, epy: placeOnFloor - 211, epx1: 0, epx2: 488, epspeed: 3},
        {epx: 244, epy: placeOnFloor - 211, epx1: 0, epx2: 488, epspeed: 2}
    ];

    //PLATFORMS DATA
    isOnPlatform = false;
    platforms = [];
    platformsPre = [
        {ppx: 10, ppy: floorPos_y - 50, ppwidth: 96, ppheight: 15},
        {ppx: 600, ppy: floorPos_y - 50, ppwidth: 96, ppheight: 15},
        {ppx: 750, ppy: floorPos_y - 101, ppwidth: 96, ppheight: 15},
        {ppx: 624, ppy: floorPos_y - 152, ppwidth: 48, ppheight: 15},
        {ppx: 776, ppy: floorPos_y - 203, ppwidth: 48, ppheight: 15},
        {ppx: 904, ppy: floorPos_y - 254, ppwidth: 48, ppheight: 15},
        {ppx: 0, ppy: floorPos_y - 203, ppwidth: 528, ppheight: 15},
        {ppx: 0, ppy: floorPos_y - 260, ppwidth: 48, ppheight: 15},
    ];


    /*****************************************
            ADVANCE ELEMENTS APPENDING
    *****************************************/

    /******* APPEND ENEMIES *******/
    for(var i = 0; i < enemiesPre.length; i++){
        //PRE BUILD ENEMY OBJECT TO APPEND TO ENEMIES ARRAY
        enemies.push({
            x_pos:  enemiesPre[i].epx,
            y_pos:  enemiesPre[i].epy,
            x1:     enemiesPre[i].epx1,
            x2:     enemiesPre[i].epx2,
            speed:  enemiesPre[i].epspeed,
            
            display: function(){
                animateSaw(this.x_pos, this.y_pos);
            },
            
            move: function(){
                if(this.x_pos > this.x2 || this.x_pos < this.x1){
                    this.speed =  this.speed * -1;
                }
                this.x_pos = this.x_pos + this.speed;
            },
            
            checkCharCollision: function(){
                if (this.x_pos < realPos + 32 && this.x_pos + 38 > realPos &&
                    this.y_pos < character.y + 32 && this.y_pos + 38 > character.y){
                    playerDied();
                }
            }
        });
    }

   /******* APPEND PLATFORMS *******/
    for(var i = 0; i < platformsPre.length; i++){
        //PRE BUILD PLATFORM OBJECT TO APPEND TO PLATFORMS ARRAY
        platforms.push({
            x_pos:  platformsPre[i].ppx,
            y_pos:  platformsPre[i].ppy,
            width:  platformsPre[i].ppwidth,
            height: platformsPre[i].ppheight,

            display: function(){
                var platformtimes = Math.floor(this.width / 48); //How many textures
                for(var i = 0; i < platformtimes; i++){
                    image(platformImg, this.x_pos + (i * 48), this.y_pos - 2);
                }
            },
            
            checkCharOn: function(){   
                if(realPos + 20 > this.x_pos && realPos + 10 < this.x_pos + this.width && character.y + 33 == this.y_pos){
                    isOnPlatform = true;
                }
            }
        });
    }
 
}


/*****************************
    OTHER HELPER FUNCTIONS
*****************************/
//IF PLAYER HAS WON
function checkPlayerWon(t_chest){
    if(score == t_chest.length){
        isWon = true;
    }
}

//CHECK CHARACTER HAS FALLEN
function checkPlayerDie(){
    if(character.y > gameHeight + 120){
        playerDied();
    }
}

//PLAYER HAS DIES
function playerDied(){
    lives -= 1;

    //Start game again or Game Over
    if(lives >= 0){
        startGame(); 
    }else{
        isLost = true;
    }
}




















// function mouseMoved() {
//   socket.emit('inputData', { x: mouseX, y:mouseY });
// }

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
