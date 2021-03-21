import { Result } from "../index";
import { RelationshipUpdateReturning } from '../../db-adapters/AdapterInterface';
import Query, { QueryOptions } from "./Query";
import ResourceIdentifier from "../ResourceIdentifier";
export declare type RemoveFromRelationshipQueryOptions = QueryOptions & {
    id: string | number;
    relationshipName: string;
    linkage: ResourceIdentifier[];
    returning: (result: RelationshipUpdateReturning) => Result | Promise<Result>;
};
export default class RemoveFromRelationshipQuery extends Query {
    protected query: {
        type: QueryOptions["type"];
        catch: QueryOptions["catch"];
        returning: RemoveFromRelationshipQueryOptions["returning"];
        id: RemoveFromRelationshipQueryOptions["id"];
        relationshipName: RemoveFromRelationshipQueryOptions["relationshipName"];
        linkage: RemoveFromRelationshipQueryOptions["linkage"];
    };
    constructor(opts: RemoveFromRelationshipQueryOptions);
    readonly id: string | number;
    readonly relationshipName: string;
    readonly linkage: ResourceIdentifier[];
}
