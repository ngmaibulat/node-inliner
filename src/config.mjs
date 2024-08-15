export const defaults = {
    images: 8,
    svgs: 8,
    scripts: true,
    links: true,
    strict: false,
    relativeTo: "",
    rebaseRelativeTo: "",
    inlineAttribute: "data-inline",
    fileContent: "",
    requestResource: undefined,
    scriptTransform: undefined,
    linkTransform: undefined,
};

export const attrValueExpression = "(=[\"']([^\"']+?)[\"'])?";

export const urlRegexGI = /url\(\s?["']?([^)'"]+)["']?\s?\).*/gi;
