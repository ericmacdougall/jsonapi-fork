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
const Errors = require("../util/errors");
function default_1(resourcesAndIds, useInputTypesList, requiredThroughType, registry) {
    return __awaiter(this, void 0, void 0, function* () {
        if (useInputTypesList) {
            const asTypePath = registry.asTypePath.bind(registry);
            resourcesAndIds.forEach((resourceOrId) => {
                resourceOrId.typePath =
                    getTypePathFromUserInput(resourceOrId, asTypePath, requiredThroughType);
            });
        }
        else {
            if (resourcesAndIds.some(it => it.typesList !== undefined)) {
                throw Errors.illegalTypeList({
                    detail: "Trying to mutate the types of an existing resource is not allowed."
                });
            }
            const adaptersToTypeNames = registry.uniqueAdapters();
            if (adaptersToTypeNames.size === 1) {
                const adapter = adaptersToTypeNames.keys().next().value;
                const typePathResults = yield adapter.getTypePaths(resourcesAndIds.map(it => ({
                    id: it.id,
                    type: it.type
                })));
                resourcesAndIds.forEach((resourceOrId) => {
                    const id = resourceOrId.id;
                    const adapterResultsForType = typePathResults[resourceOrId.type];
                    const adapterResult = adapterResultsForType && adapterResultsForType[id];
                    if (!adapterResult) {
                        throw Errors.genericNotFound({
                            detail: `First missing resource was (${resourceOrId.type}, ${resourceOrId.id}).`
                        });
                    }
                    if (requiredThroughType && !adapterResult.typePath.includes(requiredThroughType)) {
                        throw Errors.invalidResourceType({
                            detail: `The resource (${resourceOrId.type}, ${resourceOrId.id}) is of an invalid type.`
                        });
                    }
                    resourceOrId.typePath = adapterResult.typePath;
                    resourceOrId.adapterExtra = adapterResult.extra;
                });
            }
            else {
                throw new Error("Using subtypes with multiple adapters is not supported yet. " +
                    "It's not hard, exactly, just low priority. If you want this, open an issue.");
            }
        }
    });
}
exports.default = default_1;
;
function getTypePathFromUserInput(resourceOrId, asTypePath, requiredThroughType) {
    const provisionalTypePath = resourceOrId.typesList || [resourceOrId.type];
    if (!Array.isArray(provisionalTypePath)) {
        throw Errors.invalidTypeList({
            detail: `Needed an array, but got ${JSON.stringify(provisionalTypePath)}.`
        });
    }
    const typePath = asTypePath(provisionalTypePath, requiredThroughType);
    if (!typePath) {
        throw Errors.invalidTypeList({
            detail: `Got ${JSON.stringify(provisionalTypePath)}.`
        });
    }
    return typePath;
}
