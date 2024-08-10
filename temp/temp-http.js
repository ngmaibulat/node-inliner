describe("(http mocking)", function () {
    const baseUrl = "http://example.com/";

    beforeEach(function () {
        fauxJax.install();
        fauxJax.on("request", function (request) {
            assert.equal(request.requestURL.indexOf(baseUrl), 0);
            var relativePath = request.requestURL
                .slice(baseUrl.length)
                .replace(/\?.*/, "");
            var headers = {
                "Content-Type":
                    mime.contentType(path.extname(relativePath)) ||
                    "application/octet-stream",
            };
            var content = fs.readFileSync("cases/" + relativePath);
            request.respond(200, headers, content);
        });
    });

    afterEach(function () {
        fauxJax.restore();
    });

    it("should not try to inline a link that starts with #", function (done) {
        const content =
            '<link href="#" rel="stylesheet" /><link href="#aaa" rel="stylesheet" />' +
            '<img src="#" /><img src="#aaa" />' +
            '<a href="#" /><a href="#aaa" />';

        inline.html(
            {
                fileContent: content,
                strict: true,
            },
            function (err, result) {
                testEquality(err, result, content, done);
            }
        );
    });

    it("should use the base url (relativeTo) to resolve image URLs", function (done) {
        var expected = readFile("test/cases/img_out.html");
        inline.html(
            {
                fileContent: readFile("test/cases/img.html"),
                relativeTo: baseUrl,
                images: true,
            },
            function (err, result) {
                testEquality(err, result, expected, done);
            }
        );
    });

    it("should unescape HTML entities when extracting URLs from attributes", function (done) {
        fauxJax.on("request", function (request) {
            assert(!/&\w+;/.test(request.url));
        });
        inline.html(
            {
                fileContent:
                    "<img src=\"assets/icon.png?a=b&amp;c='d'\" /><img src=\"assets/icon.png?a=b&amp;c='d'&amp;&amp;\">",
                relativeTo: baseUrl,
                images: true,
            },
            done
        );
    });

    it("should understand the spaces to the sides of = when parsing attributes", function (done) {
        var count = 0;
        fauxJax.on("request", function (request) {
            count++;
        });
        inline.html(
            {
                fileContent:
                    '<img src = "assets/icon.png">' +
                    '<script src ="assets/export.js"></script>' +
                    '<script src =\n"assets/export.js?foo=1"></script>' +
                    '<link href=  "assets/simple.css" rel="stylesheet"/>',
                relativeTo: baseUrl,
                scripts: true,
                links: true,
                images: true,
            },
            function () {
                assert.equal(count, 4);
                done();
            }
        );
    });

    it("should apply the requestResource option", function (done) {
        var uris = [];
        inline.html(
            {
                fileContent:
                    '<img src="assets/icon.png"><img src="assets/icon.png?a=1">',
                relativeTo: baseUrl,
                scripts: true,
                links: true,
                images: true,
                requestResource: function (options, callback) {
                    uris.push(options.uri);
                    callback(null, "image");
                },
            },
            function () {
                assert.equal(uris.length, 2);
                assert.equal(uris[0], "http://example.com/assets/icon.png");
                assert.equal(uris[1], "http://example.com/assets/icon.png?a=1");
                done();
            }
        );
    });
});
