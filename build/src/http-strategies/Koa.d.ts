import Base from "./Base";
export default class KoaStrategy extends Base {
    constructor(apiController: any, docsController?: any, options?: any);
    apiRequest(): (this: any, next: any) => IterableIterator<any>;
    readonly docsRequest: () => (this: any, next: any) => IterableIterator<any>;
    _docsRequest: () => (this: any, next: any) => IterableIterator<any>;
    protected sendResources(responseObject: any, ctx: any): void | true;
    sendError(this: any, errors: any, ctx: any): void;
}
