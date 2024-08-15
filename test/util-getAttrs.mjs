import { strict as assert } from "assert";
import { test } from "node:test";
import { getAttrs, defaultRequestResource } from "../src/util.mjs";

// Mock for fetch
global.fetch = async (url) => ({
    status: 200,
    headers: new Map([["content-type", "text/plain"]]),
    arrayBuffer: async () => new ArrayBuffer(8),
    text: async () => "Hello, World!",
});

test("defaultRequestResource", async (t) => {
    await t.test("should handle successful text requests", (t, done) => {
        const requestOptions = {
            uri: "https://example.com",
            gzip: true,
            encoding: "utf8",
        };

        defaultRequestResource(requestOptions, (err, body) => {
            assert.equal(err, null);
            assert.equal(body, "Hello, World!");
            done();
        });
    });

    await t.test("should handle successful binary requests", (t, done) => {
        const requestOptions = {
            uri: "https://example.com/image.jpg",
            gzip: true,
            encoding: "binary",
        };

        defaultRequestResource(requestOptions, (err, body) => {
            assert.equal(err, null);
            assert.ok(body.startsWith("data:text/plain;base64,"));
            done();
        });
    });

    // Note: To test error scenarios, you'd need to mock fetch to return different status codes or throw errors
});
