const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const colisionCanvas = document.getElementById('colisionCanvas');
const colisionCtx = canvas.getContext('2d');
colisionCanvas.width = window.innerWidth;
colisionCanvas.height = window.innerHeight;

let score = 0;
ctx.font = '50px Impact';

let timeToNextRaven = 0;
let ravenInterval = 500;
let lastTime = 0;

let ravens =[];
class Raven {
    constructor(){
        this.spriteWidth = 271;
        this.spriteHeight = 194;
        this.sizeModifier = Math.random()*0.6 + 0.4;
        this.width = this.spriteWidth*this.sizeModifier;
        this.height = this.spriteHeight*this.sizeModifier;
        this.x = canvas.width;
        this.y = Math.random() * canvas.height - this.height;
        this.directionx = Math.random() *5+3;
        this.directiony = Math.random() *5 - 2.5;

        this.markedForDeletion = false;
        this.image = new Image();
        this.image.src = 'raven.png';
        this.frame = 0;
        this.maxFrame =4;
        this.timesinceflap = 0;
        this.flapInterval = Math.random()*50 + 50;

        this.randomColors = [Math.floor(Math.random()*255), Math.floor(Math.random()*255), Math.floor(Math.random()*255)];
       
        this.color = 'rgb('+this.randomColors[0]+','+this.randomColors[1]+','+this.randomColors[2]+')';

    }
    update(deltaTime){
        if(this.y<0 || this.y >canvas.height - this.height) {
            this.directiony = this.directiony * -1;
        }
        this.x -= this.directionx;
        this.y += this.directiony;
        if(this.x < 0 - this.width) this.markedForDeletion = true;
        this.timesinceflap += deltaTime;
        if(this.timesinceflap > this.flapInterval)
        {
            if(this.frame > this.maxFrame) this.frame = 0;
            else this.frame++;
            this.timesinceflap = 0;

        }
      


    }
    draw(){
        colisionCtx.fillStyle = this.color;
        
        colisionCtx.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(this.image,this.frame*this.spriteWidth,0,this.spriteWidth,this.spriteHeight, this.x,this.y, this.width, this.height);
    }
}

let explosions = [];
class Explosion {
    constructor(x,y,size){
        this.image = new Image();
        this.image.src = 'boom.png';
        this.spriteWidth = 200;
        this.spriteHeight = 179;
        this.size = size;
        this.x = x;
        this.y = y;
        this.frame = 0;
        this.sound = new Audio();
        this.sound.src = 'boom.wav';
        this.timeSinceLastFrame = 200;
        this.frameInterval =200;
        this.markedForDeletion = false;


    }
    update(deltaTime){
        if(this.frame === 0) this.sound.play();
        this.timeSinceLastFrame+=deltaTime;
        if(this.timeSinceLastFrame > this.frameInterval){
            this.frame++;
            this.timeSinceLastFrame = 0;
            if(this.frame > 5) this.markedForDeletion = true;
        }
    }
    draw(){
        ctx.drawImage(this.image,this.frame*this.spriteWidth,0,this.spriteWidth,this.spriteHeight, this.x,this.y-this.size,this.size,this.size);
    }
}

function drawScore(){
   ctx.fillStyle = 'black';
    ctx.fillText('Score: ' +score,50,75);
    ctx.fillStyle = 'white';
    ctx.fillText('Score: ' +score,55,80);
}

window.addEventListener('click',function(e){
   const detectPixelColor =  colisionCtx.getImageData(e.clientX,e.y,1,1);
   console.log(detectPixelColor);
   const pc = detectPixelColor.data;
   ravens.forEach(object =>{

    if(object.randomColors[0] === pc[0] && object.randomColors[1]=== pc[1]
        && object.randomColors[2] === pc[2]){

            object.markedForDeletion = true;
            score ++;
            explosions.push(new Explosion(object.x,object.y,object.width));
        }

   });
   
})


function animate(timestamp){

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    colisionCtx.clearRect(0, 0, canvas.width, canvas.height);

   let deltaTime = timestamp - lastTime;
   lastTime = timestamp;
   timeToNextRaven += deltaTime;
   if(timeToNextRaven > ravenInterval){
         ravens.push(new Raven());
         timeToNextRaven = 0;
         ravens.sort(function(a,b){
                return a.width - b.width;
            
         })
        
   };
   drawScore();
   [...ravens, ...explosions].forEach(object =>{
         object.update(deltaTime);
         object.draw();
    
   })
   ravens = ravens.filter(object => !object.markedForDeletion);
   explosions = explosions.filter(object => !object.markedForDeletion);
 

    requestAnimationFrame(animate);
}
animate(0);