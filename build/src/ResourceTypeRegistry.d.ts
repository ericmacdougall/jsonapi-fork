/// <reference types="node" />
import { ResourceTransformFn, FullTransformFn, TransformFn, BeforeRenderFullTransformFn, BeforeRenderResourceTransformFn } from "./steps/make-transform-fn";
import { AdapterInstance } from "./db-adapters/AdapterInterface";
import { UrlTemplate } from "./types/UrlTemplate";
import Resource from "./types/Resource";
import ResourceIdentifier from "./types/ResourceIdentifier";
import { UrlTemplates, UrlTemplatesByType } from "./types";
import { IncomingMessage, ServerResponse } from "http";
export { Resource, ResourceIdentifier, TransformFn, IncomingMessage, ServerResponse };
export declare type InputURLTemplates = {
    [linkName: string]: UrlTemplate | string;
};
export declare type ResourceTypeInfo = {
    fields?: {
        [fieldName: string]: any;
    };
    example?: string;
    description?: string;
};
export declare type InputErrorsConfig = {
    urlTemplates: {
        about: InputURLTemplates['about'];
    };
};
export declare type ErrorsConfig = {
    urlTemplates: UrlTemplates;
};
export declare type ResourceTypeDescription = {
    dbAdapter?: AdapterInstance<any>;
    info?: ResourceTypeInfo;
    defaultIncludes?: string[];
    parentType?: string;
    urlTemplates?: InputURLTemplates;
    beforeSave?: ResourceTransformFn | FullTransformFn;
    beforeRender?: BeforeRenderResourceTransformFn | BeforeRenderFullTransformFn;
    transformLinkage?: boolean;
    pagination?: {
        maxPageSize?: number;
        defaultPageSize?: number;
    };
};
export declare type ResourceTypeDescriptions = {
    [typeName: string]: ResourceTypeDescription;
};
export declare type OutputResourceTypeDescription = ResourceTypeDescription & {
    urlTemplates: UrlTemplates;
} & Required<Pick<ResourceTypeDescription, "dbAdapter" | "pagination">>;
export default class ResourceTypeRegistry {
    private _types;
    private _typesMetadata;
    private _errorsConfig?;
    constructor(typeDescs?: ResourceTypeDescriptions, descDefaults?: Partial<ResourceTypeDescription>, errorsConfig?: InputErrorsConfig);
    errorsConfig(): ErrorsConfig | undefined;
    type(typeName: string): OutputResourceTypeDescription | undefined;
    hasType(typeName: string): boolean;
    urlTemplates(): UrlTemplatesByType;
    urlTemplates(type: string): UrlTemplates;
    dbAdapter(typeName: string): AdapterInstance<any> | undefined;
    uniqueAdapters(): Map<AdapterInstance<any>, string[]>;
    beforeSave(typeName: string): TransformFn<Resource, IncomingMessage, ServerResponse> | TransformFn<ResourceIdentifier | Resource, IncomingMessage, ServerResponse> | undefined;
    beforeRender(typeName: string): TransformFn<Resource & {
        id: string;
    }, IncomingMessage, ServerResponse> | TransformFn<ResourceIdentifier | (Resource & {
        id: string;
    }), IncomingMessage, ServerResponse> | undefined;
    defaultIncludes(typeName: string): string[] | undefined;
    info(typeName: string): ResourceTypeInfo | undefined;
    transformLinkage(typeName: string): boolean;
    parentTypeName(typeName: string): string | undefined;
    pagination(typeName: string): {
        maxPageSize?: number | undefined;
        defaultPageSize?: number | undefined;
    } | undefined;
    typeNames(): string[];
    childTypeNames(typeName: string): string[];
    rootTypeNames(): string[];
    rootTypeNameOf(typeName: string): string;
    typePathTo(typeName: string): string[];
    asTypePath(typesList: string[], throughType?: string): false | string[];
    private doGet<T>(attrName, typeName);
    private processTypeDesc(it);
    private processUrlTemplates(it);
}
