"use strict";

import path from "path";
import url from "url";
import fs from "fs";
import colors from "ansi-colors";
import mime from "mime";
import validDataUrl from "valid-data-url";

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

/**
 * Escape special regex characters of a particular string
 *
 * @example
 * "http://www.test.com" --> "http:\/\/www\.test\.com"
 *
 * @param  {String} str - string to escape
 * @return {String} string with special characters escaped
 */
export function escapeSpecialChars(str) {
    return str.replace(/(\/|\.|\$|\^|\{|\[|\(|\||\)|\*|\+|\?|\\)/gm, "\\$1");
}

export function isRemotePath(url) {
    return /^'?https?:\/\/|^\/\//.test(url);
}

export function isBase64Path(url) {
    return /^'?data.*base64/.test(url);
}

export function getAttrs(tagMarkup, settings) {
    var tag = tagMarkup.match(/^<[^\W>]*/);
    if (tag) {
        tag = tag[0];
        var attrs = tagMarkup
            .replace(
                /(<[\s\S]*?(?=\>))([\s\S]*?(?=\<\/))(<\/[\w\W]>)?/gm,
                "$1>$3"
            )
            .replace(/^<[^\s>]*/, "")
            .replace(/\/?>/, "")
            .replace(/>?\s?<\/[^>]*>$/, "")
            .replace(
                new RegExp(
                    settings.inlineAttribute + "-ignore" + attrValueExpression,
                    "gi"
                ),
                ""
            )
            .replace(
                new RegExp(
                    settings.inlineAttribute + attrValueExpression,
                    "gi"
                ),
                ""
            );

        if (tag === "<script" || tag === "<img") {
            return attrs
                .replace(/(src|language|type)=["'][^"']*["']/gi, "")
                .trim();
        } else if (tag === "<link") {
            return attrs.replace(/(href|rel)=["'][^"']*["']/g, "").trim();
        }
    }
}

export function defaultRequestResource(requestOptions, callback) {
    const fetchOptions = {
        method: "GET",
        compress: requestOptions.gzip,
    };
    fetch(requestOptions.uri, fetchOptions)
        .then(function (response) {
            if (response.status !== 200) {
                throw new Error(
                    requestOptions.uri + " returned http " + response.status
                );
            }

            if (requestOptions.encoding === "binary") {
                return response.arrayBuffer().then(function (arrayBuffer) {
                    var b64 = Buffer.from(arrayBuffer).toString("base64");
                    var datauriContent =
                        "data:" +
                        response.headers.get("content-type") +
                        ";base64," +
                        b64;
                    return datauriContent;
                });
            } else {
                return response.text();
            }
        })
        .then(
            function (body) {
                callback(null, body);
            },
            function (err) {
                callback(err);
            }
        );
}

export function getRemote(uri, settings, callback, toDataUri) {
    if (/^\/\//.test(uri)) {
        uri = "https:" + uri;
    }

    var requestOptions = {
        uri: uri,
        encoding: toDataUri && "binary",
        gzip: true,
    };

    var requestResource = defaultRequestResource;
    if (typeof settings.requestResource === "function") {
        requestResource = settings.requestResource;
    }

    requestResource(requestOptions, callback);
}

export function getInlineFilePath(src, relativeTo) {
    src = src.replace(/^\//, "");
    return path.resolve(relativeTo, src).replace(/[\?#].*$/, "");
}

export function getInlineFileContents(src, relativeTo) {
    return fs.readFileSync(getInlineFilePath(src, relativeTo));
}

export function getTextReplacement(src, settings, callback) {
    if (isRemotePath(settings.relativeTo) || isRemotePath(src)) {
        getRemote(url.resolve(settings.relativeTo, src), settings, callback);
    } else if (isRemotePath(src)) {
        getRemote(src, settings, callback);
    } else {
        try {
            var replacement = getInlineFileContents(src, settings.relativeTo);
        } catch (err) {
            return callback(err);
        }
        return callback(null, replacement);
    }
}

export function getFileReplacement(src, settings, callback) {
    if (!src || srcIsCid(src)) {
        callback(null);
    } else if (isRemotePath(settings.relativeTo)) {
        getRemote(
            url.resolve(settings.relativeTo, src),
            settings,
            callback,
            true
        );
    } else if (isRemotePath(src)) {
        getRemote(src, settings, callback, true);
    } else if (validDataUrl(src)) {
        callback(null, src);
    } else {
        var fileName = getInlineFilePath(src, settings.relativeTo);
        var mimetype = mime.getType(fileName);
        fs.readFile(fileName, "base64", function (err, base64) {
            var datauri = `data:${mimetype};base64,${base64}`;
            callback(err, datauri);
        });
    }
}

export function srcIsCid(src) {
    return src.match(/^cid:/);
}

export function handleReplaceErr(err, src, strict, callback) {
    if (strict) {
        return callback(err);
    } else {
        console.warn(colors.yellow("Not found, skipping: " + src));
        return callback(null);
    }
}
