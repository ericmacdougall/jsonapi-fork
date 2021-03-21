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
const td = require("testdouble");
const run_query_1 = require("../../../src/steps/run-query");
const ResourceTypeRegistry_1 = require("../../../src/ResourceTypeRegistry");
const MongooseAdapter_1 = require("../../../src/db-adapters/Mongoose/MongooseAdapter");
const src_1 = require("../../../src");
describe("runQuery", () => {
    const adapter = td.object(new MongooseAdapter_1.default({}));
    const registry = new ResourceTypeRegistry_1.default({
        schools: {
            pagination: {
                defaultPageSize: 2,
                maxPageSize: 4
            }
        }
    }, {
        dbAdapter: adapter
    });
    it("should reject queries of unknown type", () => {
        const findQuery = new src_1.FindQuery({ type: "unknown" });
        chai_1.expect(() => run_query_1.default(registry, findQuery)).to.throw(/Unknown resource type/);
        td.verify(adapter.find(td.matchers.anything()), { times: 0 });
    });
    it('should dispatch queries to the correct adapter method', () => __awaiter(this, void 0, void 0, function* () {
        const queries = {
            find: new src_1.FindQuery({ type: 'schools' }),
            create: new src_1.CreateQuery({ type: 'schools' }),
            update: new src_1.UpdateQuery({ type: 'schools' }),
            delete: new src_1.DeleteQuery({ type: 'schools' }),
            addToRelationship: new src_1.AddToRelationshipQuery({ type: 'schools', id: '1', relationshipName: 'x' }),
            removeFromRelationship: new src_1.RemoveFromRelationshipQuery({ type: 'schools', id: '1', relationshipName: 'x' })
        };
        Object.keys(queries).forEach((type) => {
            td.when(adapter[type](td.matchers.anything())).thenResolve(type);
        });
        for (const type of Object.keys(queries)) {
            const query = queries[type];
            const result = yield run_query_1.default(registry, query);
            chai_1.expect(result).to.deep.equal(type);
        }
    }));
    it('should enforce the page size limit (by default)', () => __awaiter(this, void 0, void 0, function* () {
        const findQuery = new src_1.FindQuery({ type: 'schools', limit: 10 });
        try {
            yield run_query_1.default(registry, findQuery);
        }
        catch (err) {
            chai_1.expect(err.detail).to.equal('Must use a smaller limit per page.');
            return;
        }
        throw new Error('expected error');
    }));
    it('should not enforce page size limits if ignoreMaxLimit is set', () => __awaiter(this, void 0, void 0, function* () {
        const findQuery = new src_1.FindQuery({ type: 'schools', limit: 10 }).withoutMaxLimit();
        yield run_query_1.default(registry, findQuery);
        td.verify(adapter.find(findQuery));
    }));
    it('should allow non-default limits that are under the max', () => __awaiter(this, void 0, void 0, function* () {
        const findQuery = new src_1.FindQuery({ type: 'schools', limit: 3 });
        yield run_query_1.default(registry, findQuery);
        td.verify(adapter.find(findQuery));
    }));
    it('should apply max, not default, limit if no limit is provided', () => __awaiter(this, void 0, void 0, function* () {
        const findQuery = new src_1.FindQuery({ type: 'schools' });
        td.when(adapter.find(findQuery)).thenDo(query => query.limit);
        const limit = yield run_query_1.default(registry, findQuery);
        chai_1.expect(limit).to.equal(4);
    }));
});
