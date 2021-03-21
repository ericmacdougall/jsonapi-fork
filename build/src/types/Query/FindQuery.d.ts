import WithCriteriaQuery, { WithCriteriaQueryOptions } from "./WithCriteriaQuery";
import { FindReturning } from '../../db-adapters/AdapterInterface';
import { Sort, AndExpression, Result } from "../index";
export declare type FindQueryOptions = WithCriteriaQueryOptions & {
    populates?: string[];
    select?: {
        [typeName: string]: string[];
    };
    sort?: Sort[];
    returning(result: FindReturning): Result | Promise<Result>;
    ignoreLimitMax?: boolean;
};
export default class FindQuery extends WithCriteriaQuery {
    protected query: {
        type: FindQueryOptions["type"];
        catch: FindQueryOptions["catch"];
        returning: FindQueryOptions["returning"];
        select?: FindQueryOptions["select"];
        sort?: FindQueryOptions["sort"];
        populates: string[];
        criteria: {
            where: AndExpression;
            isSingular: boolean;
            limit?: FindQueryOptions["limit"];
            offset?: FindQueryOptions["offset"];
        };
        ignoreLimitMax: boolean;
    };
    constructor({populates, select, sort, ignoreLimitMax, ...baseOpts}: FindQueryOptions);
    onlyPopulates(paths: string[]): this;
    withPopulates(paths: string[]): this;
    withoutPopulates(paths: string[]): this;
    readonly populates: string[];
    readonly select: {
        [typeName: string]: string[];
    } | undefined;
    readonly sort: Sort[] | undefined;
    readonly ignoreLimitMax: boolean;
    withMaxLimit(): this;
    withoutMaxLimit(): this;
}
