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
const Errors = require("../../util/errors");
const Resource_1 = require("../../types/Resource");
const ResourceIdentifier_1 = require("../../types/ResourceIdentifier");
const Relationship_1 = require("../../types/Relationship");
const Data_1 = require("../../types/Generic/Data");
function default_1(jsonData, parseAsLinkage = false) {
    return __awaiter(this, void 0, void 0, function* () {
        return parseAsLinkage
            ? Data_1.default.fromJSON(jsonData).map(toResourceIdentifier)
            : Data_1.default.fromJSON(jsonData).map(toResource);
    });
}
exports.default = default_1;
function toResourceIdentifier(json) {
    return ResourceIdentifier_1.default.fromJSON(json);
}
function toResource(json) {
    const { id, type, attributes, meta, relationships = {} } = json;
    Object.keys(relationships).forEach(key => {
        if (typeof relationships[key].data === 'undefined') {
            throw Errors.relationshipMissingLinkage({
                detail: `No data was found for the ${key} relationship.`
            });
        }
        relationships[key] = Relationship_1.default.of({
            data: relationships[key].data,
            owner: { type, id, path: key }
        }).map(toResourceIdentifier);
    });
    try {
        return new Resource_1.default(type, id, attributes, relationships, meta);
    }
    catch (e) {
        switch (e.code) {
            case 1:
                throw Errors.resourceMissingTypeKey();
            case 2:
                throw Errors.resourceMetaNonObject();
            case 3:
                throw Errors.resourceFieldsContainerNonObject();
            case 4:
                throw Errors.resourceIdentifierKeyAsField();
            case 5:
                throw Errors.resourceDuplicateField({
                    detail: `${e.field} appears in both places.`
                });
            case 6:
                throw Errors.genericValidation({
                    detail: e.message
                });
            default:
                throw e;
        }
    }
}
