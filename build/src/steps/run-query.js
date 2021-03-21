"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FindQuery_1 = require("../types/Query/FindQuery");
const CreateQuery_1 = require("../types/Query/CreateQuery");
const UpdateQuery_1 = require("../types/Query/UpdateQuery");
const DeleteQuery_1 = require("../types/Query/DeleteQuery");
const AddToRelationshipQuery_1 = require("../types/Query/AddToRelationshipQuery");
const RemoveFromRelationshipQuery_1 = require("../types/Query/RemoveFromRelationshipQuery");
const errors_1 = require("../util/errors");
function runQuery(registry, query) {
    const typeDesc = registry.type(query.type);
    if (!typeDesc) {
        throw errors_1.unknownResourceType({
            detail: `${query.type} is not a known type in this API.`
        });
    }
    const finalQuery = finalizeQuery(registry, query);
    const adapter = typeDesc.dbAdapter;
    const method = (
            (finalQuery instanceof CreateQuery_1.default && adapter.create) ||
            (finalQuery instanceof FindQuery_1.default && adapter.find) ||
            (finalQuery instanceof DeleteQuery_1.default && adapter.delete) ||
            (finalQuery instanceof UpdateQuery_1.default && adapter.update) ||
            (finalQuery instanceof AddToRelationshipQuery_1.default && adapter.addToRelationship) ||
            (finalQuery instanceof RemoveFromRelationshipQuery_1.default && adapter.removeFromRelationship)
        );
    if (!method) {
        throw new Error("Unexpected query type.");
    }
    return method.call(adapter, finalQuery);
}
function finalizeQuery(registry, query) {
    if (!(query instanceof FindQuery_1.default)) {
        return query;
    }
    const typeDesc = registry.type(query.type);
    let { limit } = query;
    const { ignoreLimitMax } = query;
    const { maxPageSize } = typeDesc.pagination;
    if (typeof maxPageSize === 'number' && !ignoreLimitMax) {
        if (typeof limit === 'undefined') {
            limit = maxPageSize;
        }
        else if (limit > maxPageSize) {
            throw errors_1.invalidQueryParamValue({
                detail: `Must use a smaller limit per page.`,
                source: { parameter: "page[limit]" }
            });
        }
        return query.withLimit(limit);
    }
    return query;
}
exports.default = runQuery;
