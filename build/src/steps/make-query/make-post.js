"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate_resource_ids_1 = require("../pre-query/validate-resource-ids");
const Errors = require("../../util/errors");
const CreateQuery_1 = require("../../types/Query/CreateQuery");
const AddToRelationshipQuery_1 = require("../../types/Query/AddToRelationshipQuery");
const ResourceSet_1 = require("../../types/ResourceSet");
function default_1(request, registry, makeDoc) {
    const primary = request.document.primary._data;
    const type = request.type;
    if (request.aboutRelationship) {
        if (primary.isSingular) {
            throw Errors.expectedDataArray({
                detail: "To add to a to-many relationship, you must POST an array of linkage objects."
            });
        }
        if (!request.id || !request.relationship) {
            throw new Error("Somehow, this request was 'about a relationship' and yet didn't " +
                "include a resource id and a relationship name. This shouldn't happen." +
                "Check that your routes are passing params into the library correctly.");
        }
        return new AddToRelationshipQuery_1.default({
            type,
            id: request.id,
            relationshipName: request.relationship,
            linkage: primary.values,
            returning: () => ({ status: 204 })
        });
    }
    else {
        if (primary.some(validate_resource_ids_1.hasId)) {
            throw Errors.unsupportedClientId();
        }
        return new CreateQuery_1.default({
            type,
            records: primary,
            returning: ({ created }) => {
                const res = {
                    status: 201,
                    document: makeDoc({ primary: ResourceSet_1.default.of({ data: created }) })
                };
                if (created.isSingular) {
                    const createdResource = created.unwrap();
                    const { self: selfTemplate } = (registry.urlTemplates(createdResource.type) || { self: undefined });
                    if (selfTemplate) {
                        res.headers = {
                            Location: selfTemplate(Object.assign({ id: createdResource.id }, createdResource.attrs))
                        };
                    }
                }
                return res;
            }
        });
    }
}
exports.default = default_1;
