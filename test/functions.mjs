import fs from "node:fs";

function normalize(contents) {
    return process.platform === "win32"
        ? contents.replace(/\r\n/g, "\n")
        : contents;
}

function readFile(file) {
    return normalize(fs.readFileSync(file, "utf8"));
}

function diff(actual, expected) {
    if (actual === expected) {
        return;
    }

    actual = actual.split("\n");
    expected = expected.split("\n");

    expected.forEach(function (line, i) {
        if (!line.length && i === expected.length - 1) {
            return;
        }
        var other = actual[i];
        if (line === other) {
            console.error("%d| %j", i + 1, line);
        } else {
            console.error("%d| %j%s | %j", i + 1, line, "", other);
        }
    });
}

function testEquality(err, result, expected, done) {
    result = normalize(result);
    diff(result, expected);
    assert(!err);
    assert.equal(result, expected);
    done();
}

function add(a, b) {
    return a + b;
}

export { normalize, readFile, diff, testEquality, add };
