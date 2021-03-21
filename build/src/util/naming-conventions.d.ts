import pluralize = require("pluralize");
export declare function getModelName(typeName: string, singularizer?: typeof pluralize.singular): string;
export declare function getTypeName(modelName: string, pluralizer?: typeof pluralize.plural): string;
