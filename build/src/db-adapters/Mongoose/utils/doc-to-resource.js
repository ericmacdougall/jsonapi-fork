"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Data_1 = require("../../../types/Generic/Data");
const Resource_1 = require("../../../types/Resource");
const ResourceIdentifier_1 = require("../../../types/ResourceIdentifier");
const Relationship_1 = require("../../../types/Relationship");
const misc_1 = require("../../../util/misc");
const subtyping_1 = require("./subtyping");
const schema_1 = require("./schema");
function docToResource(models, modelNamesToTypeNames, doc, fields) {
    const model = doc.constructor;
    const discriminatorKey = schema_1.getDiscriminatorKey(model);
    const baseModelName = model.baseModelName || model.modelName;
    const baseType = modelNamesToTypeNames[baseModelName];
    if (!baseType) {
        throw new Error("Unrecognized model.");
    }
    const refPaths = schema_1.getReferencePaths(model);
    let attrs = doc.toJSON({ virtuals: true, getters: true, versionKey: false });
    delete attrs.id;
    delete attrs._id;
    if (discriminatorKey) {
        delete attrs[discriminatorKey];
    }
    if (fields && fields[baseType]) {
        const newAttrs = {};
        fields[baseType].forEach((field) => {
            if (attrs[field] !== undefined) {
                newAttrs[field] = attrs[field];
            }
        });
        attrs = newAttrs;
    }
    const relationships = {};
    const getProp = (obj, part) => obj[part];
    refPaths.forEach((path) => {
        if (fields && fields[baseType] && !fields[baseType].includes(path)) {
            return;
        }
        const pathParts = path.split(".");
        const jsonValAtPath = pathParts.reduce(getProp, attrs);
        const referencedModelName = schema_1.getReferencedModelName(model, path);
        if (!referencedModelName || !models[referencedModelName]) {
            throw new Error("Invalid referenced model name. Check for typos in schema.");
        }
        const referencedModelBaseName = models[referencedModelName].baseModelName || referencedModelName;
        const referencedType = modelNamesToTypeNames[referencedModelBaseName];
        misc_1.deleteNested(path, attrs);
        const normalizedValAtPath = typeof jsonValAtPath === "undefined" ? null : jsonValAtPath;
        const linkage = Data_1.default.fromJSON(normalizedValAtPath).map((docOrId) => {
            return new ResourceIdentifier_1.default(referencedType, String(docOrId._id ? docOrId._id : docOrId));
        });
        relationships[path] = Relationship_1.default.of({
            data: linkage,
            owner: { type: baseType, id: doc.id, path }
        });
    });
    const res = new Resource_1.default(baseType, doc.id, attrs, relationships);
    res.typePath = subtyping_1.getTypePath(model, modelNamesToTypeNames);
    return res;
}
exports.default = docToResource;
