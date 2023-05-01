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
  const [preview, setPreview] = React.useState(null);

  React.useEffect(() => {
    window.addEventListener("message", (event) => {
      // console.log("inside log:",event)
      const { type, payload } = event.data;

      if (type === "newRandomTypes") {
        console.log('hey', type, payload);
        setRandomTypes(payload.map(
          o => ({
            ...o,
            parameters: {
              ...Object.fromEntries(
                Object.entries(o.parameters).map(
                  // @ts-ignore
                  ([k, v]: [string, string]) => {
                    // undoing the hack we did in extension.ts with stintNoParse
                    // console.log('awkward', k, v);
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
      } else if (type === "updateSketch") {
        console.log('updating sketch');
        const sketchTag = document.getElementById('sketch');
        if (sketchTag) {
          sketchTag.innerHTML = '';
        }

        // // hm obviously i hate how i'm doing this wrapper but p5 in instance mode seems to be the way to go 
        // eval(`window.stintSketch = function (_stint_wrapper_p5) {
        //   for (let k in _stint_wrapper_p5) {
        //     console.log(k, _stint_wrapper_p5[k]);
        //     // the nested eval (tm) please kill me
        //     eval('let ' + k + ' = _stint_wrapper_p5[k];');
        //   }

        //   ${payload}
        // ; _stint_wrapper_p5.setup = setup; _stint_wrapper_p5.draw = draw; }`);
        // // @ts-ignore
        // new window.p5(window.stintSketch, document.getElementById('sketch'));

        // no okay doing this in instance mode is going to cause too many problems. new plan:
        // make and destroy an iframe each time. love it

        const iframe = document.createElement('iframe');
        // holy crap thanks copilot, didn't know about srcdoc
        // @ts-ignore
        iframe.setAttribute('srcdoc', `
          <html>
            <head>
              <script>
                ${
                  // @ts-ignore
                  window.p5Includes
                }
              </script>
            </head>
            <body>
              <script>
                ${payload}
              </script>
            </body>
          </html>`);
        iframe.setAttribute('style', 'width: 100%; height: 100%; border: none;');
        document.getElementById('sketch')?.appendChild(iframe);
      } else if (event.data.type === "PreviewData") {
        console.log("receivedPreviewData",payload);
        setPreview(payload);
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

  return <StintParameters error={error} randomTypes={randomTypes} setParameters={setParameters} preview={preview}/>
}

// Main function that gets executed once the webview DOM loads
function main() {
  const root = createRoot(document.getElementById('stintRoot'));
  root.render(<StintWrapper />);
}
