"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const chai_1 = require("chai");
const lib_1 = require("../../../../src/db-adapters/Mongoose/lib");
const APIError_1 = require("../../../../src/types/APIError");
const parse_query_params_1 = require("../../../../src/steps/pre-query/parse-query-params");
const Errors = require("../../../../src/util/errors");
describe("Mongoose Adapter private helper functions", () => {
    describe("errorHandler", () => {
        const validationSchema = new mongoose.Schema({
            "required": { required: true, type: String },
            "number": { type: Number },
            "customSetter": {
                type: Boolean,
                set(v) {
                    if (v === 4) {
                        throw new APIError_1.default({ typeUri: "made-up-for-test" });
                    }
                    else if (v === 5) {
                        throw new Error("Generic error");
                    }
                    else {
                        return v !== 0;
                    }
                }
            }
        });
        const TestModel = mongoose.model("ValidationTest", validationSchema);
        const testModelErrors = (doc, testFn) => {
            return new TestModel(doc).validate().then(() => {
                throw new Error("Should not run");
            }, (e) => {
                try {
                    lib_1.errorHandler(e);
                }
                catch (result) {
                    return testFn(result, e);
                }
            });
        };
        it("should return a special error for missing required fields", () => {
            return testModelErrors({}, (errors, rawError) => {
                const error = errors[0];
                const rawRequiredError = rawError.errors.required;
                chai_1.expect(error).to.be.an.instanceof(APIError_1.default);
                chai_1.expect(error).to.deep.equal(Errors.missingField({
                    detail: rawRequiredError.message,
                    rawError: rawRequiredError,
                    meta: { source: { field: "required" } }
                }));
            });
        });
        it("should return a field invalid error w/ mongoose's message for built-in errors", () => {
            return testModelErrors({
                required: "present",
                number: "String!"
            }, (errors, rawError) => {
                const error = errors[0];
                const rawCastError = rawError.errors.number;
                chai_1.expect(error).to.be.an.instanceof(APIError_1.default);
                chai_1.expect(error).to.deep.equal(Errors.invalidFieldValue({
                    detail: 'Cast to Number failed for value "String!" at path "number"',
                    rawError: rawCastError,
                    meta: { source: { field: "number" } }
                }));
            });
        });
        it("should use generic message, but error.reason as rawError, if user threw custom error", () => {
            return testModelErrors({
                required: "present",
                customSetter: 5
            }, (errors, rawError) => {
                const error = errors[0];
                const rawCastError = rawError.errors.customSetter;
                chai_1.expect(error).to.be.an.instanceof(APIError_1.default);
                chai_1.expect(error).to.deep.equal(Errors.invalidFieldValue({
                    detail: 'Invalid value for path "customSetter"',
                    rawError: rawCastError.reason,
                    meta: { source: { field: "customSetter" } }
                }));
            });
        });
        it("should use user-provided APIError if present, adding field source", () => {
            return testModelErrors({
                required: "present",
                customSetter: 4
            }, (errors, rawError) => {
                const error = errors[0];
                chai_1.expect(error).to.be.an.instanceof(APIError_1.default);
                chai_1.expect(error).to.deep.equal(new APIError_1.default({
                    typeUri: "made-up-for-test",
                    meta: { source: { field: "customSetter" } }
                }));
            });
        });
        it("should support multiple errors at once", () => {
            return testModelErrors({
                customSetter: 4
            }, (errors, rawError) => {
                chai_1.expect(errors.some((it) => it.typeUri === "https://jsonapi.js.org/errors/missing-required-field")).to.be.true;
                chai_1.expect(errors.some((it) => it.typeUri === "made-up-for-test")).to.be.true;
            });
        });
    });
    describe("toMongoCriteria", () => {
        describe("predicates", () => {
            it("should return empty objects for predicates with empty arguments", () => {
                const or = { type: "FieldExpression", args: [], operator: "or" };
                const and = { type: "FieldExpression", args: [], operator: "and" };
                chai_1.expect(lib_1.toMongoCriteria(or)).to.deep.equal({});
                chai_1.expect(lib_1.toMongoCriteria(and)).to.deep.equal({});
            });
        });
        it("should support multiple operators for the same field", () => {
            const testPredicate = parse_query_params_1.FieldExpression("and", [
                parse_query_params_1.FieldExpression("eq", [parse_query_params_1.Identifier("field"), "value"]),
                parse_query_params_1.FieldExpression("neq", [parse_query_params_1.Identifier("field"), "value"]),
                parse_query_params_1.FieldExpression("gte", [parse_query_params_1.Identifier("field"), "value"]),
                parse_query_params_1.FieldExpression("or", [
                    parse_query_params_1.FieldExpression("eq", [parse_query_params_1.Identifier("field"), "value2"]),
                    parse_query_params_1.FieldExpression("gte", [parse_query_params_1.Identifier("field3"), 1])
                ])
            ]);
            chai_1.expect(lib_1.toMongoCriteria(testPredicate)).to.deep.equal({
                $and: [
                    { field: "value" },
                    { field: { $ne: "value" } },
                    { field: { $gte: "value" } },
                    { $or: [{ field: "value2" }, { field3: { $gte: 1 } }] }
                ]
            });
        });
        it("should support multiple filters with the same operator + field", () => {
            chai_1.expect(lib_1.toMongoCriteria(parse_query_params_1.FieldExpression("and", [
                parse_query_params_1.FieldExpression("eq", [parse_query_params_1.Identifier("id2"), "23"]),
                parse_query_params_1.FieldExpression("in", [parse_query_params_1.Identifier("id2"), ["1", "2"]]),
                parse_query_params_1.FieldExpression("eq", [parse_query_params_1.Identifier("id2"), "33"])
            ]))).to.deep.equal({
                $and: [
                    { id2: "23" },
                    { id2: { $in: ["1", "2"] } },
                    { id2: "33" }
                ]
            });
        });
        it("should transform filters on id to filters on _id", () => {
            chai_1.expect(lib_1.toMongoCriteria({
                type: "FieldExpression",
                operator: "and",
                args: [parse_query_params_1.FieldExpression("eq", [parse_query_params_1.Identifier("id"), "33"])],
            })).to.deep.equal({
                $and: [
                    { _id: "33" }
                ]
            });
        });
        it("should support nested predicates", () => {
            const testPredicate = parse_query_params_1.FieldExpression("and", [
                parse_query_params_1.FieldExpression("eq", [parse_query_params_1.Identifier("field"), "value"]),
                parse_query_params_1.FieldExpression("or", [
                    parse_query_params_1.FieldExpression("and", [
                        parse_query_params_1.FieldExpression("eq", [parse_query_params_1.Identifier("field2"), "varlu2"]),
                    ]),
                    parse_query_params_1.FieldExpression("gte", [parse_query_params_1.Identifier("field3"), 1])
                ])
            ]);
            chai_1.expect(lib_1.toMongoCriteria(testPredicate)).to.deep.equal({
                $and: [
                    { field: "value" },
                    {
                        $or: [
                            { $and: [{ field2: "varlu2" }] },
                            { field3: { $gte: 1 } }
                        ]
                    }
                ]
            });
        });
    });
});
