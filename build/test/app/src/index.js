"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const bodyParser = require("body-parser");
const R = require("ramda");
const API = require("../../../src/index");
const Document_1 = require("../../../src/types/Document");
const APIError_1 = require("../../../src/types/APIError");
const FindQuery_1 = require("../../../src/types/Query/FindQuery");
const ResourceSet_1 = require("../../../src/types/ResourceSet");
const index_1 = require("../database/index");
const parse_query_params_1 = require("../../../src/steps/pre-query/parse-query-params");
const Express_1 = require("../../../src/http-strategies/Express");
exports.ExpressStrategy = Express_1.default;
const MongooseAdapter_1 = require("../../../src/db-adapters/Mongoose/MongooseAdapter");
exports.MongooseAdapter = MongooseAdapter_1.default;
exports.default = index_1.default.then(function (dbModule) {
    const adapter = new API.dbAdapters.Mongoose(dbModule.models());
    const registry = new API.ResourceTypeRegistry({
        "people": require("./resource-descriptions/people"),
        "organizations": require("./resource-descriptions/organizations"),
        "schools": require("./resource-descriptions/schools")
    }, {
        dbAdapter: adapter
    }, {
        urlTemplates: {
            about: "https://google.com/?x={code}"
        }
    });
    const Docs = new API.controllers.Documentation(registry, { name: "Example API" });
    const Controller = new API.controllers.API(registry);
    const ControllerWithCustomFilterParsing = new API.controllers.API(registry, {
        filterParser(supportedOperators, rawQuery, params) {
            return ('customNameFilter' in params)
                ? [
                    parse_query_params_1.FieldExpression("eq", [
                        parse_query_params_1.Identifier("name"),
                        String(params.customNameFilter)
                    ])
                ]
                : undefined;
        }
    });
    const app = express();
    const port = process.env.PORT || "3000";
    const host = process.env.HOST || "127.0.0.1";
    const Front = new API.httpStrategies.Express(Controller, Docs, {
        host: host + ":" + port
    });
    const FrontWith406Delegation = new API.httpStrategies.Express(Controller, Docs, {
        host: host + ":" + port,
        handleContentNegotiation: false
    });
    const FrontWithCustomFilterSupport = new API.httpStrategies.Express(ControllerWithCustomFilterParsing, Docs);
    const apiReqHandler = Front.apiRequest.bind(Front);
    app.get('/:type(people)/non-binary', Front.customAPIRequest({
        queryTransform: (req, query) => query.andWhere(parse_query_params_1.FieldExpression("nin", [parse_query_params_1.Identifier("gender"), ["male", "female"]]))
    }));
    app.get('/request-that-errors/:type(people)/:id(42)', Front.customAPIRequest({
        queryTransform: (query) => query.resultsIn(undefined, (error) => ({
            document: new Document_1.default({
                errors: [
                    new APIError_1.default({ status: 499, title: "custom error as string" })
                ]
            })
        }))
    }));
    app.get("/request-specific-operators-test", Front.customAPIRequest({
        supportedOperators: Object.assign({}, adapter.constructor.supportedOperators, { customOp: {
                arity: 2,
                legalIn: ["sort"]
            } }),
        resultFactory(opts) {
            const sorts = opts.request.queryParams.sort;
            const customOpSorts = sorts && sorts.filter(it => {
                return 'expression' in it && it.expression.operator === 'customOp';
            });
            return {
                status: (customOpSorts && customOpSorts.length > 0) ? 200 : 500
            };
        }
    }));
    app.get('/:type(people)/custom-filter-test/', FrontWithCustomFilterSupport.apiRequest);
    app.get('/:type(people)/with-names', Front.customAPIRequest({
        queryTransform: (query) => {
            const origReturning = query.returning;
            return query.resultsIn((...args) => __awaiter(this, void 0, void 0, function* () {
                const origResult = yield origReturning(...args);
                const origDocument = origResult.document;
                const names = origDocument.primary.map(it => it.attrs.name).values;
                origDocument.meta = Object.assign({}, origDocument.meta, { names });
                return origResult;
            }), error => ({
                document: new Document_1.default({})
            }));
        }
    }));
    app.get('/:type(schools)/all', Front.customAPIRequest({
        queryTransform: (query) => {
            return query.withLimit(undefined).withoutMaxLimit();
        }
    }));
    app.get('/:type(schools)/custom-illegal-max', Front.customAPIRequest({
        queryTransform: (query) => {
            return query.withLimit(200);
        }
    }));
    app.get('/:type(organizations)/no-id/406-delegation-test', FrontWith406Delegation.apiRequest, (req, res, next) => {
        res.header("Content-Type", "text/plain");
        res.send("Hello from express");
    });
    app.get('/hardcoded-result', R.partial(Front.sendResult, [{
            status: 201,
            document: new Document_1.default({ meta: { "hardcoded result": true } })
        }]));
    app.post('/sign-in', Front.customAPIRequest({ queryFactory: makeSignInQuery }));
    app.post('/sign-in/with-before-render', Front.customAPIRequest({
        queryFactory: (opts) => {
            const signInQuery = makeSignInQuery(opts);
            return signInQuery.resultsIn(R.pipe(signInQuery.returning, (origResultPromise) => __awaiter(this, void 0, void 0, function* () {
                const origResult = yield origResultPromise;
                if (origResult.document) {
                    origResult.document =
                        yield opts.transformDocument(origResult.document, 'beforeRender');
                }
                return origResult;
            })));
        }
    }));
    app.get('/with-error', Front.customAPIRequest({
        queryFactory: ({ request }) => {
            if (request.queryParams.customError) {
                throw new APIError_1.default({
                    status: 400,
                    typeUri: "http://example.com",
                    title: "Custom"
                });
            }
            throw new Error("test");
        }
    }));
    app.post("/parsed/json/:type(organizations)", bodyParser.json({ type: '*/*' }), Front.apiRequest);
    app.post("/parsed/raw/:type(organizations)", bodyParser.raw({ type: '*/*' }), Front.apiRequest);
    app.post("/parsed/text/:type(organizations)", bodyParser.text({ type: '*/*' }), Front.apiRequest);
    const subApp = express();
    app.use('/dynamic', subApp);
    app.get("/", Front.docsRequest);
    app.route("/:type(people|organizations|schools)").all(Front.apiRequest);
    app.route("/:type(people|organizations|schools)/:id")
        .get(apiReqHandler).patch(apiReqHandler).delete(apiReqHandler);
    app.route("/:type(organizations|schools)/:id/:related")
        .get(apiReqHandler);
    app.route("/:type(people|organizations|schools)/:id/relationships/:relationship")
        .get(apiReqHandler).post(apiReqHandler).patch(apiReqHandler).delete(apiReqHandler);
    app.use('/subapp', express().get('/:type(people)', Front.apiRequest));
    app.use(function (req, res, next) {
        Front.sendError({ message: "Not Found", status: 404 }, req, res, next);
    });
    return { app, Front, subApp, adapter };
});
function makeSignInQuery(opts) {
    const { serverReq } = opts;
    let authHeader = serverReq.headers.authorization;
    if (!authHeader) {
        throw new APIError_1.default({ status: 400, title: "Missing user info." });
    }
    authHeader = Array.isArray(authHeader) ? authHeader[0] : authHeader;
    const [user, pass] = Buffer.from(authHeader.substr(6), 'base64').toString().split(':');
    return new FindQuery_1.default({
        type: "people",
        isSingular: true,
        filters: [parse_query_params_1.FieldExpression("eq", [parse_query_params_1.Identifier("name"), user])],
        returning({ primary: userData }) {
            if (pass !== 'password') {
                throw new APIError_1.default({ status: 401 });
            }
            return {
                document: new Document_1.default({ primary: ResourceSet_1.default.of({ data: userData }) })
            };
        }
    });
}
