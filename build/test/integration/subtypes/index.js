"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const agent_1 = require("../../app/agent");
const creation_1 = require("../fixtures/creation");
const updates_1 = require("../fixtures/updates");
describe("Subtypes", () => {
    let Agent;
    before(() => {
        return agent_1.default.then((A) => { Agent = A; });
    });
    describe("Fetching", () => {
        describe("Subtype resources", () => {
            it("should be rendered as `type: parentType` + meta.types", () => {
                return Agent.request("GET", `/schools`)
                    .then((response) => {
                    const resources = response.body.data;
                    chai_1.expect(resources.length > 0).to.be.true;
                    resources.forEach(it => {
                        chai_1.expect(it).to.satisfy(isValidSchoolSerialization);
                    });
                });
            });
            it("should be impossible to fetch a parent type at a subtype endpoint", () => {
                return Agent.request("GET", '/schools/54419d550a5069a2129ef254')
                    .then(() => {
                    throw new Error("Shouldn't run!");
                }, (response) => {
                    chai_1.expect(response.status).to.equal(404);
                });
            });
            it("should apply ?fields restrictions based on the rendered `type`", () => {
                const hasNameOrDesc = (resource) => {
                    const { attributes } = resource;
                    return "name" in attributes || "description" in attributes;
                };
                return Promise.all([
                    Agent.request("GET", '/schools?fields[schools]=isCollege')
                        .then((resp) => {
                        chai_1.expect(resp.body.data.every(hasNameOrDesc)).to.be.true;
                    }),
                    Agent.request("GET", '/schools?fields[organizations]=isCollege')
                        .then((resp) => {
                        chai_1.expect(resp.body.data.some(hasNameOrDesc)).to.be.false;
                    })
                ]);
            });
        });
        describe("Relationships pointing to subtype resources", () => {
            it("should use the parent type in the resource identifier object", () => {
                return Agent.request("GET", `/people/53f54dd98d1e62ff12539db3`)
                    .then((response) => {
                    const { manages, homeSchool } = response.body.data.relationships;
                    chai_1.expect(manages.data.type).to.equal('organizations');
                    chai_1.expect(homeSchool.data.type).to.equal('organizations');
                });
            });
        });
    });
    describe("Deletion", () => {
        describe("Subtype resources", () => {
            let newSchoolId, newOrganizationId;
            beforeEach(() => {
                return Agent.request("POST", "/organizations")
                    .type('application/vnd.api+json')
                    .send({ data: [creation_1.VALID_SCHOOL_RESOURCE_NO_ID, creation_1.VALID_ORG_RESOURCE_NO_ID] })
                    .then((response) => {
                    const [school, organization] = response.body.data;
                    newSchoolId = school.id;
                    newOrganizationId = organization.id;
                }, (e) => {
                    throw new Error("Couldn't create resources to test deletion.");
                });
            });
            it("should be impossible to delete a parent type at a subtype endpoint", () => {
                return Promise.all([
                    Agent.request("DELETE", '/schools/54419d550a5069a2129ef254')
                        .then(() => {
                        throw new Error("Shouldn't run!");
                    }, (response) => {
                        chai_1.expect(response.status).to.equal(400);
                    }),
                    Agent.request("DELETE", "/schools")
                        .type("application/vnd.api+json")
                        .send({
                        data: [
                            { type: "organizations", id: newSchoolId },
                            { type: "organizations", id: newOrganizationId }
                        ]
                    })
                        .then(() => {
                        throw new Error("Shouldn't run!");
                    }, (response) => {
                        chai_1.expect(response.status).to.equal(400);
                    })
                ]);
            });
            it("should be possible to delete a subtype at a parent endpoint", () => {
                return Agent.request("DELETE", `/organizations/${newSchoolId}`)
                    .then((response) => {
                    chai_1.expect(response.status).to.equal(204);
                });
            });
        });
    });
    describe("Creation", () => {
        it("should be possible at the parent type endpoint with meta.types", () => {
            return Agent.request("POST", "/organizations")
                .type("application/vnd.api+json")
                .send({ data: creation_1.VALID_SCHOOL_RESOURCE_NO_ID })
                .then((response) => {
                chai_1.expect(response.status).to.equal(201);
                chai_1.expect(response.body.data).to.satisfy(isValidSchoolSerialization);
                chai_1.expect(response.body.data.attributes.isCollege).to.be.false;
            });
        });
        it("should be possible at the subtype endpoint with meta.types", () => {
            return Agent.request("POST", "/schools")
                .type("application/vnd.api+json")
                .send({ data: creation_1.VALID_SCHOOL_RESOURCE_NO_ID })
                .then((response) => {
                chai_1.expect(response.status).to.equal(201);
                chai_1.expect(response.body.data).to.satisfy(isValidSchoolSerialization);
            });
        });
        it("should not be possible at any endpoint with subtype in `type` key, with or without meta.types", () => {
            const endpoints = ["/schools", "/organizations"];
            const bodies = [
                Object.assign({}, creation_1.VALID_SCHOOL_RESOURCE_NO_ID, { type: "schools" }),
                Object.assign({}, creation_1.VALID_SCHOOL_RESOURCE_NO_ID, { type: "schools", meta: undefined })
            ];
            const requests = [].concat.apply([], endpoints.map(endpoint => bodies.map(body => {
                return Agent.request("POST", endpoint)
                    .type('application/vnd.api+json')
                    .send({ data: body })
                    .then((resp) => {
                    throw new Error("Should not run");
                }, (e) => {
                    chai_1.expect(e.status).to.equal(400);
                    chai_1.expect(e.response.body.errors[0].code).to.equal("https://jsonapi.js.org/errors/invalid-resource-type");
                });
            })));
            return Promise.all(requests);
        });
        it("should always run the subtype's beforeSave on creation", () => {
            const endpoints = ["/schools", "/organizations"];
            return Promise.all(endpoints.map(endpoint => Agent.request("POST", endpoint)
                .type("application/vnd.api+json")
                .send({ data: creation_1.VALID_SCHOOL_RESOURCE_NO_ID })
                .promise()
                .then((response) => {
                chai_1.expect(response.body.data.attributes.description).to.equal("Added a description in beforeSave");
                chai_1.expect(response.body.data.attributes.modified).to.equal("2015-10-27T05:16:57.257Z");
            })));
        });
        it("should be impossible to create a parent type at the subtype endpoint", () => {
            return Agent.request("POST", "/schools")
                .type("application/vnd.api+json")
                .send({ data: creation_1.VALID_ORG_RESOURCE_NO_ID })
                .then((resp) => {
                throw new Error("Shouldn't run");
            }, (e) => {
                chai_1.expect(e.status).to.equal(400);
                chai_1.expect(e.response.body.errors[0].code).to.equal("https://jsonapi.js.org/errors/invalid-types-list");
            });
        });
        it("should be impossible to create an unrelated type at parent type endpoint, even if lying in meta.types", () => {
            const fixtureMeta = creation_1.VALID_PERSON_RESOURCE_NO_ID.meta || {};
            const fixutreMetaTypes = fixtureMeta.types || [];
            return Agent.request("POST", "/organizations")
                .type("application/vnd.api+json")
                .send({
                data: Object.assign({ meta: Object.assign({}, fixtureMeta, { types: [
                            ...fixutreMetaTypes,
                            "organizations",
                            "schools"
                        ] }) }, creation_1.VALID_PERSON_RESOURCE_NO_ID)
            })
                .then((resp) => {
                throw new Error("Shouldn't run");
            }, (e) => {
                chai_1.expect(e.status).to.equal(400);
                chai_1.expect(e.response.body.errors[0].code).to.equal("https://jsonapi.js.org/errors/invalid-resource-type");
            });
        });
        it("should reject type lists with unknown types", () => {
            return Agent.request("POST", "/organizations")
                .type("application/vnd.api+json")
                .send({
                data: Object.assign({}, creation_1.VALID_ORG_RESOURCE_NO_ID, { meta: Object.assign({}, creation_1.VALID_ORG_RESOURCE_NO_ID.meta, { types: ["organizations", "uknown-type"] }) })
            })
                .then((resp) => {
                throw new Error("Shouldn't run");
            }, (e) => {
                chai_1.expect(e.status).to.equal(400);
                chai_1.expect(e.response.body.errors[0].code).to.equal("https://jsonapi.js.org/errors/invalid-types-list");
            });
        });
    });
    describe("Updating", () => {
        it("should be illegal to provide anything in `meta.types`", () => {
            return Agent.request("PATCH", "/organizations/54419d550a5069a2129ef254")
                .type("application/vnd.api+json")
                .send({
                data: {
                    type: "organizations",
                    id: "54419d550a5069a2129ef254",
                    meta: { types: ["organizations"] },
                    attributes: { name: "N/A" }
                }
            })
                .then((resp) => {
                throw new Error("Shouldn't run");
            }, (e) => {
                chai_1.expect(e.status).to.equal(400);
                chai_1.expect(e.response.body.errors[0].code).to.equal("https://jsonapi.js.org/errors/illegal-types-list");
            });
        });
        it("should fail with a subtype in `type` key, whether a lie or not", () => {
            const endpoints = ["/schools", "/organizations"];
            const bodies = [
                Object.assign({}, updates_1.NEVER_APPLIED_STATE_GOVT_PATCH, { type: "schools" }),
                Object.assign({}, updates_1.NEVER_APPLIED_SCHOOL_PATCH, { type: "schools" })
            ];
            const requests = [].concat.apply([], endpoints.map(endpoint => bodies.map(body => {
                return Agent.request("PATCH", endpoint)
                    .type('application/vnd.api+json')
                    .send({ data: [body] })
                    .then((resp) => {
                    throw new Error("Should not run");
                }, (e) => {
                    chai_1.expect(e.status).to.equal(400);
                    chai_1.expect(e.response.body.errors[0].code).to.equal("https://jsonapi.js.org/errors/invalid-resource-type");
                });
            })));
            return Promise.all(requests);
        });
        it.skip("should catch client lies in `meta.types`", () => {
            const fixtureMeta = updates_1.NEVER_APPLIED_STATE_GOVT_PATCH.meta || {};
            const fixutreMetaTypes = fixtureMeta.types || [];
            return Agent.request("PATCH", "/schools/54419d550a5069a2129ef254")
                .type("application/vnd.api+json")
                .send({
                data: Object.assign({ meta: Object.assign({}, fixtureMeta, { types: [
                            ...fixutreMetaTypes,
                            "schools"
                        ] }) }, updates_1.NEVER_APPLIED_STATE_GOVT_PATCH)
            })
                .then((resp) => {
                throw new Error("Shouldn't run");
            }, (e) => {
                chai_1.expect(e.status).to.equal(400);
                chai_1.expect(e.response.body.errors[0].code).to.equal("https://jsonapi.js.org/errors/invalid-types-list");
            });
        });
        it("should be illegal to update a non-sub-type at a sub-type endpoint", () => {
            return Agent.request("PATCH", "/schools/54419d550a5069a2129ef254")
                .type("application/vnd.api+json")
                .send({ data: updates_1.NEVER_APPLIED_STATE_GOVT_PATCH })
                .then((resp) => {
                throw new Error("Shouldn't run");
            }, (e) => {
                chai_1.expect(e.status).to.equal(400);
                chai_1.expect(e.response.body.errors[0].code).to.equal("https://jsonapi.js.org/errors/invalid-resource-type");
            });
        });
        it("should run the subtype's beforeSave + beforeRender function", () => {
            return Agent.request("PATCH", "/schools/5a5934cfc810949cebeecc33")
                .type("application/vnd.api+json")
                .send({
                data: {
                    type: "organizations",
                    id: "5a5934cfc810949cebeecc33",
                    attributes: {
                        isCollege: false,
                        description: ""
                    }
                }
            })
                .then((resp) => {
                chai_1.expect(resp.body.data.attributes.isCollege).to.be.false;
                chai_1.expect(resp.body.data.attributes.description).to.equal("Special, beforeSave description.");
                chai_1.expect(resp.body.data.attributes.schoolBeforeRender).to.be.true;
            });
        });
    });
});
function isValidSchoolSerialization(schoolResource) {
    return schoolResource.type === 'organizations'
        && schoolResource.meta && schoolResource.meta.types
        && schoolResource.meta.types.length === 2
        && schoolResource.meta.types.includes('organizations')
        && schoolResource.meta.types.includes('schools');
}
