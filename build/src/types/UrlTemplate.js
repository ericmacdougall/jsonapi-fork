"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const templating = require("url-template");
exports.RFC6570String = Symbol('RFC6570String');
function fromRFC6570(template) {
    const fn = templating.parse(template).expand;
    fn[exports.RFC6570String] = template;
    return fn;
}
exports.fromRFC6570 = fromRFC6570;
function fromUrl(url) {
    return () => url;
}
exports.fromUrl = fromUrl;
