"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const agent_1 = require("../../app/agent");
describe("Request finalization", () => {
    let Agent;
    before(() => {
        return agent_1.default.then(A => {
            Agent = A;
        });
    });
    it("should support request-specific custom operators", () => {
        return Promise.all([
            Agent.request("GET", "/request-specific-operators-test")
                .query("sort=(field,:customOp,true)")
                .catch(e => { console.log(e); throw e; }),
            Agent.request("GET", "/request-specific-operators-test")
                .query("sort=(field,:customOp,true)&filter=(salary,:gte,42)")
                .catch(e => { console.log(e); throw e; }),
            Agent.request("GET", "/request-specific-operators-test")
                .query("sort=(:customOp,field)")
                .ok(it => {
                return it.status === 400 &&
                    it.body.errors[0].detail.match(/\"customOp\".+ 2 arguments; got 1/);
            })
                .catch(e => { console.log(e); throw e; }),
            Agent.request("GET", "/request-specific-operators-test")
                .query("filter=(:customOp,field,true)")
                .ok(it => {
                return it.status === 400 &&
                    it.body.errors[0].detail.match(/\"customOp\" .+ recognized operator/);
            })
                .catch(e => { console.log(e); throw e; })
        ]);
    });
});
