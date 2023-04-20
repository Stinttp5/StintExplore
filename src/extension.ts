// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
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
			{}
		  );
	
		  let iteration = 0;
		  const updateWebview = () => {
			const cat = iteration++ % 2 ? 'Compiling Cat' : 'Coding Cat';
			panel.title = cat;
			panel.webview.html = getWebviewContent(cat);
		  };
	
		  // Set initial content
		  updateWebview();
	
		  // And schedule updates to the content every second
		  const interval = setInterval(updateWebview, 1000);

		  panel.onDidDispose(
			() => {
			  // When the panel is closed, cancel any future updates to the webview content
			  clearInterval(interval);
			},
			null,
			context.subscriptions
		  );
		})
	  );
}
const cats = {
	'Coding Cat': 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif',
	'Compiling Cat': 'https://media.giphy.com/media/mlvseq9yvZhba/giphy.gif'
  };
function getWebviewContent(cat: keyof typeof cats) {
	return `<!DOCTYPE html>
  <html lang="en">
  <head>
	  <meta charset="UTF-8">
	  <meta name="viewport" content="width=device-width, initial-scale=1.0">
	  <title>Cat Coding</title>
  </head>
  <body>
	  <img src="${cats[cat]}" width="300" />
  </body>
  </html>`;
  }

// This method is called when your extension is deactivated
export function deactivate() {}
