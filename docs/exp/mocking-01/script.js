import * as mod from "./lib.js";

// this will not work
mod.hello = function () {
    return "Hi";
};

console.log(mod.hello); // Hello
