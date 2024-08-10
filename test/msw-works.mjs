import { test, before, after, afterEach, beforeEach } from "node:test";
import assert from "node:assert";
import { server } from "../mocks/node.mjs";

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
    const expected = 10;
    const actual = 10;
    assert.equal(actual, expected);

    const response = await fetch("https://example.com/user");
    const user = await response.json();

    assert.equal(user.firstName, "John");
    assert.equal(user.lastName, "Maverick");
    assert.equal(response.status, 200);
});
