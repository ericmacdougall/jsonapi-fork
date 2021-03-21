"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const agent_1 = require("../../app/agent");
describe("HTTP Compliance", () => {
    let Agent;
    before(() => {
        return agent_1.default.then(A => { Agent = A; });
    });
    it("should reject PUT with a PUT-specific message", () => {
        return Agent.request("PUT", "/organizations").then((res) => {
            throw new Error("Shouldn't run since response should be an error");
        }, (err) => {
            chai_1.expect(err.response.status).to.equal(405);
            chai_1.expect(err.response.body.errors[0].detail).to.match(/PUT.+jsonapi\.org/i);
        });
    });
    it("should reject other unknown methods too", () => {
        return Agent.request("LOCK", "/organizations").then(() => {
            throw new Error("Shouldn't run since response should be an error");
        }, (err) => {
            chai_1.expect(err.response.status).to.equal(405);
            chai_1.expect(err.response.body.errors[0].detail).to.match(/lock/i);
        });
    });
    it("should reject requests with a body but no content-type", () => {
        return Agent
            .request("DELETE", "/organizations/59af14d3bbd18cd55ea08ea3/relationships/liaisons")
            .send({ data: [] })
            .then((it) => {
            throw new Error("Should not run");
        }, (err) => {
            chai_1.expect(err.status).to.equal(415);
        });
    });
});
