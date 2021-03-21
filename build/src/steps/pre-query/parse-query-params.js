"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const R = require("ramda");
const querystring_1 = require("@json-api/querystring");
const Errors = require("../../util/errors");
const json_api_1 = require("../../util/json-api");
exports.isFieldExpression = (it) => it && it.type === "FieldExpression";
exports.isId = (it) => it && it.type === "Identifier";
exports.FieldExpression = (operator, args) => ({ type: "FieldExpression", operator, args });
exports.Identifier = (value) => ({ type: "Identifier", value });
function default_1(params) {
    const paramsToParserFns = {
        include: R.partial(parseCommaSeparatedParamString, ["include"]),
        page: R.pipe(R.partial(parseScopedParam, ["page"]), R.mapObjIndexed((it, scopeName) => {
            const asNumber = parseInt(String(it), 10);
            if (String(asNumber) !== String(it)) {
                throw Errors.invalidQueryParamValue({
                    detail: "Expected a numeric integer value",
                    source: { parameter: `page[${scopeName}]` }
                });
            }
            return asNumber;
        })),
        fields: parseFieldsParam
    };
    return R.mapObjIndexed((v, paramName) => {
        return !R.has(paramName, paramsToParserFns)
            ? v
            : paramsToParserFns[paramName](v);
    }, params);
}
exports.default = default_1;
const isScopedParam = R.is(Object);
const isValidFieldName = R.allPass([
    (it) => !["id", "type"].includes(it),
    json_api_1.isValidMemberName
]);
function parseFieldsParam(fieldsParam) {
    if (!isScopedParam(fieldsParam))
        throw Errors.invalidQueryParamValue({
            source: { parameter: "fields" }
        });
    return R.mapObjIndexed(R.pipe(((v, k) => parseCommaSeparatedParamString(`fields[${k}]`, v)), R.filter(isValidFieldName)), fieldsParam);
}
function parseScopedParam(paramName, scopedParam) {
    if (!isScopedParam(scopedParam))
        throw Errors.invalidQueryParamValue({
            source: { parameter: paramName }
        });
    return scopedParam;
}
function parseCommaSeparatedParamString(paramName, encodedString) {
    if (typeof encodedString !== 'string')
        throw Errors.invalidQueryParamValue({
            detail: "Expected a comma-separated list of strings.",
            source: { parameter: paramName }
        });
    return encodedString.split(",").map(decodeURIComponent);
}
function parseSort(rawSortString, sortOperators) {
    return querystring_1.parseSort(sortOperators, rawSortString);
}
exports.parseSort = parseSort;
function parseFilter(rawFilterString, filterOperators) {
    if (!filterOperators.eq) {
        throw new Error("Must support eq operator on filters");
    }
    return querystring_1.parseFilter(filterOperators, rawFilterString);
}
exports.parseFilter = parseFilter;
