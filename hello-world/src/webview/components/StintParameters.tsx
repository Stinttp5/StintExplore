import React from 'react';
import ParameterBox from './ParameterBox';

export interface RandomType {
  id: string;
  parameters: RandomParameters;
};

export interface UniformRandomParameters {
  type: "uniform";
  min: number;
  max: number;
};

export interface NormalRandomParameters {
  type: "normal";
  mean: number;
  std: number;
};

export interface PerlinRandomParameters {
  type: "perlin";
  min: number;
  max: number;
  x: number;
  y?: number;
  z?: number;
};

export interface ParetoRandomParameters {
  type: "pareto";
  min: number;
  alpha: number;
};

export interface DrawableRandomParameters {
  type: "drawable";
  min: number;
  max: number;
  distribution: number[];
};

export interface PassthroughRandomParmeters {
  type: "passthrough";
  value: number;
};

export type RandomParameters = UniformRandomParameters | NormalRandomParameters | PerlinRandomParameters | ParetoRandomParameters | DrawableRandomParameters | PassthroughRandomParmeters;

interface StintParametersProps {
  randomTypes: RandomType[];
  setParameters: (id: string, parameters: RandomParameters) => void;
  error: string | null;
}

function StintParameters({ randomTypes, setParameters, error }: StintParametersProps) {
  if (error) {
    return <div>
      {error}
    </div>
  }

  return <div>
    {
      randomTypes.map(
        (randomType) =>
          <ParameterBox
            key={randomType.id}
            randomType={randomType}
            setParameters={setParameters} />
      )
    }
  </div>;
}

export default StintParameters;