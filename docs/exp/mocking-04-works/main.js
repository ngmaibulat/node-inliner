import { readFile } from "./lib.js";

const wrapper = {
    readFileSync: (path, encoding) => {
        return "Hello, World!";
    },
};

let content = "";

content = readFile("exp/mocking-04/data.txt", wrapper);
console.log(content);

content = readFile("exp/mocking-04-works/data.txt");
console.log(content);
