"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const agent_1 = require("../../app/agent");
const creation_1 = require("../fixtures/creation");
describe("Creating Resources", () => {
    let Agent;
    before(() => {
        return agent_1.default.then((A) => { Agent = A; });
    });
    describe("Creating a Valid Resource (With an Extra Member)", () => {
        let createdResource, res;
        before(() => {
            return Agent.request("POST", "/organizations")
                .type("application/vnd.api+json")
                .send({ "data": creation_1.VALID_ORG_RESOURCE_NO_ID_EXTRA_MEMBER, "extra": false })
                .then((response) => {
                res = response;
                createdResource = res.body.data;
            }, (e) => {
                console.log(e, e.response.body);
            });
        });
        describe("HTTP", () => {
            it("should return 201", () => {
                chai_1.expect(res.status).to.equal(201);
            });
            it("should include a valid Location header", () => {
                chai_1.expect(res.headers.location).to.match(/\/organizations\/[a-z0-9]+/);
                chai_1.expect(createdResource.links.self).to.equal(res.headers.location);
            });
        });
        describe("Document Structure", () => {
            it("should have an object/document at the top level", () => {
                chai_1.expect(res.body).to.be.an("object");
            });
            it("should ignore extra document object members", () => {
                chai_1.expect(res.status).to.be.within(200, 299);
                chai_1.expect(res.body.extra).to.be.undefined;
            });
        });
        describe("Links", () => {
            it("should have a top-level self link", () => {
                chai_1.expect(res.body.links.self).to.match(/\/organizations$/);
            });
        });
        describe("Transforms", () => {
            describe("beforeSave", () => {
                it("should execute beforeSave hook", () => {
                    chai_1.expect(createdResource.attributes.description).to.equal("Added a description in beforeSave");
                    chai_1.expect(createdResource.attributes.modified).to.equal("2015-01-01T00:00:00.000Z");
                });
            });
        });
        describe("The Created Resource", () => {
            it("should be returned in the body", () => {
                chai_1.expect(createdResource).to.be.an("object");
                chai_1.expect(createdResource.type).to.equal("organizations");
                chai_1.expect(createdResource.attributes).to.be.an("object");
                chai_1.expect(createdResource.relationships).to.be.an("object");
                chai_1.expect(createdResource.relationships.liaisons).to.be.an("object");
            });
            it("should ignore extra resource object members", () => {
                chai_1.expect(res.body.data.extraMember).to.be.undefined;
                chai_1.expect(res.body.data.attributes.extraMember).to.be.undefined;
            });
        });
    });
    describe("Creating a Resource With A Client-Id", () => {
        const errs = [];
        const clientIdObjects = [
            creation_1.ORG_RESOURCE_CLIENT_ID,
            creation_1.ORG_RESOURCE_FALSEY_CLIENT_ID,
            creation_1.ORG_RESOURCE_FALSEY_CLIENT_ID_2
        ];
        before(() => {
            return Promise.all(clientIdObjects.map(data => {
                return Agent.request("POST", "/organizations")
                    .type("application/vnd.api+json")
                    .send({ data })
                    .then((resp) => { throw new Error("Should not run"); }, (error) => { errs.push(error); });
            }));
        });
        describe("HTTP", () => {
            it("should return 403", () => {
                chai_1.expect(errs.every(it => it.response.status === 403)).to.be.true;
            });
        });
        describe("Document Structure", () => {
            it("should contain an error", () => {
                chai_1.expect(errs.every(it => Array.isArray(it.response.body.errors))).to.be.true;
            });
        });
    });
    describe("Creating a Resource With a Missing Relationship Data Key", () => {
        let err;
        before(() => {
            return Agent.request("POST", "/organizations")
                .type("application/vnd.api+json")
                .send({ data: creation_1.INVALID_ORG_RESOURCE_NO_DATA_IN_RELATIONSHIP })
                .promise()
                .then(() => {
                throw new Error("Should not run!");
            }, (error) => {
                err = error;
            });
        });
        describe("HTTP", () => {
            it("should return 400", () => {
                chai_1.expect(err.response.status).to.equal(400);
            });
        });
        describe("Document Structure", () => {
            it("should contain an error", () => {
                chai_1.expect(err.response.body.errors).to.be.an("array");
            });
        });
        describe("The error", () => {
            it("should have the correct information", () => {
                chai_1.expect(err.response.body.errors[0].code).to.be.equal("https://jsonapi.js.org/errors/relationship-missing-linkage");
                chai_1.expect(err.response.body.errors[0].detail).to.be.match(/liaisons/);
            });
        });
    });
});
