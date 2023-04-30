import React from 'react';
import { DrawableRandomParameters } from '../StintParameters';

interface DrawableRandomParameterBoxProps {
  parameters: DrawableRandomParameters;
  setParameters: (parameters: Omit<DrawableRandomParameters, 'type'>) => void;
}

function DrawableRandomParameterBox({ parameters, setParameters }: DrawableRandomParameterBoxProps) {
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
    {/* tima: workin on this i promise */}
  </div>;
}

export default DrawableRandomParameterBox;