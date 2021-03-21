"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const APIError_1 = require("../../../src/types/APIError");
describe("Error Objects", () => {
    describe("validation", () => {
        const er = new APIError_1.default({ status: 300 });
        it("should coerce the status to a string", () => {
            chai_1.expect(er.status === "300").to.be.true;
        });
    });
    describe("type uri/code", () => {
        it("should serialize typeUri in code (for now), ignoring any manually set code", () => {
            const er = new APIError_1.default({ typeUri: "http://example.com/", code: 300 });
            chai_1.expect(er.toJSON().code).to.equal("http://example.com/");
        });
    });
    describe("structure", () => {
        const er = new APIError_1.default({ status: 300 });
        it("should be an instanceof APIError", () => {
            chai_1.expect(er).to.be.instanceof(APIError_1.default);
        });
        it("should have status as an enumerable own property", () => {
            chai_1.expect(Object.keys(er)).to.include("status");
        });
    });
    describe("the fromError helper", () => {
        it("should pass APIError instances through as is", () => {
            const error = new APIError_1.default();
            chai_1.expect(APIError_1.default.fromError(error)).to.equal(error);
        });
        it('should set rawError on generated instances', () => {
            const x = new Error("test");
            chai_1.expect(APIError_1.default.fromError(x).rawError).to.equal(x);
        });
        it("should set status, title to generic vals on non-display-safe errors", () => {
            const er = APIError_1.default.fromError({
                "statusCode": 300,
                "title": "My Error"
            });
            chai_1.expect(er.status).to.eq("500");
            chai_1.expect(er.title).to.not.eq("My error");
        });
        it("should use the error's statusCode val as status iff status not defined", () => {
            const er = APIError_1.default.fromError({
                "statusCode": 300,
                [APIError_1.displaySafe]: true
            });
            const er2 = APIError_1.default.fromError({
                "status": 200,
                "statusCode": 300,
                [APIError_1.displaySafe]: true
            });
            chai_1.expect(er.status).to.equal("300");
            chai_1.expect(er2.status).to.equal("200");
        });
        it("should default to status 500", () => {
            chai_1.expect(APIError_1.default.fromError({}).status).to.equal("500");
        });
    });
});
