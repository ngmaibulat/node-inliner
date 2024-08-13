import { test } from "node:test";
import assert from "node:assert";
import inline from "../src/inline.mjs";
import { readFile } from "./functions.mjs";

test("base: should inline based on inlineAttribute", () => {
    const expected = readFile("cases/img-opt-in_out.html");

    const input = {
        fileContent: readFile("cases/img-opt-in.html"),
        relativeTo: "cases/",
        images: false,
    };

    inline.html(input, function (err, result) {
        assert.equal(result, expected);
    });
});

test("base: should exclude based on inlineAttribute", () => {
    const expected = readFile("cases/img-opt-out_out.html");

    const input = {
        fileContent: readFile("cases/img-opt-out.html"),
        relativeTo: "cases/",
        images: true,
    };

    inline.html(input, function (err, result) {
        assert.equal(result, expected);
    });
});

test("base: should console.warn missing file errors when not strict", () => {
    const input = {
        fileContent: readFile("cases/missing-file.html"),
        relativeTo: "cases/",
    };

    inline.html(input, function (err, result) {
        assert.equal(!!err, false);
    });
});

test("base: should properly escape regex vars before calling replace()", () => {
    const input = {
        fileContent: readFile("cases/script-regex-escape.html"),
        relativeTo: "cases/",
    };

    inline.html(input, function (err, result) {
        assert.equal(result.indexOf("$&") > -1, true);
    });
});

test("base: should properly escape regex vars before calling replace()", () => {
    const input = {
        fileContent: readFile("cases/script-regex-escape.html"),
        relativeTo: "cases/",
    };

    inline.html(input, function (err, result) {
        assert.equal(result.indexOf("$&") > -1, true);
    });
});
