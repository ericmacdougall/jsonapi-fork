import Resource from "../../types/Resource";
import { FieldExpression } from "../../types/index";
export declare function errorHandler(err: any, context?: {
    type: string;
    id?: string;
}): never;
export declare function toMongoCriteria(constraint: FieldExpression): any;
export declare function resourceToDocObject(resource: Resource, typePathFn?: any): object;
