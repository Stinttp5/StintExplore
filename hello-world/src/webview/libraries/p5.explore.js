(function () {
  const _stint_uniformRandom = function (parameters) {
    console.log('ufr', { parameters })
    const { min, max } = parameters;
    return (Math.random() * (max - min)) + min
  };

  const _stint_normalRandom = function (parameters) {
    const { mean, std } = parameters;
    let u = 0;
    let v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return (Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * std) + mean;
  };

  const _stint_perlinRandom = function (parameters) {
    const { min, max, x, y, z } = parameters;
    return noise.apply(this, [x || undefined, y || undefined, z || undefined]) * (max - min) + min
  };

  const _stint_paretoRandom = function (parameters) {
    const { alpha, min } = parameters;
    return min / Math.pow(Math.random(), 1 / alpha);
  }

  const _stint_passthrough = function (parameters) {
    const { value } = parameters;
    return value;
  }

  const namesToFunctions = {
    "uniform": _stint_uniformRandom,
    "normal": _stint_normalRandom,
    "perlin": _stint_perlinRandom,
    "pareto": _stint_paretoRandom,
    "passthrough": _stint_passthrough,
  }

  var namesToParams = {
    "uniform": ["min", "max"],
    "normal": ["mean", "std"],
    "perlin": ["min", "max"],
    "pareto": ["min", "alpha"],
    "drawable": ["min", "max", "distribution"],
    "passthrough": ["value"],
    // "GPTsuggest": [] // tima: I was thinking we could implement the gpt ui just in the React component and then have it save as 'passthrough'. mostly so we don't have to store a bunch of state in the source code -- but anything works with me
  }

  const sampleCanvas = function (styleFunction) {
    console.log("styleFunction:", typeof (styleFunction))
    if (typeof (styleFunction) === 'string') {
      styleFunction = eval('(' + styleFunction + ')');
    }
    var canvas = document.createElement("canvas"),
      context = canvas.getContext("2d"),
      noiseScale = 0.1, // Perlin noise scale factor
      gridSize = 1, // size of each grid cell
      gridWidth = 100, // number of grid cells in the x direction
      gridHeight = 100; // number of grid cells in the y direction

    canvas.width = gridSize * gridWidth + 100;
    canvas.height = gridSize * gridHeight + 20;

    let RVs = Array.apply(null, Array(gridWidth * gridHeight)).map(Number.prototype.valueOf, 0);

    let minVal = styleFunction(0, 0);
    let maxVal = minVal;

    for (var x = 0; x < gridWidth; x++) {
      for (var y = 0; y < gridHeight; y++) {
        // console.log("Input3:", [x * noiseScale, y * noiseScale])
        let v = styleFunction(x * noiseScale, y * noiseScale);
        // console.log("random value is: " + v)
        RVs[x * gridHeight + y] = v;
        minVal = Math.min(minVal, v);
        maxVal = Math.max(maxVal, v);
      }
    }

    context.fillStyle = "black";
    context.font = "14px Arial";
    context.fillText("Min: " + minVal.toFixed(2) + " Max: " + maxVal.toFixed(2), 0, canvas.height);

    for (var x = 0; x < gridWidth; x++) {
      for (var y = 0; y < gridHeight; y++) {
        // calculate Perlin noise value at this grid cell
        var noiseValue = (RVs[x * gridHeight + y] - minVal) / (maxVal - minVal);
        // var noiseValue = 

        // map noise value to grayscale color
        var colorValue = Math.floor(noiseValue * 255);

        // draw box with calculated color at this grid cell
        context.fillStyle = "rgb(" + colorValue + "," + colorValue + "," + colorValue + ")";
        context.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
      }
    }

    return canvas
  }

  p5.prototype.explore = function (_randomId, parameters = null) {
    if (parameters) {
      let { type } = parameters;

      console.log('explore', parameters)
      return namesToFunctions[type].apply(this, [parameters]);
    } else {
      return 0;
    }
  };

  p5.prototype.stintNoParse = function (arr) {
    if (arr.length === 1 && arr[0] === '') return null;

    throw new Error('Some random parameter could not be parsed');
  }
})();