import axios from 'axios';
import { parseScript } from 'meriyah';
import { generate } from 'astring';


// terrible practice, please delete this after 4/9/2023
// also feel free to replace it with your own open ai key: https://platform.openai.com/account/api-keys
// only has 10 dollars on it
const apiKey = "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";
const openaiApiUrl = "https://api.openai.com/v1/completions";

// also unfortunately a neat little hole has to be made in the program, based on my testing (i.e. "replace the explore call with this id" failed)
const generatePrompt = (sourceCodeWithHole: string) : string => {
    // prompt from langchain for structured output
    // can return several expressions, not just one, later
    // later say "outside of plain uniform, gaussian, poisson"
    return `Answer the user query.
    The output should be formatted as a JSON instance that conforms to the JSON schema below.
    
    As an example, for the schema {"properties": {"foo": {"title": "Foo", "description": "a list of strings", "type": "array", "items": {"type": "string"}}}, "required": ["foo"]}}
    the object {"foo": ["bar", "baz"]} is a well-formatted instance of the schema. The object {"properties": {"foo": ["bar", "baz"]}} is not well-formatted.
    
    Here is the output schema:
    {"properties": {"answer": {"title": "Answer", "description": "a single js expression at the specified location", "type": "string"}}, "required": ["expression"]}

    User Query:
    Provide an expression that returns either an integer or float that replaces <RANDOM EXPRESSION HERE> in the source code below. 
    Use local variables in the source code as needed and produce an interesting expression.

    An example expression is random(50);

    The relevant section of the source code is below:
${sourceCodeWithHole}
    `;
    // ${sourceCode}
};

// i'm going to try modifying the ast instead, so that i'm removing the explore call and inserting a string
// basically I thought this was more scalable than prop drilling 15 different templates containing duplicates of the source code from extension.ts
const insertHoleInSourceCode = (callId: string, sourceCode: string) : string => {
    let tree;
    try {
        tree = parseScript(sourceCode, { ranges: true, loc: true });
    } catch (e) {
        // document was already parsed in extension.ts so this should not fail
        throw new Error("Should be parseable: " + e);
    }
    // assumes the explore function is not the top level node
    // @ts-ignore
    const replaceNode = (node) => {
        if (node.type === "CallExpression" && node.callee.name === "explore" && node.arguments[0].value === callId) {
            return { type: "Literal", value: `<RANDOM EXPRESSION HERE>`};
        }
        for (const key in node) {
            if(typeof node[key] === "object" && node[key] !== null) {
                const result = replaceNode(node[key]);
                if (result) {
                    node[key] = result;
                }
            }
        }
        return null;
    };
    replaceNode(tree);

    const modifiedSourceCode = generate(tree);
    return modifiedSourceCode;
};


// const generateAlternativeExpression = async (sourceCode: string, callMetadata : CallMetadataTuple) : Promise<string> => {
const generateAlternativeExpression = async (exploreCallId: string, sourceCode: string) : Promise<string> => {
    if (sourceCode.length === 0) {
        return 'source code is empty';
    } else if (sourceCode.length > 6000) { // arbitrary limit of ~1500 GPT tokens 
        return 'source code is too long';
    }
    const sourceCodeWithHole = insertHoleInSourceCode(exploreCallId, sourceCode);
    try {
        const response = await axios.post(
            openaiApiUrl,
            {
                model: "text-davinci-003",
                // mode: "gpt-3.5-turbo",
                prompt: generatePrompt(sourceCodeWithHole),
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
        const output = response.data.choices[0].text;
        let parsedOutput;
        try {
            parsedOutput = JSON.parse(output);
            if (!parsedOutput.answer) {
                throw new Error("No answer field in output");
            }
        } catch (e) {
            console.log("Error parsing output from chatGPT: " + e);
            return 'N/A';
        }
        // TODO(Tommy): Parse this and make sure it's a valid expression (otherwise it can really break things)
        // Sometimes GPT is outputting "explore(...)" so maybe I should disallow those results
        return parsedOutput.answer;

    } catch (error) {
        const message = (error as any).message;
        console.log("Error with chatGPT api: " + message);
        return 'N/A';
   }
}
export default generateAlternativeExpression;
