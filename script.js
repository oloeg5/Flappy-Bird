class Config{
  constructor(){
    this.canvas = document.getElementById("canvas");
    this.ctx = canvas.getContext("2d");
    this.imgURL = "./pics/flappy-bird-set.png";
    this.img = new Image();
    this.img.src = this.imgURL;
    this.cTenth = (this.canvas.width / 10);
    this.gravity = .3;
    this.speed = 3.2;
    this.size = [51, 36];
    this.jump = -5.5;
    this.pipeWidth = 78;
    this.pipeGap = 270;
    this.pipeLoc = () => (Math.random() * ((config.canvas.height - (config.pipeGap + config.pipeWidth)) - config.pipeWidth)) + config.pipeWidth;
  }
}

class Score{
  constructor(scoreBlock, score = 0, bestScoreBlock, bestScore = 0){
    this.scoreBlock = document.querySelector(scoreBlock);
    this.score = score;
    this.bestScoreBlock = document.querySelector(bestScoreBlock);
    this.bestScore;
    this.draw();
  }

  incScore(){
    this.score++;
    this.draw();
  }
  
  setToZero(){
    this.score = 0;
    this.draw();
  }

  intBestScore() {
    if(this.score > Number(localStorage.getItem('bstScore'))){
      this.bestScore = this.score;
      localStorage.setItem('bstScore', this.bestScore.toString());
    }
    
    this.draw();
  }

  draw(){
    this.scoreBlock.innerHTML = `Your : ${this.score}`;
    this.bestScoreBlock.innerHTML = `Best : ${localStorage.getItem('bstScore')}`;
  }
};

class Background extends Config{
  constructor(){
    super();
    this.index = index;
    this.drawBackground();
  }

  drawBackground(){
    this.ctx.drawImage(this.img, 0, 0, this.canvas.width, this.canvas.height, -((this.index * (this.speed / 2)) % this.canvas.width) + this.canvas.width, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.drawImage(this.img, 0, 0, this.canvas.width, this.canvas.height, -(this.index * (this.speed / 2)) % this.canvas.width, 0, this.canvas.width, this.canvas.height);
  };
}

class Bird extends Config{
  constructor(){
    super();  
    this.index = index; 
    this.drawBird();
  }

  drawBird(){
    if (gamePlaying) {
      this.ctx.drawImage(this.img, 432, Math.floor((this.index % 9) / 3) * this.size[1], ...this.size, this.cTenth, flyHeight, ...this.size);
      flight += this.gravity;
      flyHeight = Math.min(flyHeight + flight, this.canvas.height - this.size[1]);
      menu.playSound();
    } else {
      this.ctx.drawImage(this.img, 432, Math.floor((this.index % 9) / 3) * this.size[1], ...this.size, ((this.canvas.width / 2) - this.size[0] / 2), flyHeight, ...this.size);
      flyHeight = (this.canvas.height / 2) - (this.size[1] / 2);
      
      this.ctx.fillText(`Best score : ${localStorage.getItem('bstScore')}`, 85, 245);
      this.ctx.fillText('Click to play', 90, 535);
      this.ctx.font = "bold 30px courier";
    }}
}

class Pipe extends Config{
  constructor(){
    super();
    this.pipe = pipe;
    this.drawPipes();
  }

  drawPipes(){
    if (gamePlaying){
      pipes.map(pipe => {
        pipe[0] -= this.speed;

        this.ctx.drawImage(this.img, 432, 588 - pipe[1], this.pipeWidth, pipe[1], pipe[0], 0, this.pipeWidth, pipe[1]);
        
        this.ctx.drawImage(this.img, 432 + this.pipeWidth, 108, this.pipeWidth, this.canvas.height - pipe[1] + this.pipeGap, pipe[0], pipe[1] + this.pipeGap, this.pipeWidth, this.canvas.height - pipe[1] + this.pipeGap);

        if(pipe[0] <= -this.pipeWidth){
          score.incScore();
          score_audio.playSound();
          pipes = [...pipes.slice(1), [pipes[pipes.length-1][0] + this.pipeGap + this.pipeWidth, this.pipeLoc()]];
        }
      
        if ([
          pipe[0] <= this.cTenth + this.size[0], 
          pipe[0] + this.pipeWidth >= this.cTenth, 
          pipe[1] > flyHeight || pipe[1] + this.pipeGap < flyHeight + this.size[1]
        ].every(elem => elem) || flyHeight > [this.canvas.height - (this.size[1] + 1)]) {
          gamePlaying = false;
          die.playSound();
          setup();
        }
      })
    }
  }
}

class Sounds{
  constructor(url){
    this.sound = new Audio();
    this.sound.src = url; 
  }

  playSound(){
    this.sound.play();
  }
}

const score = new Score("#currentScore", 0, "#bestScore", 0);
const config = new Config();
const fly = new Sounds("./audio/fly.mp3"); 
const score_audio = new Sounds("./audio/score.mp3"); 
const die = new Sounds("./audio/die.wav");
const menu = new Sounds("./audio/main_menu.mp3"); 

let gamePlaying = false, index = 0, flight, flyHeight, pipe;


const setup = () => {
    flight = config.jump;
    flyHeight = (config.canvas.height / 4) - (config.size[1] / 2);
    pipes = Array(3).fill().map((a, i) => [config.canvas.width + (i * (config.pipeGap + config.pipeWidth)), config.pipeLoc()]);
    score.setToZero();
};

const render = () => { 
  index++;
  
  score.intBestScore();
  new Background();
  new Bird();
  new Pipe();
  
  window.requestAnimationFrame(render);
}

setup();
config.img.onload = render;

document.addEventListener('click', () => gamePlaying = true);
window.onclick = () => {flight = config.jump; fly.playSound();}