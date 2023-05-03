import axios from 'axios';
import { parseScript } from "meriyah";
import { visit } from "estree-util-visit";

// terrible practice, please delete this after 4/9/2023
// also feel free to replace it with your own open ai key: https://platform.openai.com/account/api-keys
// only has 10 dollars on it
const apiKey = "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";
const openaiApiUrl = "https://api.openai.com/v1/completions";
//     {"properties": {"expression": {"title": "Expression", "description": "expression that can replace the explore(${exploreId}, ...) call in the source code below", "type": "string"}}, "required": ["expression"]}
const generatePrompt = (exploreId: string, sourceCode: string) : string => {
    // prompt from langchain for structured output
    // can return several expressions, not just one, later
    // later say "outside of plain uniform, gaussian, poisson"
    return `Answer the user query.
    The output should be formatted as a JSON instance that conforms to the JSON schema below.
    
    As an example, for the schema {"properties": {"foo": {"title": "Foo", "description": "a list of strings", "type": "array", "items": {"type": "string"}}}, "required": ["foo"]}}
    the object {"foo": ["bar", "baz"]} is a well-formatted instance of the schema. The object {"properties": {"foo": ["bar", "baz"]}} is not well-formatted.
    
    Here is the output schema:
    {"properties": {"expression": {"title": "Expression", "description": "a single js expression at the specified location", "type": "string"}}, "required": ["expression"]}

    User Query:
    Provide an expression that returns either an integer or float that replaces <RANDOM EXPRESSION HERE> in the source code below. 
    Use local variables in the source code as needed and produce an interesting expression.

    An example expression is random(50);

    The relevant section of the source code is below:

// gui params
var myAngle = 30;
var myColor = '#eeee00';

var gui;
function setup() {
  createCanvas(500, 500);
  noLoop();
}


function draw() {
  background(10);
  fill(myColor);
  angleMode(DEGREES);
  let pacHeight = 100;
  let pacWidth = 100;
  let border = 20;
  const type = <RANDOM EXPRESSION HERE>
  for (let i = -8; i < 8; i++) {
    let xNudge = (pacWidth + border) * i;
    for (let j = -8; j < 8; j++) {
      let yNudge = (pacHeight + border) * j;
      if (type < 0.5) {
        let myAngle = explore('angle', { type: 'uniform',min: windowWidth / 20,max: windowWidth / 2 });
        arc(width / 2 + xNudge, height / 2 + yNudge, pacWidth, pacHeight, myAngle / 2, 360 - myAngle / 2, PIE);
      } else {
        // squasres!
        const squareSize = explore("squareSize", { type: 'drawable',distribution: [1,0.55,0.05625000000000002,0.012499999999999956,0.03125,0.03749999999999998,0.03749999999999998,0.06874999999999998,0.7,0.39375000000000004],min: 10,max: 100 });
        const squareSize2 = explore("squareSize2");
        rect(width / 2 + xNudge - squareSize / 2, height / 2 + yNudge - squareSize / 2, squareSize, squareSize);
      }
    }
  }
}
    `;
    // ${sourceCode}
};

// const insertHoleInSourceCode = (sourceCode: string, exploreId: string) : string => {
// we could alternatively just store a possible random template for each explore call and then pass it down as a prop

const generateAlternativeExpression = async (exploreId: string, sourceCode: string) : Promise<string> => {
    console.log('altexp', exploreId, sourceCode);
    if (sourceCode.length === 0) {
        return 'source code is empty';
    } else if (sourceCode.length > 6000) { // arbitrary limit of ~1500 GPT tokens 
        return 'source code is too long';
    }
    try {
        const response = await axios.post(
            openaiApiUrl,
            {
                model: "text-davinci-003",
                // mode: "gpt-3.5-turbo",
                prompt: generatePrompt(exploreId, sourceCode),
                n: 1,
                max_tokens: 100,
                temperature: 0.5,
            },
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
            }
        );
        return response.data.choices[0].text;
    } catch (error) {
        const message = (error as any).message;
        console.log("Error with chatGPT api: " + message);
        return 'N/A';
   }
}
export default generateAlternativeExpression;
