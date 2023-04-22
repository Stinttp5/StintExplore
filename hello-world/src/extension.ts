import { commands, window, workspace, ExtensionContext, Uri } from "vscode";
import { HelloWorldPanel } from "./panels/HelloWorldPanel";

import { debounce } from "lodash";
import { TextDocument } from "vscode";

import { parseScript } from 'meriyah';
import { visit } from 'estree-util-visit'

let randomTypes;

const getStintCalls = debounce((document: TextDocument) => {
  const newRandomTypes: any[] = [];

  let tree;
  try {
    tree = parseScript(document.getText());
  } catch (e) {
    return;
  }
  console.log(tree);
  try {
    // @ts-ignore
    visit(tree!, (node) => {
      // console.log({ node });
      // @ts-ignore
      if (node.type === 'CallExpression' && node.callee.name === 'explore') {
        const randomIdNode = node.arguments[0];
        if (randomIdNode.type !== 'Literal' || typeof randomIdNode.value !== 'string') {
          throw new Error(`explore must be called with a string literal ID argument (at ${node.loc?.start.line}:${node.loc?.start.column}))`); // idt the loc actually works here
        }
        const randomId = randomIdNode.value;

        const randomTypeNode = node.arguments[1];
        if (randomTypeNode.type !== 'Literal' || typeof randomTypeNode.value !== 'string') {
          throw new Error(`explore must be called with a string literal type argument (parsing ${randomId})`);
        }

        const randomType = randomTypeNode.value;
        if (!['number', 'substructure', 'threshold', 'color'].includes(randomType)) {
          throw new Error(`explore must be called with a valid type argument (parsing ${randomId}). Valid arguments are 'number', 'substructure', 'threshold', 'color'`);
        }

        // const randomAncestorsNode = node.arguments[2];

        // console.log(randomId, randomType);

        const existingRandomType = newRandomTypes.find((r) => r.id === randomId);
        if (existingRandomType) {
          // if (existingRandomType.type !== randomType) {
          //   throw new Error(`explore called with conflicting types for ID ${randomId}`);
          // }
          throw new Error(`explore cannot be called multiple times with the same ID ${randomId}`);
        } else {
          newRandomTypes.push({
            id: randomId,
            type: randomType,
          });
        }
      }
    });

    console.log(newRandomTypes);
    randomTypes = newRandomTypes;
    HelloWorldPanel.sendMessage("newRandomTypes", newRandomTypes);
  } catch (e: any) {
    HelloWorldPanel.sendMessage("stintParseError", e.message);
  }
}, 500);

export function activate(context: ExtensionContext) {
  // Create the show hello world command
  const showHelloWorldCommand = commands.registerCommand("hello-world.showHelloWorld", (uri:Uri) => {
    HelloWorldPanel.render(context.extensionUri, uri);
  });

  console.log("extension activated");
  window.onDidChangeActiveTextEditor(editor => {
    console.log("changed active text editor");
    if (editor) {
      // Register a listener for changes to the active text editor's document
      const document = editor.document;
      const disposable = workspace.onDidChangeTextDocument(event => {
        if (event.document === document) {
          // console.log('Text changed in active editor');
          // window.showInformationMessage("Text changed in active editor");

          getStintCalls(document);
        }
      });
      context.subscriptions.push(disposable);
    }
  });

  // Add command to the extension context
  context.subscriptions.push(showHelloWorldCommand);
}
