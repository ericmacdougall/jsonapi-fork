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
const chai = require("chai");
const sinon = require("sinon");
const chaiSubset = require("chai-subset");
const Data_1 = require("../../../src/types/Generic/Data");
const Resource_1 = require("../../../src/types/Resource");
const ResourceSet_1 = require("../../../src/types/ResourceSet");
const Relationship_1 = require("../../../src/types/Relationship");
const ResourceIdentifier_1 = require("../../../src/types/ResourceIdentifier");
const ResourceIdentifierSet_1 = require("../../../src/types/ResourceIdentifierSet");
const Document_1 = require("../../../src/types/Document");
const templating = require("url-template");
const expect = chai.expect;
chai.use(chaiSubset);
describe("Document class", () => {
    const makeEmptyRelation = () => Relationship_1.default.of({
        data: Data_1.default.empty,
        owner: { type: "people", path: "organization", id: "31" }
    });
    const makeDatalessRelation = () => Relationship_1.default.of({
        data: undefined,
        owner: { type: "people", path: "organization", id: "32" },
        links: { self: ({ ownerId }) => `http://localhost/a?filter=${ownerId}` }
    });
    const makeFullRelation = () => Relationship_1.default.of({
        data: Data_1.default.pure(new ResourceIdentifier_1.default("organizations", "1")),
        owner: { type: "people", path: "organization", id: "33" },
        links: { self: ({ ownerId }) => `http://localhost/a?filter=${ownerId}` }
    });
    const makePerson = () => new Resource_1.default("people", "31", { name: "mark" }, { organization: makeEmptyRelation() });
    const makePerson2 = () => new Resource_1.default("people", "32", { name: "ethan" }, { organization: makeDatalessRelation() });
    const makePerson3 = () => new Resource_1.default("people", "33", { name: "john" }, { organization: makeFullRelation() });
    const person = makePerson();
    const person2 = makePerson2();
    const people = Data_1.default.of([person, person2]);
    const topLevelMeta = { mcawesome: true };
    const urlTemplates = {
        people: {
            relationship: templating.parse("RELATIONSHIP{ownerId}{path}").expand
        }
    };
    describe("Creating a Document", () => {
        it("should reject non-object meta information", () => {
            expect(() => new Document_1.default({
                primary: ResourceSet_1.default.of({ data: people }),
                meta: ["bob"]
            })).to.throw(/meta.*object/i);
        });
    });
    describe("Rendering a document", () => {
        const relationshipDocJSON = new Document_1.default({
            primary: makeDatalessRelation()
        }).toJSON();
        const singleResourceDocJSON = new Document_1.default({
            primary: ResourceSet_1.default.of({ data: Data_1.default.pure(person) }),
            meta: topLevelMeta,
            urlTemplates
        }).toJSON();
        const collectionDocJSON = new Document_1.default({
            primary: ResourceSet_1.default.of({ data: people }),
            meta: topLevelMeta,
            urlTemplates
        }).toJSON();
        it("should key primary data under data, with each resource's type, id", () => {
            expect(singleResourceDocJSON.data).to.containSubset({ "id": "31", "type": "people" });
        });
        it("resource collections should be represented as arrays", () => {
            expect(collectionDocJSON.data).to.be.an("array");
        });
        it("should represent includes as an array under `included`", () => {
            const doc = new Document_1.default({
                primary: ResourceSet_1.default.of({ data: people }),
                included: [person2]
            });
            expect(doc.toJSON().included)
                .to.containSubset([{ "id": "32", "type": "people", "attributes": { "name": "ethan" } }]);
        });
        it("Should include a top-level self links from primary", () => {
            const primary = ResourceSet_1.default.of({ data: people });
            primary.links.self = () => "http://bob";
            const doc = new Document_1.default({
                primary,
                included: [person2]
            });
            const docJSON = doc.toJSON();
            expect(docJSON.links).to.be.an("object");
            expect(docJSON.links && docJSON.links.self).to.equal("http://bob");
        });
        it("should output top-level meta information, iff provided", () => {
            const docWithoutMeta = new Document_1.default({
                primary: ResourceSet_1.default.of({ data: people }),
                included: [person2]
            });
            expect(collectionDocJSON.meta).to.deep.equal(topLevelMeta);
            expect(docWithoutMeta.toJSON().meta).to.be.undefined;
        });
        it("should output relationship linkage iff provided", () => {
            if (!collectionDocJSON.data) {
                throw new Error("Should have top-level data.");
            }
            expect(collectionDocJSON.data[0].relationships.organization).to.have.property("data");
            expect(collectionDocJSON.data[0].relationships.organization.data).to.equal(null);
            expect(collectionDocJSON.data[1].relationships.organization).to.not.have.property("data");
        });
        it("should output relationship links iff provided, preferring relationship-specific templates", () => {
            if (!collectionDocJSON.data) {
                throw new Error("Should have top-level data.");
            }
            expect(collectionDocJSON.data[0].relationships.organization.links).to.be.an("object");
            expect(collectionDocJSON.data[0].relationships.organization.links.self).to.equal("RELATIONSHIP31organization");
            expect(collectionDocJSON.data[0].relationships.organization.links).to.not.have.property("related");
            expect(collectionDocJSON.data[1].relationships.organization.links).to.be.an("object");
            expect(collectionDocJSON.data[1].relationships.organization.links.self).to.equal("http://localhost/a?filter=32");
        });
        it("should render top-level links when a relationship is primary data", () => {
            expect(relationshipDocJSON.links).to.be.an("object");
            expect(relationshipDocJSON.links.self).to.equal("http://localhost/a?filter=32");
        });
    });
    describe("transform", () => {
        const removeTransform = it => Promise.resolve(undefined);
        const removeLinkageTransform = (it) => {
            return Promise.resolve(it instanceof Resource_1.default ? it : undefined);
        };
        let collectionDoc, relationshipDoc, collectionWithLinkageDoc, singleResourceDoc, resourceIdDoc;
        beforeEach(() => {
            collectionDoc = new Document_1.default({
                primary: ResourceSet_1.default.of({ data: [makePerson(), makePerson2()] }),
                included: [makePerson2()]
            });
            relationshipDoc = new Document_1.default({ primary: makeFullRelation() });
            collectionWithLinkageDoc = new Document_1.default({
                primary: ResourceSet_1.default.of({ data: [makePerson(), makePerson3()] }),
                included: [makePerson2()]
            });
            singleResourceDoc = new Document_1.default({
                primary: ResourceSet_1.default.of({ data: Data_1.default.pure(makePerson3()) }),
                meta: topLevelMeta
            });
            resourceIdDoc = new Document_1.default({
                primary: ResourceIdentifierSet_1.default.of({
                    data: [new ResourceIdentifier_1.default("people", "4")]
                }),
                meta: topLevelMeta
            });
        });
        it("should remove items when function returns undefined", () => {
            const newDocsPromises = [
                collectionDoc.transform(removeTransform, false),
                relationshipDoc.transform(removeTransform, false),
                resourceIdDoc.transform(removeTransform, false),
                singleResourceDoc.transform(removeLinkageTransform, false)
            ];
            return Promise.all(newDocsPromises).then((newDocs) => {
                const newDocsJSON = newDocs.map(it => it.toJSON());
                expect(newDocsJSON[0].data).to.deep.equal([]);
                expect(newDocsJSON[0].included).to.deep.equal([]);
                expect(newDocsJSON[1].data).to.equal(null);
                expect(newDocsJSON[2].data).to.deep.equal([]);
                expect(newDocsJSON[3].data).to.deep.equal({
                    "type": "people",
                    "id": "33",
                    "attributes": { "name": "john" },
                    "relationships": {
                        "organization": {
                            "data": null,
                            "links": {
                                "self": "http://localhost/a?filter=33"
                            }
                        }
                    }
                });
            });
        });
        it("should skip linkage if second argument true", () => {
            const newDocsPromises = [
                relationshipDoc.transform(removeTransform, true),
                resourceIdDoc.transform(removeTransform, true),
                singleResourceDoc.transform(removeLinkageTransform, true)
            ];
            return Promise.all(newDocsPromises).then((newDocs) => {
                const newDocsJSON = newDocs.map(it => it.toJSON());
                expect(newDocsJSON[0].data).to.deep.equal({ type: "organizations", id: "1" });
                expect(newDocsJSON[1].data).to.deep.equal([{ type: "people", id: "4" }]);
                expect(newDocsJSON[2].data).to.deep.equal({
                    "type": "people",
                    "id": "33",
                    "attributes": { "name": "john" },
                    "relationships": {
                        "organization": {
                            "data": { type: "organizations", id: "1" },
                            "links": {
                                "self": "http://localhost/a?filter=33"
                            }
                        }
                    }
                });
            });
        });
        it("should leave document.meta alone", () => {
            return singleResourceDoc.transform(removeTransform).then((newDoc) => {
                expect(newDoc.meta).to.deep.equal(singleResourceDoc.meta);
            });
        });
        it("should call the tranform function on each resource/identifier with proper meta", () => __awaiter(this, void 0, void 0, function* () {
            const transformFn = sinon.spy(function (resourceOrId) {
                if (resourceOrId instanceof Resource_1.default && resourceOrId.id === "33") {
                    const linkage = resourceOrId.relationships.organization.values;
                    expect(linkage).to.deep.equal([new ResourceIdentifier_1.default("test", "4")]);
                }
                return resourceOrId instanceof ResourceIdentifier_1.default
                    ? Promise.resolve(new ResourceIdentifier_1.default("test", "4"))
                    : Promise.resolve(resourceOrId);
            });
            const hasMatchingCall = (calls, args) => {
                return calls.findIndex((call) => {
                    try {
                        expect(call.args).to.deep.equal(args);
                        return true;
                    }
                    catch (e) {
                        return false;
                    }
                }) > -1;
            };
            const [person1, person3] = collectionWithLinkageDoc.primary.values;
            const [person2] = collectionWithLinkageDoc.included;
            yield collectionWithLinkageDoc.transform(transformFn, false);
            const calls = transformFn.getCalls();
            expect(transformFn.callCount).to.equal(4);
            expect(hasMatchingCall(calls, [
                new ResourceIdentifier_1.default("organizations", "1"),
                { section: "primary" },
            ])).to.be.true;
            expect(hasMatchingCall(calls, [person3, { section: "primary" }])).to.be.true;
            expect(hasMatchingCall(calls, [person1, { section: "primary" }])).to.be.true;
            expect(hasMatchingCall(calls, [person2, { section: "included" }])).to.be.true;
        }));
    });
});
