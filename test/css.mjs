import { test } from "node:test";
import assert from "node:assert";
import inline from "../src/inline.js";
import { readFile } from "./functions.mjs";

test("css: should inline local urls", () => {
    const expected = readFile("cases/css_out.css");

    const input = {
        fileContent: readFile("cases/css.css"),
        relativeTo: "cases/",
        images: false,
    };

    inline.css(input, function (err, result) {
        assert.equal(result, expected);
    });
});

test("css: should inline remote urls", () => {
    const expected = readFile("cases/css-remote_out.css");

    const input = {
        fileContent: readFile("cases/css-remote.css"),
        relativeTo: "cases/",
        images: true,
    };

    inline.css(input, function (err, result) {
        assert.equal(result, expected);
    });
});

test("css: should rebase local urls", () => {
    const expected = readFile("cases/css-rebase_out.css");

    const input = {
        fileContent: readFile("cases/css-rebase.css"),
        rebaseRelativeTo: "assets",
        images: false,
    };

    inline.css(input, function (err, result) {
        assert.equal(result, expected);
    });
});
