import { test, before, after, afterEach, beforeEach } from "node:test";
import assert from "node:assert";
import { server } from "../mocks/node.mjs";
const baseUrl = "https://localhost";

before(() => {
    server.listen();
});

after(() => {
    server.close();
});

afterEach(() => {
    server.resetHandlers();
});

test("example test", async () => {
    const response = await fetch(`${baseUrl}/user`);
    const user = await response.json();

    assert.equal(user.firstName, "John");
    assert.equal(user.lastName, "Maverick");
    assert.equal(response.status, 200);
});

test("simple test", async () => {
    const url = `${baseUrl}/200.html`;
    const response = await fetch(url);
    assert.equal(response.status, 200);
});

test("simple test", async (t) => {
    const url = `${baseUrl}/404.html`;
    const response = await fetch(url);
    assert.equal(response.status, 404);
});

test("fetch test", async (t) => {
    const url = `${baseUrl}/img.html`;
    const response = await fetch(url);
    assert.equal(response.status, 200);

    t.diagnostic(response.headers.get("X-Some-Header"));
    t.diagnostic(response.headers.get("Content-Type"));
});
