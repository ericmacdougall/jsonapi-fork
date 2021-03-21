import { UrlTemplates } from './index';
export declare type APIErrorJSON = {
    status?: string;
    code?: string;
    title?: string;
    detail?: string;
    links?: any;
    source?: {
        pointer?: string;
        parameter?: string;
    };
    meta?: object;
};
export declare type Opts = {
    status?: string | number;
    title?: string;
    detail?: string;
    typeUri?: string;
    source?: {
        pointer?: string;
        parameter?: string;
    };
    meta?: object;
    rawError?: Error;
};
export declare const displaySafe: unique symbol;
export default class APIError extends Error {
    status?: string;
    title?: string;
    detail?: string;
    source?: Opts['source'];
    meta?: object;
    protected typeUri?: string;
    rawError?: Error;
    constructor(opts?: Opts);
    toJSON(urlTemplates?: UrlTemplates): APIErrorJSON;
    static fromError(err: any): APIError;
    static isDisplaySafe(it: any): any;
}
