"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schema_1 = require("./schema");
function getTypePath(model, modelNamesToTypeNames) {
    const modelNames = schema_1.isRootModel(model)
        ? [model.modelName]
        : [model.modelName, model.baseModelName];
    return modelNames.map(it => modelNamesToTypeNames[it]);
}
exports.getTypePath = getTypePath;
