"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai = require("chai");
const chaiSubset = require("chai-subset");
const fixtures_1 = require("./fixtures");
const ResourceTypeRegistry_1 = require("../../src/ResourceTypeRegistry");
const UrlTemplate_1 = require("../../src/types/UrlTemplate");
chai.use(chaiSubset);
const expect = chai.expect;
const makeGetterTest = function (value, type, methodName) {
    return function () {
        const registry = new ResourceTypeRegistry_1.default({
            [type]: {
                [methodName]: value
            }
        }, {
            dbAdapter: fixtures_1.minimalDummyAdapter
        });
        switch ((value === null) || typeof value) {
            case "function":
                expect(registry[methodName](type)).to.deep.equal(value);
                break;
            case "object":
                expect(registry[methodName](type)).to.containSubset(value);
                break;
            default:
                expect(registry[methodName](type)).to.equal(value);
        }
    };
};
describe("ResourceTypeRegistry", function () {
    describe("constructor", () => {
        it("should register provided resource descriptions", () => {
            const registry = new ResourceTypeRegistry_1.default({
                "someType": { info: { "description": "provided to constructor" } }
            }, { dbAdapter: fixtures_1.minimalDummyAdapter });
            const resType = registry.type("someType");
            const resTypeInfo = resType.info;
            expect(resType).to.be.an("object");
            expect(resTypeInfo.description).to.equal("provided to constructor");
        });
        it("should deep merge descriptionDefaults into resource description", () => {
            const registry = new ResourceTypeRegistry_1.default({
                "someType": {
                    info: { "example": "merged with the default" }
                }
            }, {
                info: { description: "provided as default" },
                dbAdapter: fixtures_1.minimalDummyAdapter
            });
            const resTypeInfo = registry.type("someType").info;
            expect(resTypeInfo).to.deep.equal({
                example: "merged with the default",
                description: "provided as default"
            });
        });
        it("should merge parent type's description into resource description", () => {
            const registry = new ResourceTypeRegistry_1.default({
                "b": {
                    parentType: "a",
                    info: { "description": "b" },
                    defaultIncludes: [],
                    dbAdapter: fixtures_1.minimalDummyAdapter
                },
                "a": {
                    info: { "description": "A", "example": "example from a" },
                    defaultIncludes: null,
                    dbAdapter: fixtures_1.minimalDummyAdapter
                }
            });
            const resTypeInfo = registry.type("b").info;
            const resTypeIncludes = registry.type("b").defaultIncludes;
            expect(resTypeInfo).to.deep.equal({
                example: "example from a",
                description: "b"
            });
            expect(resTypeIncludes).to.deep.equal([]);
        });
        it("should give the description precedence over the provided default", () => {
            const someTypeDesc = {
                beforeSave: (resource, req, res) => { return resource; }
            };
            const registry = new ResourceTypeRegistry_1.default({
                "someType": someTypeDesc
            }, {
                beforeSave: (resource, req, res) => { return resource; },
                dbAdapter: fixtures_1.minimalDummyAdapter
            });
            expect(registry.type("someType").beforeSave).to.equal(someTypeDesc.beforeSave);
        });
        it("should give description and resource defaults precedence over global defaults", () => {
            const registry = new ResourceTypeRegistry_1.default({
                "testType": { transformLinkage: false },
                "testType2": {}
            }, {
                transformLinkage: true,
                dbAdapter: fixtures_1.minimalDummyAdapter
            });
            const testTypeOutput = registry.type("testType");
            const testType2Output = registry.type("testType2");
            expect(testTypeOutput.transformLinkage).to.be.false;
            expect(testType2Output.transformLinkage).to.be.true;
        });
        it("should only look for descriptions at own, enumerable props of descs arg", () => {
            const typeDescs = Object.create({
                prototypeKey: {}
            }, {
                legitDesc: { value: { dbAdapter: fixtures_1.minimalDummyAdapter }, enumerable: true },
                nonEnumerableKey: { value: {}, enumerable: false }
            });
            const registeredTypes = new ResourceTypeRegistry_1.default(typeDescs).typeNames();
            expect(registeredTypes).to.contain("legitDesc");
            expect(registeredTypes).to.not.contain("nonEnumerableKey");
            expect(registeredTypes).to.not.contain("prototypeKey");
        });
        it("should reject type descs with no adapter", () => {
            expect(() => new ResourceTypeRegistry_1.default({
                "a": { transformLinkage: false }
            })).to.throw(/must be registered with a db adapter/);
        });
        it("Should allow null/undefined to overwrite all defaults", () => {
            const registry = new ResourceTypeRegistry_1.default({
                "testType": {
                    "info": null
                }
            }, {
                info: { example: "s" },
                dbAdapter: fixtures_1.minimalDummyAdapter
            });
            expect(registry.info("testType")).to.equal(null);
        });
    });
    describe("urlTemplates()", () => {
        it("should return a parsed copy of the templates for all types", () => {
            const aTemps = { "self": "" };
            const bTemps = { "related": "" };
            const typeDescs = {
                "a": { urlTemplates: aTemps, dbAdapter: fixtures_1.minimalDummyAdapter },
                "b": { urlTemplates: bTemps, dbAdapter: fixtures_1.minimalDummyAdapter }
            };
            const registry = new ResourceTypeRegistry_1.default(typeDescs);
            const templatesOut = registry.urlTemplates();
            expect(templatesOut.a).to.not.equal(aTemps);
            expect(templatesOut.b).to.not.equal(bTemps);
            expect(templatesOut.a.self).to.be.a("function");
            expect(templatesOut.b.related).to.be.a("function");
        });
    });
    describe("urlTemplates(type)", () => {
        it("should be a getter for a type's parsed urlTemplates", () => {
            const registry = new ResourceTypeRegistry_1.default({
                "mytypes": { urlTemplates: { "path": "test template" } }
            }, {
                dbAdapter: fixtures_1.minimalDummyAdapter
            });
            const templateOut = registry.urlTemplates("mytypes").path;
            expect(registry.urlTemplates("mytypes")).to.be.an("object");
            expect(templateOut({})).to.equal("test%20template");
            expect(templateOut[UrlTemplate_1.RFC6570String]).to.equal("test template");
        });
    });
    describe("errorsConfig", () => {
        it("should be a getter, while returning parsed templates", () => {
            const registry = new ResourceTypeRegistry_1.default({}, { dbAdapter: fixtures_1.minimalDummyAdapter }, { urlTemplates: { about: "http://google.com/" } });
            expect(registry.errorsConfig().urlTemplates.about({})).to.equal("http://google.com/");
        });
    });
    describe("adapter", () => {
        const adapterClone = Object.assign({}, fixtures_1.minimalDummyAdapter, { constructor: function () { return; } });
        it("should be a getter for a type's db adapter", makeGetterTest(adapterClone, "mytypes", "dbAdapter"));
    });
    describe("beforeSave", () => {
        it("should be a getter for a type for a type's beforeSave", makeGetterTest(() => { return; }, "mytypes", "beforeSave"));
    });
    describe("beforeRender", () => {
        it("should be a getter for a type's beforeRender", makeGetterTest(() => { return; }, "mytypes", "beforeRender"));
    });
    describe("info", () => {
        it("should be a getter for a type's info", makeGetterTest({}, "mytypes", "info"));
    });
    describe("type tree functions", () => {
        const registry = new ResourceTypeRegistry_1.default({
            "kindergartens": { "parentType": "schools" },
            "schools": { "parentType": "organizations" },
            "organizations": {},
            "people": {},
            "law-schools": { parentType: "schools" }
        }, {
            dbAdapter: fixtures_1.minimalDummyAdapter
        });
        describe("parentTypeName", () => {
            it("should be a getter for a type's parentType", () => {
                expect(registry.parentTypeName("schools")).to.equal("organizations");
                expect(registry.parentTypeName("organizations")).to.be.undefined;
            });
        });
        describe("rootTypeNameOf", () => {
            it("should be a getter for a type's top-most parentType", () => {
                expect(registry.rootTypeNameOf("kindergartens")).to.equal("organizations");
                expect(registry.rootTypeNameOf("schools")).to.equal("organizations");
                expect(registry.rootTypeNameOf("organizations")).to.equal("organizations");
            });
        });
        describe("typePathTo", () => {
            it("should return the path through the type tree to the provided type", () => {
                expect(registry.typePathTo("kindergartens"))
                    .to.deep.equal(["kindergartens", "schools", "organizations"]);
                expect(registry.typePathTo("schools"))
                    .to.deep.equal(["schools", "organizations"]);
                expect(registry.typePathTo("people")).to.deep.equal(["people"]);
            });
        });
        describe("asTypePath", () => {
            const sut = registry.asTypePath.bind(registry);
            const validPaths = [
                { path: ["people"] },
                { path: ["organizations", "schools"], ordered: ["schools", "organizations"] },
                { path: ["schools", "organizations"] },
                { path: ["kindergartens", "organizations", "schools"],
                    ordered: ["kindergartens", "schools", "organizations"] },
                { path: ["law-schools", "schools", "organizations"] }
            ];
            const invalidPaths = [
                { path: ["schools"] },
                { path: ["organizations", "schools", "kindergartens", "law-schools"] },
                { path: ["organizations", "schools", "people"] },
                { path: ["people", "john-does"] }
            ];
            it("should not accept an empty path as valid", () => {
                expect(sut([])).to.be.false;
                expect(sut([], "schools")).to.be.false;
            });
            describe("without throughType", () => {
                it("should return the ordered path if path points to a type; else false", () => {
                    validPaths.forEach(path => {
                        expect(sut(path.path)).to.deep.equal(path.ordered || path.path);
                    });
                    invalidPaths.forEach(path => {
                        expect(sut(path.path)).to.be.false;
                    });
                });
            });
            describe("with throughType", () => {
                it("should return the ordered path if path points to throughType or a child of it; else false", () => {
                    const typeNames = registry.typeNames();
                    invalidPaths.forEach(path => {
                        const throughType = Math.random() < 0.5 ? "schools" : "people";
                        expect(sut(path.path, throughType)).to.be.false;
                    });
                    validPaths.forEach(path => {
                        const pathTypesSet = new Set(path.path);
                        const validThroughType = getRandomElm(path.path);
                        const invalidThroughType = getRandomElm([...new Set(typeNames.filter(it => !pathTypesSet.has(it)))]);
                        expect(sut(path.path, validThroughType)).to.deep.equal(path.ordered || path.path);
                        expect(sut(path.path, invalidThroughType)).to.be.false;
                    });
                });
            });
        });
    });
});
function getRandomElm(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
