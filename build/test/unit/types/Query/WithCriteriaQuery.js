"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const parse_query_params_1 = require("../../../../src/steps/pre-query/parse-query-params");
const WithCriteriaQuery_1 = require("../../../../src/types/Query/WithCriteriaQuery");
describe("WithCriteriaQuery", () => {
    const returning = (it) => it;
    const getIdFilters = (q) => q.getFilters().args.filter(it => it.args[0].value === "id");
    const queries = [
        new WithCriteriaQuery_1.default({ type: "any", returning, isSingular: true }),
        new WithCriteriaQuery_1.default({ type: "any", id: "23", returning }),
        new WithCriteriaQuery_1.default({ type: "any", ids: ["23", "43"], returning })
    ];
    describe("matchingIdOrIds", () => {
        describe("matching single id", () => {
            const resultQueries = queries.map(q => q.matchingIdOrIds("33"));
            it("should add an id filter, not removing any that already exist", () => {
                const resultIdFilters = resultQueries.map(getIdFilters);
                const addedFilter = { type: "FieldExpression", args: [parse_query_params_1.Identifier("id"), "33"], operator: "eq" };
                chai_1.expect(resultIdFilters).to.deep.equal([
                    [addedFilter],
                    [{ type: "FieldExpression", args: [parse_query_params_1.Identifier("id"), "23"], operator: "eq" }, addedFilter],
                    [{ type: "FieldExpression", args: [parse_query_params_1.Identifier("id"), ["23", "43"]], operator: "in" }, addedFilter]
                ]);
            });
            it("should set the query singular", () => {
                chai_1.expect(resultQueries.every(it => it.isSingular === true)).to.be.true;
            });
        });
        describe("matching multiple ids", () => {
            const resultQueries = queries.map(q => q.matchingIdOrIds(["33", "45"]));
            it("should add an id filter, not removing any that already exist", () => {
                const resultIdFilters = resultQueries.map(getIdFilters);
                const addedFilter = {
                    type: "FieldExpression",
                    args: [parse_query_params_1.Identifier("id"), ["33", "45"]],
                    operator: "in"
                };
                chai_1.expect(resultIdFilters).to.deep.equal([
                    [addedFilter],
                    [{ type: "FieldExpression", args: [parse_query_params_1.Identifier("id"), "23"], operator: "eq" }, addedFilter],
                    [{ type: "FieldExpression", args: [parse_query_params_1.Identifier("id"), ["23", "43"]], operator: "in" }, addedFilter]
                ]);
            });
            it("should leave the singularity as is", () => {
                chai_1.expect(resultQueries.map(it => it.isSingular)).to.deep.equal([true, true, false]);
            });
        });
        describe("matching undefined", () => {
            it('should be a noop', () => {
                chai_1.expect(queries.map(it => it.matchingIdOrIds(undefined))).to.deep.equal(queries);
            });
        });
    });
});
