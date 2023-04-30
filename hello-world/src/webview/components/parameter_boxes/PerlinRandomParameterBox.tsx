import React from 'react';
import { PerlinRandomParameters } from '../StintParameters';

interface PerlinRandomParameterBoxProps {
  parameters: PerlinRandomParameters;
  setParameters: (parameters: Omit<PerlinRandomParameters, 'type'>) => void;
}

function PerlinRandomParameterBox({ parameters, setParameters }: PerlinRandomParameterBoxProps) {
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
    <div>
      X: <input type="text" value={parameters.x} onChange={e => {
        setParameters({
          ...parameters,
          x: e.target.value,
        });
      }} />
    </div>
    <div>
      Y: <input type="text" value={parameters.y} onChange={e => {
        setParameters({
          ...parameters,
          y: e.target.value,
        });
      }} />
    </div>
    <div>
      Z: <input type="text" value={parameters.z} onChange={e => {
        setParameters({
          ...parameters,
          z: e.target.value,
        });
      }} />
    </div>
  </div>;
}

export default PerlinRandomParameterBox;