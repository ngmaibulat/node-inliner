import vm from "node:vm";
import fs from "node:fs";
import { createContext, runInContext } from "node:vm";

// import { hello } from "./lib.js";

// const code = fs.readFileSync("./exp/mocking-03/code.mjs", "utf8");
// const script = new vm.Script(code);

// const res = await script.runInThisContext();
// console.log("res:", res);

// Now you can modify the function
// context.module.exports.someFunction = () => "mocked";

const code = "someFunction()";

const contextDef = {
    somevar: 42,
    message: "Salam!",
    someFunction: () => "Hello",
};

const context = createContext(contextDef);
const result = runInContext(code, context);
console.log(result);

// console.log(context.message);
