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
const ResourceIdentifierSet_1 = require("../../types/ResourceIdentifierSet");
exports.hasId = (it) => typeof it.id !== "undefined";
function default_1(data) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!data.every(exports.hasId)) {
            if (data instanceof ResourceIdentifierSet_1.default) {
                throw Errors.invalidLinkageStructure({
                    detail: "Missing an `id` key on one or more of the identifier objects provided."
                });
            }
            throw Errors.resourceMissingIdKey();
        }
    });
}
exports.default = default_1;
