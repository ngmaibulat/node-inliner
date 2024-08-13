import fs from "node:fs";
import * as htmlparser from "htmlparser2";

const args = {
    element: '<use xlink:href="assets/circle.svg#circle"></use>',
    src: "assets/circle.svg",
    attrs: undefined,
    limit: true,
    id: "circle",
};

let result = `
<!DOCTYPE html>
<html>
<head>
    <title>test</title>
</head>
<body>
    <svg><use xlink:href="assets/circle.svg#circle"></use></svg>
    <svg><use xlink:href="/assets/circle.svg#circle"></use></svg>
</body>
</html>
`;

function escapeSpecialChars(str) {
    return str.replace(/(\/|\.|\$|\^|\{|\[|\(|\||\)|\*|\+|\?|\\)/gm, "\\$1");
}

const handler = new htmlparser.DomHandler(
    function (err, dom) {
        if (err) {
            return callback(err);
        }

        var svg = htmlparser.DomUtils.getElements({ id: args.id }, dom);

        if (svg.length) {
            var use = htmlparser.DomUtils.getInnerHTML(svg[0]);
            // var use = htmlparser.DomUtils.textContent(svg[0]);

            //debug
            console.log("Use:");
            console.log(use);
            console.log("Args.element:");
            console.log(args.element);
            var re = new RegExp(escapeSpecialChars(args.element), "g");
            result = result.replace(re, () => use);
        }

        return;
    },
    { normalizeWhitespace: true }
);

const content = fs.readFileSync("content.svg", "utf8");

const parser = new htmlparser.Parser(handler, { xmlMode: true });
parser.write(content);

// parser.done();
parser.end();

console.log(result);
