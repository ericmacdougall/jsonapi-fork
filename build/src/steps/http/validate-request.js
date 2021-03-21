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
function checkBodyExistence(request) {
    return __awaiter(this, void 0, void 0, function* () {
        const hasBody = typeof request.body !== "undefined";
        const needsBody = ["post", "patch"].indexOf(request.method) !== -1 ||
            (request.method === "delete" && request.aboutRelationship) ||
            (request.method === "delete" && !request.id);
        if (hasBody === needsBody) {
            return;
        }
        throw Errors.genericValidation({
            detail: needsBody
                ? "This request needs a body, but didn't have one."
                : "This request should not have a body, but does."
        });
    });
}
exports.checkBodyExistence = checkBodyExistence;
function checkMethod({ method }) {
    return __awaiter(this, void 0, void 0, function* () {
        if (["patch", "post", "delete", "get"].indexOf(method) === -1) {
            const detail = `The method "${method}" is not supported.` +
                (method === "put" ? " See http://jsonapi.org/faq/#wheres-put" : "");
            throw Errors.generic405({ detail });
        }
    });
}
exports.checkMethod = checkMethod;
