"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const agent_1 = require("../../app/agent");
const creation_1 = require("../fixtures/creation");
const ResourceTypeRegistry_1 = require("../../../src/ResourceTypeRegistry");
const API_1 = require("../../../src/controllers/API");
const Express_1 = require("../../../src/http-strategies/Express");
describe("Express Strategy", () => {
    let Agent;
    before(() => {
        return agent_1.default.then(A => { Agent = A; });
    });
    describe("configuration", () => {
        const registry = new ResourceTypeRegistry_1.default({});
        const api = new API_1.default(registry);
        it("does not require a documentation controller", () => {
            chai_1.expect(() => new Express_1.default(api)).to.not.throw();
        });
        it("throws if you attempt to get a docs request handler if no docs controller was provided", () => {
            const express = new Express_1.default(api);
            chai_1.expect(() => express.docsRequest).to.throw(/^Cannot get docs request handler/);
        });
    });
    describe("body parsing", () => {
        it("should work with pre-parsed bodies", () => {
            const urls = [
                "/parsed/text/organizations",
                "/parsed/raw/organizations",
                "/parsed/json/organizations"
            ];
            return Promise.all(urls.map(url => Agent.request("POST", url)
                .type("application/vnd.api+json")
                .send({ data: creation_1.VALID_ORG_RESOURCE_NO_ID })
                .then(resp => {
                chai_1.expect(resp.status).to.equal(201);
            })));
        });
    });
    describe("building the request object", () => {
        it("should properly detect the incoming url on mounted sub apps", () => {
            return Agent.request("GET", '/subapp/people').then(resp => {
                chai_1.expect(resp.body.links.self).to.equal('http://127.0.0.1:3000/subapp/people');
            });
        });
    });
});
