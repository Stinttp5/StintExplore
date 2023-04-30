import React from 'react';
import { DrawableRandomParameters } from '../StintParameters';

interface DrawableRandomParameterBoxProps {
  parameters: DrawableRandomParameters;
  setParameters: (parameters: Omit<DrawableRandomParameters, 'type'>) => void;
}

const DEFAULT_DISTRIBUTION = [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1];

const getDistribution = (distributionString: string | undefined): number[] => {
  if (!distributionString) {
    return DEFAULT_DISTRIBUTION;
  }

  try {
    const distribution = JSON.parse(distributionString);
    if (Array.isArray(distribution) && distribution.length > 0) {
      return distribution;
    }
  } catch (e) {}

  return DEFAULT_DISTRIBUTION;
};

function DrawableRandomParameterBox({ parameters, setParameters }: DrawableRandomParameterBoxProps) {
  const distribution = getDistribution(parameters.distribution);
  const DISTRIBUTION_HEIGHT = 160;

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
    <div style={{display: 'flex', flexDirection: 'row', width: 160}}
      onMouseDown={e => {
        e.preventDefault();
      }}
    >
      {distribution.map(
        (value, index) => (
          <div key={index} style={{ height: DISTRIBUTION_HEIGHT, width: 16, backgroundColor: '#333' }}
            onMouseMove={e => {
              if (e.buttons === 1) {
                const rect = e.currentTarget.getBoundingClientRect();
                const y = e.clientY - rect.top;
                const newValue = Math.max(0, Math.min(1, 1 - y / DISTRIBUTION_HEIGHT));
                const newDistribution = [...distribution];
                newDistribution[index] = newValue;
                setParameters({
                  ...parameters,
                  distribution: JSON.stringify(newDistribution),
                });
              }
            }}
          >
            <div key={index} style={{
              height: value * DISTRIBUTION_HEIGHT,
              width: 12,
              margin: 2,
              marginTop: (1 - value) * DISTRIBUTION_HEIGHT,
              backgroundColor: '#ddd',
            }}>
              
            </div>
          </div>
        )
      )}
    </div>
  </div>;
}

export default DrawableRandomParameterBox;