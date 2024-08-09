/*
 * html-resource-inline
 * https://github.com/jrit/html-resource-inline
 *
 * Copyright (c) 2015 Jarrett Widman
 * Based on https://github.com/chyingp/grunt-inline
 */

"use strict";

var inline = {};

module.exports = inline;

inline.html = require("./html");
inline.css = require("./css");

// Use ESM
// import html from "./html";
// import css from "./css";

// const inline = {};

// inline.html = html;
// inline.css = css;

// export default inline;
