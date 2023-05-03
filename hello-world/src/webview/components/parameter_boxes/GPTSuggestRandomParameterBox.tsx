import React, { useState, useEffect } from 'react';
import { GPTSuggestRandomParameters as GPTSuggestRandomParameters } from '../StintParameters';
import generateAlternativeSuggestions from '../../../gptsuggest/api';

interface GPTSuggestRandomParameterBoxProps {
  parameters: GPTSuggestRandomParameters;
  setParameters: (parameters: Omit<GPTSuggestRandomParameters, 'type'>) => void;
  sourceCode: string;
  exploreCallId: string;
}

function GPTSuggestRandomParameterBox({ parameters, setParameters, sourceCode, exploreCallId}: GPTSuggestRandomParameterBoxProps) {
    // reruns whenever the user selects a different dropdown option, due to remounting
    useEffect(() => {
      const fetchData = async () => {
        const suggestion = await generateAlternativeSuggestions(exploreCallId, sourceCode);
        console.log('suggestion is', suggestion);
        setParameters({
          ...parameters,
          value: suggestion,
        });
      };
      fetchData();
    }, []);
  // users are allowed to modify the gpt suggestion
  const handleChange = async (value: string) => {
    setParameters({
      ...parameters,
      value,
    });
  };

  return (
    <div>
      <div>
        Expression:{' '}
        <input
          type="text"
          value={parameters.value}
          onChange={(e) => handleChange(e.target.value)}
        />
      </div>
    </div>
  );
}

export default GPTSuggestRandomParameterBox;
