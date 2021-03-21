"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mapObject = require("lodash/mapValues");
const Data_1 = require("./Generic/Data");
class MaybeDataWithLinks {
    constructor({ data, links = {} }) {
        this.links = links;
        this._data =
            typeof data === "undefined" || data instanceof Data_1.default
                ? data
                : Data_1.default.fromJSON(data);
    }
    get values() {
        return this._data ? [...this._data.values] : [];
    }
    get isSingular() {
        return this._data ? this._data.isSingular : undefined;
    }
    map(fn) {
        return this.delegateTransformToData("map", arguments);
    }
    flatMap(fn) {
        return this.delegateTransformToData("flatMap", arguments);
    }
    filter(fn) {
        return this.delegateTransformToData("filter", arguments);
    }
    mapAsync(fn) {
        return this.delegateTransformToDataAsync("mapAsync", arguments);
    }
    flatMapAsync(fn) {
        return this.delegateTransformToDataAsync("flatMapAsync", arguments);
    }
    unwrapWith(fn, linkTemplateData) {
        return {
            links: mapObject(this.links || {}, (template) => template && template(linkTemplateData)),
            data: this.unwrapDataWith(fn)
        };
    }
    unwrapDataWith(fn) {
        return this._data && this._data.map(fn).unwrap();
    }
    every(fn) {
        return this._data ? this._data.every(fn) : true;
    }
    some(fn) {
        return this._data ? this._data.some(fn) : false;
    }
    reduce(fn, initialValue) {
        if (!this._data) {
            return initialValue;
        }
        return arguments.length > 1
            ? this._data.reduce(fn, initialValue)
            : this._data.reduce(fn);
    }
    forEach(fn) {
        this._data && this._data.forEach(fn);
        return this;
    }
    clone() {
        const Ctor = this.constructor;
        return new Ctor({
            data: this._data,
            links: this.links
        });
    }
    delegateTransformToData(methodName, args) {
        return this._data
            ? this.withNewData(this._data[methodName](...args))
            : this;
    }
    delegateTransformToDataAsync(methodName, args) {
        return this._data
            ? this._data[methodName](...args)
                .then(newData => this.withNewData(newData))
            : Promise.resolve(this);
    }
    withNewData(newData) {
        const res = this.clone();
        res._data = newData;
        return res;
    }
}
exports.default = MaybeDataWithLinks;
