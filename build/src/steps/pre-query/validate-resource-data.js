"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const misc_1 = require("../../util/misc");
const Errors = require("../../util/errors");
function default_1(data, registry) {
    const resourcesByChildMostType = misc_1.partition((it) => it.typePath[0], data);
    for (const type in resourcesByChildMostType) {
        const { dbAdapter } = registry.type(type);
        const resources = resourcesByChildMostType[type];
        const relationshipNames = dbAdapter.getRelationshipNames(type);
        const invalid = resources.some((resource) => {
            return relationshipNames.some((relationshipName) => {
                return typeof resource.attrs[relationshipName] !== "undefined";
            });
        });
        if (invalid) {
            throw Errors.invalidAttributeName({
                detail: "Relationship fields must be specified under the `relationships` key."
            });
        }
    }
}
exports.default = default_1;
