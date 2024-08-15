import { strict as assert } from "assert";
import { test } from "node:test";
import path from "path";
import fs from "fs";
import { getInlineFilePath, getInlineFileContents } from "../src/util.mjs";

// Mock path.resolve
const originalResolve = path.resolve;
path.resolve = (...args) => {
    // Simulate path resolution
    return args.join("/").replace(/\/\//g, "/");
};

// Mock fs.readFileSync
const originalReadFileSync = fs.readFileSync;
fs.readFileSync = (path) => {
    // Simulate file reading
    return `Content of ${path}`;
};

test("getInlineFilePath", async (t) => {
    await t.test("should resolve relative paths", () => {
        const result = getInlineFilePath("styles/main.css", "/var/www/site");
        assert.equal(result, "/var/www/site/styles/main.css");
    });

    await t.test("should handle paths starting with /", () => {
        const result = getInlineFilePath("/styles/main.css", "/var/www/site");
        assert.equal(result, "/var/www/site/styles/main.css");
    });

    await t.test("should remove query strings and hashes", () => {
        const result = getInlineFilePath(
            "styles/main.css?v=1#section1",
            "/var/www/site"
        );
        assert.equal(result, "/var/www/site/styles/main.css");
    });
});

test("getInlineFileContents", async (t) => {
    await t.test("should read file contents", () => {
        const result = getInlineFileContents(
            "styles/main.css",
            "/var/www/site"
        );
        assert.equal(result, "Content of /var/www/site/styles/main.css");
    });

    await t.test("should handle paths starting with /", () => {
        const result = getInlineFileContents(
            "/styles/main.css",
            "/var/www/site"
        );
        assert.equal(result, "Content of /var/www/site/styles/main.css");
    });

    await t.test("should remove query strings and hashes when reading", () => {
        const result = getInlineFileContents(
            "styles/main.css?v=1#section1",
            "/var/www/site"
        );
        assert.equal(result, "Content of /var/www/site/styles/main.css");
    });
});

// Restore original functions
test.after(() => {
    path.resolve = originalResolve;
    fs.readFileSync = originalReadFileSync;
});
