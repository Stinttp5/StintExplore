import React from 'react';
import { NormalRandomParameters } from '../StintParameters';

interface NormalRandomParameterBoxProps {
  parameters: NormalRandomParameters;
  setParameters: (parameters: Omit<NormalRandomParameters, 'type'>) => void;
}

function NormalRandomParameterBox({ parameters, setParameters }: NormalRandomParameterBoxProps) {
  return <div>
    <div>
      Mean: <input type="text" value={parameters.mean} onChange={e => {
        setParameters({
          ...parameters,
          mean: e.target.value,
        });
      }} />
    </div>
    <div>
      Std. Deviation: <input type="text" value={parameters.std} onChange={e => {
        setParameters({
          ...parameters,
          std: e.target.value,
        });
      }} />
    </div>
  </div>;
}

export default NormalRandomParameterBox;