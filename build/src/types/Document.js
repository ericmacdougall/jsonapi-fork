"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const misc_1 = require("../util/misc");
const Data_1 = require("./Generic/Data");
const ResourceSet_1 = require("./ResourceSet");
const Relationship_1 = require("./Relationship");
class Document {
    constructor(data) {
        const { urlTemplates = {}, errorUrlTemplates = {} } = data, restData = __rest(data, ["urlTemplates", "errorUrlTemplates"]);
        if (typeof data.meta !== 'undefined' && !misc_1.isPlainObject(data.meta)) {
            throw new Error("Document `meta` must be an object.");
        }
        Object.assign(this, restData, { urlTemplates, errorUrlTemplates });
    }
    toJSON() {
        const res = {};
        const serializeResource = (it) => it.toJSON(this.urlTemplates[it.type] || {});
        const templatesForRelationship = (templatesForOwnerType) => {
            const { related, relationship } = templatesForOwnerType;
            return { related, self: relationship };
        };
        const { data, links = {} } = (() => {
            if (this.primary instanceof ResourceSet_1.default) {
                return this.primary.toJSON(this.urlTemplates);
            }
            else if (this.primary instanceof Relationship_1.default) {
                return this.primary.toJSON(templatesForRelationship(this.urlTemplates[this.primary.owner.type] || {}));
            }
            else if (this.primary) {
                return this.primary.toJSON();
            }
            return {};
        })();
        if (this.meta) {
            res.meta = this.meta;
        }
        if (!misc_1.objectIsEmpty(links)) {
            res.links = links;
        }
        if (this.errors) {
            res.errors = this.errors.map(it => it.toJSON(this.errorUrlTemplates));
        }
        else {
            res.data = data;
            if (this.included) {
                res.included = this.included.map(serializeResource);
            }
        }
        return res;
    }
    toString() {
        return JSON.stringify(this.toJSON());
    }
    clone() {
        const Ctor = (this.constructor || Document);
        return new Ctor(this);
    }
    getContents() {
        return [
            ...(this.included || []),
            ...(this.primary ? this.primary.values : [])
        ];
    }
    transform(fn, resourcesOnly = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = this.clone();
            const flatMapper = (it, meta) => __awaiter(this, void 0, void 0, function* () {
                const result = yield fn(it, meta);
                return result === undefined ? Data_1.default.empty : Data_1.default.pure(result);
            });
            const resourceFlatMapper = resourcesOnly
                ? flatMapper
                : function (it, meta) {
                    return __awaiter(this, void 0, void 0, function* () {
                        const relationshipNames = Object.keys(it.relationships);
                        const flatMapperWithMeta = (it2) => flatMapper(it2, meta);
                        const newRelationshipPromises = relationshipNames.map(k => it.relationships[k].flatMapAsync(flatMapperWithMeta));
                        const newRelationships = yield Promise.all(newRelationshipPromises);
                        newRelationships.forEach((newRelationship, i) => {
                            it.relationships[relationshipNames[i]] = newRelationship;
                        });
                        return flatMapper(it, meta);
                    });
                };
            const newPrimaryPromiseOrUndefined = (() => {
                const primaryMeta = { section: "primary" };
                const resourceFlatMapperWithMeta = (it2) => resourceFlatMapper(it2, primaryMeta);
                if (res.primary instanceof ResourceSet_1.default) {
                    return res.primary.flatMapAsync(resourceFlatMapperWithMeta);
                }
                if (!res.primary || resourcesOnly) {
                    return res.primary;
                }
                return res.primary.flatMapAsync((it2) => flatMapper(it2, primaryMeta));
            })();
            if (res.included) {
                const includedMeta = { section: "included" };
                const resourceFlatMapperWithMeta = (it2) => resourceFlatMapper(it2, includedMeta);
                res.included =
                    (yield Data_1.default.of(res.included).flatMapAsync(resourceFlatMapperWithMeta)).values;
            }
            res.primary = yield newPrimaryPromiseOrUndefined;
            return res;
        });
    }
}
exports.default = Document;
