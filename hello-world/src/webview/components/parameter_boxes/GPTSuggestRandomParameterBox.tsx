import React from 'react';
import { GPTSuggestRandomParameters as GPTSuggestRandomParameters } from '../StintParameters';

interface GPTSuggestRandomParameterBoxProps { 
  parameters: GPTSuggestRandomParameters;
  setParameters: (parameters: Omit<GPTSuggestRandomParameters, 'type'>) => void;
}

function GPTSuggestRandomParameterBox({ parameters, setParameters}: GPTSuggestRandomParameterBoxProps) {
  // make an api call here
  const sourceCode = parameters.sourceCodeWithHole;
  console.log('sourceCode', sourceCode)
  const suggestion = parameters.value;
  return <div>
    <div>
      Expression: <input type="text" value={suggestion} />
    </div>
  </div>;
}

export default GPTSuggestRandomParameterBox;