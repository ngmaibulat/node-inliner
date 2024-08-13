### Parsing

-   project uses regex like `const svgRegex = /<use\b[\s\S]+?\bxlink:href\s*=\s*("|')([\s\S]+?)#([^"'\s]*)("|')\s*\/?>(<\/\s*use>)?/gi;` to grab content of interest
-   should use html parser instead

### Replace

-   replace is one via Regex
-   should be done via html parser

### HTMLParser2 Usage

-   used `only` to parse SVG files
-   Looks like overkill, as any XML parser could be used

### Done

-   tests use node test runner
-   removed mocha from dev dependencies
-   using msw for http mocking
-   updating dependencies
