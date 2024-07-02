// setup canvas

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const width = (canvas.width = window.innerWidth);
const height = (canvas.height = window.innerHeight);

// function to generate random number

function random(min, max) {
  const num = Math.floor(Math.random() * (max - min + 1)) + min;
  return num;
}

// function to generate random color

function randomRGB() {
  return `rgb(${random(0, 255)},${random(0, 255)},${random(0, 255)})`;
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
        }
      }
    }
  }

 }

class EvilCircle extends Shape {
  

  constructor(x,y){
    super(x,y,1,1);
    this.color = 'white';
    this.size = 10;
    this.inputs = {};

    window.addEventListener("keydown", (e) => {
      console.log(e.key);
      if (["a","s","w","d"].includes(e.key)){
        //case "a":
          this.inputs[e.key] = 'keydown';
      }
    });

    window.addEventListener("keyup", (e) => {
      console.log(`${e.key} keyup`);
      if (["a","s","w","d"].includes(e.key)){
        this.inputs[e.key] = 'keyup';
      }
    });
  }

  userMove() {
    for (const [key, value] of Object.entries(this.inputs)){
      if (value === "keydown") {
        if (key === "a"){
          this.x -= this.velX;
        }
        else if (key === "d"){
          this.x += this.velX;
        }
        else if (key === "w"){
          this.y -= this.velY;
        }
        else if (key === "s"){
          this.y += this.velY;
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
          ball.color = this.color = randomRGB();
        }
      }
    }
  }
}
const balls = [];
const evilCircle = new EvilCircle(window.innerWidth/2,window.innerHeight/2);
const scorecard = document.querySelector('p');
var score = 0;

while (balls.length < 20){
  const size = random(10, 20);
  const ball = new Ball(
    random(0 + size, width - size),
    random(0 + size, height - size),
    random(-7, 7),
    random(-7, 7),
    randomRGB(),
    size,
  );
  
  balls.push(ball);
}

function loop() {
  ctx.fillStyle = "rgb(0 0 0 / 25%)";
  ctx.fillRect(0, 0, width, height);

  for (const ball of balls){
    if (ball.exists){
    ball.draw();
    ball.update();
    ball.collisionDetect();
    }
  }

  evilCircle.draw();
  evilCircle.userMove();
  evilCircle.checkBounds();
  evilCircle.collisionDetect();

  scorecard.textContent = `score = ${score}`;

  requestAnimationFrame(loop);
}

loop();
