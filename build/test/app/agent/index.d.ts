/// <reference types="superagent" />
import superagent = require("superagent");
declare const _default: Promise<{
    request(method: any, url: any): any;
    superagent: superagent.SuperAgentStatic;
    baseUrl: string;
}>;
export default _default;
export declare type PromiseResult<T> = T extends Promise<infer U> ? U : never;
