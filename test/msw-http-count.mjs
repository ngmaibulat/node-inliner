import { test, before, after, afterEach, beforeEach } from "node:test";
import assert from "node:assert";

import { setupServer } from "msw/node";
import { http } from "msw";

import inline from "../src/inline.mjs";
import { baseUrl } from "../mocks/baseurl.mjs";

let count = 0;

beforeEach(() => {
    count = 0;
});

const handlers = [
    http.get(`*`, () => {
        count++;

        const resp = new Response(null, {
            status: 200,
            headers: {
                "X-Some-Header": "some-value",
            },
        });

        return resp;
    }),
];

test("http: should understand the spaces to the sides of = when parsing attributes", () => {
    const server = setupServer(...handlers);
    server.listen();

    const input = {
        fileContent:
            '<img src = "assets/icon.png">' +
            '<script src ="assets/export.js"></script>' +
            '<script src =\n"assets/export.js?foo=1"></script>' +
            '<link href=  "assets/simple.css" rel="stylesheet"/>',
        relativeTo: baseUrl,
        scripts: true,
        links: true,
        images: true,
    };

    inline.html(input, function () {
        assert.equal(count, 4);
    });

    server.close();
});

//find a different way to test this
//without using http mocking
//for example, passing escaped/unescape data to a callback function
//or, explicitly testing the function that unescapes the data!!!

// test("http: should unescape HTML entities when extracting URLs from attributes", () => {
//     fauxJax.on("request", function (request) {
//         assert(!/&\w+;/.test(request.url));
//     });

//     const input = {
//         fileContent:
//             "<img src=\"assets/icon.png?a=b&amp;c='d'\" /><img src=\"assets/icon.png?a=b&amp;c='d'&amp;&amp;\">",
//         relativeTo: baseUrl,
//         images: true,
//     };

//     inline.html(input, () => {});
// });
