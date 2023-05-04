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

  const _stint_drawableRandom = function (parameters) {
    let { min, max, distribution } = parameters;

    min = min || 0;
    max = max || 1;

    if (!distribution || !distribution.length) {
      return min;
    }

    // first, we normalize the distribution
    // so that it sums to 1
    let sum = 0;
    for (let i = 0; i < distribution.length; i++) {
      sum += distribution[i];
    }
    for (let i = 0; i < distribution.length; i++) {
      distribution[i] /= sum;
    }

    // distribution is a histogram array that sums to 1
    // we want to sample from this distribution
    // so we need to find the cumulative distribution
    // and then sample from that

    // first, we find the cumulative distribution
    const cumulativeDistribution = [];
    let cumulativeSum = 0;
    for (let i = 0; i < distribution.length; i++) {
      cumulativeSum += distribution[i];
      cumulativeDistribution.push(cumulativeSum);
    }

    // then, we sample from the cumulative distribution
    const randomValue = Math.random();
    let index = 0;
    while (randomValue > cumulativeDistribution[index]) {
      index++;
    }

    // console.log({ cumulativeDistribution, randomValue, index });

    const minAllowed = index / distribution.length * (max - min) + min;
    const maxAllowed = (index + 1) / distribution.length * (max - min) + min;

    // console.log({ minAllowed, maxAllowed });

    return Math.random() * (maxAllowed - minAllowed) + minAllowed;

    // lol i didn't write any of those comments or any of that code, thanks copilot
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
    "drawable": _stint_drawableRandom,
    "passthrough": _stint_passthrough,
    "gptsuggest": _stint_passthrough,
  }

  var namesToParams = {
    "uniform": ["min", "max"],
    "normal": ["mean", "std"],
    "perlin": ["min", "max"],
    "pareto": ["min", "alpha"],
    "drawable": ["min", "max", "distribution"],
    "passthrough": ["value"],
    "gptsuggest": ["value"],
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

  

  p5.prototype.explore = function (_randomId, parameters = null,...axes) {
    if (parameters) {
      let { type } = parameters;

      // console.log('explore', parameters)
      let ret = namesToFunctions[type].apply(this, [parameters]);
      updateIOStorage(_randomId,ret,axes);
      return ret;
    } else {
      return 0;
    }
  };

  p5.prototype.stintNoParse = function (arr) {
    if (arr.length === 1 && arr[0] === '') return null;

    throw new Error('Some random parameter could not be parsed');
  };

  //preview stuff
  let stintRandomIOStorage = {}
  let stintRandomMinMax = {}
  let stintRandomDegree = {}
  let stintExtraPreview = new Set()

  p5.prototype.plotDist = function(name,value,...axes){
    stintExtraPreview.add(name);
    updateIOStorage(name,value,axes)
  }

  const updateIOStorage = function(randomID,retVal,axes){
    if (!stintRandomMinMax[randomID]) {
      stintRandomMinMax[randomID] = [retVal,retVal];
    } else {
      const [minVal,maxVal] = stintRandomMinMax[randomID];
      stintRandomMinMax[randomID] = [min(minVal,retVal),max(maxVal,retVal)];
    }

    if (axes.length === 0) {
      stintRandomDegree[randomID] = 0;
      if (!stintRandomIOStorage[randomID]) {
        stintRandomIOStorage[randomID] = []
      }
      stintRandomIOStorage[randomID].push(retVal)
    } else if (axes.length === 1) {
      stintRandomDegree[randomID] = 1;
      if (!(randomID in stintRandomIOStorage)){
        stintRandomIOStorage[randomID] = {}
      }
      if (!stintRandomIOStorage[randomID][axes[0]]) {
        stintRandomIOStorage[randomID][axes[0]] = []
      }
      stintRandomIOStorage[randomID][axes[0]].push(retVal);
    } else {
      stintRandomDegree[randomID] = 2;
      if (!(randomID in stintRandomIOStorage)){
        stintRandomIOStorage[randomID] = {}
      }
      if (!(axes[0] in stintRandomIOStorage[randomID])){
        stintRandomIOStorage[randomID][axes[0]] = {}
      }
      if (!stintRandomIOStorage[randomID][axes[0]][axes[1]]) {
        stintRandomIOStorage[randomID][axes[0]][axes[1]] = 0
      }
      stintRandomIOStorage[randomID][axes[0]][axes[1]] = retVal;
    }
  }

  p5.prototype.resetPreview = function() {
    stintRandomIOStorage = {}
    stintRandomMinMax = {}
    stintRandomDegree = {}
    stintExtraPreview = new Set()
  };

  p5.prototype.sendPreviewData = function() {
    console.log("sending preview message");
    var obj = {
      type: "PreviewData",
      payload: {
        degree: stintRandomDegree,
        minMax: stintRandomMinMax,
        storage: stintRandomIOStorage,
        extra: Array.from(stintExtraPreview)
      }
    }
    window.parent.postMessage(obj,"*");
  }

  const sampleCanvasFromStorage = function(randomID) {
    var canvas = document.createElement("canvas"),
        context = canvas.getContext("2d"),
        gridWidth = 100, // number of grid cells in the x direction
        gridHeight = 100; // number of grid cells in the y direction
    canvas.width = gridWidth + 100;
    canvas.height = gridHeight + 20;
    context.fillStyle = "black";
    context.font = "14px Arial";
    context.fillText("Min: " + stintRandomMinMax[randomID][0].toFixed(2) + " Max: " + stintRandomMinMax[randomID][1].toFixed(2), 0, canvas.height);

    switch (stintRandomDegree[randomID]) {
      case 0:
        
        break;
      case 1:
        gridSizeX = gridWidth / length(Object.keys(stintRandomIOStorage[randomID]));
        for (x in enumerate(Object.keys(stintRandomIOStorage[randomID]).sort((a,b) => Number(a) - Number(b)))) {
          gridSizeY = gridHeight / length(Object.keys(stintRandomIOStorage[randomID][x[1]]));
          for (value in stintRandomIOStorage[randomID][x[1]]) {
            value = (value-minVal)/(maxVal-minVal);
            var colorValue = Math.floor(value * 255);
            context.fillStyle = "rgb(" + colorValue + "," + colorValue + "," + colorValue + ")";
            context.fillRect(x[0] * gridSize, y[0] * gridSize, gridSize, gridSize);
          }
        }
        break;
      case 2:
        gridSizeX = gridWidth / length(Object.keys(stintRandomIOStorage[randomID]));
        for (x in enumerate(Object.keys(stintRandomIOStorage[randomID]).sort((a,b) => Number(a) - Number(b)))) {
          gridSizeY = gridHeight / length(Object.keys(stintRandomIOStorage[randomID][x[1]]));
          for (y in enumerate(Object.keys(stintRandomIOStorage[randomID][x[1]]).sort((a,b) => Number(a) - Number(b)))) {
            let value = stintRandomIOStorage[randomID][x[1]][y[1]];
            value = (value-minVal)/(maxVal-minVal);
            var colorValue = Math.floor(value * 255);
            context.fillStyle = "rgb(" + colorValue + "," + colorValue + "," + colorValue + ")";
            context.fillRect(x[0] * gridSize, y[0] * gridSize, gridSize, gridSize);
          }
        }
        break;
      default:
        break;
    }
    
    return canvas
  }
  module.exports = {sampleCanvasFromStorage, stintRandomMinMax}
})();