//

// import QuickSettings = require("./quicksettings");


(function(){
    p5.prototype.test = function() {

        return 10;
    
    };

    stintRandomParameters = {}

    const _stint_uniformRandom = function (min, max) {
        return () => {return Math.random() * (max - min) + min};
    };

    const _stint_normalRandom = function (mean, std) {
        return () => {
            let u = 0;
            let v = 0;
            while (u === 0) u = Math.random();
            while (v === 0) v = Math.random();
            return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * std + mean;
        };
    };

    const _stint_perlinRandom = function (min, max) {
        return (x,y,z) => {return noise(x, y, z) * (max - min) + min};
    };

    var namesToFunctions = {
        "uniform" : _stint_uniformRandom,
        "normal" : _stint_normalRandom,
        "perlin" : _stint_perlinRandom
    }

    sampleCanvas = function(styleFunction) {
        var canvas = document.createElement("canvas"),
            context = canvas.getContext("2d"),
            noiseScale = 0.1, // Perlin noise scale factor
            gridSize = 1, // size of each grid cell
            gridWidth = 100, // number of grid cells in the x direction
            gridHeight = 100; // number of grid cells in the y direction

        canvas.width = gridSize * gridWidth;
        canvas.height = gridSize * gridHeight;

        for (var x = 0; x < gridWidth; x++) {
            for (var y = 0; y < gridHeight; y++) {
                // calculate Perlin noise value at this grid cell
                var noiseValue = styleFunction(x * noiseScale, y * noiseScale);
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

    makeNumberGUI = function(randomId) {

        let canvas = sampleCanvas(_stint_uniformRandom(0,1))

        properties = new Set()

        var settings = QuickSettings.create(20,20,randomId,document.body);
        reloadPreview = function(f) {
            settings.removeControl("Preview");
            settings.addElement("Preview", sampleCanvas(f))
        }
        settings.addDropDown("Style", ['uniform', 'normal', 'perlin'], (value) => {
            console.log(`Dropdown value changed to ${value.value}`);
            properties.forEach (function(prop) {settings.removeControl(prop)});
            settings.removeControl("Preview")
            if (value.value === 'normal') {
                properties.add("Mean");
                properties.add("Std");
                settings.addNumber("Mean", 0, 100, 50, 1, (value) => {
                    reloadPreview(namesToFunctions["normal"](value/100,stintRandomParameters[randomId].getValue("Std")/100))
                })
                settings.addNumber("Std", 0, 100, 50, 1, (value) => {
                    reloadPreview(namesToFunctions["normal"](stintRandomParameters[randomId].getValue("Mean")/100,value/100))
                })
                reloadPreview(namesToFunctions[value.value](0.5,0.166))
                // settings.addElement("Preview", sampleCanvas(namesToFunctions[value.value](0.5,0.166)))
            } else {
                reloadPreview(namesToFunctions[value.value](0,1))
                // settings.addElement("Preview", sampleCanvas(namesToFunctions[value.value](0,1)))
            }
            })
            .addElement("Preview", canvas);
        settings.setGlobalChangeHandler(window._draw);
        return settings;
    };

    p5.prototype.explore = function(randomId, randomType, ...args) {
        if (randomType === 'number') {
            if (!stintRandomParameters[randomId]) {
                //make dropdown
                dropdown = makeNumberGUI(randomId)
                stintRandomParameters[randomId] = dropdown;
            }
            if (stintRandomParameters[randomId]) {
                let style = stintRandomParameters[randomId].getValue("Style").label
                if (style === 'uniform') {
                    const [ min, max ] = args;
                    return _stint_uniformRandom(min, max)();
                } else if (style === 'normal') {
                    let mean = stintRandomParameters[randomId].getValue("Mean")
                    let std = stintRandomParameters[randomId].getValue("Std")
                    const [ min, max ] = args;
                    return _stint_normalRandom(mean, std)();
                } else if (style === 'perlin') {
                    const [ min, max, x, y, z ] = args;
                    return _stint_perlinRandom(min, max)(x, y, z);
                }
            }
    
            const [ min, max ] = args;
            // return _stint_uniformRandom(min, max);
            return 0;
        } else if (randomType === 'substructure') {
        } else if (randomType === 'color') {
        } else if (randomType === 'threshold') {
            const [ threshold ] = args;
            return Math.random() < threshold;
        }
    };
})();