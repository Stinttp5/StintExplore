import React from 'react';
import ExtraPreviewBox from './ExtraPreviewBox';
import {ParameterBox} from './ParameterBox';

export interface RandomType {
  id: string;
  parameters: RandomParameters;
};

export interface UniformRandomParameters {
  type: "uniform";
  min: string;
  max: string;
};

export interface NormalRandomParameters {
  type: "normal";
  mean: string;
  std: string;
};

export interface PerlinRandomParameters {
  type: "perlin";
  min: string;
  max: string;
  x: string;
  y?: string;
  z?: string;
};

export interface ParetoRandomParameters {
  type: "pareto";
  min: string;
  alpha: string;
};

export interface DrawableRandomParameters {
  type: "drawable";
  min: string;
  max: string;
  distribution: string;
};

export interface PassthroughRandomParameters {
  type: "passthrough";
  value: string;
};

export type RandomParameters = UniformRandomParameters | NormalRandomParameters | PerlinRandomParameters | ParetoRandomParameters | DrawableRandomParameters | PassthroughRandomParameters;

// export interface PreviewType {
//   stintRandomIOStorage: any;
//   stintRandomMinMax: any;
//   stintRandomDegree: any;
//   stintExtraPreview: string[];
// }

interface StintParametersProps {
  randomTypes: RandomType[];
  preview: any;
  setParameters: (id: string, parameters: RandomParameters) => void;
  error: string | null;
}

function StintParameters({ randomTypes, setParameters, error, preview }: StintParametersProps) {
  if (error) {
    return <div>
      {error}
    </div>
  }

  return <div>
    {
      randomTypes.length === 0 ? <div>
        <code>explore()</code> calls will appear here.
      </div> :
      randomTypes.map(
        (randomType) =>
          <ParameterBox
            key={randomType.id}
            randomType={randomType}
            setParameters={setParameters} 
            preview={preview}/>
      )
    }
    {
      preview ? preview.extra.map(
        (id) => <ExtraPreviewBox idName={id} preview={preview}/>
      ) : null
    }
  </div>;
}

export default StintParameters;