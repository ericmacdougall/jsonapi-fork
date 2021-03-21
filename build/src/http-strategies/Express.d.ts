/// <reference types="express" />
import { RequestOpts } from "../controllers/API";
import Base, { HTTPStrategyOptions, Controller } from "./Base";
import { Request as JSONAPIRequest, Result, HTTPResponse } from "../types";
import { Request, Response, NextFunction, RequestHandler, ErrorRequestHandler } from "express";
export default class ExpressStrategy extends Base {
    constructor(apiController: any, docsController?: any, options?: HTTPStrategyOptions);
    protected buildRequestObject(req: Request): Promise<JSONAPIRequest>;
    protected sendResponse(response: HTTPResponse, res: Response, next: NextFunction): void;
    protected doRequest: (controller: Controller, req: Request, res: Response, next: NextFunction) => Promise<void>;
    readonly docsRequest: RequestHandler;
    _docsRequest: RequestHandler;
    apiRequest: RequestHandler;
    customAPIRequest: (opts: RequestOpts) => (x1: Request, x2: Response, x3: NextFunction) => Promise<void>;
    sendError: ErrorRequestHandler;
    sendResult: (result: Result, req: Request, res: Response, next: NextFunction) => Promise<void>;
}
