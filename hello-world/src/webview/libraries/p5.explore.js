(function(){
    p5.prototype.test = function() {

        return 10;
    
    };

    const stintRandomParameters = {}

    const _store_Random_Parameter = function(id, settingName, newValue) {
      if (!(id in stintRandomParameters)){
        stintRandomParameters[id] = {}
      }
      stintRandomParameters[id][settingName] = newValue
    }

    const _stint_uniformRandom = function (parameters) {
        let max = parseFloat(parameters["Max"]);
        let min = parseFloat(parameters["Min"]);
        // console.log("oh boy" + max + "    " + min);
        return () => {return (Math.random() * (max - min)) + min};
        // return () => {return max/2}
    };

    const _stint_normalRandom = function (parameters) {
        let mean = parseFloat(parameters["Mean"]);
        let std = parseFloat(parameters["Std"]);
        return () => {
            let u = 0;
            let v = 0;
            while (u === 0) u = Math.random();
            while (v === 0) v = Math.random();
            return (Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * std) + mean;
            // return mean
        };
    };

    const _stint_perlinRandom = function (parameters) {
        let max = parseFloat(parameters["Max"]);
        let min = parseFloat(parameters["Min"]);
        return (...input) => {
          // console.log("input2:",input,noise.apply(this,input))
          return noise.apply(this,input) * (max - min) + min
        };
    };

    const _stint_pareto = function (parameters) {
        let alpha = parseFloat(parameters["Alpha"]);
        let min = parseFloat(parameters["Min"]);
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
      "pareto" : ["Min","Alpha"],
      "GPTsuggest": []
    }

    const sampleCanvas = function(styleFunction) {
        console.log("styleFunction:",typeof(styleFunction))
        if (typeof(styleFunction) === 'string') {
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

        let RVs = Array.apply(null, Array(gridWidth * gridHeight)).map(Number.prototype.valueOf,0);

        let minVal = styleFunction(0, 0);
        let maxVal = minVal;

        for (var x = 0; x < gridWidth; x++) {
          for (var y = 0; y < gridHeight; y++) {
              // console.log("Input3:", [x * noiseScale, y * noiseScale])
              let v = styleFunction(x * noiseScale, y * noiseScale);
              // console.log("random value is: " + v)
              RVs[x * gridHeight + y] = v;
              minVal = Math.min(minVal,v);
              maxVal = Math.max(maxVal,v);
          }
        }

        context.fillStyle = "black";
        context.font = "14px Arial";
        context.fillText("Min: " + minVal.toFixed(2) + " Max: " + maxVal.toFixed(2), 0, canvas.height);

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
        
        return canvas
    }

    module.exports = {_store_Random_Parameter, sampleCanvas, namesToFunctions, _stint_normalRandom, _stint_perlinRandom, _stint_uniformRandom, _stint_pareto, namesToParams}

    p5.prototype.explore = function(_randomId, randomType, parameters = {}, ...input) {
      // console.log("Input1: ",input)
      if (_randomId in stintRandomParameters) {
        //update parameters to reflect new updates
        for (const [paramName, value] of Object.entries(stintRandomParameters[_randomId])) {
          console.log("updated " + paramName + " to " + value)
          parameters[paramName] = value
        }
      }
      if (randomType === "number") {
        if (parameters) {
          let style = parameters["Style"];

          if (style === "GPTsuggest") {
            return eval('(' + parameters.Override + ')').apply(this,input); 
          } else {
            return namesToFunctions[style](parameters).apply(this,input);
          }

          // console.log("style is " + style);
          
          // console.log("Output:", out);
          // return out;
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