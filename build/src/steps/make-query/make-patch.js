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
const Relationship_1 = require("../../types/Relationship");
const UpdateQuery_1 = require("../../types/Query/UpdateQuery");
const Data_1 = require("../../types/Generic/Data");
const ResourceSet_1 = require("../../types/ResourceSet");
const set_type_paths_1 = require("../set-type-paths");
function default_1(request, registry, makeDoc) {
    return __awaiter(this, void 0, void 0, function* () {
        const type = request.type;
        const primary = request.document.primary._data;
        let changedResourceData;
        if (!request.aboutRelationship) {
            if (request.id) {
                if (!primary.isSingular) {
                    throw Errors.expectedDataObject({
                        detail: "You can't replace a single resource with a collection."
                    });
                }
                const providedResource = primary.unwrap();
                if (request.id !== (providedResource && providedResource.id)) {
                    throw Errors.invalidId({
                        detail: "The id of the resource you provided must match that in the URL."
                    });
                }
            }
            else if (primary.isSingular) {
                throw Errors.expectedDataArray({
                    detail: "You must provide an array of resources to do a bulk update."
                });
            }
            changedResourceData = primary;
        }
        else {
            if (!request.relationship || !request.id) {
                throw new Error("Somehow, this request was 'about a relationship' and yet didn't " +
                    "include a resource id and a relationship name. This shouldn't happen." +
                    "Check that your routes are passing params into the library correctly.");
            }
            const resourceType = registry.rootTypeNameOf(request.type);
            const dummyResource = new Resource_1.default(resourceType, request.id, undefined, {
                [request.relationship]: Relationship_1.default.of({
                    data: primary,
                    owner: { type: resourceType, id: request.id, path: request.relationship }
                })
            });
            yield set_type_paths_1.default([dummyResource], false, request.type, registry);
            changedResourceData = Data_1.default.pure(dummyResource);
        }
        return new UpdateQuery_1.default({
            type,
            patch: changedResourceData,
            returning: ({ updated: resources }) => ({
                document: makeDoc({
                    primary: request.aboutRelationship
                        ? resources.unwrap().relationships[request.relationship]
                        : ResourceSet_1.default.of({ data: resources })
                })
            })
        });
    });
}
exports.default = default_1;
