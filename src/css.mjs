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

const urlRegexGI = /url\(\s?["']?([^)'"]+)["']?\s?\).*/gi;

const KB_TO_B = 1024;

export function rebase(src, rebaseRelativeTo, result) {
    const css =
        'url("' +
        (isRemotePath(src) || isRemotePath(rebaseRelativeTo)
            ? url.resolve(rebaseRelativeTo, src)
            : path.join(rebaseRelativeTo, src).replace(/\\/g, "/")) +
        '")';
    const re = new RegExp(
        "url\\(\\s?[\"']?(" + escapeSpecialChars(src) + ")[\"']?\\s?\\)",
        "g"
    );
    return result.replace(re, () => css);
}

export async function replaceUrl(args, settings) {
    return new Promise((resolve, reject) => {
        if (isBase64Path(args.src)) {
            return resolve(args.result); // Skip
        }

        getFileReplacement(args.src, settings, function (err, datauriContent) {
            if (err) {
                reject(err);
            }

            const tooBig =
                typeof args.limit === "number" &&
                datauriContent.length > args.limit * KB_TO_B;

            if (tooBig) {
                resolve(args.result);
            }

            const css = 'url("' + datauriContent + '")';

            const re = new RegExp(
                "url\\(\\s?[\"']?(" +
                    escapeSpecialChars(args.src) +
                    ")[\"']?\\s?\\)",
                "g"
            );

            resolve(args.result.replace(re, () => css));
        });
    });
}

export async function cssInline(settings, callback) {
    let result = settings.fileContent;

    const inlineAttributeCommentRegex = new RegExp(
        "\\/\\*\\s?" + settings.inlineAttribute + "\\s?\\*\\/",
        "i"
    );
    const inlineAttributeIgnoreCommentRegex = new RegExp(
        "\\/\\*\\s?" + settings.inlineAttribute + "-ignore\\s?\\*\\/",
        "i"
    );

    if (settings.rebaseRelativeTo) {
        const matches = result.matchAll(urlRegexGI);

        for (const match of matches) {
            const src = match[1];

            if (isRemotePath(src)) {
                continue;
            }

            if (isBase64Path(src)) {
                continue;
            }

            result = rebase(src, settings.rebaseRelativeTo, result);
        }
    }

    const regexMatches = result.matchAll(urlRegexGI);

    for (const found of regexMatches) {
        if (inlineAttributeIgnoreCommentRegex.test(found)) {
            continue;
        }

        const needsProcessing =
            settings.images || inlineAttributeCommentRegex.test(found);

        if (!needsProcessing) {
            continue;
        }

        const src = found[1];
        const limit = settings.images;

        const args = {
            src,
            limit,
            result,
        };

        await replaceUrl(args, settings)
            .then((res) => {
                // console.log("done");
                result = res;
            })
            .catch((err) => {
                handleReplaceErr(err, src, settings.strict, callback);
            });
    }
}

export default async function (options, callback) {
    const settings = { ...defaults, ...options };
    return cssInline(settings, callback);
}
