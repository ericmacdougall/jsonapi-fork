"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const APIError_1 = require("../types/APIError");
exports.genericValidation = (data) => new APIError_1.default(Object.assign({}, data, { status: 400, title: "Invalid data." }));
exports.genericNotFound = (data) => new APIError_1.default(Object.assign({}, data, { status: 404, title: "One or more of the targeted resources could not be found." }));
exports.generic405 = (data) => new APIError_1.default(Object.assign({}, data, { status: 405, title: "Method not supported." }));
exports.generic406 = (data) => new APIError_1.default(Object.assign({}, data, { status: 406, title: "Not Acceptable" }));
exports.generic415 = (data) => new APIError_1.default(Object.assign({}, data, { status: 415, title: "Invalid Media Type" }));
exports.invalidIncludePath = (data) => new APIError_1.default(Object.assign({}, data, { status: 400, typeUri: "https://jsonapi.js.org/errors/invalid-include-path", title: "Invalid include path." }));
exports.unsupportedIncludePath = (data) => new APIError_1.default(Object.assign({}, data, { status: 400, typeUri: "https://jsonapi.js.org/errors/unsupported-include-path", title: "Unsupported include path." }));
exports.illegalQueryParam = (data) => new APIError_1.default(Object.assign({}, data, { status: 400, typeUri: "https://jsonapi.js.org/errors/illegal-query-param", title: "One or more of the query parameters you provided is not allowed at this url." }));
exports.invalidQueryParamValue = (data) => new APIError_1.default(Object.assign({}, data, { status: 400, typeUri: "https://jsonapi.js.org/errors/invalid-query-param-value", title: "One or more of the query parameters you provided has an invalid value." }));
exports.illegalTypeList = (data) => new APIError_1.default(Object.assign({}, data, { status: 400, typeUri: "https://jsonapi.js.org/errors/illegal-types-list", title: "You cannot provide a list of (sub)-types on this request." }));
exports.invalidTypeList = (data) => new APIError_1.default(Object.assign({}, data, { status: 400, typeUri: "https://jsonapi.js.org/errors/invalid-types-list", title: "Invalid list of types." }));
exports.invalidResourceType = (data) => new APIError_1.default(Object.assign({}, data, { status: 400, typeUri: "https://jsonapi.js.org/errors/invalid-resource-type", title: "One or more of the provided/targeted resources is of a type " +
        "that's invalid (at least at this endpoint)." }));
exports.invalidRelationshipName = (data) => new APIError_1.default(Object.assign({}, data, { status: 400, typeUri: "https://jsonapi.js.org/errors/invalid-relationship-name", title: "A provided relationhsip name is not valid (at least on this resource)." }));
exports.invalidAttributeName = (data) => new APIError_1.default(Object.assign({}, data, { status: 400, typeUri: "https://jsonapi.js.org/errors/invalid-attribute-name", title: "A provided attribute is not valid (at least on this resource)." }));
exports.invalidLinkageStructure = (data) => new APIError_1.default(Object.assign({}, data, { status: 400, typeUri: "https://jsonapi.js.org/errors/invalid-linkage-json", title: "Part of the provided JSON was expected to be a resource " +
        "identifier object, but wasn't. Verify you have a { type, id } structure." }));
exports.invalidResourceStructure = (data) => new APIError_1.default(Object.assign({}, data, { status: 400, typeUri: "https://jsonapi.js.org/errors/resource-object-invalid-json", title: "Invalid resource object structure." }));
exports.resourceMissingTypeKey = (data) => new APIError_1.default(Object.assign({}, data, { status: 400, typeUri: "https://jsonapi.js.org/errors/resource-missing-type", title: "Provided resource object was missing the required `type` key." }));
exports.resourceMissingIdKey = (data) => new APIError_1.default(Object.assign({}, data, { status: 400, typeUri: "https://jsonapi.js.org/errors/resource-missing-id", title: "A provided resource object was missing a required `id` key." }));
exports.resourceMetaNonObject = (data) => new APIError_1.default(Object.assign({}, data, { status: 400, typeUri: "https://jsonapi.js.org/errors/resource-meta-non-object", title: "Provided resource object had a `meta` value that wasn't an object." }));
exports.resourceFieldsContainerNonObject = (data) => new APIError_1.default(Object.assign({}, data, { status: 400, typeUri: "https://jsonapi.js.org/errors/resource-fields-container-non-object", title: "Provided resource object had an `attributes` or `relationships` value that wasn't an object." }));
exports.resourceIdentifierKeyAsField = (data) => new APIError_1.default(Object.assign({}, data, { status: 400, typeUri: "https://jsonapi.js.org/errors/resource-identifier-key-used-as-field", title: "Resource objects cannot use `type` or `id` as a field." }));
exports.resourceDuplicateField = (data) => new APIError_1.default(Object.assign({}, data, { status: 400, typeUri: "https://jsonapi.js.org/errors/resource-duplicate-field", title: "Resource objects can't have an attribute and a relationship with the same name." }));
exports.relationshipMissingLinkage = (data) => new APIError_1.default(Object.assign({}, data, { status: 400, typeUri: "https://jsonapi.js.org/errors/relationship-missing-linkage", title: "Client-sent relationship objects must include `data`." }));
exports.invalidLinkageType = (data) => new APIError_1.default(Object.assign({}, data, { status: 400, typeUri: "https://jsonapi.js.org/errors/invalid-linkage-type", title: "One or more of the provided resource identifier objects is of a " +
        "type that's invalid in the targeted relationship." }));
exports.illegalFieldName = (data) => new APIError_1.default(Object.assign({}, data, { status: 400, typeUri: "https://jsonapi.js.org/errors/illegal-field-name", title: "One or more of the fields provided is not a legal field name this resource." }));
exports.unsupportedClientId = (data) => new APIError_1.default(Object.assign({}, data, { status: 403, typeUri: "https://jsonapi.js.org/errors/unsupported-client-id", title: "Client-generated ids are not supported." }));
exports.missingField = (data) => new APIError_1.default(Object.assign({}, data, { status: 400, typeUri: "https://jsonapi.js.org/errors/missing-required-field", title: "Missing required field." }));
exports.invalidFieldValue = (data) => new APIError_1.default(Object.assign({}, data, { status: 400, typeUri: "https://jsonapi.js.org/errors/invalid-field-value", title: "Invalid field value." }));
exports.missingDataKey = (data) => new APIError_1.default(Object.assign({}, data, { status: 400, typeUri: "https://jsonapi.js.org/errors/missing-data-key", title: "Request body is missing the top-level JSON:API `data` key." }));
exports.expectedDataArray = (data) => new APIError_1.default(Object.assign({}, data, { status: 400, typeUri: "https://jsonapi.js.org/errors/expected-data-array", title: "The JSON:API `data` key must hold an array for this request." }));
exports.expectedDataObject = (data) => new APIError_1.default(Object.assign({}, data, { status: 400, typeUri: "https://jsonapi.js.org/errors/expected-data-object", title: "The JSON:API `data` key must hold an object, not an array, for this request." }));
exports.jsonParse = (data) => new APIError_1.default(Object.assign({}, data, { status: 400, typeUri: "https://jsonapi.js.org/errors/json-parse-error", title: "Request is not valid JSON." }));
exports.uniqueViolation = (data) => new APIError_1.default(Object.assign({}, data, { status: 409, typeUri: "https://jsonapi.js.org/errors/unique-error", title: "This resource/update contained some data that was the same as " +
        "data in another resource of the same type, but was supposed to be unique." }));
exports.invalidId = (data) => new APIError_1.default(Object.assign({}, data, { status: 400, typeUri: "https://jsonapi.js.org/errors/invalid-id", title: "One or more of the provided resource ids is invalid." }));
exports.unknownResourceType = (data) => new APIError_1.default(Object.assign({}, data, { status: 404, typeUri: "https://jsonapi.js.org/errors/unknown-resource-type", title: 'Unknown resource type.' }));
exports.unknownRelationshipName = (data) => new APIError_1.default(Object.assign({}, data, { status: 404, typeUri: "https://jsonapi.js.org/errors/unknown-relationship-name", title: 'Unknown relationship name.' }));
exports.occFail = (data) => new APIError_1.default(Object.assign({}, data, { status: 409, typeUri: "https://jsonapi.js.org/errors/optimistic-concurrency-check-failed", title: "One or more of the resources you are trying to use was either " +
        "changed or was deleted while you were trying to read/update it. Try again." }));
exports.invalidMediaTypeParam = (data) => new APIError_1.default(Object.assign({}, data, { status: 415, typeUri: "https://jsonapi.js.org/errors/invalid-media-type-parameter", title: "Invalid Media Type Parameter" }));
