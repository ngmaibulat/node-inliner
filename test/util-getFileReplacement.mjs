import { strict as assert } from "assert";
import { test } from "node:test";
import { getFileReplacement } from "../src/util.mjs";

//////// Mock global.fetch //////////

function buffPromise() {
    const buff = Buffer.from(
        "aHR0cHM6Ly9leGFtcGxlLmNvbS9pbWFnZS5wbmc=",
        "base64"
    );

    const promise = Promise.resolve(buff);
    return promise;
}

function textPromise() {
    const data = "aHR0cHM6Ly9leGFtcGxlLmNvbS9pbWFnZS5wbmc=";
    const promise = Promise.resolve(data);
    return promise;
}

const mockFetch = (url) => {
    const promise = new Promise((resolve, reject) => {
        // Simulate handling different URLs
        if (url === "https://example.com/image.png") {
            resolve({
                status: 200,
                arrayBuffer: buffPromise,
                // Mock `text` method
                text: textPromise,
                // Mock `json` method if needed
                json: () => Promise.resolve({}),

                headers: {
                    get: (name) => {
                        const headers = {
                            "content-type": "image/png",
                            // Add other headers if needed
                        };
                        return headers[name.toLowerCase()];
                    },
                },
            });
        } else {
            reject(new Error("Not Found"));
        }
    });

    return promise;
};

// const origfetch = global.fetch;
global.fetch = mockFetch;

//////// Actual Tests //////////

test("getFileReplacement: handle null src", (t) => {
    getFileReplacement(null, {}, (err, result) => {
        assert.equal(err, null);
        assert.equal(result, null);
    });
});

test("getFileReplacement: handle CID src", (t) => {
    getFileReplacement("cid:example", {}, (err, result) => {
        assert.equal(err, null);
        assert.equal(result, null);
    });
});

test("getFileReplacement: should handle remote relativeTo", (t) => {
    const url = "image.png";
    const settings = { relativeTo: "https://example.com/" };

    getFileReplacement(url, settings, (err, result) => {
        assert.equal(err, null);
        assert.equal(
            result,
            "data:image/png;base64,aHR0cHM6Ly9leGFtcGxlLmNvbS9pbWFnZS5wbmc="
        );
    });
});

test("getFileReplacement: should handle remote src", (t) => {
    const url = "https://example.com/image.png";
    const settings = {};
    const expected =
        "data:image/png;base64,aHR0cHM6Ly9leGFtcGxlLmNvbS9pbWFnZS5wbmc=";

    getFileReplacement(url, settings, (err, result) => {
        assert.equal(err, null);
        assert.equal(result, expected);
    });
});

test("getFileReplacement: should handle valid data URL", (t) => {
    const dataUrl =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==";

    getFileReplacement(dataUrl, {}, (err, result) => {
        assert.equal(err, null);
        assert.equal(result, dataUrl);
    });
});

test("getFileReplacement: handle local file", (t) => {
    const url = "image.png";
    const settings = { relativeTo: "/local/path/" };
    const expected = "data:image/png;base64,L2xvY2FsL3BhdGgvaW1hZ2UucG5n";

    const wrapper = {
        readFile: (path, encoding, callback) => {
            const content = Buffer.from(path).toString("base64");
            callback(null, content);
        },
    };

    getFileReplacement(
        url,
        settings,
        (err, result) => {
            assert.equal(err, null);
            assert.equal(result, expected);
        },
        wrapper
    );
});
