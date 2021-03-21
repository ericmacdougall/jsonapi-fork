import MongooseAdapter from "./db-adapters/Mongoose/MongooseAdapter";
import ExpressStrategy from "./http-strategies/Express";
import KoaStrategy from "./http-strategies/Koa";
import Document from "./types/Document";
import Error, { displaySafe as displaySafeError } from "./types/APIError";
import Data from "./types/Generic/Data";
import Resource from "./types/Resource";
import ResourceIdentifier from "./types/ResourceIdentifier";
import ResourceSet from "./types/ResourceSet";
import Relationship from "./types/Relationship";
import { RFC6570String } from './types/UrlTemplate';
import Field from "./types/Documentation/Field";
import FieldType from "./types/Documentation/FieldType";
import ResourceTypeRegistry from "./ResourceTypeRegistry";
import CreateQuery from "./types/Query/CreateQuery";
import FindQuery from "./types/Query/FindQuery";
import UpdateQuery from "./types/Query/UpdateQuery";
import DeleteQuery from "./types/Query/DeleteQuery";
import AddToRelationshipQuery from "./types/Query/AddToRelationshipQuery";
import RemoveFromRelationshipQuery from "./types/Query/RemoveFromRelationshipQuery";
import API, { defaultSortParamParser, defaultFilterParamParser } from "./controllers/API";
import Documentation from "./controllers/Documentation";
import * as Errors from "./util/errors";
import { Identifier, isId as isIdentifier, FieldExpression, isFieldExpression } from './steps/pre-query/parse-query-params';
export { TransformFn } from "./steps/make-transform-fn";
export { RunnableQuery, QueryReturning } from "./steps/run-query";
export { FinalizedRequest as Request, Result, HTTPResponse, AndExpression, Sort, SortDirection, ExpressionSort, FieldSort, FieldExpression as FieldExpressionType } from "./types";
export { FindReturning, CreationReturning, UpdateReturning, DeletionReturning, RelationshipUpdateReturning } from "./db-adapters/AdapterInterface";
export { Document, Error, Resource, ResourceIdentifier, ResourceSet, Relationship, API as APIController, Documentation as DocumentationController, CreateQuery, FindQuery, UpdateQuery, DeleteQuery, AddToRelationshipQuery, RemoveFromRelationshipQuery, Field, FieldType, ResourceTypeRegistry, displaySafeError, RFC6570String, Data, Errors, Identifier, isIdentifier, FieldExpression, isFieldExpression, defaultSortParamParser, defaultFilterParamParser };
export declare const dbAdapters: {
    readonly Mongoose: typeof MongooseAdapter;
};
export declare const httpStrategies: {
    readonly Express: typeof ExpressStrategy;
    readonly Koa: typeof KoaStrategy;
};
export declare const helpers: {
    Identifier: (value: string) => {
        type: "Identifier";
        value: string;
    };
    isIdentifier: (it: any) => it is {
        type: "Identifier";
        value: string;
    };
    FieldExpression: <T extends string>(operator: T, args: any[]) => {
        type: "FieldExpression";
        operator: T;
        args: any[];
    };
    isFieldExpression: (it: any) => it is ({
        operator: "or";
        args: ((any & {
            type: "FieldExpression";
        }) | ({
            operator: "and";
            args: ((any & {
                type: "FieldExpression";
            }) | (any & {
                type: "FieldExpression";
            }) | ({
                operator: "eq" | "neq" | "ne";
                args: [{
                        type: "Identifier";
                        value: string;
                    }, any];
            } & {
                type: "FieldExpression";
            }) | ({
                operator: "in" | "nin";
                args: [{
                        type: "Identifier";
                        value: string;
                    }, string[] | number[]];
            } & {
                type: "FieldExpression";
            }) | ({
                operator: "lt" | "gt" | "lte" | "gte";
                args: [{
                        type: "Identifier";
                        value: string;
                    }, string | number];
            } & {
                type: "FieldExpression";
            }) | ({
                operator: string;
                args: any[];
            } & {
                type: "FieldExpression";
            }))[];
        } & {
            type: "FieldExpression";
        }) | ({
            operator: "eq" | "neq" | "ne";
            args: [{
                    type: "Identifier";
                    value: string;
                }, any];
        } & {
            type: "FieldExpression";
        }) | ({
            operator: "in" | "nin";
            args: [{
                    type: "Identifier";
                    value: string;
                }, string[] | number[]];
        } & {
            type: "FieldExpression";
        }) | ({
            operator: "lt" | "gt" | "lte" | "gte";
            args: [{
                    type: "Identifier";
                    value: string;
                }, string | number];
        } & {
            type: "FieldExpression";
        }) | ({
            operator: string;
            args: any[];
        } & {
            type: "FieldExpression";
        }))[];
    } & {
        type: "FieldExpression";
    }) | ({
        operator: "and";
        args: (({
            operator: "or";
            args: ((any & {
                type: "FieldExpression";
            }) | (any & {
                type: "FieldExpression";
            }) | ({
                operator: "eq" | "neq" | "ne";
                args: [{
                        type: "Identifier";
                        value: string;
                    }, any];
            } & {
                type: "FieldExpression";
            }) | ({
                operator: "in" | "nin";
                args: [{
                        type: "Identifier";
                        value: string;
                    }, string[] | number[]];
            } & {
                type: "FieldExpression";
            }) | ({
                operator: "lt" | "gt" | "lte" | "gte";
                args: [{
                        type: "Identifier";
                        value: string;
                    }, string | number];
            } & {
                type: "FieldExpression";
            }) | ({
                operator: string;
                args: any[];
            } & {
                type: "FieldExpression";
            }))[];
        } & {
            type: "FieldExpression";
        }) | (any & {
            type: "FieldExpression";
        }) | ({
            operator: "eq" | "neq" | "ne";
            args: [{
                    type: "Identifier";
                    value: string;
                }, any];
        } & {
            type: "FieldExpression";
        }) | ({
            operator: "in" | "nin";
            args: [{
                    type: "Identifier";
                    value: string;
                }, string[] | number[]];
        } & {
            type: "FieldExpression";
        }) | ({
            operator: "lt" | "gt" | "lte" | "gte";
            args: [{
                    type: "Identifier";
                    value: string;
                }, string | number];
        } & {
            type: "FieldExpression";
        }) | ({
            operator: string;
            args: any[];
        } & {
            type: "FieldExpression";
        }))[];
    } & {
        type: "FieldExpression";
    }) | ({
        operator: "eq" | "neq" | "ne";
        args: [{
                type: "Identifier";
                value: string;
            }, any];
    } & {
        type: "FieldExpression";
    }) | ({
        operator: "in" | "nin";
        args: [{
                type: "Identifier";
                value: string;
            }, string[] | number[]];
    } & {
        type: "FieldExpression";
    }) | ({
        operator: "lt" | "gt" | "lte" | "gte";
        args: [{
                type: "Identifier";
                value: string;
            }, string | number];
    } & {
        type: "FieldExpression";
    }) | ({
        operator: string;
        args: any[];
    } & {
        type: "FieldExpression";
    });
    defaultSortParamParser: typeof defaultSortParamParser;
    defaultFilterParamParser: typeof defaultFilterParamParser;
    getModelName(typeName: string, singularizer?: (word: string) => string): string;
    getTypeName(modelName: string, pluralizer?: (word: string) => string): string;
};
export declare const types: {
    Document: typeof Document;
    Error: typeof Error;
    Resource: typeof Resource;
    ResourceIdentifier: typeof ResourceIdentifier;
    ResourceSet: typeof ResourceSet;
    Relationship: typeof Relationship;
    Documentation: {
        Field: typeof Field;
        FieldType: typeof FieldType;
    };
    Query: {
        Find: typeof FindQuery;
        Create: typeof CreateQuery;
        Update: typeof UpdateQuery;
        Delete: typeof DeleteQuery;
        AddToRelationship: typeof AddToRelationshipQuery;
        RemoveFromRelationship: typeof RemoveFromRelationshipQuery;
    };
};
export declare const controllers: {
    API: typeof API;
    Documentation: typeof Documentation;
};
declare const defaultExp: {
    types: {
        Document: typeof Document;
        Error: typeof Error;
        Resource: typeof Resource;
        ResourceIdentifier: typeof ResourceIdentifier;
        ResourceSet: typeof ResourceSet;
        Relationship: typeof Relationship;
        Documentation: {
            Field: typeof Field;
            FieldType: typeof FieldType;
        };
        Query: {
            Find: typeof FindQuery;
            Create: typeof CreateQuery;
            Update: typeof UpdateQuery;
            Delete: typeof DeleteQuery;
            AddToRelationship: typeof AddToRelationshipQuery;
            RemoveFromRelationship: typeof RemoveFromRelationshipQuery;
        };
    };
    controllers: {
        API: typeof API;
        Documentation: typeof Documentation;
    };
    httpStrategies: {
        readonly Express: typeof ExpressStrategy;
        readonly Koa: typeof KoaStrategy;
    };
    dbAdapters: {
        readonly Mongoose: typeof MongooseAdapter;
    };
    helpers: {
        Identifier: (value: string) => {
            type: "Identifier";
            value: string;
        };
        isIdentifier: (it: any) => it is {
            type: "Identifier";
            value: string;
        };
        FieldExpression: <T extends string>(operator: T, args: any[]) => {
            type: "FieldExpression";
            operator: T;
            args: any[];
        };
        isFieldExpression: (it: any) => it is ({
            operator: "or";
            args: ((any & {
                type: "FieldExpression";
            }) | ({
                operator: "and";
                args: ((any & {
                    type: "FieldExpression";
                }) | (any & {
                    type: "FieldExpression";
                }) | ({
                    operator: "eq" | "neq" | "ne";
                    args: [{
                            type: "Identifier";
                            value: string;
                        }, any];
                } & {
                    type: "FieldExpression";
                }) | ({
                    operator: "in" | "nin";
                    args: [{
                            type: "Identifier";
                            value: string;
                        }, string[] | number[]];
                } & {
                    type: "FieldExpression";
                }) | ({
                    operator: "lt" | "gt" | "lte" | "gte";
                    args: [{
                            type: "Identifier";
                            value: string;
                        }, string | number];
                } & {
                    type: "FieldExpression";
                }) | ({
                    operator: string;
                    args: any[];
                } & {
                    type: "FieldExpression";
                }))[];
            } & {
                type: "FieldExpression";
            }) | ({
                operator: "eq" | "neq" | "ne";
                args: [{
                        type: "Identifier";
                        value: string;
                    }, any];
            } & {
                type: "FieldExpression";
            }) | ({
                operator: "in" | "nin";
                args: [{
                        type: "Identifier";
                        value: string;
                    }, string[] | number[]];
            } & {
                type: "FieldExpression";
            }) | ({
                operator: "lt" | "gt" | "lte" | "gte";
                args: [{
                        type: "Identifier";
                        value: string;
                    }, string | number];
            } & {
                type: "FieldExpression";
            }) | ({
                operator: string;
                args: any[];
            } & {
                type: "FieldExpression";
            }))[];
        } & {
            type: "FieldExpression";
        }) | ({
            operator: "and";
            args: (({
                operator: "or";
                args: ((any & {
                    type: "FieldExpression";
                }) | (any & {
                    type: "FieldExpression";
                }) | ({
                    operator: "eq" | "neq" | "ne";
                    args: [{
                            type: "Identifier";
                            value: string;
                        }, any];
                } & {
                    type: "FieldExpression";
                }) | ({
                    operator: "in" | "nin";
                    args: [{
                            type: "Identifier";
                            value: string;
                        }, string[] | number[]];
                } & {
                    type: "FieldExpression";
                }) | ({
                    operator: "lt" | "gt" | "lte" | "gte";
                    args: [{
                            type: "Identifier";
                            value: string;
                        }, string | number];
                } & {
                    type: "FieldExpression";
                }) | ({
                    operator: string;
                    args: any[];
                } & {
                    type: "FieldExpression";
                }))[];
            } & {
                type: "FieldExpression";
            }) | (any & {
                type: "FieldExpression";
            }) | ({
                operator: "eq" | "neq" | "ne";
                args: [{
                        type: "Identifier";
                        value: string;
                    }, any];
            } & {
                type: "FieldExpression";
            }) | ({
                operator: "in" | "nin";
                args: [{
                        type: "Identifier";
                        value: string;
                    }, string[] | number[]];
            } & {
                type: "FieldExpression";
            }) | ({
                operator: "lt" | "gt" | "lte" | "gte";
                args: [{
                        type: "Identifier";
                        value: string;
                    }, string | number];
            } & {
                type: "FieldExpression";
            }) | ({
                operator: string;
                args: any[];
            } & {
                type: "FieldExpression";
            }))[];
        } & {
            type: "FieldExpression";
        }) | ({
            operator: "eq" | "neq" | "ne";
            args: [{
                    type: "Identifier";
                    value: string;
                }, any];
        } & {
            type: "FieldExpression";
        }) | ({
            operator: "in" | "nin";
            args: [{
                    type: "Identifier";
                    value: string;
                }, string[] | number[]];
        } & {
            type: "FieldExpression";
        }) | ({
            operator: "lt" | "gt" | "lte" | "gte";
            args: [{
                    type: "Identifier";
                    value: string;
                }, string | number];
        } & {
            type: "FieldExpression";
        }) | ({
            operator: string;
            args: any[];
        } & {
            type: "FieldExpression";
        });
        defaultSortParamParser: typeof defaultSortParamParser;
        defaultFilterParamParser: typeof defaultFilterParamParser;
        getModelName(typeName: string, singularizer?: (word: string) => string): string;
        getTypeName(modelName: string, pluralizer?: (word: string) => string): string;
    };
    displaySafeError: symbol;
    RFC6570String: symbol;
    Errors: typeof Errors;
    ResourceTypeRegistry: typeof ResourceTypeRegistry;
};
export default defaultExp;
