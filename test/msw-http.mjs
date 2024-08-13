import { test, before, after, afterEach, beforeEach } from "node:test";
import assert from "node:assert";
import fs from "fs";
import { server } from "../mocks/node.mjs";

import inline from "../src/inline.mjs";
import { readFile } from "./functions.mjs";
import { baseUrl } from "../mocks/baseurl.mjs";

before(() => {
    server.listen();
});

after(() => {
    server.close();
});

afterEach(() => {
    server.resetHandlers();
});

//does tested code make an http request?
test("http: should not try to inline empty links", async (t) => {
    const expected = '<link href="" rel="stylesheet" />';

    const input = {
        fileContent: expected,
        strict: false,
        relativeTo: baseUrl,
    };

    inline.html(input, function (err, result) {
        assert.equal(result, expected);
    });
});

test("http: should not try to inline a link that starts with #", async () => {
    const content =
        '<link href="#" rel="stylesheet" /><link href="#aaa" rel="stylesheet" />' +
        '<img src="#" /><img src="#aaa" />' +
        '<a href="#" /><a href="#aaa" />';

    const input = {
        fileContent: content,
        strict: true,
    };

    inline.html(input, function (err, result) {
        assert.equal(result, content);
    });
});

test("http: should use the base url (relativeTo) to resolve image URLs", async () => {
    const expected = fs.readFileSync("cases/img_out.html", "utf8");
    const fileContent = fs.readFileSync("cases/img.html", "utf8");

    const input = {
        fileContent: fileContent,
        relativeTo: baseUrl,
        images: true,
    };

    inline.html(input, function (err, result) {
        assert.equal(result, expected);
    });
});

test("http: should apply the requestResource option", () => {
    const uris = [];

    const input = {
        fileContent:
            '<img src="assets/icon.png"><img src="assets/icon.png?a=1">',
        relativeTo: baseUrl,
        scripts: true,
        links: true,
        images: true,
        requestResource: function (options, callback) {
            uris.push(options.uri);
            callback(null, "image");
        },
    };

    inline.html(input, function () {
        assert.equal(uris.length, 2);
        assert.equal(uris[0], `${baseUrl}/assets/icon.png`);
        assert.equal(uris[1], `${baseUrl}/assets/icon.png?a=1`);
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
