"use strict";
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
exports.displaySafe = Symbol("isJSONAPIDisplayReady");
class APIError extends Error {
    constructor(opts = {}) {
        super(...(opts.title ? [String(opts.title)] : []));
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor || APIError);
        }
        const res = new Proxy(this, {
            set(obj, prop, value) {
                const coercePropToString = ["status", "typeUri", "title", "detail"].indexOf(prop) > -1;
                obj[prop] = coercePropToString
                    ? value == null ? undefined : String(value)
                    : value;
                return true;
            }
        });
        Object.assign(res, opts);
        return res;
    }
    toJSON(urlTemplates) {
        const _a = this, { rawError, typeUri } = _a, serializableProps = __rest(_a, ["rawError", "typeUri"]);
        const res = Object.assign({}, serializableProps, (typeUri ? { code: typeUri } : {}));
        if (urlTemplates && urlTemplates.about && !(res.links && res.links.about)) {
            return Object.assign({}, res, { links: { about: urlTemplates.about(this) } });
        }
        return res;
    }
    static fromError(err) {
        const ErrorConstructor = this || APIError;
        const fallbackTitle = "An unknown error occurred while trying to process this request.";
        if (err instanceof APIError) {
            return err;
        }
        else if (this.isDisplaySafe(err)) {
            return new ErrorConstructor({
                status: err.status || err.statusCode || 500,
                title: err.title || fallbackTitle,
                detail: err.detail || err.details || (err.message || undefined),
                typeUri: err.typeUri,
                source: typeof err.source === "object" ? err.source : undefined,
                meta: typeof err.meta === "object" ? err.meta : undefined,
                rawError: err
            });
        }
        else {
            return new ErrorConstructor({
                status: 500,
                title: fallbackTitle,
                rawError: err
            });
        }
    }
    static isDisplaySafe(it) {
        return it && (it instanceof APIError || it[exports.displaySafe]);
    }
}
exports.default = APIError;
