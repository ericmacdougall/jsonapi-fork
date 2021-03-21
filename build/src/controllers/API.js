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
const R = require("ramda");
const Document_1 = require("../types/Document");
const APIError_1 = require("../types/APIError");
const ResourceSet_1 = require("../types/ResourceSet");
const ResourceIdentifierSet_1 = require("../types/ResourceIdentifierSet");
const Relationship_1 = require("../types/Relationship");
const Errors = require("../util/errors");
const logger_1 = require("../util/logger");
const requestValidators = require("../steps/http/validate-request");
const negotiate_content_type_1 = require("../steps/http/content-negotiation/negotiate-content-type");
const validate_content_type_1 = require("../steps/http/content-negotiation/validate-content-type");
const finalize_operator_definitions_1 = require("../steps/pre-query/finalize-operator-definitions");
const query_parsing_1 = require("../util/query-parsing");
const parse_query_params_1 = require("../steps/pre-query/parse-query-params");
const parse_request_primary_1 = require("../steps/pre-query/parse-request-primary");
const set_type_paths_1 = require("../steps/set-type-paths");
const validate_document_1 = require("../steps/pre-query/validate-document");
const validate_resource_types_1 = require("../steps/pre-query/validate-resource-types");
const validate_resource_ids_1 = require("../steps/pre-query/validate-resource-ids");
const validate_resource_data_1 = require("../steps/pre-query/validate-resource-data");
const make_transform_fn_1 = require("../steps/make-transform-fn");
const run_query_1 = require("../steps/run-query");
const make_get_1 = require("../steps/make-query/make-get");
const make_post_1 = require("../steps/make-query/make-post");
const make_patch_1 = require("../steps/make-query/make-patch");
const make_delete_1 = require("../steps/make-query/make-delete");
const http_1 = require("http");
exports.IncomingMessage = http_1.IncomingMessage;
exports.ServerResponse = http_1.ServerResponse;
const CreateQuery_1 = require("../types/Query/CreateQuery");
exports.CreateQuery = CreateQuery_1.default;
const FindQuery_1 = require("../types/Query/FindQuery");
exports.FindQuery = FindQuery_1.default;
const UpdateQuery_1 = require("../types/Query/UpdateQuery");
exports.UpdateQuery = UpdateQuery_1.default;
const DeleteQuery_1 = require("../types/Query/DeleteQuery");
exports.DeleteQuery = DeleteQuery_1.default;
const AddToRelationshipQuery_1 = require("../types/Query/AddToRelationshipQuery");
exports.AddToRelationshipQuery = AddToRelationshipQuery_1.default;
const RemoveFromRelationshipQuery_1 = require("../types/Query/RemoveFromRelationshipQuery");
exports.RemoveFromRelationshipQuery = RemoveFromRelationshipQuery_1.default;
class APIController {
    constructor(registry, opts = {}) {
        this.makeDoc = (data) => {
            const errorsConfig = this.registry.errorsConfig();
            return new Document_1.default(Object.assign({ urlTemplates: this.registry.urlTemplates(), errorUrlTemplates: errorsConfig && errorsConfig.urlTemplates }, data));
        };
        this.runQuery = (query) => run_query_1.default(this.registry, query);
        this.handle = (request, serverReq, serverRes, opts = {}) => __awaiter(this, void 0, void 0, function* () {
            let contentType;
            let jsonAPIResult = {};
            try {
                logger_1.default.info("Negotiating response content-type");
                contentType =
                    yield negotiate_content_type_1.default(request.accepts, ["application/vnd.api+json"]);
                logger_1.default.info("Parsing request body/query parameters");
                const finalizedRequest = yield this.finalizeRequest(request, opts.supportedOperators || this.getSupportedOperators(request));
                const customQueryFactory = opts.queryFactory ||
                    (opts.queryTransform && (() => {
                        const queryTransform = opts.queryTransform;
                        return (queryFactoryOpts) => __awaiter(this, void 0, void 0, function* () {
                            const query = yield this.makeQuery(queryFactoryOpts);
                            const req = queryFactoryOpts.serverReq;
                            return queryTransform.length > 1
                                ? queryTransform(req, query)
                                : queryTransform(query);
                        });
                    })());
                const transformExtras = {
                    request: finalizedRequest,
                    registry: this.registry,
                    serverReq,
                    serverRes
                };
                const beforeSave = make_transform_fn_1.default("beforeSave", transformExtras);
                const beforeRender = make_transform_fn_1.default("beforeRender", transformExtras);
                const resultBuildingOpts = Object.assign({}, transformExtras, { makeDocument: this.makeDoc, beforeSave,
                    beforeRender,
                    transformDocument(doc, modeOrFn) {
                        const fn = modeOrFn === 'beforeSave'
                            ? beforeSave
                            : (modeOrFn === 'beforeRender' ? beforeRender : modeOrFn);
                        const transformLinkage = transformExtras.registry.typeNames()
                            .some(it => transformExtras.registry.transformLinkage(it));
                        return doc.transform(fn, !transformLinkage);
                    }, makeQuery: this.makeQuery, runQuery: this.runQuery, setTypePaths(it, useInputData, requiredThroughType) {
                        return set_type_paths_1.default(it, useInputData, requiredThroughType, transformExtras.registry);
                    } });
                const resultFactory = opts.resultFactory || this.makeResult;
                jsonAPIResult = yield resultFactory(resultBuildingOpts, customQueryFactory);
            }
            catch (err) {
                logger_1.default.warn("API Controller caught error", err, err.stack);
                jsonAPIResult = makeResultFromErrors(this.makeDoc, err);
            }
            logger_1.default.info("Creating HTTPResponse", jsonAPIResult);
            return resultToHTTPResponse(jsonAPIResult, contentType);
        });
        this.registry = registry;
        this.filterParamParser = opts.filterParser || defaultFilterParamParser;
        this.sortParamParser = opts.sortParser || defaultSortParamParser;
    }
    finalizeRequest(request, supportedOperators) {
        return __awaiter(this, void 0, void 0, function* () {
            const guardedQueryParamParse = (parser, paramName, thisParamFinalizedOps) => {
                try {
                    request.rawQueryString = decodeURIComponent(request.rawQueryString);
                    return parser(thisParamFinalizedOps, request.rawQueryString, request.queryParams, { method: request.method, uri: request.uri })
                }
                catch (e) {
                    throw Errors.invalidQueryParamValue({
                        detail: `Invalid ${paramName} syntax: ${e.message} See jsonapi.js.org for details.`,
                        source: { parameter: paramName }
                    });
                }
            };
            const finalizedSupportedOperators = Object.keys(supportedOperators).reduce((acc, operatorName) => {
                const operatorConfig = finalize_operator_definitions_1.default(operatorName, supportedOperators[operatorName]);
                operatorConfig.legalIn.forEach(key => {
                    acc[key][operatorName] = operatorConfig;
                });
                return acc;
            }, {
                filter: {},
                sort: {}
            });
            const finalizedRequest = Object.assign({}, request, { queryParams: Object.assign({}, parse_query_params_1.default(request.queryParams), { filter: guardedQueryParamParse(this.filterParamParser, "filter", finalizedSupportedOperators.filter), sort: guardedQueryParamParse(this.sortParamParser, "sort", finalizedSupportedOperators.sort) }), document: undefined });
            if (request.body !== undefined) {
                const parsedPrimary = yield (() => __awaiter(this, void 0, void 0, function* () {
                    yield validate_content_type_1.default(request, this.constructor.supportedExt);
                    yield validate_document_1.default(request.body);
                    return parse_request_primary_1.default(request.body.data, parseAsLinkage(request));
                }))();
                finalizedRequest.document = this.makeDoc({
                    primary: parseAsLinkage(request)
                        ? (isBulkDelete(request)
                            ? ResourceIdentifierSet_1.default.of({
                                data: parsedPrimary
                            })
                            : Relationship_1.default.of({
                                data: parsedPrimary,
                                owner: {
                                    type: request.type,
                                    id: request.id,
                                    path: request.relationship
                                }
                            }))
                        : ResourceSet_1.default.of({
                            data: parsedPrimary
                        }),
                    meta: request.body.meta
                });
            }
            return finalizedRequest;
        });
    }
    getSupportedOperators(request) {
        const typeDesc = this.registry.type(request.type);
        if (!typeDesc) {
            return { filter: {}, sort: {} };
        }
        return (typeDesc.dbAdapter.constructor.supportedOperators || {});
    }
    makeQuery(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const { request } = opts;
            let requestAfterBeforeSave = request;
            yield requestValidators.checkMethod(request);
            yield requestValidators.checkBodyExistence(request);
            if (request.document && request.document.primary) {
                if (!parseAsLinkage(request)) {
                    if (!['post', 'patch'].includes(request.method)) {
                        throw new Error("Unexpected method.");
                    }
                    yield validate_resource_types_1.default(request.type, request.document.primary, opts.registry);
                    if (request.method === 'patch') {
                        yield validate_resource_ids_1.default(request.document.primary);
                    }
                    yield opts.setTypePaths(request.document.getContents(), request.method === "post", request.type);
                    validate_resource_data_1.default(request.document.primary, opts.registry);
                }
                if (isBulkDelete(request)) {
                    yield validate_resource_types_1.default(request.type, request.document.primary, opts.registry);
                }
                requestAfterBeforeSave = Object.assign({}, request, { document: yield opts.transformDocument(request.document, "beforeSave") });
            }
            const baseQuery = yield (() => __awaiter(this, void 0, void 0, function* () {
                switch (request.method) {
                    case "get":
                        return make_get_1.default(requestAfterBeforeSave, opts.registry, opts.makeDocument);
                    case "post":
                        return make_post_1.default(requestAfterBeforeSave, opts.registry, opts.makeDocument);
                    case "patch":
                        return make_patch_1.default(requestAfterBeforeSave, opts.registry, opts.makeDocument);
                    case "delete":
                        return make_delete_1.default(requestAfterBeforeSave, opts.registry, opts.makeDocument);
                    default:
                        throw new Error("Unknown/unexpected method.");
                }
            }))();
            const origReturning = baseQuery.returning;
            const origCatch = baseQuery.catch || makeResultFromErrors.bind(null, opts.makeDocument);
            const transformResultDocument = (result) => __awaiter(this, void 0, void 0, function* () {
                result.document = result.document &&
                    (yield opts.transformDocument(result.document, "beforeRender"));
                return result;
            });
            return baseQuery.resultsIn(R.pipeP(R.pipe(origReturning, Promise.resolve.bind(Promise)), transformResultDocument), R.pipeP(R.pipe(origCatch, Promise.resolve.bind(Promise)), transformResultDocument));
        });
    }
    makeResult(opts, customQueryFactory) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const queryFactory = customQueryFactory || opts.makeQuery;
                const query = yield queryFactory(opts);
                const result = yield opts.runQuery(query).then(query.returning, query.catch);
                if (result.document && result.document.primary) {
                    result.document.primary.links = Object.assign({ "self": () => opts.request.uri }, result.document.primary.links);
                }
                return result;
            }
            catch (err) {
                return makeResultFromErrors(opts.makeDocument, err);
            }
        });
    }
    static responseFromError(errors, requestAccepts) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.responseFromResult(makeResultFromErrors((data) => new Document_1.default(data), errors), requestAccepts, false);
        });
    }
    static responseFromResult(result, reqAccepts, allow406 = true) {
        return __awaiter(this, void 0, void 0, function* () {
            let contentType;
            try {
                contentType = yield negotiate_content_type_1.default(reqAccepts, ["application/vnd.api+json"]);
                return resultToHTTPResponse(result, contentType);
            }
            catch (e) {
                const finalResult = allow406
                    ? makeResultFromErrors((data) => new Document_1.default(data), e)
                    : result;
                return resultToHTTPResponse(finalResult, "application/vnd.api+json");
            }
        });
    }
}
APIController.supportedExt = Object.freeze([]);
exports.default = APIController;
function defaultFilterParamParser(filterOps, rawQuery, queryParams) {
    if(queryParams.filter) {
        const tmp = {}
        Object.keys(queryParams.filter).map(param => {
            tmp[param] = query_parsing_1.getQueryParamValue("filter[" + param + "]", rawQuery)
                .map(it => parse_query_params_1.parseFilter(it, filterOps))
                .getOrDefault(undefined)
        })
        return tmp;
    } else {
        return undefined
    }
}
exports.defaultFilterParamParser = defaultFilterParamParser;
function defaultSortParamParser(sortOps, rawQuery) {
    return query_parsing_1.getQueryParamValue("sort", rawQuery)
        .map(it => parse_query_params_1.parseSort(it, sortOps))
        .getOrDefault(undefined);
}
exports.defaultSortParamParser = defaultSortParamParser;
function makeResultFromErrors(makeDoc, errors) {
    const rawErrorsArray = (Array.isArray(errors) ? errors : [errors]);
    const finalErrorsArray = rawErrorsArray.map(APIError_1.default.fromError.bind(APIError_1.default));
    logger_1.default.warn("Errors converted to json-api Result", ...rawErrorsArray);
    const status = pickStatus(finalErrorsArray.map(v => Number(v.status)));
    return {
        document: makeDoc({ errors: finalErrorsArray }),
        status
    };
}
function resultToHTTPResponse(response, negotiatedMediaType) {
    const status = (() => {
        if (response.status) {
            return response.status;
        }
        if (response.document) {
            return response.document.errors
                ? pickStatus(response.document.errors.map(it => Number(it.status)))
                : 200;
        }
        return 204;
    })();
    const headers = Object.assign({}, (status !== 204
        ? { 'content-type': negotiatedMediaType || "application/vnd.api+json" }
        : {}), { 'vary': 'Accept' }, response.headers);
    return {
        status,
        headers,
        body: response.document && response.document.toString()
    };
}
function pickStatus(errStatuses) {
    return errStatuses[0];
}
function isBulkDelete(request) {
    return request.method === "delete" && !request.id && !request.aboutRelationship;
}
function parseAsLinkage(request) {
    return request.aboutRelationship || isBulkDelete(request);
}
