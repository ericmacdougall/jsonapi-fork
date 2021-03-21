"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const R = require("ramda");
const parse_query_params_1 = require("../../steps/pre-query/parse-query-params");
const Query_1 = require("./Query");
class WithCriteriaQuery extends Query_1.default {
    constructor(opts) {
        super(opts);
        if (opts.id && opts.ids) {
            throw new Error("Can't provide both the id and the ids options. Pick one.");
        }
        this.query = Object.assign({}, this.query, { criteria: Object.assign({}, this.query.criteria, { where: parse_query_params_1.FieldExpression("and", opts.filters || []), isSingular: opts.isSingular || opts.id !== undefined, limit: opts.limit, offset: opts.offset }) });
        if (opts.ids || opts.id) {
            this.query = this.matchingIdOrIds(opts.ids || opts.id).query;
        }
    }
    andWhere(constraint) {
        if (this.query.criteria.where.operator !== 'and') {
            throw new Error("Where criteria is always an and predicate");
        }
        const res = this.clone();
        res.query = Object.assign({}, res.query, { criteria: Object.assign({}, res.query.criteria, { where: Object.assign({}, res.query.criteria.where, { args: [
                        ...res.query.criteria.where.args,
                        constraint
                    ] }) }) });
        return res;
    }
    matchingIdOrIds(idOrIds) {
        let res;
        if (Array.isArray(idOrIds)) {
            res = this.andWhere(parse_query_params_1.FieldExpression("in", [parse_query_params_1.Identifier("id"), idOrIds.map(String)]));
        }
        else if (typeof idOrIds === "string" && idOrIds) {
            res = this.andWhere(parse_query_params_1.FieldExpression("eq", [parse_query_params_1.Identifier("id"), String(idOrIds)]));
            res.query = Object.assign({}, res.query, { criteria: Object.assign({}, res.query.criteria, { isSingular: true }) });
        }
        else {
            res = this;
        }
        return res;
    }
    getFilters() {
        return R.clone(this.query.criteria.where);
    }
    withoutFilters() {
        const res = this.clone();
        res.query = Object.assign({}, res.query, { criteria: Object.assign({}, res.query.criteria, { where: parse_query_params_1.FieldExpression("and", []) }) });
        return res;
    }
    isSimpleIdQuery() {
        const filters = this.query.criteria.where.args;
        return (filters.length === 1 &&
            parse_query_params_1.isId(filters[0].args[0]) && filters[0].args[0].value === "id" &&
            (filters[0].operator === "eq" || filters[0].operator === "in"));
    }
    removeFilter(filter) {
        const res = this.clone();
        res.query.criteria.where.args =
            res.query.criteria.where.args.filter(it => !R.equals(it, filter));
        return res;
    }
    get offset() {
        return this.query.criteria.offset;
    }
    get limit() {
        return this.query.criteria.limit;
    }
    get isSingular() {
        return this.query.criteria.isSingular;
    }
    withLimit(limit) {
        const res = this.clone();
        res.query.criteria.limit = limit;
        return res;
    }
}
exports.default = WithCriteriaQuery;
