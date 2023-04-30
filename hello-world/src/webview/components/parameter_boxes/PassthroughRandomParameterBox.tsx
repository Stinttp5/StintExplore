import React from 'react';
import { PassthroughRandomParameters } from '../StintParameters';

interface PassthroughRandomParameterBoxProps {
  parameters: PassthroughRandomParameters;
  setParameters: (parameters: Omit<PassthroughRandomParameters, 'type'>) => void;
}

function PassthroughRandomParameterBox({ parameters, setParameters }: PassthroughRandomParameterBoxProps) {
  return <div>
    <div>
      Expression: <input type="text" value={parameters.value} onChange={e => {
        setParameters({
          ...parameters,
          value: e.target.value,
        });
      }} />
    </div>
  </div>;
}

export default PassthroughRandomParameterBox;