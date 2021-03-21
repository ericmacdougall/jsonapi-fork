"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pluralize = require("pluralize");
function getModelName(typeName, singularizer = pluralize.singular.bind(pluralize)) {
    const words = typeName.split("-");
    words[words.length - 1] = singularizer(words[words.length - 1]);
    return words.map((it) => it.charAt(0).toUpperCase() + it.slice(1)).join("");
}
exports.getModelName = getModelName;
function getTypeName(modelName, pluralizer = pluralize.plural.bind(pluralize)) {
    return pluralizer(modelName
        .replace(/([A-Z])/g, "-$1")
        .slice(1)
        .toLowerCase());
}
exports.getTypeName = getTypeName;
