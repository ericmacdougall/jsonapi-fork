/// <reference types="node" />
import Resource, { ResourceJSON } from "./Resource";
import APIError from './APIError';
import ResourceIdentifier, { ResourceIdentifierJSON } from "./ResourceIdentifier";
import Document, { DocumentData } from "./Document";
import Data from "./Generic/Data";
import { UrlTemplate } from "./UrlTemplate";
import { ParsedStandardQueryParams } from "../steps/pre-query/parse-query-params";
import { IncomingMessage, ServerResponse } from "http";
export declare type DataOf<T> = null | T | T[];
export declare type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export declare type PrimaryData = DataOf<Resource> | DataOf<ResourceIdentifier>;
export declare type ErrorOrErrorArray = Error | APIError | (APIError | Error)[];
export declare type DataWithLinksArgs<T> = {
    data: T | T[] | null | Data<T>;
    links?: UrlTemplates;
};
export declare type LinkageJSON = DataOf<ResourceIdentifierJSON>;
export declare type PrimaryDataJSON = DataOf<ResourceJSON> | LinkageJSON;
export declare type Links = {
    [linkName: string]: any;
};
export declare type Reducer<T, U = any> = (acc: U, it: T, i: number, arr: T[]) => U;
export declare type PredicateFn<T> = (it: T, i: number, arr: T[]) => boolean;
export declare type Mapper<T, U> = (it: T, i: number, arr: T[]) => U;
export declare type AsyncMapper<T, U> = (it: T, i: number, arr: T[]) => U | Promise<U>;
export declare type Reduceable<T, U> = {
    reduce: (fn: Reducer<T, U>, init?: U) => U;
};
export declare type ServerReq = IncomingMessage;
export declare type ServerRes = ServerResponse;
export declare type StrictDictMap<T> = {
    [it: string]: T | undefined;
};
export declare type SortDirection = "ASC" | "DESC";
export declare type FieldSort = {
    field: string;
    direction: SortDirection;
};
export declare type ExpressionSort = {
    expression: FieldExpression;
    direction: SortDirection;
};
export declare type Sort = FieldSort | ExpressionSort;
export declare type ParsedFilterParam = FieldExpression[];
export declare type ParsedSortParam = Sort[];
export declare type ParsedQueryParams = ParsedStandardQueryParams & {
    sort?: ParsedSortParam;
    filter?: ParsedFilterParam;
};
export declare type FinalizeArgs = (operatorsConfig: ParserOperatorsConfig, operator: string, args: any[]) => any;
export declare type OperatorDesc = {
    legalIn?: ("sort" | "filter")[];
    arity?: number;
    finalizeArgs?: FinalizeArgs;
};
export declare type FinalizedOperatorDesc = Required<OperatorDesc>;
export declare type SupportedOperators = StrictDictMap<OperatorDesc>;
export declare type FinalizedSupportedOperators = StrictDictMap<FinalizedOperatorDesc>;
export declare type ParserOperatorsConfig = StrictDictMap<Omit<FinalizedOperatorDesc, "legalIn">>;
export declare type AndExpression = FieldExpression & {
    operator: "and";
    args: FieldExpression[];
};
export declare type Identifier = {
    type: "Identifier";
    value: string;
};
export declare type FieldExpression = ({
    operator: "or";
    args: FieldExpression[];
} | {
    operator: "and";
    args: FieldExpression[];
} | {
    operator: "eq" | 'neq' | 'ne';
    args: [Identifier, any];
} | {
    operator: "in" | "nin";
    args: [Identifier, string[] | number[]];
} | {
    operator: 'lt' | 'gt' | 'lte' | 'gte';
    args: [Identifier, string | number];
} | {
    operator: string;
    args: any[];
}) & {
    type: "FieldExpression";
};
export declare type UrlTemplatesByType = {
    [typeName: string]: UrlTemplates;
};
export declare type UrlTemplates = {
    [linkName: string]: UrlTemplate | undefined;
};
export declare type Request = {
    body: any | undefined;
    method: string;
    uri: string;
    contentType: string | undefined;
    accepts: string | undefined;
    rawQueryString: string | undefined;
    queryParams: {
        [paramName: string]: any;
    };
    type: string;
    id: string | undefined;
    relationship: string | undefined;
    aboutRelationship: boolean;
};
export declare type FinalizedRequest = Request & {
    queryParams: ParsedQueryParams;
    document: Document | undefined;
};
export declare type Result = {
    headers?: {
        [headerName: string]: string;
    };
    ext?: string[];
    status?: number;
    document?: Document;
};
export interface HTTPResponse {
    headers: {
        "content-type"?: string;
        vary?: string;
    };
    status: number;
    body?: string;
}
export declare type makeDocument = (data: DocumentData) => Document;
