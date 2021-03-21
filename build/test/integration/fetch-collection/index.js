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
const chai_1 = require("chai");
const agent_1 = require("../../app/agent");
const creation_1 = require("../fixtures/creation");
describe("Fetching Collection", () => {
    let Agent;
    before(() => {
        return agent_1.default.then(A => { Agent = A; });
    });
    describe("Fetching all organizations", () => {
        let res;
        before(() => {
            return Agent.request("GET", "/organizations")
                .accept("application/vnd.api+json")
                .then(response => {
                res = response;
            });
        });
        describe("Status Code", () => {
            it("should be 200", () => {
                chai_1.expect(res.status).to.equal(200);
            });
        });
        describe("Document Structure", () => {
            it("should have an object/document at the top level", () => {
                chai_1.expect(res.body).to.be.an("object");
            });
            describe("Top-Level Links", () => {
                it("should contain a self link to the collection", () => {
                    chai_1.expect(res.body.links).to.be.an('object');
                    chai_1.expect(res.body.links.self).to.equal(`${Agent.baseUrl}/organizations`);
                });
            });
            describe("Resource Objects/Primary Data", () => {
                it("should be an array under data", () => {
                    chai_1.expect(res.body.data).to.be.an("array");
                });
                it("should not contain extra members", () => {
                    const isAllowedKey = (key) => ["type", "id", "attributes", "relationships", "links", "meta"].indexOf(key) !== -1;
                    if (!Object.keys(res.body.data[0]).every(isAllowedKey)) {
                        throw new Error("Invalid Key!");
                    }
                });
                it("should contain links under each relationship", () => {
                    res.body.data.map(it => it.relationships.liaisons).forEach((it) => {
                        chai_1.expect(it.links).to.be.an("object");
                        chai_1.expect(it.self).to.be.undefined;
                        chai_1.expect(it.related).to.be.undefined;
                        chai_1.expect(it.links.self).to.be.a("string");
                        chai_1.expect(it.data).to.not.be.undefined;
                    });
                });
                it("should contain both organizations and schools", () => {
                    chai_1.expect(res.body.data.some(it => it.meta && it.meta.types && it.meta.types.includes("schools"))).to.be.true;
                    chai_1.expect(res.body.data.every(it => it.type === "organizations")).to.be.true;
                });
                it("should have transformed all resources, including sub types", () => {
                    chai_1.expect(res.body.data.every(resource => {
                        return resource.attributes.addedBeforeRender;
                    })).to.be.true;
                });
                it("should not contain resources removed in beforeRender", () => {
                    chai_1.expect(res.body.data.every(resource => {
                        return resource.id !== "59af14d3bbd18cd55ea08ea2";
                    })).to.be.true;
                });
            });
        });
    });
    describe("Fetching Ascending Gendered Collection", () => {
        let res;
        before(() => {
            return Agent.request("GET", "/people?sort=gender")
                .accept("application/vnd.api+json")
                .then(response => {
                res = response;
            });
        });
        it("should have Jane above John", () => {
            const johnJaneList = res.body.data
                .map(it => it.attributes.name)
                .filter(it => {
                return ["John Smith", "Jane Doe"].indexOf(it) > -1;
            });
            chai_1.expect(johnJaneList[0]).to.equal("Jane Doe");
            chai_1.expect(johnJaneList[1]).to.equal("John Smith");
        });
    });
    describe("Fetching Descended Sorted Name Collection", () => {
        let res;
        before(() => {
            return Agent.request("GET", "/people?sort=-name")
                .accept("application/vnd.api+json")
                .then(response => {
                res = response;
            });
        });
        it("Should have John above Jane", () => {
            const johnJaneList = res.body.data
                .map(it => it.attributes.name)
                .filter(it => {
                return ["John", "Jane"].indexOf(it.substring(0, 4)) > -1;
            });
            chai_1.expect(johnJaneList).to.deep.equal(["John Smith", "Jane Doe"]);
        });
    });
    describe("Fetching Multi-Sorted Collection", () => {
        let res;
        before(() => {
            return Agent.request("GET", "/people?sort=-gender,name")
                .accept("application/vnd.api+json")
                .then(response => {
                res = response;
            });
        });
        it("Should have Doug before John; both before Jane", () => {
            const johnJaneDougList = res.body.data.map((it) => it.attributes.name).filter((it) => {
                return ["John", "Jane", "Doug"].indexOf(it.substring(0, 4)) > -1;
            });
            chai_1.expect(johnJaneDougList).to.deep.equal([
                "Doug Wilson", "John Smith", "Jane Doe"
            ]);
        });
    });
    describe("Fetching with Offset and/or Limit (reverse name sorted for determinism)", () => {
        let res;
        before(() => {
            return Agent.request("GET", "/people?sort=-name&page[offset]=1&page[limit]=3")
                .accept("application/vnd.api+json")
                .then(response => {
                res = response;
            });
        });
        it("should only return exactly the 3 people we expect", () => {
            chai_1.expect(res.body.data.map(it => it.attributes.name)).to.deep.equal([
                "John Smith",
                "Jane Doe",
                "Doug Wilson"
            ]);
        });
        it("Should include the total record count", () => {
            chai_1.expect(res.body.meta).to.deep.equal({
                total: 5
            });
        });
        it("Should error iff limit is above the max allowed", () => {
            return Promise.all([
                Agent.request("GET", "/organizations?page[limit]=6")
                    .then(() => {
                    throw new Error("shouldn't run");
                }, e => {
                    chai_1.expect(e.status).to.eq(400);
                    chai_1.expect(e.response.body.errors[0].source.parameter).to.eq("page[limit]");
                }),
                Agent.request("GET", "/schools?page[limit]=6")
                    .then(() => {
                    throw new Error("shouldn't run");
                }, e => {
                    chai_1.expect(e.status).to.eq(400);
                    chai_1.expect(e.response.body.errors[0].source.parameter).to.eq("page[limit]");
                }),
                Agent.request("GET", "/schools?page[limit]=5")
            ]);
        });
        it("should apply the resource type's default page size", () => __awaiter(this, void 0, void 0, function* () {
            yield Agent.request("POST", "/schools")
                .type("application/vnd.api+json")
                .send({
                data: [
                    creation_1.VALID_SCHOOL_RESOURCE_NO_ID_EMPTY_PRINCIPAL_NO_LIAISONS,
                    creation_1.VALID_SCHOOL_RESOURCE_NO_ID_EMPTY_PRINCIPAL_NO_LIAISONS,
                    creation_1.VALID_SCHOOL_RESOURCE_NO_ID_EMPTY_PRINCIPAL_NO_LIAISONS
                ]
            });
            return Agent.request("GET", "/schools").then(resp => {
                chai_1.expect(resp.body.data).to.have.length(2);
            });
        }));
    });
    describe("Filtering", () => {
        it("should support simple equality filters", () => {
            return Agent.request("GET", "/people")
                .query("filter=(name,:eq,`Doug Wilson`)")
                .accept("application/vnd.api+json")
                .then((res) => {
                chai_1.expect(res.body.data).to.have.length(1);
                chai_1.expect(res.body.data[0].attributes.name).to.equal("Doug Wilson");
            });
        });
        it("should support user's custom filters", (done) => {
            Agent.request("GET", '/people/custom-filter-test?customNameFilter=Doug Wilson')
                .accept("application/vnd.api+json")
                .then((res) => {
                chai_1.expect(res.body.data).to.have.length(1);
                chai_1.expect(res.body.data[0].attributes.name).to.equal("Doug Wilson");
                done();
            }, done).catch(done);
        });
        it("should still return resource array even with a single id filter", () => {
            return Agent.request("GET", "/organizations")
                .query("filter=(id,`54419d550a5069a2129ef254`)")
                .accept("application/vnd.api+json")
                .then((res) => {
                chai_1.expect(res.body.data).to.be.an("array");
                chai_1.expect(res.body.data).to.have.length(1);
                chai_1.expect(res.body.data[0].id).to.equal("54419d550a5069a2129ef254");
            });
        });
        it("should give a nice error on invalid filter syntax/values", () => {
            const invalidFilterStringsToErrorRegexs = {
                "filter=(id,:n,`54419d550a5069a2129ef254`)": /"n" .+ recognized operator/i,
                "filter=(id,:neq,`54419d550a5069a2129ef254`,x)": /Expected field expression/i,
                "filter=(4,4)": /field reference/i,
                "filter=true": /Expected field expression/i,
                "filter=(:and,true)": /expects its arguments to be field expressions/i,
                "filter=(:and,((true:false)))": /Expected field expression but \"\(\" found/,
                "filter=(()": /Expected field expression but \"\(\" found/,
                "filter=(:and,(:eq,test))": /exactly 2 arguments/
            };
            return Promise.all(Object.keys(invalidFilterStringsToErrorRegexs).map(filterString => Agent.request("GET", "/organizations")
                .query(filterString)
                .accept("application/vnd.api+json")
                .then((res) => {
                throw new Error("shouldn't run");
            }, (e) => {
                const jsonErr = e.response.body.errors[0];
                chai_1.expect(e.response.status).to.equal(400);
                chai_1.expect(jsonErr.code).to.equal("https://jsonapi.js.org/errors/invalid-query-param-value");
                chai_1.expect(jsonErr.source).to.deep.equal({ parameter: "filter" });
                chai_1.expect(jsonErr.detail).to.match(invalidFilterStringsToErrorRegexs[filterString]);
            })));
        });
    });
    describe("Fetching with includes", () => {
        it("should not contain duplicate resources", () => {
            return Agent.request("GET", "/organizations")
                .query("include=liaisons")
                .accept("application/vnd.api+json")
                .then(res => {
                const janeDoes = res.body.included.filter(it => it.attributes.name === 'Jane Doe');
                chai_1.expect(janeDoes).to.have.length(1);
            });
        });
    });
});
