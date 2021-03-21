import APIError, { APIErrorJSON } from "./APIError";
import { PrimaryDataJSON, UrlTemplatesByType, UrlTemplates, Links } from "./index";
import Resource, { ResourceJSON } from "./Resource";
import ResourceIdentifier from "./ResourceIdentifier";
import ResourceSet from "./ResourceSet";
import Relationship from "./Relationship";
import ResourceIdentifierSet from "../types/ResourceIdentifierSet";
export declare type DocumentJSON = ({
    data: PrimaryDataJSON;
    errors: undefined;
    included?: ResourceJSON[];
} | {
    errors: APIErrorJSON[];
    data: undefined;
    included: undefined;
}) & {
    meta?: object;
    links?: Links;
};
export declare type TransformMeta = {
    section: "primary" | "included";
};
export declare type DocTransformFn<T> = (resourceOrIdentifier: T, meta: TransformMeta) => Promise<T | undefined>;
export declare type DocResourceTransformFn = DocTransformFn<Resource>;
export declare type DocFullTransformFn = DocTransformFn<Resource | ResourceIdentifier>;
export declare type DocumentData = {
    meta?: object;
    included?: Resource[];
    primary?: ResourceSet | Relationship | ResourceIdentifierSet;
    errors?: APIError[];
    urlTemplates?: UrlTemplatesByType;
    errorUrlTemplates?: UrlTemplates;
};
export default class Document {
    meta: DocumentData["meta"];
    included: DocumentData["included"];
    primary: DocumentData["primary"];
    errors: DocumentData["errors"];
    urlTemplates: UrlTemplatesByType;
    errorUrlTemplates: UrlTemplates;
    constructor(data: DocumentData);
    toJSON(): DocumentJSON;
    toString(): string;
    clone(): Document;
    getContents(): (Resource | ResourceIdentifier)[];
    transform(fn: DocResourceTransformFn | DocFullTransformFn, resourcesOnly?: boolean): Promise<Document>;
}
