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

var isJumpLeft;
var isJumpRight;

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
let keyImg;
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

let osc1;
let osc2;
let osc3;
let osc4;
let osc5;

//Dynamic Time Warping
var dwtreceived;

var modalwindow;
var actualTresuare;

//HTML ELEMENTS FOR OSC
let box1;
let box2;
let box3;
let box4;
let box5;

let MLOutputType;

var totalShapes
let squareShape;
let triangleShape;
let circleShape;

let indexShape;
let counterShape;

/*********************
    SETUP FUNCTION
*********************/
function setup(){

    socket = io.connect(window.location.origin);
    MLOutputType = "Classificationq";
    //Change to 'DTW' for other functionality

    // socket.on('ping', function(data){
    //     console.log(data);
    // });

    //GET OSC DATA FROM NODEJS
    socket.on('outputData',
        function(data){

            //IF ML OUTPUT TYPE IS EXPECTED TO BE CLASSIFICATION
            if(MLOutputType == "Classification"){

                //Loop the data coming in
                for(var n = 0; n < data.args.length; n++){
                    thisOSCData = data.args[n].value;
                }

            //IF ML OUTPUT TYPE IS EXPECTED TO BE DWT
            }else{

                //If OSC gives /one -> Class 1
                //if(data.args[0].value == 3){
                if(data.address == "/one"){
                    dwtreceived = "square";
                    
                }

                //If OSC gives /two -> Class 2
                //if(data.args[0].value == 2){
                if(data.address == "/two"){
                    dwtreceived = "triangle";
                }

                //If OSC gives /three -> Class 3
                //if(data.args[0].value == 1){
                if(data.address == "/three"){
                    dwtreceived = "circle";
                }

            }

        }
    );

    //Declare the outputs in variables
    osc1 = 1;
    osc2 = 2;
    osc3 = 3;
    osc4 = 4;
    osc5 = 5;
    
    //HTML ELEMENTS FOR NICE FUNTIONALITY
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

    //RUN LEFT
    packageRunLeft = [];
    for(var i = 0; i < 12; i++)
        packageRunLeft.push(loadImage('./assets/run-left/run'+ i +'.png'));
    runIndexLeft = 0;

    //RUN RIGHT
    packageRunRight = [];
    for(var i = 0; i < 12; i++)
        packageRunRight.push(loadImage('./assets/run-right/run'+ i +'.png'));
    runIndexRight = 0;

    //CHESTS
    keyImg = loadImage("./assets/key.png");
    chestClosed = loadImage("./assets/chestclosed.png");
    platformImg = loadImage("./assets/platform.png");

    //ENEMIES
    packageSaw = [];
    for(var i = 0; i < 8; i++)
        packageSaw.push(loadImage("./assets/saw/saw" + i + ".png"));
    sawIndex = 0;

    //DRAWING SHAPES
    squareShape = [];
    for(var i = 0; i < 4; i++){
        squareShape.push(loadImage("./assets/shapes/square-" + i + ".png"))
    }

    triangleShape = [];
    for(var i = 0; i < 4; i++){
        triangleShape.push(loadImage("./assets/shapes/triangle-" + i + ".png"))
    }

    circleShape = [];
    for(var i = 0; i < 4; i++){
        circleShape.push(loadImage("./assets/shapes/circle-" + i + ".png"))
    }

    totalShapes = 0;
    indexShape = 0;
    counterShape = 0;

    //Calling main function 
    lives = 10;
    startGame();

}

/* ----------------------------------------------------------- */

/****************************
        DRAW FUNCTION
****************************/
function draw(){

    if(modalwindow == false ){
  
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
            strokeWeight(4);
            noStroke();
            fill(176, 0, 0);
            rect(50, 100, gameWidth - 100, gameHeight - 200);

            textSize(50);
            fill(255);            
            strokeWeight(3);
            
            text("GAME OVER - You lost", gameWidth/2, gameHeight/2);
            textAlign(CENTER,CENTER);
            strokeWeight(1);
            return;
        }
        
        //PLAYER WON
        if(isWon == true){
            strokeWeight(4);
            noStroke();
            fill(119, 242, 147);
            rect(50, 100, gameWidth - 100, gameHeight - 200);

            textSize(50);
            fill(0);;            
            strokeWeight(3);
            
            text("YOU WON", gameWidth/2, gameHeight/2);
            textAlign(CENTER,CENTER);
            strokeWeight(1);
            return;
        }


        /*************************
                GAME LOGIC
        *************************/  
        //CHARACTER JUMPS (!WIIMOTE ONLY) 
        if((thisOSCData == osc2 && character.y == placeOnFloor) ||
           (thisOSCData == osc2 && isOnPlatform == true)){
            
            //IsJumping is true and limit jump is 92
            if(isFalling == false){
                isJumping = true;
                limitJump = character.y - 92;
            }
        }

        //CHARACTER JUMPS RIGHT OR LEFT (!WIIMOTE ONLY) 
        if((thisOSCData == osc1 && character.y == placeOnFloor) || (thisOSCData == osc1 && isOnPlatform == true) ||
           (thisOSCData == osc3 && character.y == placeOnFloor) || (thisOSCData == osc3 && isOnPlatform == true)){

            //IsJumping is true and limit jump is 92
            if(isFalling == false){

                //Jump left 
                if(thisOSCData == osc1){
                    isJumpLeft = true;
                    lastDirection = "left";
                }

                //Jump right
                if(thisOSCData == osc3){
                    isJumpRight = true;
                    lastDirection = "right";
                }

                isJumping = true;
                limitJump = character.y - 92;
            }

        }


        //CHARACTER MOVES LEFT OR BACKGROUND SCROLL - (!WIIMOTE OPTIONAL)
        if(isLeft || thisOSCData == osc4  || (isJumping == true && isFalling == false && isJumpLeft)){

            if(character.x > width * 0.2){
                character.x = character.x - 3;
            }else{
                scrollPos += 3;
            }

        }

        //CHARACTER MOVES RIGHT OR BACKGROUND SCROLL - (!WIIMOTE OPTIONAL)
        if(isRight || thisOSCData == osc5 || (isJumping == true && isFalling == false && isJumpRight)){

            if(character.x < width * 0.8){
                character.x = character.x + 3;
            }else{
                scrollPos -= 3;
            }

        }

        //GRAVITY
        if(character.y < placeOnFloor && isOnPlatform == false && isJumping == false){
            character.y += 3;
            isJumpLeft = false;
            isJumpRight = false;

        }else{
            isFalling = false;
        }

        //JUMP -POWER UP
        if(isJumping == true && isFalling == false && character.y > limitJump){
            character.y -= 3;
            isFalling = false;
        }
        
        //LIMIT OF JUMPING - CHARACTER FALLS
        if(character.y < limitJump){
            isFalling = true;
            isJumping = false;
        }

        //Update real position for collision detection
        realPos = character.x - scrollPos;

        //CLEAR THE BACKGROUND COLOR EVERY FRAME
        box1.style.backgroundColor = "#e6e6e6";
        box2.style.backgroundColor = "#e6e6e6";
        box3.style.backgroundColor = "#e6e6e6";
        box4.style.backgroundColor = "#e6e6e6";
        box5.style.backgroundColor = "#e6e6e6";

        //CHANGE COLOR OF HTML ELEMENT IF OSC DETECTED 
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

        //Change last position of character when moving
        if(thisOSCData == 4){
            lastDirection = "left";
        }else if(thisOSCData == 5){
            lastDirection = "right";
        }

        //Reset the OSC data
        thisOSCData = 0;     


        /*********************************
                SCREEN INFORMATION
        *********************************/
        textAlign(LEFT, BASELINE);
        textSize(14);
        fill(0);
        noStroke(); 
        image(keyImg, 10,15)
        text(score+" / "+chests.length, 36, 25);
        text("Lives: ", 10, 45);
        
        //DRAW THE HEARTS IN SCREEN
        for(var l = 0; l < lives; l++){    
            fill(255,0,0);
            ellipse(60 + 18*l, 36, 8, 8);
            ellipse(68 + 18*l, 36, 8, 8);
            triangle(56 + 18*l, 36,
                72 + 18*l, 36,
                64 + 18*l, 47);  
        }

    //GAME IS WAITING FOR CHARACTER TO GET THE CHEST WITH DWT
    }else{
        drawModalWindow();
        compareShapes();
    }
    
}


/* ----------------------------------------------------------- */

/****************************
    KEY CONTROL FUNCTIONS
****************************/
//EVENT FOR PRESING
function keyPressed(){

    //Left Arrow
    if(keyCode == 37)
        isLeft = true;

    //Right Arrow
    if(keyCode == 39)
        isRight = true;

    //CHARACTER JUMPS LEFT OR RIGHT USING 'A' or 'D'
    if((keyCode === 65 && character.y == placeOnFloor) || (keyCode === 65 && isOnPlatform == true) ||
       (keyCode === 68 && character.y == placeOnFloor) || (keyCode === 68 && isOnPlatform == true)){
        if(isFalling == false){

            //Jump left
            if(keyCode == 65){
                isJumpLeft = true;
                lastDirection = "left";
            }

            //Jump right
            if(keyCode == 68){
                isJumpRight = true;
                lastDirection = "right";
            }

            //IsJumping is true and limit jump is 92
            isJumping = true;
            limitJump = character.y - 92;
        
        }
    }

    //CHARACTER JUMPS PRESSING 'SPACE'
    if((keyCode === 32 && character.y == placeOnFloor) || (keyCode === 32 && isOnPlatform == true)){
        if(isFalling == false){
            isJumping = true;
            limitJump = character.y - 92;
        }
    }

}

//EVENT FOR RELEASING
function keyReleased(){

    //Left Arrow
    if(keyCode == 37){
        isLeft = false;
        lastDirection = "left";
    }
  
    //Right Arrow
    if(keyCode == 39){
        isRight = false;
        lastDirection = "right";
    }

    //Jump Left
    if(keyCode == 65){
        isJumpLeft = false;
        lastDirection = "left";
    }
  
    //Jump Right
    if(keyCode == 68){
        isJumpRight = false;
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
    }else if((isLeft == true && isJumping == true) || (thisOSCData == osc2 && isJumping == true) || (isJumpLeft == true && isJumping == true)){
        image(jumpleft, character.x, character.y, 32, 32);
              
    //CHARACTER JUMPING RIGHT
    }else if((isRight == true && isJumping == true) || (thisOSCData == osc2 && isJumping == true) || (isJumpRight == true && isJumping == true)){
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

                //GRAB THE OBJECT IF CLASSIFICATION OUTPUT TYPE
                if(MLOutputType == "Classification"){
                    chests[b].isFound = true;
                    score++;

                //WAIT FOR DTW SHAPE INSTEAD
                }else{
                    t_chest[b].achieve = true;
                    actualTresuare = b;
                    modalwindow = true;
                }

            }

        }

    }
}


/**********************************************
    FUNCTIONS TO CHECK DWT COMING FROM USER
**********************************************/
//DRAW THE MODAL WINDOW IN THE SCREEN
function drawModalWindow(){
    strokeWeight(4);
    stroke(0);
    fill(255, 222,111);
    rect(20, 20, gameWidth - 40, gameHeight - 40);

    textSize(45);
    fill(0);
    strokeWeight(1);

    var textToShow = "Draw a " + chests[actualTresuare].shape + " to collect this key";
    text(textToShow, gameWidth/2, gameHeight/2 - 100);

    textSize(30);
    strokeWeight(1);
    text("To collect this key", gameWidth/2, gameHeight/2 - 30);
    textAlign(CENTER, CENTER);

    if(chests[actualTresuare].shape == "square"){
        totalShapes = 4;
        image(squareShape[indexShape], 364, 220);

    }else if(chests[actualTresuare].shape == "triangle"){
        totalShapes = 3;
        image(triangleShape[indexShape], 364, 220);

    }else{
        totalShapes = 3;
        image(circleShape[indexShape], 364, 220);
    }


    if(counterShape * 5 == 100){
        indexShape++;
        counterShape = 0;
    }else{
        counterShape++;
    }

    if(indexShape == 4){
        indexShape = 0;
    }

}

//RUN TO COMPARE THE SHAPES GIVEN BY THE USER
function compareShapes(){
    //If the shape given corresponds to given by the user
    if(dwtreceived == chests[actualTresuare].shape){

        //Remove the chest and close modal window
        chests[actualTresuare].isFound = true;
        score++;
        modalwindow = false;
        dwtreceived = "none";

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

    modalwindow = false;

    //Control the background scrolling
    scrollPos = 0;

    //Real position of the character within the game. (Used for collision detection)
    realPos = character.x - scrollPos;

    //Control the movement of the character
    isLeft = false;
    isRight = false;
    isJumping = false;
    isFalling = false;

    isJumpLeft = false;
    isJumpRight = false;

    //CHESTS DATA
    chests = [{x: 50, y: 323, size: 50, isFound: false, achieve: false, shape: "triangle"},
              {x: 392, y: 375, size: 50, isFound: false, achieve: false, shape: "square"},
              {x: 15, y: 113, size: 50, isFound: false, achieve: false, shape: "circle"},
    ]; 

    //CANYONS DATA => Width must be multiples of 22px
    canyon = [
        {x: 220, width: 66},
        {x: 595, width: 110}
    ];

    //ENEMIES DATA
    enemies = [];
    enemiesPre = [
        {epx: 10, epy: placeOnFloor + 14, epx1: 10, epx2: 180, epspeed: 1},
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