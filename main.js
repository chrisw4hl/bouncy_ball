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

function trajectoryEquation(ball1,ball2){
  if (flag == 1){

  }else{

  }
}

class Ball {
  constructor(x,y,velX,velY,color,size){
    this.x = x;
    this.y = y;
    this.velX = velX;
    this.velY = velY;
    this.color = color;
    this.size = size;
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
      if (this !== ball) {
        const dx = this.x - ball.x;
        const dy = this.y - ball.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.size + ball.size){
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

const balls = [];

while (balls.length < 25){
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
    ball.draw();
    ball.update();
    ball.collisionDetect();
  }

  requestAnimationFrame(loop);
}

loop();
