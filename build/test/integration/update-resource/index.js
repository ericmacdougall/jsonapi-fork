"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const agent_1 = require("../../app/agent");
const updates_1 = require("../fixtures/updates");
describe("Updating Resources", () => {
    let Agent;
    before(() => {
        return agent_1.default.then((A) => { Agent = A; });
    });
    describe("Updating a resource's attributes", () => {
        let res;
        before(() => {
            return Agent.request("PATCH", `/organizations/${updates_1.VALID_ORG_VIRTUAL_PATCH.id}`)
                .type("application/vnd.api+json")
                .send({ "data": updates_1.VALID_ORG_VIRTUAL_PATCH })
                .then((response) => {
                res = response.body.data;
            });
        });
        it("should not reset fields missing in the update to their defaults", () => {
            chai_1.expect(res.attributes.modified).to.be.equal(new Date("2015-01-01").toISOString());
        });
        it("should invoke setters on virtual, updated attributes", () => {
            chai_1.expect(res.attributes.echo).to.be.equal(updates_1.VALID_ORG_VIRTUAL_PATCH.attributes.echo);
            chai_1.expect(res.attributes.reversed).to.be.equal(updates_1.VALID_ORG_VIRTUAL_PATCH.attributes.echo.split("").reverse().join(""));
        });
        it("should invoke setters on non-virtual updated attributes", () => {
            chai_1.expect(res.attributes.name).to.equal("CHANGED NAME");
        });
        it("should not change attributes not (directly or indirectly) part of the update", () => {
            chai_1.expect(res.relationships.liaisons.data).to.deep.equal([{
                    type: "people",
                    id: "53f54dd98d1e62ff12539db3"
                }]);
        });
    });
    describe("Updating a non-existent resource", () => {
        it("should 404", () => {
            const missingOId = "507f191e810c19729de860ea";
            return Promise.all([
                Agent.request("PATCH", `/organizations/${missingOId}`)
                    .type("application/vnd.api+json")
                    .send({ "data": Object.assign({}, updates_1.VALID_ORG_VIRTUAL_PATCH, { id: missingOId }) })
                    .then((response) => {
                    throw new Error("Should 404");
                }, (err) => {
                    chai_1.expect(err.status).to.equal(404);
                }),
                Agent.request("PATCH", `/people/${missingOId}`)
                    .type("application/vnd.api+json")
                    .send({
                    "data": {
                        "type": "people",
                        id: missingOId,
                        attributes: { name: "N/A" }
                    }
                })
                    .then((response) => {
                    throw new Error("Should 404");
                }, (err) => {
                    chai_1.expect(err.status).to.equal(404);
                })
            ]);
        });
    });
    describe("Updating a resource without providing an id in json", () => {
        it("should 400", () => {
            return Agent.request("PATCH", `/organizations/59ac9c0ecc4c356fcda65202`)
                .type("application/vnd.api+json")
                .send({ data: updates_1.INVALID_ORG_PATCH_NO_ID })
                .promise()
                .then((response) => {
                throw new Error("Should 400");
            }, (err) => {
                chai_1.expect(err.status).to.equal(400);
            });
        });
    });
    describe("Bulk updates", () => {
        it("should 400 if any resources don't have ids", () => {
            return Agent.request("PATCH", `/organizations`)
                .type("application/vnd.api+json")
                .send({ data: [updates_1.VALID_ORG_VIRTUAL_PATCH, updates_1.INVALID_ORG_PATCH_NO_ID] })
                .promise()
                .then((response) => {
                throw new Error("Should 400");
            }, (err) => {
                chai_1.expect(err.status).to.equal(400);
            });
        });
    });
});
