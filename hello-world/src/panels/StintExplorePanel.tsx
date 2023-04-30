import { Disposable, Webview, WebviewPanel, window, Uri, ViewColumn } from "vscode";
import { getUri } from "../utilities/getUri";
import { getNonce } from "../utilities/getNonce";
import { updateStintParameters } from "../extension";

export class StintExplorePanel {
  public static currentPanel: StintExplorePanel | undefined;
  private readonly _panel: WebviewPanel;
  private _disposables: Disposable[] = [];

  private constructor(panel: WebviewPanel, extensionUri: Uri, sketchUri: Uri) {
    this._panel = panel;

    // Set an event listener to listen for when the panel is disposed (i.e. when the user closes
    // the panel or when the panel is closed programmatically)
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Set the HTML content for the webview panel
    this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri, sketchUri);

    // Set an event listener to listen for messages passed from the webview context
    this._setWebviewMessageListener(this._panel.webview);
  }

  /**
   * Renders the current webview panel if it exists otherwise a new webview panel
   * will be created and displayed.
   *
   * @param extensionUri The URI of the directory containing the extension.
   */
  public static render(extensionUri: Uri, sketchUri: Uri) {
    if (StintExplorePanel.currentPanel) {
      // If the webview panel already exists reveal it
      StintExplorePanel.currentPanel._panel.reveal(ViewColumn.One);
    } else {
      // If a webview panel does not already exist create and show a new one
      const panel = window.createWebviewPanel(
        // Panel view type
        "p5ushu.js",
        // Panel title
        "p5ushi.js",
        // The editor column the panel should be displayed in
        ViewColumn.One,
        // Extra panel configurations
        {
          // Enable JavaScript in the webview
          enableScripts: true,
          // Restrict the webview to only load resources from the `out` directory
          localResourceRoots: [Uri.joinPath(extensionUri, "out")],
        }
      );
      StintExplorePanel.currentPanel = new StintExplorePanel(panel, extensionUri, sketchUri);
    }
  }

  /**
   * Cleans up and disposes of webview resources when the webview panel is closed.
   */
  public dispose() {
    StintExplorePanel.currentPanel = undefined;

    // Dispose of the current webview panel
    this._panel.dispose();

    // Dispose of all disposables (i.e. commands) associated with the current webview panel
    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  public static sendMessage(type: string, payload?: any) {
    if (!StintExplorePanel.currentPanel) {
      return;
    }

    const panel = StintExplorePanel.currentPanel;

    panel._panel.webview.postMessage({ type, payload });
  }

  /**
   * Defines and returns the HTML that should be rendered within the webview panel.
   *
   * @remarks This is also the place where *references* to CSS and JavaScript files
   * are created and inserted into the webview HTML.
   *
   * @param webview A reference to the extension webview
   * @param extensionUri The URI of the directory containing the extension
   * @returns A template string literal containing the HTML that should be
   * rendered within the webview panel
   */
  private _getWebviewContent(webview: Webview, extensionUri: Uri, sketchUri: Uri) {
    const webviewUri = getUri(webview, extensionUri, ["out", "webview.js"]);
    const nonce = getNonce();
    
    const p5minUri = getUri(webview, extensionUri, ["out", "libraries" , "p5.min.js"]);
    const p5soundUri = getUri(webview, extensionUri, ["out", "libraries" , "p5.sound.min.js"]);
    const p5funcminUri = getUri(webview, extensionUri, ["out", "libraries" , "p5.func.min.js"]);
    const p5exploreUri = getUri(webview, extensionUri, ["out", "libraries" , "p5.explore.js"]);

    let totalScriptContents = '';
    const fs = require('fs');
    for (const scriptUri of [p5minUri, p5soundUri, p5funcminUri, p5exploreUri]) {
      const scriptContents = fs.readFileSync(scriptUri.fsPath, 'utf8');
      totalScriptContents += scriptContents;
    }

    // const fs = require('fs');
    // const sketchUri2 = getUri(webview, extensionUri, ["out", "sketch.js"]);

    // // File destination.txt will be created or overwritten by default.
    // fs.copyFile(sketchUri.fsPath, sketchUri2.fsPath, (err: any) => {
    //   if (err) throw err;
    //   console.log('source.txt was copied to destination.txt');
    // });

    // const test = getUri(webview,sketchUri,["."]);
    // const test2 = p5minUri;

    // Tip: Install the es6-string-html VS Code extension to enable code highlighting below
    return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>p5ushi.js</title>
          <style>
            body {
              display: flex;
              flex-direction: row;

              width: 800px;
            }

            #stintRoot {
              /* flex: 1; */
              width: 200px; /* yeah none of these width settings are working yikes */
              padding: 10px;
              box-sizing: border-box;
            }

            #sketch {
              width: 600px;
              height: 600px;
              /* flex: 3; */
            }
          </style>
        </head>
        <body>
          <div id="stintRoot"></div>
          <script>
            window.p5Includes = ${JSON.stringify(totalScriptContents)};
          </script>
					<script type="module" nonce="${nonce}" src="${webviewUri}"></script>
          <div id="sketch"></div>
        </body>
      </html>
    `;
  }

  /**
   * Sets up an event listener to listen for messages passed from the webview context and
   * executes code based on the message that is recieved.
   *
   * @param webview A reference to the extension webview
   */
  private _setWebviewMessageListener(webview: Webview) {
    webview.onDidReceiveMessage(
      (message: any) => {
        const { command } = message;
        switch (command) {
          case "updateParameters":
            const { id, parameters } = message.payload;
            // console.log('usp', { id, parameters });
            updateStintParameters(id, parameters);
            return;
        }
      },
      undefined,
      this._disposables
    );
  }
}
