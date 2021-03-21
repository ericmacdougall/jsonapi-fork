import { Reduceable } from "../types";
export declare function isPlainObject(obj: object): boolean;
export declare function objectIsEmpty(obj: object): boolean;
export declare const reduceToObject: (makeKey: any) => (acc: any, it: any) => any;
export declare const reduceById: (acc: any, it: any) => any;
export declare function deleteNested(path: string, object: object): boolean;
export declare function isSubsetOf(setArr: any[], potentialSubsetArr: any[]): boolean;
export declare function setDifference(minuendArr: any[], subtrahendArr: any[]): Set<any>;
export declare const stripLeadingBMPChar: (char: string) => (it: string) => string;
export declare function partition<T>(fnOrKey: ((it: T) => string) | string, items: Reduceable<T, {
    [partitionName: string]: T[];
}>): {
    [partitionName: string]: T[];
};
export declare function pseudoTopSort(nodes: string[], edges: {
    [from: string]: {
        [to: string]: true;
    };
}, roots: string[]): string[];
