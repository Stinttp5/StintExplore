// A p5.gui Template feat. Pacman

// gui params
var myAngle = 30;
var myColor = '#eeee00';

var gui;

function setup() {
  createCanvas(500, 500);
  noLoop();
}

function draw() {
  background(10);
  fill(myColor);
  angleMode(DEGREES);
  let pacHeight = 100;
  let pacWidth = 100;
  let border = 20;
  const type = explore("type", { type: 'uniform',min: 0,max: 1 });
  for (let i = -8; i < 8; i++) {
    let xNudge = (pacWidth + border) * i;
    for (let j = -8; j < 8; j++) {
      let yNudge = (pacHeight + border) * j;
      if (type < 0.5) {
        let myAngle = explore('angle', { type: 'uniform',min: windowWidth / 20,max: windowWidth / 2 });
        arc(width / 2 + xNudge, height / 2 + yNudge, pacWidth, pacHeight, myAngle / 2, 360 - myAngle / 2, PIE);
      } else {
        // squasres!
        const squareSize = explore("squareSize", { type: 'passthrough', value: Math.random() * 100 });
        const squareSize2 = explore("squareSize2");
        rect(width / 2 + xNudge - squareSize / 2, height / 2 + yNudge - squareSize / 2, squareSize, squareSize);
      }
    }
  }


}

// dynamically adjust the canvas to the window
function windowResized() {
  // resizeCanvas(500, 500);
}
