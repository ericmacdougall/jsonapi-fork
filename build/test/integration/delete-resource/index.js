"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const agent_1 = require("../../app/agent");
const creation_1 = require("../fixtures/creation");
describe("Deleting resources", () => {
    let Agent;
    before(() => agent_1.default.then(A => { Agent = A; }));
    describe("Single resource deletion", () => {
        let creationId1, creationId2, creationId3;
        before(() => {
            return Promise.all([
                createSchool(Agent).then(school => creationId1 = school.id),
                createSchool(Agent).then(school => creationId2 = school.id),
                createSchool(Agent).then(school => creationId3 = school.id)
            ]);
        });
        it("should delete a resource by id", () => {
            return Agent.request("DEL", `/schools/${creationId1}`)
                .type("application/vnd.api+json")
                .send()
                .then(() => {
                return Agent.request("GET", `/schools/${creationId1}`)
                    .accept("application/vnd.api+json")
                    .then(() => {
                    throw new Error("shouldn't run");
                }, err => {
                    chai_1.expect(err.response.statusCode).to.equal(404);
                });
            });
        });
        it("should not be stymied by `Content-Length: 0`, regardless of Content-Type; see #67", () => {
            return Promise.all([
                Agent.request("DEL", `/schools/${creationId2}`)
                    .set("Content-Length", 0)
                    .send()
                    .then(() => {
                    return Agent.request("GET", `/schools/${creationId2}`)
                        .accept("application/vnd.api+json")
                        .then(() => {
                        throw new Error("shouldn't run");
                    }, err => {
                        chai_1.expect(err.response.statusCode).to.equal(404);
                    });
                }),
                Agent.request("DEL", `/schools/${creationId3}`)
                    .set("Content-Length", 0)
                    .type("application/vnd.api+json")
                    .send()
                    .then(() => {
                    return Agent.request("GET", `/schools/${creationId3}`)
                        .accept("application/vnd.api+json")
                        .then(() => {
                        throw new Error("shouldn't run");
                    }, err => {
                        chai_1.expect(err.response.statusCode).to.equal(404);
                    });
                })
            ]);
        });
        it('should return 404 if deleting a resoucrce that doesn\'t exist', () => {
            return Agent.request("DELETE", "/people/5a5934cfc810949cebeecc33")
                .then(() => {
                throw new Error("shoudln't run");
            }, (err) => {
                chai_1.expect(err.status).to.equal(404);
            });
        });
    });
    describe("Bulk delete", () => {
        let creationIds;
        beforeEach(() => {
            return Promise.all([createSchool(Agent), createSchool(Agent)]).then(schools => {
                creationIds = schools.map(it => it.id);
            });
        });
        it("should support bulk delete", () => {
            return Agent.request("DEL", `/schools`)
                .type("application/vnd.api+json")
                .send({ data: creationIds.map(id => ({ type: "organizations", id })) })
                .then(() => {
                const notFoundPromises = creationIds.map(id => Agent.request("GET", `/schools/${id}`)
                    .accept("application/vnd.api+json")
                    .then(() => {
                    throw new Error("shouldn't run");
                }, err => {
                    chai_1.expect(err.response.statusCode).to.equal(404);
                }));
                return Promise.all(notFoundPromises);
            });
        });
        it("should delete all matching resources, even if some are not found", () => {
            const idsToDelete = ["56beb8500000000000000000", ...creationIds];
            return Agent.request("DEL", `/schools`)
                .type("application/vnd.api+json")
                .send({ data: idsToDelete.map(id => ({ type: "organizations", id })) })
                .then((resp) => {
                chai_1.expect(resp.status).to.equal(204);
                return Promise.all(creationIds.map(it => {
                    return Agent.request("GET", `/organizations/${it}`).then(() => {
                        throw new Error("Should not run!");
                    }, (e) => {
                        chai_1.expect(e.status).to.equal(404);
                    });
                }));
            });
        });
    });
});
function createSchool(Agent) {
    return Agent.request("POST", "/schools")
        .type("application/vnd.api+json")
        .send({ data: creation_1.VALID_SCHOOL_RESOURCE_NO_ID })
        .then(response => response.body.data);
}
