import { test } from "node:test";
import assert from "node:assert";
import inline from "../src/inline.mjs";

import { normalize, readFile, diff, testEquality, add } from "./functions.mjs";

// Example test
// test("should return 4 when adding 2 and 2", (t) => {
//     t.test("addition test", () => {
//         // expect(add(2, 2)).toBe(4);
//         const res = add(2, 2);
//         assert.equal(res, 4);
//     });
// });

test("links: should inline local links", async () => {
    const expected = readFile("cases/css_out.html", "utf8");

    const { fileContent, relativeTo } = {
        fileContent: readFile("cases/css.html", "utf8"),
        relativeTo: "cases/",
    };

    inline.html({ fileContent, relativeTo }, (err, result) => {
        assert.equal(result, expected);
    });
});

test("links: should inline remote links", async () => {
    const expected = await readFile("cases/css-remote_out.html");
    const inputFile = await readFile("cases/css-remote.html");

    const input = {
        fileContent: inputFile,
        relativeTo: "cases/",
    };

    inline.html(input, function (err, result) {
        assert.equal(result, expected);
    });
});

test("links: should keep data: uris as-is", async () => {
    const expected = readFile("cases/data-uri.html");
    const input = {
        fileContent: expected,
    };

    inline.html(input, function (err, result) {
        assert.equal(result, expected);
    });
});

test("links: should inline remote links with no protocol", async () => {
    const expected = readFile("cases/css-remote-no-protocol_out.html");

    const input = {
        fileContent: readFile("cases/css-remote-no-protocol.html"),
        relativeTo: "cases/",
    };

    inline.html(input, function (err, result) {
        assert.equal(result, expected);
    });
});

test("links: should inline remote links relative to a url", async () => {
    const expected = readFile("cases/css-remote-relative-to-url_out.html");

    const input = {
        fileContent: readFile("cases/css-remote-relative-to-url.html"),
        relativeTo: "https://raw.githubusercontent.com/jrit/",
    };

    inline.html(input, function (err, result) {
        assert.equal(result, expected);
    });
});

test("links: should inline local and remote multiline links", async () => {
    const expected = readFile("cases/css-multiline_out.html");

    const input = {
        fileContent: readFile("cases/css-multiline.html"),
        relativeTo: "cases/",
    };

    inline.html(input, function (err, result) {
        assert.equal(result, expected);
    });
});

test("links: should transform links", () => {
    const expected = readFile("cases/css-transform_out.html");

    const input = {
        fileContent: readFile("cases/css-transform.html"),
        relativeTo: "cases/",
        linkTransform: function (content, done) {
            done(null, "/*inserted*/\n" + content);
        },
    };

    inline.html(input, function (err, result) {
        assert.equal(result, expected);
    });
});

test("links: should rebase inline local links relative to", () => {
    const expected = readFile("cases/css-rebase_out.html");

    const input = {
        fileContent: readFile("cases/css-rebase.html"),
        relativeTo: "cases/",
        rebaseRelativeTo: "cases/assets/fonts",
    };

    inline.html(input, function (err, result) {
        assert.equal(result, expected);
    });
});
