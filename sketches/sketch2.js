function setup() {
  resizeCanvas(500, 500);
  fill(255);
  noStroke();

  // const bg = explore('background', { type: 'uniform',min: 0,max: 255 })
  // background(bg);
  console.log(2);
  const bg = explore('background', { type: 'uniform',min: 0,max: 255 })
  background(bg);
  console.log(1);
}

function draw() {

}