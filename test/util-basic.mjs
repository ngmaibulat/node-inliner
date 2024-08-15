import { strict as assert } from "assert";
import { test } from "node:test";
import {
    escapeSpecialChars,
    isRemotePath,
    isBase64Path,
} from "../src/util.mjs";

test("utils: escapeSpecialChars", async (t) => {
    await t.test("should escape special regex characters", () => {
        assert.equal(
            escapeSpecialChars("http://www.test.com"),
            "http:\\/\\/www\\.test\\.com"
        );
        assert.equal(
            escapeSpecialChars("$^{[(|)*+?\\"),
            "\\$\\^\\{\\[\\(\\|\\)\\*\\+\\?\\\\"
        );
        assert.equal(escapeSpecialChars("normal text"), "normal text");
    });
});

test("utils: isRemotePath", async (t) => {
    await t.test("should identify remote paths", () => {
        assert.equal(isRemotePath("http://example.com"), true);
        assert.equal(isRemotePath("https://example.com"), true);
        assert.equal(isRemotePath("//example.com"), true);
        assert.equal(isRemotePath("'http://example.com"), true);
        assert.equal(isRemotePath("ftp://example.com"), false);
        assert.equal(isRemotePath("/local/path"), false);
    });
});

test("utils: isBase64Path", async (t) => {
    await t.test("should identify base64 paths", () => {
        assert.equal(
            isBase64Path(
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=="
            ),
            true
        );
        assert.equal(
            isBase64Path(
                "'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAA=="
            ),
            true
        );
        assert.equal(isBase64Path("http://example.com"), false);
        assert.equal(isBase64Path("normal text"), false);
    });
});
