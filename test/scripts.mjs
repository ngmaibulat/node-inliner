import { test } from "node:test";
import assert from "node:assert";
import inline from "../src/inline.mjs";

import { readFile } from "./functions.mjs";

test("scripts: should inline scripts", () => {
    const expected = readFile("cases/script_out.html");

    const input = {
        fileContent: readFile("cases/script.html"),
        relativeTo: "cases/",
    };

    inline.html(input, function (err, result) {
        assert.equal(result, expected);
    });
});

test("scripts: should inline multiline scripts", () => {
    const expected = readFile("cases/script-multiline_out.html");

    const input = {
        fileContent: readFile("cases/script-multiline.html"),
        relativeTo: "cases/",
    };

    inline.html(input, function (err, result) {
        assert.equal(result, expected);
    });
});

test("scripts: should transform scripts", () => {
    const expected = readFile("cases/script-transform_out.html");

    const input = {
        fileContent: readFile("cases/script-transform.html"),
        relativeTo: "cases/",
        scriptTransform: function (content, done) {
            done(null, content);
        },
    };

    inline.html(input, function (err, result) {
        assert.equal(result, expected);
    });
});
