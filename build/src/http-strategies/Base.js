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
const qs = require("qs");
const getRawBody = require("raw-body");
const logger_1 = require("../util/logger");
const Errors = require("../util/errors");
class BaseStrategy {
    constructor(apiController, docsController, options) {
        this.api = apiController;
        this.docs = docsController;
        this.config = Object.assign({ tunnel: false, handleContentNegotiation: true }, options);
        if (typeof options === 'object' && options != null && !options.host) {
            logger_1.default.warn("Unsafe: missing `host` option in http strategy. This is unsafe " +
                "unless you have reason to trust the (X-Forwarded-)Host header.");
        }
    }
    buildRequestObject(req, protocol, fallbackHost, params, parsedQuery) {
        return __awaiter(this, void 0, void 0, function* () {
            const reqUrl = req.url;
            const queryStartIndex = reqUrl.indexOf("?");
            const hasQuery = queryStartIndex !== -1;
            const rawQueryString = hasQuery && reqUrl.substr(queryStartIndex + 1);
            const protocolGuess = protocol || (req.connection.encrypted ? "https" : "http");
            const host = this.config.host || fallbackHost;
            const body = yield this.getParsedBodyJSON(req);
            return {
                queryParams: parsedQuery || (hasQuery && qs.parse(rawQueryString)) || {},
                rawQueryString: rawQueryString || undefined,
                id: params.id,
                type: params.type,
                relationship: params.related || params.relationship,
                aboutRelationship: !!params.relationship,
                uri: protocolGuess + "://" + host + req.url,
                method: (() => {
                    const usedMethod = req.method.toLowerCase();
                    const requestedMethod = req.headers["x-http-method-override"] &&
                        String(req.headers["x-http-method-override"]).toLowerCase();
                    if (this.config.tunnel && usedMethod === "post" && requestedMethod === "patch") {
                        return "patch";
                    }
                    else if (requestedMethod) {
                        throw Errors.genericValidation({
                            detail: `Cannot tunnel to method "${requestedMethod.toUpperCase()}".`
                        });
                    }
                    return usedMethod;
                })(),
                accepts: req.headers.accept,
                contentType: req.headers["content-type"],
                body
            };
        });
    }
    getParsedBodyJSON(req) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!hasBody(req)) {
                return undefined;
            }
            const bodyParserOptions = Object.assign({ encoding: "utf-8", limit: "1mb" }, (hasValidContentLength(req)
                ? { length: req.headers["content-length"] }
                : {}));
            const bodyString = yield (() => {
                const reqBody = req.body;
                const reqRawBody = req.rawBody;
                if (isReadableStream(req)) {
                    return getRawBody(req, bodyParserOptions);
                }
                else if (Buffer.isBuffer(reqBody)) {
                    return reqBody.toString('utf8');
                }
                else if (typeof reqBody === 'string') {
                    return reqBody;
                }
                else if (Buffer.isBuffer(reqRawBody)) {
                    return reqRawBody.toString('utf8');
                }
                else if (typeof reqRawBody === 'string') {
                    return reqRawBody;
                }
                return undefined;
            })();
            if (typeof bodyString === "undefined") {
                if ("body" in req) {
                    return req.body;
                }
                throw new Error("Request body could not be parsed. Ensure that no other middleware " +
                    "has already read the request or, if that's not possible, ensure " +
                    "that it sets req.rawBody with the unparsed body string, or req.body " +
                    "with parsed JSON.");
            }
            if (bodyString.length === 0) {
                return undefined;
            }
            try {
                return JSON.parse(bodyString);
            }
            catch (error) {
                throw Errors.jsonParse();
            }
        });
    }
}
exports.default = BaseStrategy;
function hasBody(req) {
    return req.headers["transfer-encoding"] !== undefined || hasValidContentLength(req);
}
function hasValidContentLength(req) {
    return !isNaN(req.headers["content-length"]);
}
function isReadableStream(req) {
    return typeof req._readableState === "object"
        && req._readableState.endEmitted === false;
}
