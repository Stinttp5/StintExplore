(function(){
    p5.prototype.test = function() {

        return 10;
    
    };

    const stintRandomParameters = {}

    const _stint_uniformRandom = function (parameters) {
        let max = parameters["Max"];
        let min = parameters["Min"];
        return () => {return Math.random() * (max - min) + min};
    };

    const _stint_normalRandom = function (parameters) {
        let mean = parameters["Mean"];
        let std = parameters["Std"];
        return () => {
            let u = 0;
            let v = 0;
            while (u === 0) u = Math.random();
            while (v === 0) v = Math.random();
            return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * std + mean;
        };
    };

    const _stint_perlinRandom = function (parameters) {
        let max = parameters["Max"];
        let min = parameters["Min"];
        return (x,y,z) => {return noise(x, y, z) * (max - min) + min};
    };

    const _stint_pareto = function (parameters) {
        let alpha = parameters["Alpha"];
        let min = parameters["Min"];
        return () => {
            return min/Math.pow(Math.random(),1/alpha)
        }
    }

    var namesToFunctions = {
        "uniform" : _stint_uniformRandom,
        "normal" : _stint_normalRandom,
        "perlin" : _stint_perlinRandom,
        "pareto" : _stint_pareto
    }

    var namesToParams = {
      "uniform" : ["Min","Max"],
      "normal" : ["Mean","Std"],
      "perlin" : ["Min","Max"],
      "pareto" : ["Min","Alpha"]
    }

    const sampleCanvas = function(styleFunction) {
        var canvas = document.createElement("canvas"),
            context = canvas.getContext("2d"),
            noiseScale = 0.1, // Perlin noise scale factor
            gridSize = 1, // size of each grid cell
            gridWidth = 100, // number of grid cells in the x direction
            gridHeight = 100; // number of grid cells in the y direction

        canvas.width = gridSize * gridWidth + 100;
        canvas.height = gridSize * gridHeight + 20;

        let RVs = Array.apply(null, Array(gridWidth * gridHeight)).map(Number.prototype.valueOf,0);

        for (var x = 0; x < gridWidth; x++) {
          for (var y = 0; y < gridHeight; y++) {
              RVs[x * gridHeight + y] = styleFunction(x * noiseScale, y * noiseScale);
          }
        }

        let minVal = min(RVs)
        let maxVal = max(RVs)

        for (var x = 0; x < gridWidth; x++) {
            for (var y = 0; y < gridHeight; y++) {
                // calculate Perlin noise value at this grid cell
                var noiseValue = (RVs[x * gridHeight + y]-minVal)/(maxVal-minVal);
                // var noiseValue = 

                // map noise value to grayscale color
                var colorValue = Math.floor(noiseValue * 255);

                // draw box with calculated color at this grid cell
                context.fillStyle = "rgb(" + colorValue + "," + colorValue + "," + colorValue + ")";
                context.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
            }
        }
        context.fillStyle = "black";
        context.font = "14px Arial";
        context.fillText("Min: " + minVal.toFixed(2) + " Max: " + maxVal.toFixed(2), 0, canvas.height);
        return canvas
    }

    module.exports = {sampleCanvas, namesToFunctions, _stint_normalRandom, _stint_perlinRandom, _stint_uniformRandom, _stint_pareto, namesToParams}

    p5.prototype.explore = function(_randomId, randomType, parameters = {}) {
        if (randomType === "number") {
          if (parameters) {
            let style = parameters["Style"];
            return namesToFunctions[style](parameters)();
            // if (style === "uniform") {
            //   const { min, max } = parameters;
            //   return _stint_uniformRandom(min, max)();
            // } else if (style === "normal") {
            //   let mean = parameters["Mean"];
            //   let std = parameters["Std"];
            //   return _stint_normalRandom(mean, std)();
            // } else if (style === "perlin") {
            //   const { min, max, x, y, z } = parameters;
            //   return _stint_perlinRandom(min, max)(x, y, z);
            // } else if (style === "pareto") {
            //   let min = parameters["Min"];
            //   let alpha = parameters["Alpha"];
            //   return _stint_pareto(min,alpha)();
            // }
          }
          return 0;
        } else if (randomType === "substructure") {
        } else if (randomType === "color") {
        } else if (randomType === "threshold") {
          const [threshold] = args;
          return Math.random() < threshold;
        }
      };
})();