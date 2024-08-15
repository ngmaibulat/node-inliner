// test.mjs
import { test, mock } from "node:test";
import assert from "node:assert";

// Sample function to test
function sayHello() {
    return "Hello";
}

function sayHi() {
    return "Hi";
}

// works,
// but seems mostly useless
const fn = mock.fn(sayHello, sayHi, { times: 2 });

console.log(sayHello());

console.log(fn());
