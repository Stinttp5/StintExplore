function setup() {
  createCanvas(500, 500);
  noLoop();
}

function draw() {
  colorMode(HSB);
  background(10);
  angleMode(DEGREES);
  let border = 20;
  const gridSize = Math.floor(explore('gridSize', { type: 'normal',mean: 5,std: 1 }));
  const pacWidth = windowWidth / (gridSize * 2) - border;
  const pacHeight = windowHeight / (gridSize * 2) - border;

  const hueOffset = explore('hueOffset', { type: 'uniform',min: 0,max: 360 })
  for (let i = -gridSize; i < gridSize; i++) {
    let xNudge = (pacWidth + border) * i;
    for (let j = -gridSize; j < gridSize; j++) {      
      let yNudge = (pacHeight + border) * j;
      const squareSize = explore("squareSize", { type: 'drawable',distribution: [0.33125000000000004,0.45625000000000004,0.45625000000000004,0.5125,0.56875,0.60625,0.7,0.775,0.85625,0.90625],min: 5,max: pacWidth });
      const x = width / 2 + xNudge - squareSize / 2;
      const y = height / 2 + yNudge - squareSize / 2;
      fill(
        (hueOffset +
        explore('pacHue', { type: 'perlin',min: 0,max: 150,x: x,y: y })) % 360
      , 100, 100);
      rect(x, y, squareSize, squareSize);
    }
  }
}
