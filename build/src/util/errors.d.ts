import { Omit } from '../types';
import APIError, { Opts } from '../types/APIError';
export declare type ErrorOpts = Omit<Opts, "title" | "status" | "typeUri">;
export declare const genericValidation: (data?: Pick<Opts, "meta" | "source" | "detail" | "rawError"> | undefined) => APIError;
export declare const genericNotFound: (data?: Pick<Opts, "meta" | "source" | "detail" | "rawError"> | undefined) => APIError;
export declare const generic405: (data?: Pick<Opts, "meta" | "source" | "detail" | "rawError"> | undefined) => APIError;
export declare const generic406: (data?: Pick<Opts, "meta" | "source" | "detail" | "rawError"> | undefined) => APIError;
export declare const generic415: (data?: Pick<Opts, "meta" | "source" | "detail" | "rawError"> | undefined) => APIError;
export declare const invalidIncludePath: (data?: Pick<Opts, "meta" | "source" | "detail" | "rawError"> | undefined) => APIError;
export declare const unsupportedIncludePath: (data?: Pick<Opts, "meta" | "source" | "detail" | "rawError"> | undefined) => APIError;
export declare const illegalQueryParam: (data?: Pick<Opts, "meta" | "source" | "detail" | "rawError"> | undefined) => APIError;
export declare const invalidQueryParamValue: (data?: Pick<Opts, "meta" | "source" | "detail" | "rawError"> | undefined) => APIError;
export declare const illegalTypeList: (data?: Pick<Opts, "meta" | "source" | "detail" | "rawError"> | undefined) => APIError;
export declare const invalidTypeList: (data?: Pick<Opts, "meta" | "source" | "detail" | "rawError"> | undefined) => APIError;
export declare const invalidResourceType: (data?: Pick<Opts, "meta" | "source" | "detail" | "rawError"> | undefined) => APIError;
export declare const invalidRelationshipName: (data?: Pick<Opts, "meta" | "source" | "detail" | "rawError"> | undefined) => APIError;
export declare const invalidAttributeName: (data?: Pick<Opts, "meta" | "source" | "detail" | "rawError"> | undefined) => APIError;
export declare const invalidLinkageStructure: (data?: Pick<Opts, "meta" | "source" | "detail" | "rawError"> | undefined) => APIError;
export declare const invalidResourceStructure: (data?: Pick<Opts, "meta" | "source" | "detail" | "rawError"> | undefined) => APIError;
export declare const resourceMissingTypeKey: (data?: Pick<Opts, "meta" | "source" | "detail" | "rawError"> | undefined) => APIError;
export declare const resourceMissingIdKey: (data?: Pick<Opts, "meta" | "source" | "detail" | "rawError"> | undefined) => APIError;
export declare const resourceMetaNonObject: (data?: Pick<Opts, "meta" | "source" | "detail" | "rawError"> | undefined) => APIError;
export declare const resourceFieldsContainerNonObject: (data?: Pick<Opts, "meta" | "source" | "detail" | "rawError"> | undefined) => APIError;
export declare const resourceIdentifierKeyAsField: (data?: Pick<Opts, "meta" | "source" | "detail" | "rawError"> | undefined) => APIError;
export declare const resourceDuplicateField: (data?: Pick<Opts, "meta" | "source" | "detail" | "rawError"> | undefined) => APIError;
export declare const relationshipMissingLinkage: (data?: Pick<Opts, "meta" | "source" | "detail" | "rawError"> | undefined) => APIError;
export declare const invalidLinkageType: (data?: Pick<Opts, "meta" | "source" | "detail" | "rawError"> | undefined) => APIError;
export declare const illegalFieldName: (data?: Pick<Opts, "meta" | "source" | "detail" | "rawError"> | undefined) => APIError;
export declare const unsupportedClientId: (data?: Pick<Opts, "meta" | "source" | "detail" | "rawError"> | undefined) => APIError;
export declare const missingField: (data?: Pick<Opts, "meta" | "source" | "detail" | "rawError"> | undefined) => APIError;
export declare const invalidFieldValue: (data?: Pick<Opts, "meta" | "source" | "detail" | "rawError"> | undefined) => APIError;
export declare const missingDataKey: (data?: Pick<Opts, "meta" | "source" | "detail" | "rawError"> | undefined) => APIError;
export declare const expectedDataArray: (data?: Pick<Opts, "meta" | "source" | "detail" | "rawError"> | undefined) => APIError;
export declare const expectedDataObject: (data?: Pick<Opts, "meta" | "source" | "detail" | "rawError"> | undefined) => APIError;
export declare const jsonParse: (data?: Pick<Opts, "meta" | "source" | "detail" | "rawError"> | undefined) => APIError;
export declare const uniqueViolation: (data?: Pick<Opts, "meta" | "source" | "detail" | "rawError"> | undefined) => APIError;
export declare const invalidId: (data?: Pick<Opts, "meta" | "source" | "detail" | "rawError"> | undefined) => APIError;
export declare const unknownResourceType: (data?: Pick<Opts, "meta" | "source" | "detail" | "rawError"> | undefined) => APIError;
export declare const unknownRelationshipName: (data?: Pick<Opts, "meta" | "source" | "detail" | "rawError"> | undefined) => APIError;
export declare const occFail: (data?: Pick<Opts, "meta" | "source" | "detail" | "rawError"> | undefined) => APIError;
export declare const invalidMediaTypeParam: (data?: Pick<Opts, "meta" | "source" | "detail" | "rawError"> | undefined) => APIError;
