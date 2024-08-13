import { test } from "node:test";
import assert from "node:assert";
import inline from "../src/inline.js";
import { readFile } from "./functions.mjs";

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

test("svg: should include based on size", () => {
    const expected = readFile("cases/svg/svg-opt-out_out.html");

    const input = {
        fileContent: readFile("cases/svg/svg-opt-out.html"),
        relativeTo: "cases/",
        svgs: 8,
    };

    inline.html(input, function (err, result) {
        assert.equal(result, expected);
    });
});

test("svg: should exclude based on size", () => {
    const expected = readFile("cases/svg/svg-too-large_out.html");

    const input = {
        fileContent: readFile("cases/svg/svg-too-large.html"),
        relativeTo: "cases/",
        svgs: 0.1,
    };

    inline.html(input, function (err, result) {
        assert.equal(result, expected);
    });
});
