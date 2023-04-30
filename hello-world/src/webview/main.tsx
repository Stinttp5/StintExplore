import {
  provideVSCodeDesignSystem,
  vsCodeButton,
  Button,
  vsCodeDropdown,
} from "@vscode/webview-ui-toolkit";
import QuickSettings from "./libraries/quicksettings";
import * as stintExplore from "./libraries/p5.explore";

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

const renderExploreParameters = (randomTypes) => {
  const rootDiv = document.getElementById("root")!;

  rootDiv.innerHTML = '';
  for (const { id, type, parameters } of randomTypes) {
    console.log("hi")
    globalSettings[id] = makeNumberGUI(id, type, parameters);
  }
};

const renderError = (stintError: string) => {
  const rootDiv = document.getElementById("root")!;

  rootDiv.innerHTML = stintError;
};

const makeNumberGUI = function (randomId, type, parameters) {
  const rootDiv = document.getElementById("root")!;

  // let canvas = sampleCanvas(_stint_uniformRandom(0,1))

  let sliderMax = 100
  let sliderMin = 0

  const properties = new Set();

  const settings = QuickSettings.create(0, 0, randomId, rootDiv);
  const reloadPreview = function (f) {
    // TODO
    settings.removeControl("Preview");
    const canvas = stintExplore.sampleCanvas(f)
    settings.addElement("Preview", canvas)
  };
  const styleDefault = parameters.hasOwnProperty('Style') ? JSON.parse(parameters.Style) : "uniform"; // string literal
  console.log({styleDefault});
  const dropdownOptions = ["uniform", "normal", "perlin", "pareto","GPTsuggest"];
  settings
    .addDropDown("Style", dropdownOptions, (value) => {
      console.log(`Dropdown value changed to ${value.value}`);
      properties.forEach(function (prop) {
        settings.removeControl(prop);
      });
      settings.removeControl("Preview");
      let style = value.value
      let propertyDefaults = {}
      for (let prop of stintExplore.namesToParams[style]) {
        properties.add[prop]
        propertyDefaults[prop] = parameters.hasOwnProperty(prop) ? parameters[prop] : (sliderMax + sliderMin)/2
        parameters[prop] = propertyDefaults[prop]
      }
      for (let prop of stintExplore.namesToParams[style]) {
        settings.addNumber(prop,sliderMin,sliderMax,propertyDefaults[prop],1, (value) => {return;})
      }
      if (value.value === "GPTsuggest") {
        console.log(parameters.Override)
        reloadPreview(parameters.Override)
      } else {
        reloadPreview(stintExplore.namesToFunctions[value.value](parameters))
      }
      

      // if (value.value === "normal") {
      //   properties.add("Mean");
      //   properties.add("Std");
      //   const meanDefault = parameters.hasOwnProperty('Mean') ? parseFloat(parameters.Mean) : 50;
      //   const stdDefault = parameters.hasOwnProperty('Std') ? parseFloat(parameters.Std) : 50;
      //   settings.addNumber("Mean", 0, 100, meanDefault, 1, (value) => {
      //     // reloadPreview(
      //     //   stintExplore.namesToFunctions["normal"](
      //     //     value / 100,
      //     //     parseFloat(parameters.Std) / 100
      //     //   )
      //     // );
      //   });
      //   settings.addNumber("Std", 0, 100, stdDefault, 1, (value) => {
      //     // reloadPreview(
      //     //   stintExplore.namesToFunctions["normal"](
      //     //     parseFloat(parameters.Mean) / 100,
      //     //     value / 100
      //     //   )
      //     // );
      //   });
      //   reloadPreview(stintExplore.namesToFunctions[value.value](meanDefault/100, stdDefault/100));
      //   // settings.addElement("Preview", sampleCanvas(stintExplore.namesToFunctions[value.value](0.5,0.166)))
      // } else if (value.value === "pareto") {
      //   properties.add("Min");
      //   properties.add("Alpha");
      //   const minDefault = parameters.hasOwnProperty('Min') ? parseFloat(parameters.Min) : 50;
      //   const alphaDefault = parameters.hasOwnProperty('Alpha') ? parseFloat(parameters.Alpha) : 50;
      //   settings.addNumber("Min", 0, 100, minDefault, 1, (value) => {
      //     // reloadPreview(
      //     //   stintExplore.namesToFunctions["pareto"](
      //     //     value / 100,
      //     //     parseFloat(parameters.Alpha) / 100
      //     //   )
      //     // );
      //   });
      //   settings.addNumber("Alpha", 0, 100, alphaDefault, 1, (value) => {
      //     // reloadPreview(
      //     //   stintExplore.namesToFunctions["pareto"](
      //     //     parseFloat(parameters.Min) / 100,
      //     //     value / 100
      //     //   )
      //     // );
      //   });
      //   // reloadPreview(stintExplore.namesToFunctions[value.value](minDefault/100, alphaDefault/100));
      // } else {
      //   // reloadPreview(stintExplore.namesToFunctions[value.value](0, 1));
      //   // settings.addElement("Preview", sampleCanvas(namesToFunctions[value.value](0,1)))
      // }
    })
    .setDraggable(false)
    // .addElement("Preview", canvas);
  settings.setValue("Style", dropdownOptions.indexOf(styleDefault));
  settings.setGlobalChangeHandler(handleUpdate(randomId));
  return settings;
};

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

  stintExplore._store_Random_Parameter(id,settingName,jsValue);
  
}
