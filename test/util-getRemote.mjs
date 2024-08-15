import { strict as assert } from "assert";
import { test } from "node:test";
import { getRemote } from "../src/util.mjs";

// Mock for global.fetch
const mockFetch = (url, options) => {
    return Promise.resolve({
        status: 200,
        headers: new Map([["content-type", "text/plain"]]),
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
        text: () => Promise.resolve("Mocked response for " + url),
    });
};

test("getRemote", async (t) => {
    // Store the original fetch function
    const originalFetch = global.fetch;

    // Set up the mock
    global.fetch = mockFetch;

    await t.test("should handle protocol-relative URLs", (t) => {
        return new Promise((resolve) => {
            getRemote("//example.com", {}, (err, result) => {
                assert.equal(err, null);
                assert.equal(result, "Mocked response for https://example.com");
                resolve();
            });
        });
    });

    await t.test("should use https for protocol-relative URLs", (t) => {
        return new Promise((resolve) => {
            getRemote("//example.com", {}, (err, result) => {
                assert.equal(err, null);
                assert.equal(result, "Mocked response for https://example.com");
                resolve();
            });
        });
    });

    await t.test("should use provided URI for absolute URLs", (t) => {
        return new Promise((resolve) => {
            getRemote("http://example.com", {}, (err, result) => {
                assert.equal(err, null);
                assert.equal(result, "Mocked response for http://example.com");
                resolve();
            });
        });
    });

    await t.test(
        "should set encoding to binary when toDataUri is true",
        (t) => {
            return new Promise((resolve) => {
                getRemote(
                    "http://example.com",
                    {},
                    (err, result) => {
                        assert.equal(err, null);
                        assert.ok(result.startsWith("data:text/plain;base64,"));
                        resolve();
                    },
                    true
                );
            });
        }
    );

    await t.test("should use custom requestResource when provided", (t) => {
        return new Promise((resolve) => {
            const customRequestResource = (requestOptions, callback) => {
                callback(null, "Custom mocked response");
            };
            const settings = { requestResource: customRequestResource };
            getRemote("http://example.com", settings, (err, result) => {
                assert.equal(err, null);
                assert.equal(result, "Custom mocked response");
                resolve();
            });
        });
    });

    // Restore the original fetch function
    global.fetch = originalFetch;
});
