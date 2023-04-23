import { commands, window, workspace, ExtensionContext, Uri, Range, Position } from "vscode";
import { HelloWorldPanel } from "./panels/HelloWorldPanel";

import { debounce } from "lodash";
import { TextDocument } from "vscode";

import { parseScript } from "meriyah";
import { visit } from "estree-util-visit";

let randomTypes: any;
let lastActiveTextEditor: any;

const getStintCalls = debounce((document: TextDocument) => {
  const newRandomTypes: any[] = [];

  let tree;
  try {
    tree = parseScript(document.getText(), { ranges: true, loc: true });
  } catch (e) {
    return;
  }
  // console.log(tree);
  try {
    // @ts-ignore
    visit(tree!, (node) => {
      // console.log({ node });
      // @ts-ignore
      if (node.type === "CallExpression" && node.callee.name === "explore") {
        const randomIdNode = node.arguments[0];
        if (randomIdNode.type !== "Literal" || typeof randomIdNode.value !== "string") {
          throw new Error(
            `explore must be called with a string literal ID argument (at sketch.js:${node.loc?.start.line}))`
          ); // idt the loc actually works here
        }
        const randomId = randomIdNode.value;

        const randomTypeNode = node.arguments[1];
        if (randomTypeNode.type !== "Literal" || typeof randomTypeNode.value !== "string") {
          throw new Error(
            `explore must be called with a string literal type argument (parsing ${randomId})`
          );
        }

        const randomType = randomTypeNode.value;
        if (!["number", "substructure", "threshold", "color"].includes(randomType)) {
          throw new Error(
            `explore must be called with a valid type argument (parsing ${randomId}). Valid arguments are 'number', 'substructure', 'threshold', 'color'`
          );
        }

        const randomParametersNode = node.arguments[2];
        const randomParameters: any = {};
        if (randomParametersNode && randomParametersNode.type === "ObjectExpression") {
          for (const prop of randomParametersNode.properties) {
            if (prop.type !== "Property") {
              throw new Error(`not property ${prop.type} (parsing ${randomId})`);
            }
            if (prop.key.type !== "Identifier") {
              throw new Error(`not identifier ${prop.key.type} (parsing ${randomId})`);
            }
            const valueRange = prop.value.loc!;
            const valueLiteral = document.getText(
              new Range(
                new Position(valueRange.start.line - 1, valueRange.start.column),
                new Position(valueRange.end.line - 1, valueRange.end.column)
              )
            );
            randomParameters[prop.key.name] = valueLiteral;
          }
        }

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
            parameters: randomParameters, // the values here are all STRINGS, literals from what's in the code -- depending on the type (dropdown, slider, expression textbox, etc.) we'll need to parse them in the frontend
          });
        }
      }
    });

    console.log(newRandomTypes);
    randomTypes = newRandomTypes;
    HelloWorldPanel.sendMessage("newRandomTypes", newRandomTypes);
  } catch (e: any) {
    console.error(e);
    HelloWorldPanel.sendMessage("stintParseError", e.message);
  }
}, 500);

export const updateStintParameters = (id: string, settingName: string, changedValue: string) => {
  // console.log("usp???");
  randomTypes.find((r: any) => r.id === id)!.parameters[settingName] = changedValue;

  const textEditor = lastActiveTextEditor!;
  const document = textEditor.document!;

  let needsNewParam: boolean = false;
  let foundLoc: any;

  console.log(1);

  const tree = parseScript(document.getText(), { ranges: true, loc: true });
  // @ts-ignore
  visit(tree!, (node) => {
    // console.log({ node });
    // @ts-ignore
    if (node.type === "CallExpression" && node.callee.name === "explore") {
      const randomIdNode = node.arguments[0];
      if (randomIdNode.type === "Literal") {
        const randomId = randomIdNode.value;
        if (randomId === id) {
          const parametersArg = node.arguments[2];
          if (parametersArg) {
            console.log("found", { parametersArg });
            const loc = parametersArg.loc;
            foundLoc = loc;
          } else {
            const loc = node.arguments[1].loc!;
            foundLoc = {
              start: {
                line: loc.end.line,
                column: loc.end.column,
              },
            };
            needsNewParam = true;
          }
        }
      }
    }
  });

  // console.log({ foundLoc });

  if (!foundLoc) {
    return;
  }

  // const start = document.positionAt(foundLoc.start.offset);
  // const end = document.positionAt(foundLoc.end.offset);

  if (needsNewParam) {
    textEditor
      .edit((editBuilder: any) => {
        editBuilder.insert(new Position(foundLoc.start.line - 1, foundLoc.start.column), ", {}");
      })
      .then(() => updateStintParameters(id, settingName, changedValue));
  } else {
    textEditor.edit((editBuilder: any) => {
      editBuilder.replace(
        new Range(
          new Position(foundLoc.start.line - 1, foundLoc.start.column),
          new Position(foundLoc.end.line - 1, foundLoc.end.column)
        ),
        `{ ${Object.entries(randomTypes.find((r: any) => r.id === id).parameters).map(
            // @ts-ignore
            ([ k, v ]: [ string, string ]) => `${k}: ${v}`
        ).join(',')} }`
      );
    });
  }
};

const tryUpdateStint = () => {
  const textEditor = lastActiveTextEditor!;
  const document = textEditor?.document!;
  if (document) getStintCalls(document); 
};

export function activate(context: ExtensionContext) {
  // Create the show hello world command
  const showHelloWorldCommand = commands.registerCommand(
    "hello-world.showHelloWorld",
    (uri: Uri) => {
      HelloWorldPanel.render(context.extensionUri, uri);
    }
  );

  console.log("extension activated");
  window.onDidChangeActiveTextEditor((editor) => {
    console.log("changed active text editor");
    tryUpdateStint();
    if (editor) {
      lastActiveTextEditor = editor; // lol hate this
      // Register a listener for changes to the active text editor's document
      const document = editor.document;
      const disposable = workspace.onDidChangeTextDocument((event) => {
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
