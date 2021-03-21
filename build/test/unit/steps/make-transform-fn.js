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
const fixtures_1 = require("../fixtures");
const Resource_1 = require("../../../src/types/Resource");
const ResourceIdentifier_1 = require("../../../src/types/ResourceIdentifier");
const ResourceTypeRegistry_1 = require("../../../src/ResourceTypeRegistry");
const make_transform_fn_1 = require("../../../src/steps/make-transform-fn");
describe("makeTransformFn", () => {
    const registry = new ResourceTypeRegistry_1.default({
        "law-schools": {
            parentType: "schools",
            beforeRender(it, meta, extras, superFn) {
                return __awaiter(this, void 0, void 0, function* () {
                    it.lawSchools = true;
                    return superFn(it, meta);
                });
            }
        },
        "kindergartens": {
            parentType: "schools",
            transformLinkage: true,
            beforeSave(it, meta, extras, superFn) {
                return __awaiter(this, void 0, void 0, function* () {
                    it.kindergartens = true;
                    return superFn(it);
                });
            }
        },
        "schools": {
            parentType: "organizations",
            transformLinkage: false,
            beforeSave(it, meta, extras, superFn) {
                it.schools = true;
                it.schoolSuper = superFn;
                it.schoolExtras = extras;
                it.schoolMeta = meta;
                return superFn(it, meta);
            },
            beforeRender: undefined
        },
        "organizations": {
            transformLinkage: true,
            beforeSave(it, meta, extras, superFn) {
                it.organizations = true;
                return superFn(it, meta);
            },
            beforeRender(it, meta, extras, superFn) {
                return __awaiter(this, void 0, void 0, function* () {
                    it.organizations = true;
                    return it;
                });
            }
        },
        "people": {
            transformLinkage: false
        },
        "incomes": {
            transformLinkage: false,
            beforeRender(it, meta, extras, superFn) {
                return __awaiter(this, void 0, void 0, function* () {
                    it.incomes = true;
                    return superFn(it, meta);
                });
            },
            beforeSave(it, meta, extras, superFn) {
                it.incomes = true;
                return superFn(it, meta);
            }
        },
        "sponsorships": {
            parentType: "incomes",
            transformLinkage: true,
            beforeRender(it, meta, extras, superFn) {
                it.sponsorships = true;
                return superFn(it, meta);
            },
            beforeSave(it, meta, extras, superFn) {
                return __awaiter(this, void 0, void 0, function* () {
                    it.sponsorships = true;
                    return it;
                });
            }
        }
    }, {
        dbAdapter: fixtures_1.minimalDummyAdapter
    });
    const makeWithTypePath = (klass) => (childTypeName) => {
        const res = new klass(registry.rootTypeNameOf(childTypeName), "2");
        res.typePath = registry.typePathTo(childTypeName);
        return res;
    };
    const makeResource = makeWithTypePath(Resource_1.default);
    const makeResourceId = makeWithTypePath(ResourceIdentifier_1.default);
    const meta = { section: "included" };
    const extras = {
        registry,
        serverReq: { serverReq: true },
        serverRes: { serverRes: true },
        request: { libRequest: true }
    };
    describe("super function", () => {
        it("should be binary, with extras, superFn already bound", () => {
            const resource = makeResource("kindergartens");
            const transformFn = make_transform_fn_1.default("beforeSave", extras);
            return transformFn(resource, meta).then(newResource => {
                chai_1.expect(newResource.kindergartens).to.be.true;
                chai_1.expect(newResource.schoolExtras).to.equal(extras);
                chai_1.expect(newResource.schoolMeta).to.be.undefined;
                chai_1.expect(newResource.schoolSuper).to.be.a("function");
            });
        });
        it("should call the parent transform, even many levels deep, and be a noop if at root type", () => {
            const resource = makeResource("kindergartens");
            const transformFn = make_transform_fn_1.default("beforeSave", extras);
            return transformFn(resource, meta).then(newResource => {
                const { kindergartens, schools, organizations } = newResource;
                chai_1.expect(kindergartens).to.be.true;
                chai_1.expect(schools).to.be.true;
                chai_1.expect(organizations).to.be.true;
            });
        });
        it("should be a noop if the parent type is missing the relevant transform", () => {
            const resource = makeResource("law-schools");
            const transformFn = make_transform_fn_1.default("beforeRender", extras);
            return transformFn(resource, meta).then(newResource => {
                const { lawSchools, organizations } = newResource;
                chai_1.expect(lawSchools).to.be.true;
                chai_1.expect(organizations).to.be.undefined;
            });
        });
        it("should not run unless called explicitly by the child function", () => {
            const resource = makeResource("sponsorships");
            const transformFn = make_transform_fn_1.default("beforeSave", extras);
            return transformFn(resource, meta).then(newResource => {
                chai_1.expect(newResource).to.have.property("sponsorships", true);
                chai_1.expect(newResource).to.not.have.property("incomes");
            });
        });
    });
    describe("transforming linkage", () => {
        it("should ignore the typesList when deciding whether and how to transform linkage", () => {
            const linkage1 = makeResourceId("schools");
            const linkage2 = makeResourceId("sponsorships");
            const linkage3 = makeResourceId("kindergartens");
            const saveTransformFn = make_transform_fn_1.default("beforeSave", extras);
            const renderTransformFn = make_transform_fn_1.default("beforeRender", extras);
            return Promise.all([
                saveTransformFn(linkage1, meta),
                renderTransformFn(linkage2, meta),
                saveTransformFn(linkage3, meta)
            ]).then(([newLinkage1, newLinkage2, newLinkage3]) => {
                chai_1.expect(newLinkage1).to.have.property("organizations", true);
                chai_1.expect(newLinkage1).to.not.have.property("schools");
                chai_1.expect(newLinkage2).to.not.have.any.keys("incomes", "sponsorships");
                chai_1.expect(newLinkage3).to.have.property("organizations", true);
                chai_1.expect(newLinkage3).to.not.have.any.keys("schools", "kindergartens");
            });
        });
    });
});
