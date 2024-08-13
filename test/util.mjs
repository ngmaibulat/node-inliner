import { test } from "node:test";
import assert from "node:assert";
import { escapeSpecialChars } from "../src/util.mjs";

test("util: should escape special regex characters in a string", () => {
    const str = "http://fonts.googleapis.com/css?family=Open+Sans";
    const expected =
        "http:\\/\\/fonts\\.googleapis\\.com\\/css\\?family=Open\\+Sans";

    const result = escapeSpecialChars(str);
    const regex = new RegExp(result, "g");

    assert.equal(result, expected);
    assert.equal(str.match(regex).length, 1);
});
