"use strict";

import url from "url";
import path from "path";
import {
    defaults,
    escapeSpecialChars,
    isBase64Path,
    getFileReplacement,
    isRemotePath,
    handleReplaceErr,
} from "./util.mjs";

export default function (options, callback) {
    var settings = Object.assign({}, defaults, options);

    var replaceUrl = function (callback) {
        var args = this;

        if (isBase64Path(args.src)) {
            return callback(null); // Skip
        }

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
                typeof args.limit === "number" &&
                datauriContent.length > args.limit * 1000
            ) {
                return callback(null); // Skip
            }

            var css = 'url("' + datauriContent + '")';
            var re = new RegExp(
                "url\\(\\s?[\"']?(" +
                    escapeSpecialChars(args.src) +
                    ")[\"']?\\s?\\)",
                "g"
            );
            result = result.replace(re, () => css);

            return callback(null);
        });
    };

    var rebase = function (src) {
        var css =
            'url("' +
            (isRemotePath(src) || isRemotePath(settings.rebaseRelativeTo)
                ? url.resolve(settings.rebaseRelativeTo, src)
                : path
                      .join(settings.rebaseRelativeTo, src)
                      .replace(/\\/g, "/")) +
            '")';
        var re = new RegExp(
            "url\\(\\s?[\"']?(" + escapeSpecialChars(src) + ")[\"']?\\s?\\)",
            "g"
        );
        result = result.replace(re, () => css);
    };

    var result = settings.fileContent;
    var tasks = [];
    var found = null;

    var urlRegex = /url\(\s?["']?([^)'"]+)["']?\s?\).*/i;
    var index = 0;

    if (settings.rebaseRelativeTo) {
        var matches = {};
        var src;

        while ((found = urlRegex.exec(result.substring(index))) !== null) {
            src = found[1];
            matches[src] = true;
            index = found.index + index + 1;
        }

        for (src in matches) {
            if (!isRemotePath(src) && !isBase64Path(src)) {
                rebase(src);
            }
        }
    }

    var inlineAttributeCommentRegex = new RegExp(
        "\\/\\*\\s?" + settings.inlineAttribute + "\\s?\\*\\/",
        "i"
    );
    var inlineAttributeIgnoreCommentRegex = new RegExp(
        "\\/\\*\\s?" + settings.inlineAttribute + "-ignore\\s?\\*\\/",
        "i"
    );

    index = 0;
    while ((found = urlRegex.exec(result.substring(index))) !== null) {
        if (
            !inlineAttributeIgnoreCommentRegex.test(found[0]) &&
            (settings.images || inlineAttributeCommentRegex.test(found[0]))
        ) {
            tasks.push(
                replaceUrl.bind({
                    src: found[1],
                    limit: settings.images,
                })
            );
        }
        index = found.index + index + 1;
    }

    var promises = tasks.map(function (fn) {
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
