/// <reference types="mongoose" />
import { Model, SchemaType } from "mongoose";
export declare function getReferencePaths(model: Model<any>): string[];
export declare function isReferencePath(schemaType: SchemaType): boolean;
export declare function isRootModel(model: Model<any>): boolean;
export declare function getReferencedModelName(model: Model<any>, path: string): string | undefined;
export declare function getDiscriminatorKey(model: Model<any>): string | undefined;
export declare function getVersionKey(model: Model<any>): string;
export declare function getMetaKeys(model: Model<any>): string[];
