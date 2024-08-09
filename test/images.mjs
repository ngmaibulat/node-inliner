import { test } from "node:test";
import assert from "node:assert";
import inline from "../src/inline.js";
import { readFile } from "./functions.mjs";

test("images: should inline local images", () => {
    const expected = readFile("cases/img_out.html");

    const input = {
        fileContent: readFile("cases/img.html"),
        relativeTo: "cases/",
        images: true,
    };

    inline.html(input, function (err, result) {
        assert.equal(result, expected);
    });
});

test("images: should inline remote images", () => {
    const expected = readFile("cases/img-remote_out.html");

    const input = {
        fileContent: readFile("cases/img-remote.html"),
        relativeTo: "cases/",
        images: true,
    };

    inline.html(input, function (err, result) {
        assert.equal(result, expected);
    });
});

test("images: should inline images in one line", () => {
    const expected = readFile("cases/img-singleline_out.html");

    const input = {
        fileContent: readFile("cases/img-singleline.html"),
        relativeTo: "cases/",
        images: true,
    };

    inline.html(input, function (err, result) {
        assert.equal(result, expected);
    });
});

test("images: should include based on size", () => {
    const expected = readFile("cases/img-opt-out_out.html");

    const input = {
        fileContent: readFile("cases/img-opt-out.html"),
        relativeTo: "cases/",
        images: 8,
    };

    inline.html(input, function (err, result) {
        assert.equal(result, expected);
    });
});

test("images: should exclude based on size", () => {
    const expected = readFile("cases/img-too-large_out.html");

    const input = {
        fileContent: readFile("cases/img-too-large.html"),
        relativeTo: "cases/",
        images: 0.1,
    };

    inline.html(input, function (err, result) {
        assert.equal(result, expected);
    });
});
