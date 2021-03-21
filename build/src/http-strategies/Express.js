"use strict";
const fetch = require("node-fetch");

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
const varyLib = require("vary");
const url = require("url");
const R = require("ramda");
const logger_1 = require("../util/logger");
const API_1 = require("../controllers/API");
const Base_1 = require("./Base");
class ExpressStrategy extends Base_1.default {
    constructor(apiController, docsController, options) {
        super(apiController, docsController, options);
        this.doRequest = (controller, req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const requestObj = yield this.buildRequestObject(req);
                const responseObj = yield controller(requestObj, req, res);
                    this.sendResponse(responseObj, res, next);
            }
            catch (err) {
                this.sendError(err, req, res, next);
            }
        });
        this._docsRequest = R.partial(this.doRequest, [this.docs && this.docs.handle]);
        this.apiRequest = R.partial(this.doRequest, [this.api.handle]);
        this.customAPIRequest = (opts) => R.partial(this.doRequest, [
            (request, req, res) => this.api.handle(request, req, res, opts)
        ]);
        this.sendError = (errors, req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const responseObj = yield API_1.default.responseFromError(errors, req.headers.accept);
                this.sendResponse(responseObj, res, next);
            }
            catch (err) {
                logger_1.default.error("Hit an unexpected error creating or sending response." +
                    "This shouldn't happen.");
                next(err);
            }
        });
        this.sendResult = (result, req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const responseObj = yield API_1.default.responseFromResult(result, req.headers.accept, true);
                this.sendResponse(responseObj, res, next);
            }
            catch (err) {
                logger_1.default.error("Hit an unexpected error creating or sending response." +
                    "This shouldn't happen.");
                next(err);
            }
        });
    }
    buildRequestObject(req) {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            const genericReqPromise = _super("buildRequestObject").call(this, req, req.protocol, req.host, req.params, req.query);
            if (req.url !== req.originalUrl) {
                const genericReq = yield genericReqPromise;
                const { pathname, search } = url.parse('http://example.com' + req.originalUrl, false, false);
                const newUri = url.format(Object.assign({}, url.parse(genericReq.uri, false, false), { pathname,
                    search }));
                return Object.assign({}, genericReq, { uri: newUri });
            }
            return genericReqPromise;
        });
    }
    sendResponse(response, res, next) {
        const _a = response.headers, { vary } = _a, otherHeaders = __rest(_a, ["vary"]);
        if (vary) {
            varyLib(res, vary);
        }
        if (response.status === 406 && !this.config.handleContentNegotiation) {
            next();
            return;
        }
        res.status(response.status || 200);
        Object.keys(otherHeaders).forEach(k => {
            res.set(k, otherHeaders[k]);
        });

        if (response.body !== undefined) {
            res.send(new Buffer(response.body)).end();
        }
        else {
            res.end();
        }
    }
    get docsRequest() {
        if (this.docs == null) {
            throw new Error('Cannot get docs request handler. '
                + 'No docs controller was provided to the HTTP strategy.');
        }
        return this._docsRequest;
    }
    ;
}
exports.default = ExpressStrategy;
