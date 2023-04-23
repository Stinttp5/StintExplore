import {
  provideVSCodeDesignSystem,
  vsCodeButton,
  Button,
  vsCodeDropdown,
} from "@vscode/webview-ui-toolkit";
import QuickSettings from "./libraries/quicksettings";
import * as stintExplore from "./libraries/p5.explore";

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


// Main function that gets executed once the webview DOM loads
function main() {
  window.addEventListener("message", (event) => {
    const { type, payload } = event.data;

    if (type === "newRandomTypes") {
      renderExploreParameters(payload);
    } else if (type === "stintParseError") {
      renderError(payload);
    }
  });
}

const globalSettings = {};

const renderExploreParameters = (randomTypes) => {
  const rootDiv = document.getElementById("root")!;

  rootDiv.innerHTML = '';
  for (const { id, type, parameters } of randomTypes) {
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

  const properties = new Set();

  const settings = QuickSettings.create(0, 0, randomId, rootDiv);
  const reloadPreview = function (f) {
    // TODO
    settings.removeControl("Preview");
    settings.addElement("Preview", stintExplore.sampleCanvas(f))
  };
  const styleDefault = parameters.hasOwnProperty('Style') ? JSON.parse(parameters.Style) : "uniform"; // string literal
  console.log({styleDefault});
  const dropdownOptions = ["uniform", "normal", "perlin", "pareto"];
  settings
    .addDropDown("Style", dropdownOptions, (value) => {
      // console.log(`Dropdown value changed to ${value.value}`);
      properties.forEach(function (prop) {
        settings.removeControl(prop);
      });
      settings.removeControl("Preview");
      if (value.value === "normal") {
        properties.add("Mean");
        properties.add("Std");
        const meanDefault = parameters.hasOwnProperty('Mean') ? parseFloat(parameters.Mean) : 50;
        const stdDefault = parameters.hasOwnProperty('Std') ? parseFloat(parameters.Std) : 50;
        settings.addNumber("Mean", 0, 100, meanDefault, 1, (value) => {
          reloadPreview(
            stintExplore.namesToFunctions["normal"](
              value / 100,
              parseFloat(parameters.Std) / 100
            )
          );
        });
        settings.addNumber("Std", 0, 100, stdDefault, 1, (value) => {
          reloadPreview(
            stintExplore.namesToFunctions["normal"](
              parseFloat(parameters.Mean) / 100,
              value / 100
            )
          );
        });
        reloadPreview(stintExplore.namesToFunctions[value.value](meanDefault/100, stdDefault/100));
        // settings.addElement("Preview", sampleCanvas(stintExplore.namesToFunctions[value.value](0.5,0.166)))
      } else if (value.value === "pareto") {
        properties.add("Min");
        properties.add("Alpha");
        const minDefault = parameters.hasOwnProperty('Min') ? parseFloat(parameters.Min) : 50;
        const alphaDefault = parameters.hasOwnProperty('Alpha') ? parseFloat(parameters.Alpha) : 50;
        settings.addNumber("Min", 0, 100, minDefault, 1, (value) => {
          reloadPreview(
            stintExplore.namesToFunctions["pareto"](
              value / 100,
              parseFloat(parameters.Alpha) / 100
            )
          );
        });
        settings.addNumber("Alpha", 0, 100, alphaDefault, 1, (value) => {
          reloadPreview(
            stintExplore.namesToFunctions["pareto"](
              parseFloat(parameters.Min) / 100,
              value / 100
            )
          );
        });
        reloadPreview(stintExplore.namesToFunctions[value.value](minDefault/100, alphaDefault/100));
      } else {
        reloadPreview(stintExplore.namesToFunctions[value.value](0, 1));
        // settings.addElement("Preview", sampleCanvas(namesToFunctions[value.value](0,1)))
      }
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
  if (value.value) { // dropdown
    changedValue = `"${value.value}"`; // add quotes, because this is a string literal
    // check for number
  } else if (value.toFixed) { // number
    changedValue = value;
  } else { // expression
    changedValue = value;
  }
  console.log(id, settingName, changedValue);
  vscode.postMessage({ command: "updateParameters", id, settingName, changedValue });
}
