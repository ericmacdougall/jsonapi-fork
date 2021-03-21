import Relationship, { RelationshipJSON, RelationshipArgs } from "./Relationship";
import { UrlTemplates } from "./index";
export declare type ResourceJSON = {
    id: string;
    type: string;
    attributes?: object;
    relationships?: {
        [name: string]: RelationshipJSON;
    };
    meta?: object;
    links?: {
        self?: string;
    };
};
export declare type ResourceWithId = Resource & {
    id: string;
};
export declare type ResourceWithTypePath = Resource & {
    typePath: string[];
};
export default class Resource {
    private _id;
    private _type;
    private _relationships;
    private _attrs;
    private _meta;
    adapterExtra: any;
    typePath: string[] | undefined;
    constructor(type: string, id?: string, attrs?: any, relationships?: any, meta?: {
        types?: string[];
    });
    id: string | undefined;
    type: string;
    readonly typesList: any;
    equals(otherResource: Resource): boolean;
    attrs: {
        [name: string]: any;
    };
    attributes: {
        [name: string]: any;
    };
    relationships: {
        [name: string]: Relationship;
    };
    meta: object;
    removeAttr(attrPath: string): void;
    removeRelationship(relationshipPath: string): void;
    setRelationship(relationshipPath: string, data: RelationshipArgs["data"]): void;
    toJSON(urlTemplates: UrlTemplates): ResourceJSON;
}
