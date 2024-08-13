import fs from "node:fs";
import * as htmlparser from "htmlparser2";
import { find, findOne, findAll, getInnerHTML } from "domutils";

// find all svg
// for each svg - find all use elements
// for each use element - find the xlink:href attribute

// parse the target svg file - grab svgContent
// replace the use element with the svgContent

// Also
// Handle img tags with svg src

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
        // const svg = htmlparser.DomUtils.getElements({ id: args.id }, dom);
        // const svg = htmlparser.DomUtils.getElements({ id: "circle" }, dom);

        const svg = findOne((elem) => elem.name === "svg", dom);

        if (!svg) {
            return;
        }

        const svgContent = getInnerHTML(svg);
        const re = new RegExp(escapeSpecialChars(args.element), "g");

        result = result.replace(re, () => svgContent);

        return;
    },
    { normalizeWhitespace: true }
);

const parser = new htmlparser.Parser(handler, { xmlMode: true });
const content = fs.readFileSync("content.svg", "utf8");
parser.write(content);

parser.end();

console.log(result);
