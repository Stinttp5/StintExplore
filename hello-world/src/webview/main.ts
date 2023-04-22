import { provideVSCodeDesignSystem, vsCodeButton, Button, vsCodeDropdown } from "@vscode/webview-ui-toolkit";

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
provideVSCodeDesignSystem().register(
  vsCodeButton(),
  vsCodeDropdown(),
);

// Get access to the VS Code API from within the webview context
const vscode = acquireVsCodeApi();

window.addEventListener("load", main);

// Main function that gets executed once the webview DOM loads
function main() {
  const updateButton = document.getElementById("update") as Button;
  updateButton?.addEventListener("click", handleUpdateClick);

  window.addEventListener("message", event => {
    const { type, payload } = event.data;

    if (type === 'newRandomTypes') {
      renderExploreParameters(payload);
    } else if (type === 'stintParseError') {
      renderError(payload);
    }
  });
}

const renderExploreParameters = (randomTypes) => {
  const rootDiv = document.getElementById("root")!;

  rootDiv.innerHTML = JSON.stringify(randomTypes);
};

const renderError = (stintError: string) => {
  const rootDiv = document.getElementById("root")!;

  rootDiv.innerHTML = stintError;
};

function handleUpdateClick() {
  vscode.postMessage({});
}
