"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const sut = require("../../../src/util/naming-conventions");
describe("Mongoose Adapter Conventional Naming Utils", () => {
    const typeNamesToModelNames = {
        "teams": "Team",
        "jobs": "Job",
        "events": "Event",
        "venues": "Venue",
        "related-clubs": "RelatedClub",
        "team-memberships": "TeamMembership"
    };
    describe("getTypeName", () => {
        it("should lowercase & pluralize the model name; use dashes in camelCased names", () => {
            for (const type in typeNamesToModelNames) {
                chai_1.expect(sut.getTypeName(typeNamesToModelNames[type])).to.equal(type);
            }
        });
        it("should use a custom pluralize if provided", () => {
            const pluralize = () => "customplural";
            chai_1.expect(sut.getTypeName("TestModel", pluralize)).to.equal("customplural");
        });
    });
    describe("getModelName", () => {
        it("should reverse getTypeName", () => {
            for (const type in typeNamesToModelNames) {
                const modelName = typeNamesToModelNames[type];
                chai_1.expect(sut.getModelName(type)).to.equal(modelName);
            }
        });
        it("should use a custom singularizer if provided", () => {
            const singularize = () => "customsingular";
            chai_1.expect(sut.getModelName("test-models", singularize)).to.equal("TestCustomsingular");
        });
    });
});
