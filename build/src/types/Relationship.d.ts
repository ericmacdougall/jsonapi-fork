import { LinkageJSON, UrlTemplates } from "./index";
import MaybeDataWithLinks, { MaybeDataWithLinksArgs } from "./MaybeDataWithLinks";
import ResourceIdentifier from "./ResourceIdentifier";
export declare type RelationshipJSON = {
    data?: LinkageJSON;
    links?: RelationshipLinksJSON;
};
export declare type RelationshipLinksJSON = {
    self?: string;
    related?: string;
};
export declare type RelationshipOwner = {
    type: string;
    id: string | undefined;
    path: string;
};
export declare type RelationshipArgs = MaybeDataWithLinksArgs<ResourceIdentifier> & {
    owner: RelationshipOwner;
};
export default class Relationship extends MaybeDataWithLinks<ResourceIdentifier> {
    owner: RelationshipOwner;
    protected constructor(it: RelationshipArgs);
    protected clone(): this;
    toJSON(fallbackTemplates: UrlTemplates): RelationshipJSON;
    static of(it: RelationshipArgs): Relationship;
}
