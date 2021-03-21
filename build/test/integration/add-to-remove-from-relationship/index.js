"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const agent_1 = require("../../app/agent");
const updates_1 = require("../fixtures/updates");
const creation_1 = require("../fixtures/creation");
describe("Partially modifying a relationship at a relationship endpoint", () => {
    let Agent, relationshipEndpointUrl;
    before(() => {
        return agent_1.default.then(A => {
            Agent = A;
            return Agent.request("POST", "/organizations")
                .type("application/vnd.api+json")
                .send({ "data": creation_1.VALID_SCHOOL_RESOURCE_NO_ID_EMPTY_PRINCIPAL_NO_LIAISONS })
                .then((response) => {
                relationshipEndpointUrl =
                    `/organizations/${response.body.data.id}/relationships/liaisons`;
            });
        });
    });
    const modifyRelationship = (method, linkage, url) => {
        return Agent.request(method, url)
            .accept("application/vnd.api+json")
            .type("application/vnd.api+json")
            .send(linkage)
            .then((res) => {
            chai_1.expect(res.status).to.equal(204);
        });
    };
    const testRelationshipState = (expectedVal, url) => {
        return Agent.request("GET", url)
            .accept("application/vnd.api+json")
            .then((res) => {
            chai_1.expect(res.body.data).to.deep.equal(expectedVal.data);
        });
    };
    const duplicateLinkage = Object.assign({}, updates_1.VALID_ORG_RELATIONSHIP_PATCH, { data: [
            ...updates_1.VALID_ORG_RELATIONSHIP_PATCH.data,
            ...updates_1.VALID_ORG_RELATIONSHIP_PATCH.data
        ] });
    describe("Adding to a to-many relationship at a relationship endpoint", () => {
        it("should work", () => {
            return modifyRelationship("POST", updates_1.VALID_ORG_RELATIONSHIP_PATCH, relationshipEndpointUrl).then(() => {
                return testRelationshipState(updates_1.VALID_ORG_RELATIONSHIP_PATCH, relationshipEndpointUrl);
            });
        });
        it("should not add a resource that's already in the relationship", () => {
            return modifyRelationship("POST", updates_1.VALID_ORG_RELATIONSHIP_PATCH, relationshipEndpointUrl).then(() => {
                return testRelationshipState(updates_1.VALID_ORG_RELATIONSHIP_PATCH, relationshipEndpointUrl);
            });
        });
        it("should ignore duplicates in linkage to add", () => {
            return modifyRelationship("POST", duplicateLinkage, relationshipEndpointUrl).then(() => {
                return testRelationshipState(updates_1.VALID_ORG_RELATIONSHIP_PATCH, relationshipEndpointUrl);
            });
        });
        it("should do nothing when adding an empty linkage array", () => {
            return modifyRelationship("POST", updates_1.VALID_TO_MANY_RELATIONSHIP_EMPTY_PATCH, relationshipEndpointUrl).then(() => {
                return testRelationshipState(updates_1.VALID_ORG_RELATIONSHIP_PATCH, relationshipEndpointUrl);
            });
        });
    });
    describe("removing from a to-many relationship at a relationship endpoint", () => {
        it("should work", () => {
            return modifyRelationship("DEL", updates_1.VALID_ORG_RELATIONSHIP_PATCH, relationshipEndpointUrl).then(() => {
                return testRelationshipState(updates_1.VALID_TO_MANY_RELATIONSHIP_EMPTY_PATCH, relationshipEndpointUrl);
            });
        });
        it("should be a no-op when removing an item that isn't in the relationship", () => {
            return modifyRelationship("DEL", updates_1.VALID_ORG_RELATIONSHIP_PATCH, relationshipEndpointUrl).then(() => {
                return testRelationshipState(updates_1.VALID_TO_MANY_RELATIONSHIP_EMPTY_PATCH, relationshipEndpointUrl);
            });
        });
        it("should ignore duplicates in linkage to remove", () => {
            return modifyRelationship("POST", updates_1.VALID_ORG_RELATIONSHIP_PATCH, relationshipEndpointUrl)
                .then(() => modifyRelationship("DEL", duplicateLinkage, relationshipEndpointUrl))
                .then(() => testRelationshipState(updates_1.VALID_TO_MANY_RELATIONSHIP_EMPTY_PATCH, relationshipEndpointUrl));
        });
        it("should do nothing when removing an empty linkage array", () => {
            return modifyRelationship("POST", updates_1.VALID_ORG_RELATIONSHIP_PATCH, relationshipEndpointUrl)
                .then(() => modifyRelationship("DEL", updates_1.VALID_TO_MANY_RELATIONSHIP_EMPTY_PATCH, relationshipEndpointUrl))
                .then(() => testRelationshipState(updates_1.VALID_ORG_RELATIONSHIP_PATCH, relationshipEndpointUrl));
        });
    });
    describe("Using POST or DELETE on a to-one relationship", () => {
        it.skip("should 405");
    });
});
