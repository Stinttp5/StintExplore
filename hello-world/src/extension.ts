import { commands, ExtensionContext, Uri } from "vscode";
import { HelloWorldPanel } from "./panels/HelloWorldPanel";

export function activate(context: ExtensionContext) {
  // Create the show hello world command
  const showHelloWorldCommand = commands.registerCommand("hello-world.showHelloWorld", (uri:Uri) => {
    HelloWorldPanel.render(context.extensionUri,uri);
  });

  // Add command to the extension context
  context.subscriptions.push(showHelloWorldCommand);
}
