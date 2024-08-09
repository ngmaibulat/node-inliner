import { test } from "node:test";
import assert from "node:assert";
import inline from "../src/inline.js";
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

test("base: should pass HTTP errors up through callbacks when strict", () => {
    const input = {
        fileContent: readFile("cases/404.html"),
        relativeTo: "cases/",
        strict: true,
    };

    const message =
        "https://raw.githubusercontent.com/not-a-file.css returned http 400";

    inline.html(input, function (err, result) {
        assert.equal(err.message, message);
    });
});

test("base: should pass missing file errors up through callbacks when strict", () => {
    const expected = readFile("cases/missing-file.html");

    const input = {
        fileContent: readFile("cases/missing-file.html"),
        relativeTo: "cases/",
        strict: true,
    };

    inline.html(input, function (err, result) {
        assert.equal(result, expected);
    });
});

test("base: should console.warn HTTP errors when not strict", () => {
    const expected = readFile("cases/404.html");

    const input = {
        fileContent: readFile("cases/404.html"),
        relativeTo: "cases/",
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
