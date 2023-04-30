import {
  provideVSCodeDesignSystem,
  vsCodeButton,
  vsCodeDropdown,
} from "@vscode/webview-ui-toolkit";

import React from 'react';
import { createRoot } from 'react-dom/client';
import StintParameters, { RandomParameters } from "./components/StintParameters";

// In order to use the Webview UI Toolkit web components they
// must be registered with the browser (i.e. webview) using the
// syntax below.
//
// To register more toolkit components, simply import the component
// registration function and call it from within the register
// function, like so:
//
// provideVSCodeDesignSystem().register(
//   vsCodeButton(),
//   vsCodeCheckbox()
// );
//
// Finally, if you would like to register all of the toolkit
// components at once, there's a handy convenience function:
//
// provideVSCodeDesignSystem().register(allComponents);
//
provideVSCodeDesignSystem().register(vsCodeButton(), vsCodeDropdown());

// Get access to the VS Code API from within the webview context
const vscode = acquireVsCodeApi();

window.addEventListener("load", main);

function StintWrapper() {
  const [randomTypes, setRandomTypes] = React.useState([]);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    window.addEventListener("message", (event) => {
      const { type, payload } = event.data;
      console.log('hey', type, payload);

      if (type === "newRandomTypes") {
        setRandomTypes(payload.map(
          o => ({
            ...o,
            parameters: {
              ...Object.fromEntries(
                Object.entries(o.parameters).map(
                  // @ts-ignore
                  ([k, v]: [string, string]) => {
                    // undoing the hack we did in extension.ts with stintNoParse
                    console.log('awkward', k, v);
                    const match = v.match(/^stintNoParse`(.*)`$/);
                    if (match) {
                      return [k, match[1]];
                    }
                    return [k, v];
                  }
                )
              ),
              type: eval(o.parameters.type), // it's a string literal here from the code, we need to eval it
            },
          })
        ));
        setError(null);
      } else if (type === "stintParseError") {
        setError(payload);
      }
    });
  }, []);

  const setParameters = (id: string, parameters: RandomParameters) => {
    vscode.postMessage({
      command: "updateParameters",
      payload: { id, parameters: {
        ...parameters,
        type: `'${parameters.type}'`, // convert back to a string literal to be shoved into the code
      }},
    });
  };

  return <StintParameters error={error} randomTypes={randomTypes} setParameters={setParameters} />
}

// Main function that gets executed once the webview DOM loads
function main() {
  const root = createRoot(document.getElementById('root'));
  root.render(<StintWrapper />);
}

const globalSettings = {};

const handleUpdate = (id: string) => (settingName: string) => {
  const value = globalSettings[id].getValue(settingName);
  let changedValue = '';
  let jsValue = '';
  if (value.value) { // dropdown
    changedValue = `"${value.value}"`; // add quotes, because this is a string literal
    jsValue = `${value.value}`;
    // check for number
  } else if (value.toFixed) { // number
    changedValue = value;
    jsValue = value;
  } else { // expression
    changedValue = value;
    jsValue = value;
  }
  // console.log(id, settingName, changedValue);
  vscode.postMessage({ command: "updateParameters", id, settingName, changedValue });
}
