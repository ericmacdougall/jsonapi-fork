"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const agent_1 = require("../../app/agent");
const index_1 = require("../../app/src/index");
const Data_1 = require("../../../src/types/Generic/Data");
const Resource_1 = require("../../../src/types/Resource");
const Relationship_1 = require("../../../src/types/Relationship");
const ResourceIdentifier_1 = require("../../../src/types/ResourceIdentifier");
const FindQuery_1 = require("../../../src/types/Query/FindQuery");
const CreateQuery_1 = require("../../../src/types/Query/CreateQuery");
const DeleteQuery_1 = require("../../../src/types/Query/DeleteQuery");
const AddToRelationshipQuery_1 = require("../../../src/types/Query/AddToRelationshipQuery");
const RemoveFromRelationshipQuery_1 = require("../../../src/types/Query/RemoveFromRelationshipQuery");
const creation_1 = require("../fixtures/creation");
const updates_1 = require("../fixtures/updates");
describe("MongooseAdapter", () => {
    let adapter;
    let Agent;
    before(() => {
        return Promise.all([agent_1.default, index_1.default]).then(([agent, app]) => {
            Agent = agent;
            adapter = app.adapter;
        });
    });
    describe("Fetching", () => {
        it("should show virtuals in the response", () => {
            return Agent.request("GET", "/organizations")
                .then(resp => {
                chai_1.expect(resp.body.data.every(resource => resource.attributes.virtualName.endsWith(' (virtualized)'))).to.be.true;
            });
        });
        it("should support sorting by valid geoDistance, iff no other sorts are provided", () => {
            return Promise.all([
                Agent.request("GET", "/organizations?sort=(:geoDistance,location,[-70,40])")
                    .then(resp => {
                    const resources = resp.body.data;
                    const stateGovIndex = resources.findIndex(it => it.id === "54419d550a5069a2129ef254");
                    const echoOrgIndex = resources.findIndex(it => it.id === "59ac9c0ecc4c356fcda65202");
                    chai_1.expect(stateGovIndex < echoOrgIndex).to.be.true;
                }),
                Agent.request("GET", "/organizations?sort=(:geoDistance,location,[0,0])")
                    .then(resp => {
                    const resources = resp.body.data;
                    const stateGovIndex = resources.findIndex(it => it.id === "54419d550a5069a2129ef254");
                    const echoOrgIndex = resources.findIndex(it => it.id === "59ac9c0ecc4c356fcda65202");
                    chai_1.expect(echoOrgIndex < stateGovIndex).to.be.true;
                }),
                Agent.request("GET", "/organizations?sort=name,(:geoDistance,location,[0,0])")
                    .catch(e => {
                    chai_1.expect(e.response.status).to.equal(400);
                    chai_1.expect(e.response.body.errors[0].detail).to.equal("Cannot combine geoDistance sorts with other sorts.");
                })
            ]);
        });
        it.skip("should support reversing the sort order of `geoDistance`");
        it("should exclude documents with no geo field when \"sorting\" by distance", () => {
            return Agent.request("GET", "/organizations?sort=(:geoDistance,location,[-70,40])")
                .then(resp => {
                chai_1.expect(resp.body.data.filter(it => it.id === "59af14d3bbd18cd55ea08ea3")).to.have.length(0);
            });
        });
        it("should support pagination with sorting by geoDistance", () => {
            return Promise.all([
                Agent.request("GET", "/organizations?sort=(location,:geoDistance,[-70,40])&page[limit]=1")
                    .then(resp => {
                    const resources = resp.body.data;
                    chai_1.expect(resources.length).to.equal(1);
                    chai_1.expect(resources[0].id).to.equal("54419d550a5069a2129ef254");
                }),
                Agent.request("GET", "/organizations")
                    .query("sort=(location,:geoDistance,[-70,40])")
                    .query("page[limit]=1&page[offset]=1")
                    .then(resp => {
                    const resources = resp.body.data;
                    chai_1.expect(resources.length).to.equal(1);
                    chai_1.expect(resources[0].id).to.equal("59ac9c0ecc4c356fcda65202");
                })
            ]);
        });
        it('should support mixing other filters with geoDistance sort', () => {
            return Agent.request("GET", "/organizations")
                .query("filter=(:or,(name,`ELEMENTARY%20SCHOOL`),(name,`STATE%20GOVERNMENT`))")
                .query("sort=(location,:geoDistance,[0,0])")
                .then(resp => {
                chai_1.expect(resp.body.data.length).to.equal(1);
                chai_1.expect(resp.body.data[0].id).to.equal("54419d550a5069a2129ef254");
            });
        });
        describe("geoWithin", () => {
            it('should support filtering docs within a given circle', () => {
                return Promise.all([
                    Agent.request("GET", "/organizations")
                        .query("filter=(location,:geoWithin,([10.1,10.1],:toGeoCircle,40000))")
                        .then(resp => {
                        chai_1.expect(resp.body.data.length).to.equal(1);
                        chai_1.expect(resp.body.data[0].id).to.equal("59ac9c0ecc4c356fcda65202");
                    }),
                    Agent.request("GET", "/organizations")
                        .query("filter=(location,:geoWithin,([-32,25],:toGeoCircle,4800000))")
                        .query("sort=(location,:geoDistance,[0,0])")
                        .then(resp => {
                        chai_1.expect(resp.body.data.length).to.equal(2);
                        chai_1.expect(resp.body.data[0].id).to.equal("59ac9c0ecc4c356fcda65202");
                        chai_1.expect(resp.body.data[1].id).to.equal("54419d550a5069a2129ef254");
                    }),
                    Agent.request("GET", "/organizations")
                        .query("filter=(location,:geoWithin,([-32,25],:toGeoCircle,4800000))")
                        .query("sort=(location,:geoDistance,[-60,30])")
                        .then(resp => {
                        chai_1.expect(resp.body.data.length).to.equal(2);
                        chai_1.expect(resp.body.data[0].id).to.equal("54419d550a5069a2129ef254");
                        chai_1.expect(resp.body.data[1].id).to.equal("59ac9c0ecc4c356fcda65202");
                    }),
                    Agent.request("GET", "/organizations")
                        .query("filter=(location,:geoWithin,([-32,25],:toGeoCircle,4500000))")
                        .query("sort=(location,:geoDistance,[0,0])")
                        .then(resp => {
                        chai_1.expect(resp.body.data.length).to.equal(1);
                        chai_1.expect(resp.body.data[0].id).to.equal("54419d550a5069a2129ef254");
                    }),
                ]);
            });
            it("should not be allowed in sort [same with toGeoCircle]", () => {
                const isInvalidSortError = it => it.source && it.source.parameter === "sort" &&
                    it.code === "https://jsonapi.js.org/errors/invalid-query-param-value";
                return Promise.all([
                    Agent.request("GET", "/organizations?sort=([0,0],:toGeoCircle,4)")
                        .ok(it => it.badRequest && it.body.errors.some(isInvalidSortError)),
                    Agent.request("GET", "/organizations?sort=(:geoWithin,location,([0,0],:toGeoCircle,4))")
                        .ok(it => it.badRequest && it.body.errors.some(isInvalidSortError))
                ]);
            });
            it("should not allow a toGeoCircle outside a geoWithin", () => {
                const isInvalidtoGeoCircleError = it => it.title.includes("only have toGeoCircle inside of a geoWithin");
                return Promise.all([
                    Agent.request("GET", "/organizations?filter=(:and,([0,0],:toGeoCircle,4))")
                        .ok(it => it.badRequest && isInvalidtoGeoCircleError(it.body.errors[0])),
                    Agent.request("GET", "/organizations?filter=([0,0],:toGeoCircle,4)")
                        .ok(it => it.badRequest && isInvalidtoGeoCircleError(it.body.errors[0]))
                ]);
            });
        });
    });
    describe.skip("Deletion", () => { });
    describe("Creation", () => {
        let createdResource;
        before(() => {
            return Agent.request("POST", "/organizations")
                .type("application/vnd.api+json")
                .send({ "data": creation_1.VALID_ORG_RESOURCE_NO_ID })
                .then((response) => {
                createdResource = response.body.data;
            }, (e) => {
                console.log(e, e.response.body);
            });
        });
        it("should run setters on create", () => {
            chai_1.expect(createdResource.attributes.name).to.equal(creation_1.VALID_ORG_RESOURCE_NO_ID.attributes.name.toUpperCase());
            chai_1.expect(createdResource.attributes.echo).to.equal(creation_1.VALID_ORG_RESOURCE_NO_ID.attributes.echo);
        });
        it("should show virtuals in the returned resource", () => {
            chai_1.expect(createdResource.attributes.virtualName).to.equal(creation_1.VALID_ORG_RESOURCE_NO_ID.attributes.name.toUpperCase() + ' (virtualized)');
            chai_1.expect(createdResource.attributes.reversed).to.equal(creation_1.VALID_ORG_RESOURCE_NO_ID.attributes.echo.split("").reverse().join(""));
        });
        it("should apply schema defaults", () => {
            chai_1.expect(createdResource.attributes.neverSet).to.equal("set from mongoose default");
        });
        it("should not allow setting internal fields as attributes", () => {
            const makeSetInternalFieldRequest = (k, v, inRelationships) => {
                const spreadData = inRelationships
                    ? {
                        relationships: Object.assign({}, creation_1.VALID_ORG_RESOURCE_NO_ID.relationships, { [k]: { data: v } })
                    }
                    : {
                        attributes: Object.assign({}, creation_1.VALID_ORG_RESOURCE_NO_ID.attributes, { [k]: v })
                    };
                return Agent.request("POST", "/organizations")
                    .type("application/vnd.api+json")
                    .send({ "data": Object.assign({}, creation_1.VALID_ORG_RESOURCE_NO_ID, spreadData) })
                    .then((response) => {
                    throw new Error("Should not run!");
                }, (e) => {
                    chai_1.expect(e.status).to.equal(400);
                    chai_1.expect([
                        "https://jsonapi.js.org/errors/illegal-field-name",
                        "https://jsonapi.js.org/errors/invalid-linkage-json"
                    ]).to.include(e.response.body.errors[0].code);
                });
            };
            return Promise.all([
                makeSetInternalFieldRequest("__t", "School", false),
                makeSetInternalFieldRequest("__v", 3, false),
                makeSetInternalFieldRequest("__t", "School", true),
                makeSetInternalFieldRequest("__v", 3, true),
                makeSetInternalFieldRequest("__t", { "type": "organizations", id: "School" }, true),
                makeSetInternalFieldRequest("__v", { "type": "organizations", id: 3 }, true),
            ]);
        });
        it("should reject invalid creations with type/field indicated in error.meta", () => {
            return Agent.request("POST", "/organizations")
                .send({ data: creation_1.INVALID_ORG_RESOURCE_NO_ID })
                .type("application/vnd.api+json")
                .ok(it => it.badRequest)
                .then(resp => {
                chai_1.expect(resp.body.errors[0].code)
                    .to.equal('https://jsonapi.js.org/errors/missing-required-field');
                chai_1.expect(resp.body.errors[0].meta)
                    .to.deep.equal({ source: { field: 'name', type: 'organizations' } });
            });
        });
    });
    describe("Updating", () => {
        let res;
        before(() => {
            return Agent.request("PATCH", `/organizations/${updates_1.VALID_ORG_VIRTUAL_PATCH.id}`)
                .type("application/vnd.api+json")
                .send({ "data": updates_1.VALID_ORG_VIRTUAL_PATCH })
                .then((response) => {
                res = response.body.data;
            });
        });
        it("should invoke setters on virtual, updated attributes", () => {
            chai_1.expect(res.attributes.echo).to.be.equal(updates_1.VALID_ORG_VIRTUAL_PATCH.attributes.echo);
            chai_1.expect(res.attributes.reversed).to.be.equal(updates_1.VALID_ORG_VIRTUAL_PATCH.attributes.echo.split("").reverse().join(""));
        });
        it("should invoke setters on non-virtual updated attributes", () => {
            chai_1.expect(res.attributes.name).to.equal("CHANGED NAME");
        });
        it("should not allow setting internal fields", () => {
            const makeSetInternalFieldRequest = (k, v, inRelationships) => {
                const spreadData = inRelationships
                    ? {
                        relationships: Object.assign({}, creation_1.VALID_ORG_RESOURCE_NO_ID.relationships, { [k]: { data: v } })
                    }
                    : {
                        attributes: Object.assign({}, creation_1.VALID_ORG_RESOURCE_NO_ID.attributes, { [k]: v })
                    };
                return Agent.request("PATCH", `/organizations/${updates_1.VALID_ORG_VIRTUAL_PATCH.id}`)
                    .type("application/vnd.api+json")
                    .send({
                    "data": Object.assign({ type: "organizations", id: updates_1.VALID_ORG_VIRTUAL_PATCH.id }, spreadData)
                })
                    .then((response) => {
                    throw new Error("Should not run!");
                }, (e) => {
                    chai_1.expect(e.status).to.equal(400);
                    chai_1.expect([
                        "https://jsonapi.js.org/errors/illegal-field-name",
                        "https://jsonapi.js.org/errors/invalid-linkage-json"
                    ]).to.include(e.response.body.errors[0].code);
                });
            };
            return Promise.all([
                makeSetInternalFieldRequest("__t", "School", false),
                makeSetInternalFieldRequest("__v", 3, false),
                makeSetInternalFieldRequest("__t", "School", true),
                makeSetInternalFieldRequest("__v", 3, true),
                makeSetInternalFieldRequest("__t", { "type": "organizations", id: "School" }, true),
                makeSetInternalFieldRequest("__v", { "type": "organizations", id: 3 }, true),
            ]);
        });
        it("should reject invalid patches with type/id/field indicated in error.meta", () => {
            return Agent.request("PATCH", "/organizations/59af14d3bbd18cd55ea08ea3")
                .send({
                data: Object.assign({}, updates_1.NEVER_APPLIED_SCHOOL_PATCH, { attributes: Object.assign({}, updates_1.NEVER_APPLIED_SCHOOL_PATCH.attributes, { name: 4 }) })
            })
                .type("application/vnd.api+json")
                .ok(it => it.badRequest)
                .then(resp => {
                chai_1.expect(resp.body.errors[0].code)
                    .to.equal("https://jsonapi.js.org/errors/invalid-field-value");
                chai_1.expect(resp.body.errors[0].meta)
                    .to.deep.equal({
                    source: {
                        field: 'name',
                        type: 'organizations',
                        id: "59af14d3bbd18cd55ea08ea3"
                    }
                });
            });
        });
    });
    describe("Query return types", () => {
        describe("Find", () => {
            it("should return the proper type", () => {
                const dummyReturning = (result) => ({});
                const singularQuery = new FindQuery_1.default({
                    type: "people", isSingular: true, returning: dummyReturning
                });
                const pluralQuery = new FindQuery_1.default({
                    type: "people", isSingular: false, returning: dummyReturning
                });
                const paginatedQuery = new FindQuery_1.default({
                    type: "people", limit: 10, isSingular: false, returning: dummyReturning
                });
                const populatedQuery = new FindQuery_1.default({
                    type: "people", isSingular: false, populates: ["manages"], returning: dummyReturning
                });
                return Promise.all([
                    adapter.find(singularQuery).then(result => {
                        chai_1.expect(result.primary.isSingular).to.equal(true);
                        chai_1.expect(result.included).to.be.undefined;
                        chai_1.expect(result.collectionSize).to.be.undefined;
                    }),
                    adapter.find(pluralQuery).then(result => {
                        chai_1.expect(result.primary.isSingular).to.equal(false);
                        chai_1.expect(result.included).to.be.undefined;
                        chai_1.expect(result.collectionSize).to.be.undefined;
                    }),
                    adapter.find(paginatedQuery).then(result => {
                        const countReturned = result.primary.values.length;
                        const expectedMinCollSize = Math.min(countReturned, 10);
                        chai_1.expect(result.primary.isSingular).to.equal(false);
                        chai_1.expect(countReturned > 4 && countReturned <= 10).to.be.true;
                        chai_1.expect(result.included).to.be.undefined;
                        chai_1.expect(result.collectionSize >= expectedMinCollSize).to.be.true;
                    }),
                    adapter.find(populatedQuery).then(result => {
                        chai_1.expect(result.primary.isSingular).to.equal(false);
                        chai_1.expect(result.primary.values.length > 1).to.be.true;
                        chai_1.expect(result.included.every(it => it.type === 'organizations')).to.be.true;
                    })
                ]);
            });
        });
        describe("AddToRelationship", () => {
            it("should return the proper type", () => __awaiter(this, void 0, void 0, function* () {
                const dummyReturning = (result) => ({});
                const originalLinkage = [new ResourceIdentifier_1.default("people", "53f54dd98d1e62ff12539db2")];
                const newOrg = (yield adapter.create(new CreateQuery_1.default({
                    type: "organizations",
                    records: Data_1.default.pure(dummyOrgResource(originalLinkage)),
                    returning: dummyReturning
                }))).created.values[0];
                const linkage = [
                    new ResourceIdentifier_1.default("people", "53f54dd98d1e62ff12539db2"),
                    new ResourceIdentifier_1.default("people", "53f54dd98d1e62ff12539db3"),
                ];
                const query = new AddToRelationshipQuery_1.default({
                    type: "organizations",
                    id: newOrg.id,
                    relationshipName: "liaisons",
                    linkage,
                    returning: dummyReturning
                });
                return adapter.addToRelationship(query).then(result => {
                    chai_1.expect(result.before).to.be.an.instanceof(Relationship_1.default);
                    chai_1.expect(result.after).to.be.an.instanceof(Relationship_1.default);
                    chai_1.expect(result.before.owner).to.deep.equal({
                        type: "organizations", id: newOrg.id, path: "liaisons"
                    });
                    chai_1.expect(result.before.owner).to.deep.equal(result.after.owner);
                    chai_1.expect(result.before.values).to.deep.equal(originalLinkage);
                    chai_1.expect(result.after.values).to.deep.equal(linkage);
                });
            }));
        });
        describe("RemoveFromRelationship", () => {
            it("should return the proper type", () => __awaiter(this, void 0, void 0, function* () {
                const dummyReturning = (result) => ({});
                const originalLinkage = [
                    new ResourceIdentifier_1.default("people", "53f54dd98d1e62ff12539db2")
                ];
                const newOrg = (yield adapter.create(new CreateQuery_1.default({
                    type: "organizations",
                    records: Data_1.default.pure(dummyOrgResource(originalLinkage)),
                    returning: dummyReturning
                }))).created.values[0];
                const linkage = [
                    new ResourceIdentifier_1.default("people", "53f54dd98d1e62ff12539db2"),
                    new ResourceIdentifier_1.default("people", "53f54dd98d1e62ff12539db3"),
                ];
                const query = new RemoveFromRelationshipQuery_1.default({
                    type: "organizations",
                    id: newOrg.id,
                    relationshipName: "liaisons",
                    linkage,
                    returning: dummyReturning
                });
                return adapter.removeFromRelationship(query).then(result => {
                    chai_1.expect(result.before).to.be.an.instanceof(Relationship_1.default);
                    chai_1.expect(result.after).to.be.an.instanceof(Relationship_1.default);
                    chai_1.expect(result.before.owner).to.deep.equal({
                        type: "organizations", id: newOrg.id, path: "liaisons"
                    });
                    chai_1.expect(result.before.owner).to.deep.equal(result.after.owner);
                    chai_1.expect(result.before.values).to.deep.equal(originalLinkage);
                    chai_1.expect(result.after.values).to.deep.equal([]);
                });
            }));
        });
        describe("Delete", () => {
            it("should return the proper type", () => __awaiter(this, void 0, void 0, function* () {
                const dummyReturning = (result) => ({});
                const newOrgs = (yield adapter.create(new CreateQuery_1.default({
                    type: "organizations",
                    records: Data_1.default.of([
                        dummyOrgResource(),
                        dummyOrgResource(),
                        dummyOrgResource()
                    ]),
                    returning: dummyReturning
                }))).created.values;
                const [firstNewId, ...restNewIds] = newOrgs.map(it => it.id);
                const singularQuery = new DeleteQuery_1.default({
                    type: "organizations",
                    id: firstNewId,
                    returning: dummyReturning
                });
                const pluralQuery = new DeleteQuery_1.default({
                    type: "organizations",
                    ids: restNewIds,
                    returning: dummyReturning
                });
                return Promise.all([
                    adapter.delete(singularQuery).then(result => {
                        chai_1.expect(result.deleted.isSingular).to.be.true;
                        chai_1.expect(result.deleted.values[0]).to.deep.equal(newOrgs[0]);
                    }),
                    adapter.delete(pluralQuery).then(result => {
                        chai_1.expect(result.deleted.isSingular).to.be.false;
                        chai_1.expect(result.deleted.values).to.deep.equal([newOrgs[1], newOrgs[2]]);
                    })
                ]);
            }));
        });
    });
});
function dummyOrgResource(liaisonLinkage) {
    const newOrgResource = new Resource_1.default("organizations", undefined, { name: "whatevs" }, liaisonLinkage
        ? {
            liaisons: Relationship_1.default.of({
                data: liaisonLinkage,
                owner: { type: "organizations", id: undefined, path: "liaisons" }
            })
        }
        : undefined);
    newOrgResource.typePath = ["organizations"];
    return newOrgResource;
}
