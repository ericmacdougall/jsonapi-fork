"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const agent_1 = require("../../app/agent");
const API_1 = require("../../../src/controllers/API");
const index_1 = require("../../app/src/index");
describe("Result factories", () => {
    let Agent;
    before(() => {
        return agent_1.default.then(A => {
            Agent = A;
        });
    });
    it("should be called with user's query factory and library's, & parsed request", () => {
        const queryFactory = function () { };
        return index_1.default.then(({ subApp, Front }) => {
            subApp.get("/result-factory", Front.customAPIRequest({
                queryFactory,
                resultFactory: ({ makeQuery, request }, customQueryFactory) => {
                    try {
                        chai_1.expect(request.queryParams.test).to.deep.equal({ 'here': "test" });
                        chai_1.expect(makeQuery).to.equal(API_1.default.prototype.makeQuery);
                        chai_1.expect(customQueryFactory).to.equal(queryFactory);
                        return { status: 204 };
                    }
                    catch (e) {
                        return { status: 500, headers: { 'X-Error': String(e) } };
                    }
                }
            }));
        }).then(() => {
            return Agent.request("GET", "/dynamic/result-factory?test[here]=test")
                .then(response => {
                chai_1.expect(response.status).to.equal(204);
            });
        });
    });
    it("should send the returned result", () => {
        const respMeta = { message: "Use different endpoint." };
        return index_1.default.then(({ subApp, Front }) => {
            subApp.get("/result-factory-2", Front.customAPIRequest({
                resultFactory: ({ makeDocument }) => {
                    return {
                        document: makeDocument({ meta: respMeta }),
                        headers: { 'Location': '/test' },
                        status: 303
                    };
                }
            }));
        }).then(() => {
            return Agent.request("GET", "/dynamic/result-factory-2").redirects(0)
                .then(response => {
                throw new Error("Shouldn't run. 303 rejects for some reason in superagent.");
            }, (e) => {
                chai_1.expect(e.response.status).to.equal(303);
                chai_1.expect(e.response.body.meta).to.deep.equal(respMeta);
                chai_1.expect(e.response.headers.location).to.equal('/test');
            });
        });
    });
});
