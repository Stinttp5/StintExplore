import React, { useState, useEffect, useRef } from 'react';
import { RandomParameters, RandomType } from './StintParameters';
import UniformRandomParameterBox from './parameter_boxes/UniformRandomParameterBox';
import NormalRandomParameterBox from './parameter_boxes/NormalRandomParameterBox';
import PerlinRandomParameterBox from './parameter_boxes/PerlinRandomParameterBox';
import ParetoRandomParameterBox from './parameter_boxes/ParetoRandomParameterBox';
import DrawableRandomParameterBox from './parameter_boxes/DrawableRandomParameterBox';
import PassthroughRandomParameterBox from './parameter_boxes/PassthroughRandomParameterBox';
import { max } from 'lodash';
// import {stintRandomDegree,stintRandomIOStorage,stintRandomMinMax} from "../libraries/p5.preview"
// import {sampleCanvasFromStorage,stintRandomMinMax} from "../libraries/p5.explore"

interface ParameterBoxProps {
  randomType: RandomType;
  setParameters: (id: string, parameters: RandomParameters) => void;
  preview: any;
  key: string; // didn't think i needed this??
}

const renderBox = (randomType: RandomType, setParameters: (id: string, parameters: RandomParameters) => void) => {
  if (randomType.parameters.type === "uniform") {
    return (
      <UniformRandomParameterBox
        parameters={randomType.parameters}
        setParameters={params => setParameters(
          randomType.id,
          {
            ...params,
            type: "uniform",
          },
        )} />
    );
  } else if (randomType.parameters.type === "normal") {
    return (
      <NormalRandomParameterBox
        parameters={randomType.parameters}
        setParameters={params => setParameters(
          randomType.id,
          {
            ...params,
            type: "normal",
          },
        )} />
    );
  } else if (randomType.parameters.type === "perlin") {
    return (
      <PerlinRandomParameterBox
        parameters={randomType.parameters}
        setParameters={params => setParameters(
          randomType.id,
          {
            ...params,
            type: "perlin",
          },
        )} />
    );
  } else if (randomType.parameters.type === "pareto") {
    return (
      <ParetoRandomParameterBox
        parameters={randomType.parameters}
        setParameters={params => setParameters(
          randomType.id,
          {
            ...params,
            type: "pareto",
          },
        )} />
    );
  } else if (randomType.parameters.type === "drawable") {
    return (
      <DrawableRandomParameterBox
        parameters={randomType.parameters}
        setParameters={params => setParameters(
          randomType.id,
          {
            ...params,
            type: "drawable",
          },
        )} />
    );
  } else if (randomType.parameters.type === "passthrough") {
    return (
      <PassthroughRandomParameterBox
        parameters={randomType.parameters}
        setParameters={params => setParameters(
          randomType.id,
          {
            ...params,
            type: "passthrough",
          },
        )} />
    );
  } else {
    // force typescript to error if this is reachable
    const _exhaustiveCheck: never = randomType.parameters;

    // (it IS reachable, since the params pulled from the code might not have a type
    // specified, but the above makes sure that types are accounted for in the if-else ladder)
    return null;
  }
}

function ParameterBox({ randomType, setParameters, preview }: ParameterBoxProps) {
  const [cachedType, setCachedType] = useState(randomType);
  console.log("UPDATING BOX SDFGHJKJHGFDFGHJKJHGFDFGHJKLKJHGFDFGHJKJHGF")
  useEffect(() => {
    if (randomType !== cachedType) {
      setCachedType(randomType);
    }
  }, [randomType]);

  const setParametersShim = (id: string, parameters: RandomParameters) => {
    console.log("setParametersShim", id, parameters);
    setParameters(id, parameters);
    setCachedType({
      ...cachedType,
      parameters,
    });
  };

  return <div style={{ marginBottom: 30 }}> {/* sorry isabel don't hate me pls :)) */}
    <div>
      <strong>
        {randomType.id}
      </strong>
    </div>

    <select value={cachedType.parameters.type || ''} onChange={
      e => {
        const newType = e.target.value as RandomParameters["type"];
        setParametersShim(
          randomType.id,
          // @ts-ignore
          {
            ...cachedType.parameters, // this will pollute the parameters over time as we change distributions, but it means:
            // a. we get to save the parameters of the previous distribution in case the user wants to switch back
            // b. if there are parameters with matching names (min, max), they'll be preserved
            type: newType,
          },
        );
        }
    }>
      <option value="">--</option>
      <option value="uniform">Uniform</option>
      <option value="normal">Normal</option>
      <option value="perlin">Perlin</option>
      <option value="pareto">Pareto</option>
      <option value="drawable">Drawable</option>
      <option value="passthrough">Expression</option>
    </select>
    

    {renderBox(cachedType, setParametersShim)}
    <div>
      <CanvasComponent randomID={randomType.id} preview={preview}/>
    </div>
  </div>;
}

// let stintRandomIOStorage = {}
// let stintRandomMinMax = {}
// let stintRandomDegree = {}

// window.addEventListener("message",(event) => {
//   if (event.data.type === "PreviewData") {
//     console.log("got preview message", event.data);
//     stintRandomDegree = event.data.payload.degree;
//     stintRandomIOStorage = event.data.payload.storage;
//     stintRandomMinMax = event.data.payload.minMax;
//   }
// })

function CanvasComponent({randomID,preview, ...props}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (preview == null) return;
    let stintRandomDegree = preview.degree[randomID];
    let stintRandomIOStorage = preview.storage[randomID];
    let stintRandomMinMax = preview.minMax[randomID];
    console.log("randomID is",randomID,"preview is",preview)
    if (stintRandomDegree == null || stintRandomIOStorage == null || stintRandomMinMax == null) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (stintRandomMinMax[0] == stintRandomMinMax[1]) {
      canvas.width = 100;
      canvas.height = 20;
      context.fillStyle = "white";
      context.font = "14px Arial";
      context.fillText("Value: " + stintRandomMinMax[0].toFixed(2), 0, canvas.height);
    } else {
      // Draw on the canvas using the 2D context
      let gridWidth = 100; // number of grid cells in the x direction
      let gridHeight = 100; // number of grid cells in the y direction
      canvas.width = gridWidth + 100;
      canvas.height = gridHeight + 20;
      context.fillStyle = "white";
      context.font = "14px Arial";
      context.fillText("Min: " + stintRandomMinMax[0].toFixed(2) + " Max: " + stintRandomMinMax[1].toFixed(2), 0, canvas.height);

      let minVal = stintRandomMinMax[0];
      let maxVal = stintRandomMinMax[1];

      switch (stintRandomDegree) {
        case 0:
          context.fillStyle = "white";
          context.fillRect(0,0,gridWidth,gridHeight)
          context.fillStyle = "grey";
          var buckets = Array(10).fill(0); //TODO: is there a good way to decide bucket resolution?
          for (var entry of stintRandomIOStorage) {
            var value = (Number(entry)-minVal)/(maxVal-minVal);
            if (value == 1) {
              buckets[buckets.length-1] += 1;
            } else {
              buckets[Math.floor(value * buckets.length)] += 1;
            }
          }
          let maxBucket = max(buckets)
          for (var b in buckets) {
            context.fillRect(Number(b)/buckets.length * gridWidth, gridHeight*(1 - (buckets[b]/maxBucket)), gridWidth/buckets.length, gridHeight*(buckets[b]/maxBucket));
          }
          break;
        case 1:
          var gridSizeX = gridWidth / Object.keys(stintRandomIOStorage).length;
          var xind = 0;
          console.log("!!!!!!", Object.keys(stintRandomIOStorage).sort((a,b) => Number(a) - Number(b)));
          for (var x of Object.keys(stintRandomIOStorage).sort((a,b) => Number(a) - Number(b))) {
            console.log("!!!",x,stintRandomIOStorage[x]);
            var buckets = Array(10).fill(0);
            for (var entry of stintRandomIOStorage[x]) {
              var value = (Number(entry)-minVal)/(maxVal-minVal);
              if (value == 1) {
                buckets[buckets.length-1] += 1;
              } else {
                buckets[Math.floor(value * buckets.length)] += 1;
              }
            }
            let maxBucket = max(buckets)
            for (var b in buckets) {
              var colorValue = Math.floor((buckets[b]/maxBucket) * 255);
              context.fillStyle = "rgb(" + colorValue + "," + colorValue + "," + colorValue + ")";
              context.fillRect(xind * gridSizeX, gridHeight*(1 - (Number(b)/buckets.length)), gridSizeX, gridHeight/buckets.length);
            }
            // var gridSizeY = gridHeight / Object.keys(stintRandomIOStorage[x]).length;
            // var yind = 0;
            // for (var entry of stintRandomIOStorage[x]) {
            //   var value = (Number(entry)-minVal)/(maxVal-minVal);
            //   var colorValue = Math.floor(value * 255);
            //   context.fillStyle = "rgb(" + colorValue + "," + colorValue + "," + colorValue + ")";
            //   context.fillRect(xind * gridSizeX, yind * gridSizeY, gridSizeX, gridSizeY);
            //   yind += 1;
            // }
            xind += 1;
          }
          break;
        case 2:
          gridSizeX = gridWidth / Object.keys(stintRandomIOStorage).length;
          var xind = 0;
          console.log("!!!!!!", Object.keys(stintRandomIOStorage).sort((a,b) => Number(a) - Number(b)));
          for (var x of Object.keys(stintRandomIOStorage).sort((a,b) => Number(a) - Number(b))) {
            console.log("!!!",x,stintRandomIOStorage[x]);
            var gridSizeY = gridHeight / Object.keys(stintRandomIOStorage[x]).length;
            var yind = 0;
            for (var y of Object.keys(stintRandomIOStorage[x]).sort((a,b) => Number(a) - Number(b))) {
              var value = Number(stintRandomIOStorage[x][y]);
              value = (value-minVal)/(maxVal-minVal);
              var colorValue = Math.floor(value * 255);
              context.fillStyle = "rgb(" + colorValue + "," + colorValue + "," + colorValue + ")";
              context.fillRect(xind * gridSizeX, yind * gridSizeY, gridSizeX, gridSizeY);
              yind += 1;
            }
            xind += 1;
          }
          break;
        default:
          break;
      }
    }

    
  }, [randomID,preview]);

  return (
    <canvas ref={canvasRef} {...props} />
  );
}

export default ParameterBox;