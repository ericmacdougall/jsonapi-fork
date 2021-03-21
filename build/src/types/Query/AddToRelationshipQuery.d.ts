import { Result } from "../index";
import { RelationshipUpdateReturning } from '../../db-adapters/AdapterInterface';
import Query, { QueryOptions } from "./Query";
import ResourceIdentifier from "../ResourceIdentifier";
export declare type AddToRelationshipQueryOptions = QueryOptions & {
    id: string | number;
    relationshipName: string;
    linkage: ResourceIdentifier[];
    returning: (result: RelationshipUpdateReturning) => Result | Promise<Result>;
};
export default class AddToRelationshipQuery extends Query {
    protected query: {
        type: QueryOptions["type"];
        catch: QueryOptions["catch"];
        returning: AddToRelationshipQueryOptions["returning"];
        id: AddToRelationshipQueryOptions["id"];
        relationshipName: AddToRelationshipQueryOptions["relationshipName"];
        linkage: AddToRelationshipQueryOptions["linkage"];
    };
    constructor(opts: AddToRelationshipQueryOptions);
    readonly id: string | number;
    readonly relationshipName: string;
    readonly linkage: ResourceIdentifier[];
}
