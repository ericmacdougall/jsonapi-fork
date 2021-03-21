export declare type ResourceIdentifierJSON = {
    type: string;
    id: string;
};
export default class ResourceIdentifier {
    type: string;
    id: string;
    typePath: string[] | undefined;
    adapterExtra: any;
    constructor(type: string, id: string);
    readonly typesList: undefined;
    toJSON(): {
        id: string;
        type: string;
    };
    static fromJSON(it: ResourceIdentifierJSON): ResourceIdentifier;
}
export declare function isValidLinkageObject(it: any): it is ResourceIdentifierJSON;
