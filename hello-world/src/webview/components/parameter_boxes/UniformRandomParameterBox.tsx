import React from 'react';
import { UniformRandomParameters } from '../StintParameters';

interface UniformRandomParameterBoxProps {
  parameters: UniformRandomParameters;
  setParameters: (parameters: Omit<UniformRandomParameters, 'type'>) => void;
}

function UniformRandomParameterBox({ parameters, setParameters }: UniformRandomParameterBoxProps) {
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
      Max: <input type="text" value={parameters.max} onChange={e => {
        setParameters({
          ...parameters,
          max: e.target.value,
        });
      }} />
    </div>
  </div>;
}

export default UniformRandomParameterBox;