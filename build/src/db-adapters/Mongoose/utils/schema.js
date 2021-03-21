"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getReferencePaths(model) {
    const paths = [];
    model.schema.eachPath((name, type) => {
        if (isReferencePath(type))
            paths.push(name);
    });
    return paths;
}
exports.getReferencePaths = getReferencePaths;
function isReferencePath(schemaType) {
    const options = (schemaType.caster || schemaType).options;
    return options && options.ref !== undefined;
}
exports.isReferencePath = isReferencePath;
function isRootModel(model) {
    return !model.baseModelName;
}
exports.isRootModel = isRootModel;
function getReferencedModelName(model, path) {
    const schemaType = model.schema.path(path);
    const schemaOptions = (schemaType.caster || schemaType).options;
    return schemaOptions && schemaOptions.ref;
}
exports.getReferencedModelName = getReferencedModelName;
function getDiscriminatorKey(model) {
    return model.schema.options.discriminatorKey;
}
exports.getDiscriminatorKey = getDiscriminatorKey;
function getVersionKey(model) {
    return model.schema.options.versionKey;
}
exports.getVersionKey = getVersionKey;
function getMetaKeys(model) {
    return [getDiscriminatorKey(model), getVersionKey(model)]
        .filter(it => it !== undefined);
}
exports.getMetaKeys = getMetaKeys;
