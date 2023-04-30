import React from 'react';
import { ParetoRandomParameters } from '../StintParameters';

interface ParetoRandomParameterBoxProps {
  parameters: ParetoRandomParameters;
  setParameters: (parameters: Omit<ParetoRandomParameters, 'type'>) => void;
}

function ParetoRandomParameterBox({ parameters, setParameters }: ParetoRandomParameterBoxProps) {
  return <div>
    <div>
      Min: <input type="text" value={parameters.min} onChange={e => {
        setParameters({
          ...parameters,
          min: e.target.value,
        });
      }} />
    </div>
    <div>
      Alpha: <input type="text" value={parameters.alpha} onChange={e => {
        setParameters({
          ...parameters,
          alpha: e.target.value,
        });
      }} />
    </div>
  </div>;
}

export default ParetoRandomParameterBox;