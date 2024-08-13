import { test } from "node:test";
import assert from "node:assert";
import inline from "./src/inline.js";
import { readFile } from "./test/functions.mjs";

test("svg: should inline local svgs", (t) => {
    const expected = readFile("cases/svg/svg_out.html");

    const input = {
        fileContent: readFile("cases/svg/svg.html"),
        relativeTo: "cases/",
        svgs: true,
    };

    inline.html(input, function (err, result) {
        assert.equal(result, expected);
    });
});

// const input = {
//     fileContent: readFile("cases/svg/svg.html"),
//     relativeTo: "cases/",
//     svgs: true,
// };

// inline.html(input, function (err, result) {
//     console.log(result);
// });
