"use strict";

import path from "path";
import { DomHandler } from "domhandler";
import * as htmlparser from "htmlparser2";
import { htmlUnescape } from "escape-goat";

import { defaults, attrValueExpression } from "./config.mjs";
import css from "./css.mjs";

import {
    getAttrs,
    getTextReplacement,
    getFileReplacement,
    handleReplaceErr,
    escapeSpecialChars,
    isRemotePath,
} from "./util.mjs";

export default function (options, callback) {
    var settings = Object.assign({}, defaults, options);

    function replaceInlineAttribute(str) {
        const isBuffer = str instanceof Buffer;

        if (isBuffer) {
            str = str.toString("utf8");
        }

        return str
            .replace(
                new RegExp(
                    " " +
                        settings.inlineAttribute +
                        "-ignore" +
                        attrValueExpression,
                    "gi"
                ),
                ""
            )
            .replace(
                new RegExp(
                    " " + settings.inlineAttribute + attrValueExpression,
                    "gi"
                ),
                ""
            );
    }

    var replaceScript = function (callback) {
        var args = this;

        args.element = replaceInlineAttribute(args.element);

        getTextReplacement(args.src, settings, function (err, content) {
            if (err) {
                return handleReplaceErr(
                    err,
                    args.src,
                    settings.strict,
                    callback
                );
            }

            var onTransform = function (err, content) {
                if (err) {
                    return callback(err);
                }

                if (
                    !content ||
                    (typeof args.limit === "number" &&
                        content.length > args.limit * 1000)
                ) {
                    return callback(null);
                }
                var html = content.toString();
                html = html.replace(/<\/script>/gim, "<\\/script>");
                html =
                    "<script" +
                    (args.attrs ? " " + args.attrs : "") +
                    ">\n" +
                    html +
                    "\n</script>";
                var re = new RegExp(escapeSpecialChars(args.element), "g");
                result = result.replace(re, () => html);
                return callback(null);
            };

            if (options.scriptTransform) {
                return options.scriptTransform(content, onTransform);
            }
            onTransform(null, content);
        });
    };

    var replaceLink = function (callback) {
        var args = this;

        args.element = replaceInlineAttribute(args.element);

        getTextReplacement(args.src, settings, function (err, content) {
            if (err) {
                return handleReplaceErr(
                    err,
                    args.src,
                    settings.strict,
                    callback
                );
            }

            var onTransform = function (err, content) {
                if (err) {
                    return callback(err);
                }

                if (
                    !content ||
                    (typeof args.limit === "number" &&
                        content.length > args.limit * 1000)
                ) {
                    return callback(null);
                }

                var cssOptions = Object.assign({}, settings, {
                    fileContent: content.toString(),
                    rebaseRelativeTo:
                        isRemotePath(args.src) &&
                        !isRemotePath(settings.relativeTo)
                            ? args.src
                            : path.relative(
                                  settings.relativeTo,
                                  settings.rebaseRelativeTo ||
                                      path.join(
                                          settings.relativeTo,
                                          args.src,
                                          ".." + path.sep
                                      )
                              ),
                });

                css(cssOptions, function (err, content) {
                    if (err) {
                        return callback(err);
                    }
                    var html = content.toString();
                    html = html.replace(/<\/script>/gim, "<\\/script>");
                    html =
                        "<style" +
                        (args.attrs ? " " + args.attrs : "") +
                        ">\n" +
                        html.replace(/\/\*[\s]*--[\s]*>*/gm, "/* - ->") +
                        "\n</style>";
                    var re = new RegExp(escapeSpecialChars(args.element), "g");
                    result = result.replace(re, () => html);
                    return callback(null);
                });
            };

            if (options.linkTransform) {
                return options.linkTransform(content, onTransform);
            }
            onTransform(null, content);
        });
    };

    var replaceImg = function (callback) {
        var args = this;

        args.element = replaceInlineAttribute(args.element);

        getFileReplacement(args.src, settings, function (err, datauriContent) {
            if (err) {
                return handleReplaceErr(
                    err,
                    args.src,
                    settings.strict,
                    callback
                );
            }
            if (
                !datauriContent ||
                (typeof args.limit === "number" &&
                    datauriContent.length > args.limit * 1000)
            ) {
                return callback(null);
            }
            var html =
                "<img" +
                (args.attrs ? " " + args.attrs : "") +
                ' src="' +
                datauriContent +
                '" />';
            var re = new RegExp(escapeSpecialChars(args.element), "g");
            result = result.replace(re, () => html);
            return callback(null);
        });
    };

    const replaceSvg = function (callback) {
        const args = this;

        args.element = replaceInlineAttribute(args.element);

        getTextReplacement(args.src, settings, function (err, content) {
            if (err) {
                return handleReplaceErr(
                    err,
                    args.src,
                    settings.strict,
                    callback
                );
            }
            if (
                !content ||
                (typeof args.limit === "number" &&
                    content.length > args.limit * 1000)
            ) {
                return callback(null);
            }

            const trivialHandler = new DomHandler((err, dom) => {
                if (err) {
                    console.log("trivialHandler error");
                }

                console.log("trivialHandler");
                return callback(null);
            });

            const handler = new htmlparser.DomHandler(
                function (err, dom) {
                    if (err) {
                        return callback(err);
                    }

                    var svg = htmlparser.DomUtils.getElements(
                        { id: args.id },
                        dom
                    );

                    if (svg.length) {
                        var use = htmlparser.DomUtils.getInnerHTML(svg[0]);
                        // var use = htmlparser.DomUtils.textContent(svg[0]);

                        var re = new RegExp(
                            escapeSpecialChars(args.element),
                            "g"
                        );
                        result = result.replace(re, () => use);
                    }

                    return callback(null);
                },
                { normalizeWhitespace: true }
            );

            // const parser = new htmlparser.Parser(trivialHandler);
            const parser = new htmlparser.Parser(handler, {
                xmlMode: true,
            });

            parser.write(content.toString());
            parser.end();
        });
    };

    var result = settings.fileContent;
    var tasks = [];
    var found;

    var inlineAttributeRegex = new RegExp(settings.inlineAttribute, "i");
    var inlineAttributeIgnoreRegex = new RegExp(
        settings.inlineAttribute + "-ignore",
        "i"
    );
    var relStylesheetAttributeIgnoreRegex = new RegExp("stylesheet", "i");

    var scriptRegex =
        /<script\b[^>]+?\bsrc\s*=\s*("|')([\s\S]+?)\1[\s\S]*?>[\s\w\S]*?(?=<\/script>)<\/script>/gi;
    while ((found = scriptRegex.exec(result)) !== null) {
        if (
            !inlineAttributeIgnoreRegex.test(found[0]) &&
            (settings.scripts || inlineAttributeRegex.test(found[0]))
        ) {
            var src = htmlUnescape(found[2]).trim();
            if (src && src.indexOf("#") !== 0) {
                tasks.push(
                    replaceScript.bind({
                        element: found[0],
                        src: src,
                        attrs: getAttrs(found[0], settings),
                        limit: settings.scripts,
                    })
                );
            }
        }
    }

    var linkRegex = /<link\b[\s\S]+?\bhref\s*=\s*("|')([\s\S]*?)\1[\s\S]*?>/gm;
    while ((found = linkRegex.exec(result)) !== null) {
        if (
            !inlineAttributeIgnoreRegex.test(found[0]) &&
            relStylesheetAttributeIgnoreRegex.test(found[0]) &&
            (settings.links || inlineAttributeRegex.test(found[0]))
        ) {
            var src = htmlUnescape(found[2]).trim();
            if (src && src.indexOf("#") !== 0) {
                tasks.push(
                    replaceLink.bind({
                        element: found[0],
                        src: src,
                        attrs: getAttrs(found[0], settings),
                        limit: settings.links,
                    })
                );
            }
        }
    }

    var imgRegex = /<img\b[\s\S]+?\bsrc\s*=\s*("|')([\s\S]*?)\1[\s\S]*?>/gm;
    while ((found = imgRegex.exec(result)) !== null) {
        if (
            !inlineAttributeIgnoreRegex.test(found[0]) &&
            (settings.images || inlineAttributeRegex.test(found[0]))
        ) {
            var src = htmlUnescape(found[2]).trim();
            if (src && src.indexOf("#") !== 0) {
                tasks.push(
                    replaceImg.bind({
                        element: found[0],
                        src: src,
                        attrs: getAttrs(found[0], settings),
                        limit: settings.images,
                    })
                );
            }
        }
    }

    const svgRegex =
        /<use\b[\s\S]+?\bxlink:href\s*=\s*("|')([\s\S]+?)#([^"'\s]*)("|')\s*\/?>(<\/\s*use>)?/gi;
    while ((found = svgRegex.exec(result)) !== null) {
        if (
            !inlineAttributeIgnoreRegex.test(found[0]) &&
            (settings.svgs || inlineAttributeRegex.test(found[0]))
        ) {
            const context = {
                element: found[0],
                src: htmlUnescape(found[2]).trim(),
                attrs: getAttrs(found[0], settings),
                limit: settings.svgs,
                id: htmlUnescape(found[3]).trim(),
            };

            tasks.push(replaceSvg.bind(context));
        }
    }

    result = replaceInlineAttribute(result);

    const promises = tasks.map(function (fn) {
        return new Promise(function (resolve, reject) {
            fn(function (error) {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    });

    Promise.all(promises).then(
        function () {
            callback(null, result);
        },
        function (error) {
            callback(error, result);
        }
    );
}
