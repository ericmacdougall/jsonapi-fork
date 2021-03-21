/// <reference types="node" />
import { Request, FinalizedRequest, Result, HTTPResponse, ServerReq, ServerRes, ParsedFilterParam, ParsedSortParam, makeDocument, ErrorOrErrorArray, SupportedOperators, ParserOperatorsConfig } from "../types";
import ResourceTypeRegistry from "../ResourceTypeRegistry";
import Document, { DocumentData, DocTransformFn } from "../types/Document";
import Resource from "../types/Resource";
import ResourceIdentifier from "../types/ResourceIdentifier";
import { TransformMode } from "../steps/make-transform-fn";
import { RunnableQuery, QueryReturning } from '../steps/run-query';
import { IncomingMessage, ServerResponse } from "http";
import CreateQuery from "../types/Query/CreateQuery";
import FindQuery from "../types/Query/FindQuery";
import UpdateQuery from "../types/Query/UpdateQuery";
import DeleteQuery from "../types/Query/DeleteQuery";
import AddToRelationshipQuery from "../types/Query/AddToRelationshipQuery";
import RemoveFromRelationshipQuery from "../types/Query/RemoveFromRelationshipQuery";
export { CreateQuery, FindQuery, UpdateQuery, DeleteQuery, AddToRelationshipQuery, RemoveFromRelationshipQuery, IncomingMessage, ServerResponse };
export declare type APIControllerOpts = {
    filterParser?: customParamParser<ParsedFilterParam>;
    sortParser?: customParamParser<ParsedSortParam>;
};
export declare type customParamParser<T> = (supportedOperators: ParserOperatorsConfig, rawQuery: string | undefined, parsedParams: object, target: {
    method: string;
    uri: string;
}) => T | undefined;
export declare type QueryFactory = (opts: QueryBuildingContext) => RunnableQuery | Promise<RunnableQuery>;
export declare type ResultFactory = (opts: ResultBuildingContext, customQueryFactory?: QueryFactory) => Result | Promise<Result>;
export declare type QueryBuildingContext<T = Resource | ResourceIdentifier> = {
    request: FinalizedRequest;
    serverReq: ServerReq;
    serverRes: ServerRes;
    beforeSave: DocTransformFn<T>;
    beforeRender: DocTransformFn<T>;
    transformDocument(doc: Document, modeOrFn: TransformMode | DocTransformFn<T>): Promise<Document>;
    setTypePaths(it: (Resource | ResourceIdentifier)[], useInputData: boolean, requiredThroughType?: string): Promise<void>;
    registry: ResourceTypeRegistry;
    makeDocument: makeDocument;
    makeQuery: QueryFactory;
    runQuery<U extends RunnableQuery>(q: U): Promise<QueryReturning<U>>;
};
export declare type ResultBuildingContext = QueryBuildingContext;
export declare type QueryTransformNoReq = {
    (first: RunnableQuery): RunnableQuery;
};
export declare type QueryTransformWithReq = {
    (first: ServerReq, second: RunnableQuery): RunnableQuery;
};
export declare type RequestOpts = {
    queryTransform?: QueryTransformNoReq | QueryTransformWithReq;
    queryFactory?: QueryFactory;
    resultFactory?: ResultFactory;
    supportedOperators?: SupportedOperators;
};
export default class APIController {
    private registry;
    private filterParamParser;
    private sortParamParser;
    constructor(registry: ResourceTypeRegistry, opts?: APIControllerOpts);
    protected makeDoc: (data: DocumentData) => Document;
    protected finalizeRequest(request: Request, supportedOperators: SupportedOperators): Promise<FinalizedRequest>;
    private getSupportedOperators(request);
    makeQuery(opts: QueryBuildingContext): Promise<RunnableQuery>;
    runQuery: <T extends RunnableQuery>(q: T) => Promise<QueryReturning<T>>;
    makeResult(opts: ResultBuildingContext, customQueryFactory?: QueryFactory): Promise<Result>;
    handle: (request: Request, serverReq: IncomingMessage, serverRes: ServerResponse, opts?: RequestOpts) => Promise<HTTPResponse>;
    static responseFromError(errors: ErrorOrErrorArray, requestAccepts: any): Promise<HTTPResponse>;
    static responseFromResult(result: Result, reqAccepts?: string, allow406?: boolean): Promise<HTTPResponse>;
    static supportedExt: ReadonlyArray<string>;
}
export declare function defaultFilterParamParser(filterOps: ParserOperatorsConfig, rawQuery: string | undefined): (({
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
}))[] | undefined;
export declare function defaultSortParamParser(sortOps: ParserOperatorsConfig, rawQuery: string | undefined): ({
    field: string;
    direction: "ASC" | "DESC";
} | {
    expression: ({
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
    direction: "ASC" | "DESC";
})[] | undefined;
