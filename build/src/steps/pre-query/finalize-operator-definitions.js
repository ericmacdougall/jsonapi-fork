"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const R = require("ramda");
const parse_query_params_1 = require("./parse-query-params");
exports.ASSUMED_BINARY_OPERATORS = ["eq", "neq", 'ne', "in", "nin", 'lt', 'gt', 'lte', 'gte'];
function finalizeOperatorConfig(assumedBinaryOps, operatorName, operatorConfig) {
    const { legalIn = ["filter"], arity = assumedBinaryOps.includes(operatorName) ? 2 : Infinity, finalizeArgs = finalizeFilterFieldExprArgs } = operatorConfig;
    return Object.assign({}, operatorConfig, { legalIn, arity, finalizeArgs });
}
exports.finalizeOperatorConfig = finalizeOperatorConfig;
exports.default = R.partial(finalizeOperatorConfig, [exports.ASSUMED_BINARY_OPERATORS]);
function finalizeFilterFieldExprArgs(conf, operator, args) {
    if (operator === 'and' || operator === 'or') {
        if (args.length === 0) {
            throw new Error(`The "${operator}" operator requires at least one argument.`);
        }
        if (!args.every(parse_query_params_1.isFieldExpression)) {
            throw new Error(`The "${operator}" operator expects its arguments to be field expressions.`);
        }
    }
    else if (conf[operator].arity === 2) {
        if (!parse_query_params_1.isId(args[0])) {
            throw new SyntaxError(`"${operator}" operator expects field reference as first argument.`);
        }
        try {
            assertNoIdentifiers(args[1]);
        }
        catch (e) {
            throw new SyntaxError(`Identifier not allowed in second argument to "${operator}" operator.`);
        }
    }
    else if (conf[operator].arity !== Infinity && args.length !== conf[operator].arity) {
        throw new SyntaxError(`"${operator}" operator expects exactly ${conf[operator].arity} arguments; got ${args.length}.`);
    }
    return args;
}
exports.finalizeFilterFieldExprArgs = finalizeFilterFieldExprArgs;
function assertNoIdentifiers(it) {
    if (Array.isArray(it)) {
        it.forEach(assertNoIdentifiers);
    }
    if (parse_query_params_1.isId(it)) {
        throw new Error("Identifier not allowed in this context.");
    }
}
