/// <reference types="express" />
import express = require("express");
import { QueryBuildingContext } from "../../../src/controllers/API";
import ExpressStrategy from "../../../src/http-strategies/Express";
import MongooseAdapter from '../../../src/db-adapters/Mongoose/MongooseAdapter';
import { Express } from "express";
export { Express, QueryBuildingContext, ExpressStrategy, MongooseAdapter };
declare const _default: Promise<{
    app: express.Express;
    Front: ExpressStrategy;
    subApp: express.Express;
    adapter: MongooseAdapter;
}>;
export default _default;
