import { Sort, Identifier as IdentifierType, ParserOperatorsConfig, FieldExpression as FieldExprType } from "../../types/index";
export declare const isFieldExpression: (it: any) => it is FieldExprType;
export declare const isId: (it: any) => it is IdentifierType;
export declare const FieldExpression: <T extends string>(operator: T, args: any[]) => {
    type: "FieldExpression";
    operator: T;
    args: any[];
};
export declare const Identifier: (value: string) => {
    type: "Identifier";
    value: string;
};
export declare type StringListParam = string[];
export declare type ScopedParam = {
    [scopeName: string]: any;
};
export declare type ScopedStringListParam = {
    [scopeName: string]: string[];
};
export declare type RawParams = {
    [paramName: string]: any;
};
export declare type ParsedStandardQueryParams = {
    include?: StringListParam;
    page?: ScopedParam;
    fields?: ScopedStringListParam;
    [paramName: string]: any;
};
export default function (params: RawParams): ParsedStandardQueryParams;
export declare function parseSort(rawSortString: string, sortOperators: ParserOperatorsConfig): Sort[];
export declare function parseFilter(rawFilterString: string, filterOperators: ParserOperatorsConfig): FieldExprType[];
