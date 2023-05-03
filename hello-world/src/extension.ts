import { commands, window, workspace, ExtensionContext, Uri, Range, Position } from "vscode";
import { StintExplorePanel } from "./panels/StintExplorePanel";

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
        console.log(randomIdNode);
        const randomId = randomIdNode.value;

        const randomParametersNode = node.arguments[1];
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
            parameters: randomParameters, // the values here are all STRINGS, literals from what's in the code -- depending on the type (dropdown, slider, expression textbox, etc.) we'll need to parse them in the frontend
          });
        }
      }
    });

    console.log(newRandomTypes);
    randomTypes = newRandomTypes;
    const randomTypesMetadata = {
        newRandomTypes,
        sourceCode: document.getText() 
    }
    StintExplorePanel.sendMessage("newRandomTypes", randomTypesMetadata);
  } catch (e: any) {
    console.error(e);
    StintExplorePanel.sendMessage("stintParseError", e.message);
  }
}, 500);

export const updateStintParameters = (id: string, parameters: any) => {
  // console.log("usp???");
  randomTypes.find((r: any) => r.id === id)!.parameters = parameters;

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
          const parametersArg = node.arguments[1];
          if (parametersArg) {
            console.log("found", { parametersArg });
            const loc = parametersArg.loc;
            foundLoc = loc;
          } else {
            const loc = node.arguments[0].loc!;
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
      .then(() => updateStintParameters(id, parameters));
  } else {
    textEditor.edit((editBuilder: any) => {
      editBuilder.replace(
        new Range(
          new Position(foundLoc.start.line - 1, foundLoc.start.column),
          new Position(foundLoc.end.line - 1, foundLoc.end.column)
        ),
        `{ ${Object.entries(randomTypes.find((r: any) => r.id === id).parameters).map(
            // @ts-ignore
            ([ k, v ]: [ string, string ]) => {
              // here's the thing.
              // if you're in the middle of typing, you might type something that doesn't parse yet.
              // this breaks the whole damn thing.
              // so if it doesn't parse, we're going to wrap it with a js custom format string -- stintNoParse`canvasWidth /`
              // this will fail at runtime, maybe, if I remember to add a stintNoParse function. i mean it'll fail either way.
              // but the important bit is to wrap it iff it doesn't parse.
              // nah ok i do need to implement it so the empty thing parses to null for optional params

              const tryParse = `{ a: ${v} }`;
              try {
                parseScript(tryParse);
              } catch (e) {
                return `${k}: stintNoParse\`${v}\``;
              }

              return `${k}: ${v}`;
            }
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

const sendUpdateSketch = debounce((text) => {
  StintExplorePanel.sendMessage("updateSketch", text);
}, 16);

export function activate(context: ExtensionContext) {
  // Create the show 'show' command
  const showp5ushiCommand = commands.registerCommand(
    "p5ushijs.open",
    (uri: Uri) => {
      StintExplorePanel.render(context.extensionUri, uri);
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
          sendUpdateSketch(document.getText());

          // console.log('Text changed in active editor');
          // window.showInformationMessage("Text changed in active editor");

          getStintCalls(document);
        }
      });
      context.subscriptions.push(disposable);
    }
  });

  // Add command to the extension context
  context.subscriptions.push(showp5ushiCommand);
}
