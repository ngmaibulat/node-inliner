import fs from "node:fs";
import jsdom from "jsdom";

// Function to extract SVGs from HTML
function extractSVGs(html) {
    const dom = new jsdom.JSDOM(html);
    const document = dom.window.document;

    // Select all SVG elements
    const svgs = document.querySelectorAll("svg");

    // Convert NodeList to Array and map to outerHTML
    return Array.from(svgs);
}

// Read HTML file
fs.readFile("index.html", "utf8", (err, html) => {
    if (err) {
        console.error("Error reading file:", err);
        return;
    }

    // Extract SVGs
    const extractedSVGs = extractSVGs(html);

    // Log results
    console.log(`Found ${extractedSVGs.length} SVG elements:`);
    extractedSVGs.forEach((svg, index) => {
        const html = svg.outerHTML;
        console.log(`\nSVG ${index + 1}:`);
        console.log(html);

        const useTags = svg.querySelectorAll("use");
        const arr = Array.from(useTags);
        console.log(arr);
    });
});
