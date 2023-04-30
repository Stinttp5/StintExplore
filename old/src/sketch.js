// A p5.gui Template feat. Pacman

// gui params
var myAngle = 30;
var myColor = '#eeee00';

var gui;

function setup() {

  createCanvas(windowWidth, windowHeight);

  // Create the GUI
  sliderRange(0, 90, 1);
  // gui = createGui('p5.gui');
  // gui.addGlobals('myColor');
  
  // Only call draw when then gui is changed
  noLoop();
}


function draw() {
    
  // this is a piece of cake
  background(test());
  fill(myColor);
  angleMode(DEGREES);
  let pacHeight = 100;
  let pacWidth = 100;
  let border = 20;
  // const type = explore("type", "number", { Style: "normal",Mean: 1,Std: 49 });
  const type = 0;
  for (let i = -8; i < 8; i++) {
    let xNudge = (pacWidth+border)*i;
    for (let j = -8; j < 8; j++) {
      let yNudge = (pacHeight+border)*j;
      if (type < 0.5) {
        let myAngle = explore('angle', { type: 'uniform',min: canvasWidth / 2,max: stintNoParse`canvasHeight / ` });
        // let myAngle = explore("angle", "number", { Style: "normal",Mean: 53,Std: 25,Min: 40 });
        // console.log({myAngle});
        arc(width/2 + xNudge, height/2 + yNudge, pacWidth, pacHeight, myAngle/2, 360 - myAngle/2, PIE);
        // arc(width/2 + xNudge, height/2 + yNudge, pacWidth, pacHeight,0, 180);

        // const squareSize = explore("squareSize2", "number", { Style: "normal",Mean: 50,Std: 51 });
        // rect(width / 2 + xNudge - squareSize / 2, height / 2 + yNudge - squareSize / 2, squareSize, squareSize);
      } else {
        // squasres!
        const squareSize = explore("squareSize");
        rect(width / 2 + xNudge - squareSize / 2, height / 2 + yNudge - squareSize / 2, squareSize, squareSize);
      }
    }
  }
  
  
}


// dynamically adjust the canvas to the window
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}





// let bgColor;
// let dropdown;

// function setup() {
//   createCanvas(400, 400);

//   // Create a dropdown menu with two options
//   dropdown = createSelect();
//   dropdown.option('White');
//   dropdown.option('Black');
//   dropdown.position(10, 10);

//   // Set the initial background color to white
//   bgColor = 255;
// }

// function draw() {
//   // Set the background color based on the dropdown value
//   if (dropdown.value() === 'White') {
//     bgColor = 255;
//   } else {
//     bgColor = 0;
//   }
//   background(bgColor);

//   // Draw other elements of the sketch here
// }
