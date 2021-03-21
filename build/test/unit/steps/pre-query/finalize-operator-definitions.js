"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const finalize_operator_definitions_1 = require("../../../../src/steps/pre-query/finalize-operator-definitions");
const parse_query_params_1 = require("../../../../src/steps/pre-query/parse-query-params");
const dummyConfig = {
    or: { arity: Infinity, finalizeArgs: finalize_operator_definitions_1.finalizeFilterFieldExprArgs },
    and: { arity: Infinity, finalizeArgs: finalize_operator_definitions_1.finalizeFilterFieldExprArgs },
    binary: { arity: 2, finalizeArgs: finalize_operator_definitions_1.finalizeFilterFieldExprArgs },
    nary: { arity: Infinity, finalizeArgs: finalize_operator_definitions_1.finalizeFilterFieldExprArgs },
    trinary: { arity: 3, finalizeArgs: finalize_operator_definitions_1.finalizeFilterFieldExprArgs }
};
describe("finalizeFilterFieldExprArgs", () => {
    describe("`and` or `or` expressions", () => {
        it("Should require the expression have >0 arguments", () => {
            chai_1.expect(() => finalize_operator_definitions_1.finalizeFilterFieldExprArgs(dummyConfig, "and", [])).to.throw(/"and".+requires at least one argument/);
            chai_1.expect(() => finalize_operator_definitions_1.finalizeFilterFieldExprArgs(dummyConfig, "or", [])).to.throw(/"or".+requires at least one argument/);
        });
        it("should require every argument to be a (potentially invalid) field exp", () => {
            chai_1.expect(() => finalize_operator_definitions_1.finalizeFilterFieldExprArgs(dummyConfig, "and", [{}])).to.throw(/"and".+arguments to be field expressions/);
            chai_1.expect(() => finalize_operator_definitions_1.finalizeFilterFieldExprArgs(dummyConfig, "or", [4])).to.throw(/"or".+arguments to be field expressions/);
            const invalidExp = parse_query_params_1.FieldExpression("binary", []);
            chai_1.expect(finalize_operator_definitions_1.finalizeFilterFieldExprArgs(dummyConfig, "and", [invalidExp])).to.deep.equal([invalidExp]);
            const validArgs = [parse_query_params_1.FieldExpression("nary", [])];
            chai_1.expect(finalize_operator_definitions_1.finalizeFilterFieldExprArgs(dummyConfig, "and", validArgs)).to.deep.equal(validArgs);
        });
    });
    describe("binary operators", () => {
        it("should require args[0] to be an Identifier for binary operators", () => {
            const validArgs = [parse_query_params_1.Identifier("test"), 3];
            chai_1.expect(finalize_operator_definitions_1.finalizeFilterFieldExprArgs(dummyConfig, "binary", validArgs)).to.deep.equal(validArgs);
            chai_1.expect(() => finalize_operator_definitions_1.finalizeFilterFieldExprArgs(dummyConfig, "binary", [4, 3])).to.throw(/expects field reference/);
        });
        it("should recursively prohibit identifiers in args[1]", () => {
            const invalidArgs = [
                [parse_query_params_1.Identifier("test"), parse_query_params_1.Identifier("test")],
                [parse_query_params_1.Identifier("test"), [parse_query_params_1.Identifier("test")]],
                [parse_query_params_1.Identifier("test"), [4, parse_query_params_1.Identifier("test")]]
            ];
            invalidArgs.forEach(invalidArgSet => {
                chai_1.expect(() => finalize_operator_definitions_1.finalizeFilterFieldExprArgs(dummyConfig, "binary", invalidArgSet))
                    .to.throw(/identifier not allowed in second argument/i);
            });
        });
    });
    describe("fixed arity operators", () => {
        it("should validate their arity", () => {
            const invalidArgs = [parse_query_params_1.Identifier("test"), 3];
            const validArgs = [3, parse_query_params_1.Identifier("test"), 3];
            chai_1.expect(() => finalize_operator_definitions_1.finalizeFilterFieldExprArgs(dummyConfig, "trinary", invalidArgs)).to.throw(/exactly 3 arguments/);
            chai_1.expect(finalize_operator_definitions_1.finalizeFilterFieldExprArgs(dummyConfig, "trinary", validArgs)).to.deep.equal(validArgs);
        });
    });
});
