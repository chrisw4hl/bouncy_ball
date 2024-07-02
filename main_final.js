// setup canvas

const canvas = document.querySelector('canvas');
const body = document.querySelector('body');
const ctx = canvas.getContext('2d');

//select all menu items
const startScreen = document.querySelector('.startScreen');
const mouseShow = document.querySelector('.mouseShow');
const startButton = document.querySelector('.startBtn');
const pauseScreen = document.querySelector('.pauseScreen');
const resumeBtn = document.querySelector('.resumeBtn');
const finishScreen = document.querySelector('.finishScreen');
const finishText = document.querySelector('.finishText');
const resetBtn = document.querySelector('.resetBtn');
const scorecard = document.querySelector('p');
const highScoresTab = document.querySelector('.highScoresTab');
highScoresTab.textContent = `High Scores: \r\n`;



var width = (canvas.width = window.innerWidth);
var height = (canvas.height = window.innerHeight);
console.log(`width: ${width}`);
console.log(`height: ${height}`);
var windowArea = width*height;

const inputs = {"w":"keyup","a":"keyup","s":"keyup","d":"keyup","Escape":"keyup"};
// function to generate random number

var scoreHistory = localStorage.getItem("highScores");
scoreHistory = scoreHistory.split(",");
scoreHistory = scoreHistory.map(Number);
const highScores = (scoreHistory || []);

var startTime = Date.now();
var finishTime;
var pauseTimeStart = 0;
var pauseTimeEnd = 0;

function random(min, max) {
  const num = Math.floor(Math.random() * (max - min + 1)) + min;
  return num;
}

// function to generate random color

function randomRGB() {
  return `rgb(${random(0, 200)},${random(0, 255)},${random(0, 255)})`;
}

let paused = false;
let start = false;

window.addEventListener("resize",resize);

function resize () {
  //scale the size of the balls linearlly by the area of the screen
  const oldWidth = width;
  const oldHeight = height;
  height = (canvas.height = window.innerHeight);
  width = (canvas.width = window.innerWidth)
  for (const ball of balls){
    ball.size = ball.size*width*height/oldWidth/oldHeight;
    ball.x = ball.x*width/oldWidth;
    ball.y = ball.y*height/oldHeight;
  }
  //evilCircle.size = evilCircle.size*width*height/oldWidth/oldHeight;
  evilCircle.x = evilCircle.x*width/oldWidth;
  evilCircle.y = evilCircle.y*height/oldHeight;

}
startButton.addEventListener("click",() => {paused = false;
  start = true;
  startScreen.style.display = 'none';
  mouseShow.remove();
  startTime = Date.now();});

resumeBtn.addEventListener("click",unpause);
resetBtn.addEventListener('click',reset);

canvas.addEventListener("touchstart",process_touchstart);
canvas.addEventListener("touchmove",process_touchmove);
canvas.addEventListener("touchend",process_touchend);
canvas.addEventListener("touchcancel",process_touchcancel);

function process_touchstart(ev){
  const touches = ev.touches;
  //todo: write logic to find closest touch to evilCircle
  //for (const touch of touches){
  if (touches.length > 0){
    reset_movement();
    const screenX = touches[0].clientX;
    const screenY = touches[0].clientY;
    const keys = findMove(screenX,screenY);

    for (const key of keys){
      inputs[key] = "keydown";
    }
  }

}

function process_touchend(){
  //to be implemented
}

function reset_movement(){
  inputs["w"] = "keyup";
  inputs["d"] = "keyup";
  inputs["s"] = "keyup";
  inputs["a"] = "keyup";
}

function process_touchmove(ev){
  const touches = ev.touches;
  if (touches.length > 0){
    reset_movement();
    const screenX = touches[0].clientX;
    const screenY = touches[0].clientY;
    const keys = findMove(screenX,screenY);

    for (const key of keys){
      inputs[key] = "keydown";
    }
  }

}

function process_touchcancel(){
  //to be implemented
}

function findMove(x,y){
  const deltaX = x - evilCircle.x;
  const deltaY = y - evilCircle.y;
  var angle = Math.atan2(deltaY,deltaX)*180/Math.PI;
  if (angle < 0){
    angle = 360 + angle;
  }

  //is there a better way to do this? hashmap maybe?
  if (angle <= 15){
    return ["d"];
  }
  else if (angle <= 75){
    return ["s","d"];
  } 
  else if (angle <= 105){
    return ["s"];
  }
  else if (angle <= 165){
    return ["a","s"];
  }
  else if (angle <= 195){
    return ["a"];
  }
  else if (angle <= 255){
    return ["a","w"];
  }
  else if (angle <= 285){
    return ["w"];
  }
  else if (angle <= 345){
    return ["d","w"]
  }
  else{
    return ["d"];
  }
}


class Shape {
  constructor(x,y,velX,velY){
    this.x = x;
    this.y = y;
    this.velX = velX;
    this.velY = velY;
  }
}

class Ball extends Shape {
  constructor(x,y,velX,velY,color,size){
    super(x,y,velX,velY);
    this.color = color;
    this.size = size;
    this.exists = true;
  }

  draw() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.size, 0, 2*Math.PI);
    ctx.fill();
  }
  
  clear(){
    ctx.clearRect(this.x-this.size, this.y-this.size, this.size, this.size);
  }
  update() {
    if ((this.x + this.size) >= width){
      this.velX = -(this.velX);
    }
    if ((this.x - this.size) <= 0){
      this.velX = -(this.velX);
    }
    if ((this.y + this.size) >= height){
      this.velY = -(this.velY);
    }
    if ((this.y - this.size) <= 0){
      this.velY = -(this.velY);
    }
    this.x += this.velX;
    this.y += this.velY;
  }

  collisionDetect() {
    for (const ball of balls){
      if (!(this === ball) && ball.exists){
        const dx = this.x - ball.x;
        const dy = this.y - ball.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < (this.size + ball.size)){
          ball.color = this.color = randomRGB();
          this.calculateTrajectory(ball);
        }
      }
    }
  }

  calculateTrajectory(ball){
    const v1x = this.velX;
    const v1y = this.velY;
    const v2x = ball.velX;
    const v2y = ball.velY;
    const v1 = Math.sqrt(v1x*v1x + v1y*v1y);
    const v2 = Math.sqrt(v2x*v2x + v2y*v2y);
    const theta1 = Math.atan2(v1y,v1x);
    const theta2 = Math.atan2(v2y,v2x);
    //represent masses as a function of diameter cubed to better model the balls like spheres colliding
    const mass1 = this.size*this.size*this.size;
    const mass2 = ball.size*ball.size*this.size;
    const phi = Math.atan2((ball.y-this.y),(ball.x-this.x));

    let newV1x = (v1*Math.cos(theta1-phi)*(mass1 - mass2) + 2*mass2*v2*Math.cos(theta2 - phi))/(mass1+mass2)*Math.cos(phi)+v1*Math.sin(theta1-phi)*Math.cos(phi + Math.PI/2);
    let newV1y = (v1*Math.cos(theta1-phi)*(mass1 - mass2) + 2*mass2*v2*Math.cos(theta2 - phi))/(mass1+mass2)*Math.sin(phi)+v1*Math.sin(theta1-phi)*Math.sin(phi + Math.PI/2);
    let newV2x = (v2*Math.cos(theta2-phi)*(mass2 - mass1) + 2*mass1*v1*Math.cos(theta1 - phi))/(mass1+mass2)*Math.cos(phi)+v2*Math.sin(theta2-phi)*Math.cos(phi + Math.PI/2);
    let newV2y = (v2*Math.cos(theta2-phi)*(mass2 - mass1) + 2*mass1*v1*Math.cos(theta1 - phi))/(mass1+mass2)*Math.sin(phi)+v2*Math.sin(theta2-phi)*Math.sin(phi + Math.PI/2);
   
    //apply the new calculated velocities to the objects
    this.velX = newV1x;
    this.velY = newV1y;
    ball.velX = newV2x;
    ball.velY = newV2y;
  
    //set the colliding ball outside of this ball to avoid getting stuck
    ball.x = this.x + (this.size + ball.size)*Math.cos(phi)
    ball.y = this.y + (this.size + ball.size)*Math.sin(phi)
  }


 }

class EnemyBall extends Ball {
 constructor(x,y,velX,velY,color,size){
    super(x,y,velX,velY);
    this.color = color;
    this.size = size;
  }

  collisionDetect(){
    const playerX = evilCircle.x;
    const playerY = evilCircle.y;
    const playerSize = evilCircle.size;
    const dx = this.x - playerX;
    const dy = this.y - playerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < (this.size + playerSize)){
      startTime -= 5000;
      console.log('hello');
      flashRed();

    }

  }
  draw() {
    const startPosX = this.x - this.size;
    const startPoxY = this.y + this.size;
    ctx.beginPath();
    ctx.strokeStyle = 'rgb(255,255,255,.6)';
    ctx.lineWidth = 3;
    ctx.moveTo(startPosX-1, startPoxY);
    ctx.lineTo((startPosX + 2*this.size), startPoxY);
    ctx.lineTo(this.x, (startPoxY - 2*this.size));
    ctx.lineTo(startPosX, startPoxY);
    ctx.stroke();
    ctx.fillStyle = this.color;
    ctx.fill();

  }

}

async function flashRed(){

  const damageOverlay = document.querySelector('.damage');

  damageOverlay.style.display = 'block';
  await new Promise(r => setTimeout(r, 200))
  .then(() => damageOverlay.style.display = 'none')
  .catch(() => console.error('Pause error'));




}
  

class EvilCircle extends Shape {

  constructor(x,y){
    super(x,y,10,10);
    this.color = 'white';
    this.size = 10;

    window.addEventListener("keydown", (e) => {
      if (["a","s","w","d","Escape","`","h"].includes(e.key)){
          inputs[e.key] = "keydown";
      }
    });

    window.addEventListener("keyup", (e) => {
      if (["a","s","w","d","Escape","`","h"].includes(e.key)){
        inputs[e.key] = "keyup";
      }
    });
  }

  userMove() {
    let double = 0;
    for (const [key, value] of Object.entries(inputs)){
      if (value === "keydown"){
        double += 1;
      }
    }
    for (const [key, value] of Object.entries(inputs)){
      let inputMod = 1;
      if (value === 'keydown'){
        if (double > 1){
          inputMod = .707;
        }
        if (key === "a"){
          this.x -= inputMod*this.velX;
        }
        else if (key === "d"){
          this.x += inputMod*this.velX;
        }
        else if (key === "w"){
          this.y -= inputMod*this.velY;
        }
        else if (key === "s"){
          this.y += inputMod*this.velY;
        }
        else if (key === "Escape"){
          if (!paused){
            paused = true;
            pauseScreen.style.display = 'block';
          }
        } 
      }
    }
  }
  draw() {
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = this.color;
    ctx.arc(this.x, this.y, this.size, 0, 2*Math.PI);
    ctx.stroke();
  }
  clear(){
    ctx.clearRect(this.x, this.y, this.size, this.size);
  }
  checkBounds(){
    if ((this.x + this.size) >= width){
      this.x = width-(this.size);
    }
    if ((this.x - this.size) <= 0){
      this.x = (this.size);
    }
    if ((this.y + this.size) >= height){
      this.y = height-(this.size);
    }
    if ((this.y - this.size) <= 0){
      this.y = (this.size);
    }
  }
  collisionDetect() {
    for (const ball of balls){
      if (!(this === ball) && ball.exists){
        const dx = this.x - ball.x;
        const dy = this.y - ball.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < (this.size + ball.size)){
          ball.exists = false;
          score += 1;
          ballsRemaining -= 1;
          finishTime = Date.now();
          this.color = randomRGB();
        }
      }
    }
  }
}
const balls = [];
const enemies = [];
var ballsRemaining = 0;
const evilCircle = new EvilCircle(window.innerWidth/2,window.innerHeight/2);
var score = 0;

function removeBalls(){
  while (balls.length > 0){
    balls.pop();
  }
}
function addBalls (){
  //add 20 random balls to the game, with size scaled by full screen testing size
  ballsRemaining = 0;
  while (balls.length < 20){
    const size = random(10, 20)*windowArea/(1280*567);
    const ball = new Ball(
      random(0 + size, width - size),
      random(0 + size, height - size),
      random(-7, 7),
      random(-7, 7),
      randomRGB(),
      size,
    );

    balls.push(ball);
    ballsRemaining += 1;
  }
}

function addEnemies (n){
  while (enemies.length < n){
    const size = random(10, 15)*windowArea/(1280*567);
    const enemy = new EnemyBall(
      random(0 + size, width - size),
      random(0 + size, height - size),
      -10,
      0,
      'rgb(255,0,0,1)',
      size,
    );

    enemies.push(enemy);
  }
}

//mutex and mutexCheck used to prevent certain actions from happening on subsequent loops with same keypress, implemented asychronously
let mutex = {"unpause":true,
              "reset":true,
              "scores":true};

let finishDisplay = false;

async function mutexCheck(param) {
  mutex[param] = false;
  await new Promise(r => setTimeout(r, 200))
    .then(() => mutex[param] = true)
    .catch(() => console.error('Pause error'));
      

}

function unpause(){
      paused = false;
      pauseScreen.style.display = 'none';
      inputs["Escape"]="keyup";
      mutexCheck("unpause");
}

function reset(){
    score = 0;
    evilCircle.size = 10;
    inputs["`"] = "keyup";
    if (finishScreen.style.diplay !== "none"){
      console.log("hello");
      finishScreen.style.display = 'none';
      finishDisplay = false;
    }
    if (paused){
      paused = false;
      start = false;
      pauseScreen.style.display = 'none';
      startScreen.style.display = 'block';
    }

    removeBalls();
    addBalls();
    addEnemies(5);
    evilCircle.x = window.innerWidth/2;
    evilCircle.y = window.innerHeight/2;
    mutexCheck("reset");
    startTime = Date.now();
}

function fillScores(){
  highScoresTab.textContent = `High Scores:\r\n`;
  for (const score of highScores) {
    highScoresTab.textContent += `${score} Sec\r\n`;
  }
}
function toggleScores(){
  if (highScoresTab.style.display === "none" || highScoresTab.style.display === ""){
    highScoresTab.style.display = "block";
  }
  else {
    highScoresTab.style.display = "none";
  }
  mutexCheck("scores");

}

addBalls();
addEnemies(5);
function loop() {

  if (inputs["`"] === "keydown" && mutex.reset === true){
    reset();
  }
  if (inputs["h"] === "keydown" && mutex.scores === true){
    fillScores();
    toggleScores();

  }
  if ((inputs["Escape"] === "keydown") && finishDisplay === false){
    if(paused && mutex.unpause == true){
      pauseTimeEnd = Date.now();
      unpause()
      startTime += pauseTimeEnd - pauseTimeStart;
    }
    else if (mutex.unpause == true){
      paused = true;
      pauseTimeStart = Date.now();
      pauseScreen.style.display = 'block';
      mutexCheck("unpause");
    }
  }
      

  if (!paused){
  ctx.fillStyle = "rgb(0 0 0 / 25%)";
  ctx.clearRect(0, 0, width, height);
  ctx.fillRect(0, 0, width, height);
  }

  for (const ball of balls){
    if (ball.exists && !paused){
      ball.draw();
    }
  }
  for (const enemy of enemies){
    if (!paused && !finishDisplay){
      enemy.draw();
    }
  }
  if(start && !paused){
    evilCircle.draw();
  }

  for (const ball of balls){
    if (ball.exists && !paused){
      ball.update();
      ball.collisionDetect();
    }
  }

  for (const enemy of enemies){
    if (!paused && !finishDisplay){
      enemy.update();
      enemy.collisionDetect();
    }
  }

  if(start && !paused){
    evilCircle.userMove();
    if (paused){
      pauseScreen.style.display = 'block';
    }

    evilCircle.checkBounds();
    evilCircle.collisionDetect();

  }

  scorecard.textContent = `score = ${score}`;

  if (ballsRemaining === 0){
    finishDisplay = true;
    currentScore = (finishTime -startTime)/1000;
    finishText.textContent = `Congratulations! Your score is: ${currentScore} seconds`;
    if (!highScores.includes(currentScore)){
      highScores.push(currentScore);
      highScores.sort((a, b) => {return a-b});
      const saveScores = highScores.slice(0,10);
      localStorage.setItem("highScores",saveScores);
    }
    ctx.fillStyle = "rgb(0 0 0 / 25%)";
    ctx.clearRect(0, 0, width, height);
    ctx.fillRect(0, 0, width, height);
    finishScreen.style.display = 'block';
  }else if (finishDisplay){
    finishDisplay = false;
    finishScreen.style.display = 'none';
  }

  requestAnimationFrame(loop);
}

loop();
