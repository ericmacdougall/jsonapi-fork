"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Errors = require("../util/errors");
class ResourceIdentifier {
    constructor(type, id) {
        this.type = type;
        this.id = id;
    }
    get typesList() {
        return undefined;
    }
    toJSON() {
        return { id: this.id, type: this.type };
    }
    static fromJSON(it) {
        if (!isValidLinkageObject(it)) {
            throw Errors.invalidLinkageStructure();
        }
        const Constructor = this || ResourceIdentifier;
        return new Constructor(it.type, it.id);
    }
}
exports.default = ResourceIdentifier;
function isValidLinkageObject(it) {
    return it && typeof it.type === "string" && typeof it.id === "string";
}
exports.isValidLinkageObject = isValidLinkageObject;
