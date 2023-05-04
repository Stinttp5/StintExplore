const width = 500;
const height = 500;

function setup() {
  createCanvas(width, height);
  colorMode(HSB);
  background(10);
  noStroke();

  const gridSize = Math.floor(explore('gridSize', { type: 'normal',min: 5,max: 10,mean: 15,std: 2 }));
  const cellSize = width / gridSize;

  const baseHue = explore('baseHue', { type: 'uniform',min: 0,max: 360 });

  for (let x = 0; x < width; x += cellSize) {
    for (let y = 0; y < height; y += cellSize) {
      const squareSize = explore('squareSize', { type: 'drawable',min: 5,max: cellSize - 5,value: cellSize / 2,mean: cellSize / 2,std: cellSize / 10,x: x / 50,y: y / 50,distribution: [0.99375,0,0,0,0,0,0,0,0,0.975] });
      const xPadded = x + (cellSize - squareSize) / 2;
      const yPadded = y + (cellSize - squareSize) / 2;
      
      const hueOffset = explore('hueOffset', { type: 'perlin',min: 0,max: 100,x: x / 50,y: y / 50 });

      fill(
        (baseHue + hueOffset) % 360,
        100,
        100
      );
      rect(xPadded, yPadded, squareSize, squareSize);
    }
  }

  sendPreviewData();
}
