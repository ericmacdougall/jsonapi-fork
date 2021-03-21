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
const logger_1 = require("../util/logger");
const Resource_1 = require("../types/Resource");
const ResourceIdentifier_1 = require("../types/ResourceIdentifier");
function makeTransformFn(mode, extras) {
    const { registry } = extras;
    const makeSuperFunction = (remainingTypes, extras) => {
        return (it, meta) => {
            const parentType = remainingTypes[0];
            const parentTransform = parentType && registry[mode](parentType);
            if (!parentType || !parentTransform) {
                return it;
            }
            const nextSuper = makeSuperFunction(remainingTypes.slice(1), extras);
            return parentTransform(it, meta, extras, nextSuper);
        };
    };
    return function (it, meta) {
        return __awaiter(this, void 0, void 0, function* () {
            if (it instanceof ResourceIdentifier_1.default && !registry.transformLinkage(it.type)) {
                return it;
            }
            if (it instanceof Resource_1.default && !it.typePath) {
                logger_1.default.warn("Tried to apply transform to resource with no type path. " +
                    "Fell back to type key. This is potentially unsafe. " +
                    "You should investigate why your resource object had no type path.");
            }
            const applicableTypes = it instanceof Resource_1.default && it.typePath ? it.typePath : [it.type];
            const transformFn = registry[mode](applicableTypes[0]);
            if (!transformFn) {
                return it;
            }
            return transformFn(it, meta, extras, makeSuperFunction(applicableTypes.slice(1), extras));
        });
    };
}
exports.default = makeTransformFn;
