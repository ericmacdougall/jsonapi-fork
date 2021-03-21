import { Result } from "../index";
import Query, { QueryOptions } from "./Query";
import { CreationReturning } from '../../db-adapters/AdapterInterface';
import Resource, { ResourceWithTypePath } from "../Resource";
export { Resource, ResourceWithTypePath };
import Data from "../Generic/Data";
export declare type CreateQueryOptions = QueryOptions & {
    records: Data<ResourceWithTypePath>;
    returning: (result: CreationReturning) => Result | Promise<Result>;
};
export default class CreateQuery extends Query {
    protected query: {
        type: QueryOptions["type"];
        catch: QueryOptions["catch"];
        returning: CreateQueryOptions["returning"];
        records: CreateQueryOptions["records"];
    };
    constructor({records, ...baseOpts}: CreateQueryOptions);
    readonly records: Data<ResourceWithTypePath>;
}
