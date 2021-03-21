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
const contentTypeParser = require("content-type");
const Errors = require("../../../util/errors");
const misc_1 = require("../../../util/misc");
function validateContentType(request, supportedExt) {
    return __awaiter(this, void 0, void 0, function* () {
        const contentType = contentTypeParser.parse(request.contentType);
        delete contentType.parameters.charset;
        if (contentType.type !== "application/vnd.api+json") {
            throw Errors.generic415({
                detail: "The request's Content-Type must be application/vnd.api+json, " +
                    `but you provided ${contentType.type}.`
            });
        }
        else if (!misc_1.objectIsEmpty(contentType.parameters)) {
            throw Errors.invalidMediaTypeParam({
                detail: "The request's Content-Type must be application/vnd.api+json, " +
                    "with no parameters. But the Content-Type you provided contained the " +
                    `parameters: ${Object.keys(contentType.parameters).join(", ")}.`
            });
        }
    });
}
exports.default = validateContentType;
