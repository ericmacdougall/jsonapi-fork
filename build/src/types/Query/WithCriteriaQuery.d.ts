import Query, { QueryOptions } from "./Query";
import { FieldExpression, AndExpression } from "../index";
export declare type WithCriteriaQueryOptions = QueryOptions & {
    limit?: number;
    offset?: number;
    isSingular?: boolean;
    filters?: FieldExpression[];
    ids?: string[];
    id?: string;
};
export default class WithCriteriaQuery extends Query {
    protected query: QueryOptions & {
        criteria: {
            where: AndExpression;
            isSingular: boolean;
            offset?: number;
            limit?: number;
        };
    };
    constructor(opts: WithCriteriaQueryOptions);
    andWhere(constraint: FieldExpression): this;
    matchingIdOrIds(idOrIds: string | string[] | undefined): this;
    getFilters(): AndExpression;
    withoutFilters(): this;
    isSimpleIdQuery(): boolean;
    protected removeFilter(filter: FieldExpression): this;
    readonly offset: number | undefined;
    readonly limit: number | undefined;
    readonly isSingular: boolean;
    withLimit(limit: number | undefined): this;
}
