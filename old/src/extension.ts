// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { readFileSync } from 'fs';
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "stintexplore" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('stintexplore.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from StintExplore!');
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(
		vscode.commands.registerCommand('stintexplore.cat', () => {
		  const panel = vscode.window.createWebviewPanel(
			'catCoding',
			'Cat Coding',
			vscode.ViewColumn.One,
			{
				// Enable scripts in the webview
				enableScripts: true
			  }
		  );

		  panel.webview.html = getWebviewContent();

		  panel.webview.onDidReceiveMessage(
			message => {
			  switch (message.command) {
				case 'alert':
				  vscode.window.showErrorMessage(message.text);
				  return;
			  }
			},
			undefined,
			context.subscriptions
		  );
	
		//   let iteration = 0;
		//   const updateWebview = () => {
		// 	const cat = iteration++ % 2 ? 'Compiling Cat' : 'Coding Cat';
		// 	panel.title = cat;
		// 	panel.webview.html = getWebviewContent();
		//   };
	
		  // Set initial content
		//   updateWebview();
	
		  // And schedule updates to the content every second
		//   const interval = setInterval(updateWebview, 1000);

		//   panel.onDidDispose(
		// 	() => {
		// 	  // When the panel is closed, cancel any future updates to the webview content
		// 	  clearInterval(interval);
		// 	},
		// 	null,
		// 	context.subscriptions
		//   );
		})
	  );
}
const cats = {
	'Coding Cat': 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif',
	'Compiling Cat': 'https://media.giphy.com/media/mlvseq9yvZhba/giphy.gif'
  };
function getWebviewContent() {
	return `<!DOCTYPE html>
	<html lang="en">
	  <head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
	
		<title>Sketch</title>
	
		<link rel="stylesheet" type="text/css" href="style.css">
	
		<script src="src/libraries/p5.min.js"></script>
		<script src="src/libraries/p5.sound.min.js"></script>
		<script src="src/libraries/quicksettings.js"></script>
		<script src="src/libraries/p5.gui.js"></script>
		<script src="src/libraries/p5.func.min.js"></script>
		<script src="src/libraries/p5.explore.js"></script>
	  </head>
	
	  <body>
	  	<img src="https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif" width="300" />
		<h1 id="lines-of-code-counter">0</h1>

		<script>
			(function() {
				const vscode = acquireVsCodeApi();
				const counter = document.getElementById('lines-of-code-counter');

				let count = 0;
				setInterval(() => {
					counter.textContent = count++;

					// Alert the extension when our cat introduces a bug
					if (Math.random() < 0.001 * count) {
						vscode.postMessage({
							command: 'alert',
							text: '🐛  on line ' + count
						})
					}
				}, 100);
			}())
		</script>
		<script src="src/sketch.js"></script>
	  </body>
	</html>`;
  }

// This method is called when your extension is deactivated
export function deactivate() {}
