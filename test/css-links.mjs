import { test } from "node:test";
import assert from "node:assert";
import inline from "../src/inline.mjs";

import { normalize, readFile, diff, testEquality, add } from "./functions.mjs";

const content = `
<html>
<link href="assets/main.css" rel="stylesheet">
</html>
`;

test("links: should inline local links", async () => {
    const expected = readFile("cases/css_out.html", "utf8");

    const { fileContent, relativeTo } = {
        fileContent: content,
        relativeTo: "cases/",
    };

    inline.html({ fileContent, relativeTo }, (err, result) => {
        assert.equal(result, expected);
    });
});
