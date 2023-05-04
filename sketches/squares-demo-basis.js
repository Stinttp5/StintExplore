const width = 500;
const height = 500;

function setup() {
  createCanvas(width, height);
  colorMode(HSB);
  background(10);
  noStroke();

  const gridSize = Math.floor(10);
  const cellSize = width / gridSize;

  const baseHue = 0;

  for (let x = 0; x < width; x += cellSize) {
    for (let y = 0; y < height; y += cellSize) {
      const squareSize = cellSize / 2;
      const xPadded = x + (cellSize - squareSize) / 2;
      const yPadded = y + (cellSize - squareSize) / 2;
      
      const hueOffset = 0;

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
