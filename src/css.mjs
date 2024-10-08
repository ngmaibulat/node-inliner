"use strict";

import url from "url";
import path from "path";

import { defaults, urlRegexGI } from "./config.mjs";
import {
    escapeSpecialChars,
    isBase64Path,
    getFileReplacement,
    isRemotePath,
} from "./util.mjs";

function resolveRemotePath(src, rebaseRelativeTo) {
    return url.resolve(rebaseRelativeTo, src);
}

function resolveLocalPath(src, rebaseRelativeTo) {
    return path.join(rebaseRelativeTo, src).replace(/\\/g, "/");
}

function createUrlRegex(src) {
    const escapedSrc = escapeSpecialChars(src);
    return new RegExp(`url\\(\\s?[\"']?(${escapedSrc})[\"']?\\s?\\)`, "g");
}

function isContentTooBig(content, limit) {
    const KB_TO_B = 1024;
    return typeof limit === "number" && content.length > limit * KB_TO_B;
}

function replaceUrlInResult(result, src, datauriContent) {
    const newCss = `url("${datauriContent}")`;
    const urlRegex = createUrlRegex(src);
    return result.replace(urlRegex, () => newCss);
}

export function rebase(src, rebaseRelativeTo, result) {
    const isRemote = isRemotePath(src) || isRemotePath(rebaseRelativeTo);

    const targetPath = isRemote
        ? resolveRemotePath(src, rebaseRelativeTo)
        : resolveLocalPath(src, rebaseRelativeTo);

    return replaceUrlInResult(result, src, targetPath);
}

export async function replaceUrl(src, limit, css, settings) {
    return new Promise((resolve, reject) => {
        if (isBase64Path(src)) {
            return resolve(css); // Skip
        }

        getFileReplacement(src, settings, function (err, target) {
            if (err) {
                reject(err);
            }

            const tooBig = isContentTooBig(target, limit); //Skip as the content is too big

            if (tooBig) {
                resolve(css);
            }

            const ret = replaceUrlInResult(css, src, target);
            resolve(ret);
        });
    });
}

function createCommentRegex(attribute) {
    return new RegExp(`\\/\\*\\s?${attribute}\\s?\\*\\/`, "i");
}

function shouldSkipRebase(src) {
    return isRemotePath(src) || isBase64Path(src);
}

function rebaseUrls(css, rebaseRelativeTo) {
    const matches = css.matchAll(urlRegexGI);

    for (const match of matches) {
        const src = match[1];

        if (shouldSkipRebase(src)) {
            continue;
        }

        css = rebase(src, rebaseRelativeTo, css);
    }

    return css;
}

export async function processUrls(
    css,
    settings,
    inlineAttributeRegex,
    inlineAttributeIgnoreRegex
) {
    const regexMatches = css.matchAll(urlRegexGI);

    for (const found of regexMatches) {
        if (inlineAttributeIgnoreRegex.test(found)) {
            continue;
        }

        const needsProcessing =
            settings.images || inlineAttributeRegex.test(found);

        if (!needsProcessing) {
            continue;
        }

        const src = found[1];
        const limit = settings.images;

        await replaceUrl(src, limit, css, settings)
            .then((res) => {
                css = res;
            })
            .catch((err) => {
                throw new Error(err);
            });
    }
    return css;
}

export async function cssInline(settings) {
    let result = settings.fileContent;

    if (settings.rebaseRelativeTo) {
        result = rebaseUrls(result, settings.rebaseRelativeTo);
    }

    const attr = settings.inlineAttribute;
    const inlineAttributeRegex = createCommentRegex(attr);
    const inlineAttributeIgnoreRegex = createCommentRegex(`${attr}-ignore`);

    return processUrls(
        result,
        settings,
        inlineAttributeRegex,
        inlineAttributeIgnoreRegex
    );
}

export default async function (options, callback) {
    const settings = { ...defaults, ...options };

    try {
        const result = await cssInline(settings);
        return callback(null, result);
    } catch (err) {
        return callback(err, null);
    }
}
