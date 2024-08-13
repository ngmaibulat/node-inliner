// import * as htmlparser2 from "htmlparser2";
// import { extractArticles } from "./functions.js";

import jsdom from "jsdom";

const url = "https://www.theregister.com/";

const res = await fetch(url);
const content = await res.text();

// const dom = htmlparser2.parseDocument(content);
// await extractArticles(dom);

// Create a new JSDOM instance
const dom = new jsdom.JSDOM(content);

// Get the document
const document = dom.window.document;

// Use querySelector to get all article tags
const articles = document.querySelectorAll("article");

// Print the number of articles found
console.log(`Found ${articles.length} article tags`);

// Print the content of each article
articles.forEach((article, index) => {
    console.log(`\nArticle ${index + 1}:`);
    console.log(article.textContent.trim());
    console.log(article.innerHTML);

    const links = article.querySelectorAll("a");
    console.log(`Links found in Article ${index + 1}:`);

    if (links.length === 0) {
        console.log("No links found in this article.");
        return;
    }

    links.forEach((link, linkIndex) => {
        console.log(`  Link ${linkIndex + 1}:`);
        console.log(`    Text: ${link.textContent}`);
        console.log(`    URL: ${link.href}`);
    });
});
