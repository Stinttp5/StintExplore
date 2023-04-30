import React, { useState, useEffect } from 'react';
import { RandomParameters, RandomType } from './StintParameters';
import UniformRandomParameterBox from './parameter_boxes/UniformRandomParameterBox';

interface ParameterBoxProps {
  randomType: RandomType;
  setParameters: (id: string, parameters: RandomParameters) => void;

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
  } else if (randomType.parameters.type === "perlin") {
  } else if (randomType.parameters.type === "pareto") {
  } else if (randomType.parameters.type === "drawable") {
  } else if (randomType.parameters.type === "passthrough") {
  } else {
    // force typescript to error if this is reachable
    const _exhaustiveCheck: never = randomType.parameters;

    // (it IS reachable, since the params pulled from the code might not have a type
    // specified, but the above makes sure that types are accounted for in the if-else ladder)
    return null;
  }
}

function ParameterBox({ randomType, setParameters }: ParameterBoxProps) {
  const [cachedType, setCachedType] = useState(randomType);

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

    <select value={randomType.parameters.type || ''}>
      <option value="">--</option>
      <option value="uniform">Uniform</option>
      <option value="normal">Normal</option>
      <option value="perlin">Perlin</option>
      <option value="pareto">Pareto</option>
      <option value="drawable">Drawable</option>
      <option value="passthrough">Passthrough</option>
    </select>

    {renderBox(cachedType, setParametersShim)}
  </div>;
}

export default ParameterBox;