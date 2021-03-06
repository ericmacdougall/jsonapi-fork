"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai = require("chai");
const requestValidators = require("../../../../src/steps/http/validate-request");
const { expect } = chai;
describe("Request Validation functions", () => {
    describe("checkBodyExistence", () => {
        it("should return a promise", () => {
            const res = requestValidators.checkBodyExistence({}).catch(() => { });
            expect(res).to.be.instanceof(Promise);
        });
        it("should return a rejected promise if a POST request is missing a body", (done) => {
            const contextMock = { body: undefined, method: "post" };
            requestValidators.checkBodyExistence(contextMock).then(() => {
                done(new Error("This fulfillment handler shoudn't run"));
            }, () => { done(); });
        });
        it("should return a rejected promise if a PATCH request is missing a body", (done) => {
            const contextMock = { body: undefined, method: "patch" };
            requestValidators.checkBodyExistence(contextMock).then(() => {
                done(new Error("This fulfillment handler shoudn't run"));
            }, () => { done(); });
        });
        it("should return a rejected promise if a linkage DELETE request is missing a body", (done) => {
            const contextMock = {
                body: undefined,
                method: "delete",
                aboutRelationship: true,
                ext: []
            };
            requestValidators.checkBodyExistence(contextMock).then(() => {
                done(new Error("This fulfillment handler shoudn't run"));
            }, () => { done(); });
        });
        it("should return a rejected promise if an unexpected body is present", (done) => {
            const contextMock = { body: {}, method: "get" };
            requestValidators.checkBodyExistence(contextMock).then(() => {
                done(new Error("This fulfillment handler shoudn't run"));
            }, () => { done(); });
        });
        it("should resolve the promise successfully when expected body is present", (done) => {
            const contextMock = { body: {}, method: "patch" };
            requestValidators.checkBodyExistence(contextMock)
                .then(() => { done(); }, done);
        });
        it("should resolve the promise when body is expectedly absent", (done) => {
            const contextMock = { body: undefined, method: "get" };
            requestValidators.checkBodyExistence(contextMock)
                .then(() => { done(); }, done);
        });
    });
});
