let canvasWidth = 500;
let canvasHeight = 500;
let maxFish = 10;
let numFish = 0;
let xNudge = 80;
let currentFishes = [];
let fishLength = 100;
let fishSpacing = 50;
let fishSpeed = 2
let color = [];

class Fish{
  constructor(){
    this.bodyLength = fishLength;
    this.bodyWidth = fishLength*0.8;
    this.color = [255, 128, 0, 230];
  }
  get length(){
		return (this.bodyLength)
	}
	set length(x){
		this.bodyLength = x;
	}
  get width(){
		return (this.bodyWidth)
	}
	set width(x){
		this.bodyWidth = x;
	}
	get xPos(){
		return (this.centerX)
	}
	set xPos(x){
		this.centerX = x;
	}
	get yPos(){
    return (this.centerY+this.yOffset)
	}
	set yPos(y){
		this.centerY= y;
	}
  set color(x){
    this.fishColor = x
  }
  get color(){
    return this.fishColor
  }
  draw(){

    push(); // Save the current drawing state
		translate(this.centerX, this.yPos); // Translate the canvas to the center of the fish
		rotate(HALF_PI); // Rotate the canvas by 90 degrees counterclockwise
		translate(-this.centerX, -this.yPos); // Translate the canvas back to the original position

    // Set fill color to semi-transparent orange
    fill(this.fishColor[0], this.fishColor[1], this.fishColor[2], this.fishColor[3]);
    noStroke(); // Rrotate(HALF_PI);emove the stroke outline
    
    var diameter = this.bodyWidth;
    // Draw the fish head (a circle)
    ellipse(this.centerX, this.yPos, diameter, diameter*1.1);
    
		let bodyWiggleRate = 0.08;
  	let bodyWiggle = sin(frameCount * bodyWiggleRate) *10;
		
    // Draw the fish body (a triangle)
    triangle(this.centerX - diameter / 2, this.yPos+diameter/8, 
             this.centerX + diameter / 2, this.yPos+diameter/8, 
             this.centerX+bodyWiggle, this.yPos + this.bodyLength);
  
  
    let tailWidth = diameter * 0.5; // width of the tail
    let tailHeight = diameter * 0.5; // height of the tail proportional to head
    let tailX = this.centerX; // x-coordinate of the tail's top point
    let tailY = this.yPos + this.bodyLength*0.75; // y-coordinate of the tail's top point
  
  // Draw the fish tail (one triangle pointed towards the body)
  triangle(this.centerX-tailWidth / 2 +bodyWiggle, tailY + tailHeight, 
           this.centerX + tailWidth / 2 +bodyWiggle, tailY + tailHeight, 
           tailX+bodyWiggle, tailY);
	// Draw the fish fins (triangles angled towards the body)
  let finWidth = diameter * 0.4 + sin(frameCount / 10) * 5 + 10; // width of the fins
  let finHeight = diameter * 0.4 - sin(frameCount / 10) * 5 - 10; // height of the fins
  let finAngle = 20; // angle of the fins in degrees
  
  // Left fin
  let leftFinX = this.centerX - diameter / 2 + 1; 
  let leftFinY = this.yPos + this.bodyLength * 0.14;
  let leftFinBaseX = leftFinX + finWidth * Math.cos(finAngle * Math.PI / 180);
  let leftFinBaseY = leftFinY + finWidth * Math.sin(finAngle * Math.PI / 180);

  triangle(leftFinX, leftFinY, 
           leftFinBaseX, leftFinBaseY, 
           leftFinX - 5, leftFinY + finHeight);

  // Right fin
  let rightFinX = this.centerX + diameter / 2 - 1;
  let rightFinY = this.yPos + this.bodyLength * 0.14;
  let rightFinBaseX = rightFinX - finWidth * Math.cos(finAngle * Math.PI / 180);
  let rightFinBaseY = rightFinY + finWidth * Math.sin(finAngle * Math.PI / 180);
  
  triangle(rightFinX, rightFinY, 
           rightFinBaseX, rightFinBaseY, 
           rightFinX + 5, rightFinY + finHeight);
	pop();
	}
	
}


function newSize(y){
  const fishLength = explore('fishLength', { type: 'passthrough',min: 30,max: 200,distribution: [0.7875,0.53125,0.475,0.38125,0.3125,0.29374999999999996,0.38749999999999996,0.5625,0.825,0.875],mean: 100,std: 20,x: y/canvasHeight,y: stintNoParse``,z: stintNoParse``,alpha: 100,value: 100 })
  return fishLength
}

function setup() { 
	xNudge = 0;
  color = newColor();
  createCanvas(canvasWidth, canvasHeight);

}


function draw() {
  background(10, 20, 30);
  //bodyY = explore("bodyY", "number", { Style: "normal",Mean: 400,Std: 50 })
  border = 5

  if (currentFishes.length < maxFish){
    f = new Fish();
			f.xPos = xNudge;
			f.yPos = random(canvasHeight);
      fishLength = newSize(f.yPos);
      f.length = fishLength
      f.width = fishLength*0.85
			currentFishes.push(f);
			xNudge += fishLength
      f.color = newColor();
  }   
  else{

    for (var fish of currentFishes){
      fish.xPos = fish.xPos + fishSpeed

      const fishY = explore('fishYOffset', { type: 'passthrough',min: -50,max: 50,distribution: [0.80625,0.5,0.16249999999999998,0.11875000000000002,0.09999999999999998,0.5625,0.7,0.8125,0.85625,0.51875],x: fish.xPos/200,value: 0 })
      fish.yOffset = fishY;
      fish.draw();

      //reset fish
      if (fish.xPos > canvasWidth+(2*fish.length)){
        fish.xPos = -(fish.length*2.5)
        fish.yPos = random(canvasHeight)
        fishLength = newSize(fish.yPos);
        fish.bodyLength = fishLength;
        fish.bodyWidth = fishLength*0.84
        


      }
    }
		//console.log(fish)
  }
	
	
}
function newColor(){
  const R = explore('R', { type: 'passthrough',min: 0,max: 255,distribution: [0.8625,0.79375,0.043749999999999956,0.06874999999999998,0.050000000000000044,0.050000000000000044,0.050000000000000044,0.050000000000000044,0.0625,0],value: 100 })
  const G = explore('G', { type: 'passthrough',min: 0,max: 250,distribution: [0.03125,0.03125,0.043749999999999956,0.575,0.043749999999999956,0.06874999999999998,0.06874999999999998,0.03749999999999998,0.10624999999999996,0.9625],value: 100 })
  const B = explore('B', { type: 'passthrough',min: 0,max: 255,distribution: [1,0.83125,0.65,0.24375000000000002,0.25,0.5375,0.7,0.85625,0.95,1],value: 100 })
  const A = explore('A', { type: 'passthrough',min: 100,max: 255,distribution: [0.80625,0.5,0.16249999999999998,0.11875000000000002,0.09999999999999998,0.5625,0.7,0.8125,0.85625,0.51875] })
  color = [R, G, B, A];
  return color
}
