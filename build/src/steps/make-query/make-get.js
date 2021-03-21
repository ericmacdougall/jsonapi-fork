"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Errors = require("../../util/errors");
const ResourceSet_1 = require("../../types/ResourceSet");
const FindQuery_1 = require("../../types/Query/FindQuery");
function default_1(request, registry, makeDoc) {
    const type = request.type;
    if (!request.aboutRelationship) {
        if (request.queryParams.page && typeof request.id === 'string') {
            throw Errors.illegalQueryParam({
                detail: "Pagination is not supported on requests for a single resource."
            });
        }
        const paginationSettings = registry.pagination(type);
        const defaultPageSize = paginationSettings && paginationSettings.defaultPageSize;
        const { include = registry.defaultIncludes(type), page: { offset = undefined, limit = defaultPageSize } = {}, fields, sort, filter } = request.queryParams;
        return new FindQuery_1.default({
            type,
            id: request.id,
            populates: include,
            select: fields,
            sort,
            filters: filter,
            offset,
            limit,
            returning: ({ primary, included, collectionSize }) => ({
                document: makeDoc(Object.assign({ primary: ResourceSet_1.default.of({ data: primary }), included }, (collectionSize != undefined
                    ? { meta: { total: collectionSize } }
                    : {})))
            })
        });
    }
    if (request.queryParams.page) {
        throw Errors.illegalQueryParam({
            detail: "Pagination is not supported on requests for resource linkage."
        });
    }
    if (!request.id || !request.relationship) {
        throw new Error("An id and a relationship path must be provided on requests for resource linkage.");
    }
    return new FindQuery_1.default({
        type,
        populates: [],
        id: request.id,
        returning({ primary }) {
            const resource = primary.unwrap();
            const relationship = resource.relationships &&
                resource.relationships[request.relationship];
            if (!relationship) {
                return {
                    status: 404,
                    document: makeDoc({
                        errors: [
                            Errors.unknownRelationshipName({
                                detail: `${request.relationship} is not a valid ` +
                                    `relationship name on resources of type '${type}'`
                            })
                        ]
                    })
                };
            }
            return {
                document: makeDoc({ primary: relationship })
            };
        }
    });
}
exports.default = default_1;
