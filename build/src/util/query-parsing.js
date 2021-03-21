"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const R = require("ramda");
const Maybe_1 = require("../types/Generic/Maybe");
exports.Just = Maybe_1.Just;
exports.Nothing = Maybe_1.Nothing;
exports.getQueryParamValue = R.curry((paramName, queryString) => {
    return Maybe_1.default(queryString).map(it => it.split("&").reduce((acc, paramString) => {
        const [rawKey, rawValue] = splitSingleQueryParamString(paramString);
        return rawKey === paramName ? rawValue : acc;
    }, undefined));
});
function splitSingleQueryParamString(paramString) {
    const bracketEqualsPos = paramString.indexOf("]=");
    const delimiterPos = bracketEqualsPos === -1 ? paramString.indexOf("=") : bracketEqualsPos + 1;
    return delimiterPos === -1
        ? [paramString, ""]
        : [paramString.slice(0, delimiterPos), paramString.slice(delimiterPos + 1)];
}
