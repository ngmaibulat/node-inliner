import { findAll } from "domutils";

export async function extractArticles(dom) {
    // Select all article tags
    // const articles = selectAll("article", dom);

    const articles = findAll(
        (elem) => elem.name === "article",
        dom.children,
        true
    );

    console.log(`Found ${articles.length} article tags`);

    // Example: Print the text content of each article
    articles.forEach((article, index) => {
        // const articleText =
        // console.log(`Article ${index + 1}:`);
        // console.log(articleText.substring(0, 100) + "...\n"); // Print first 100 characters
    });
}
