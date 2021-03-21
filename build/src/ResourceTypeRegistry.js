"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Immutable = require("immutable");
const mapObject = require("lodash/mapValues");
const misc_1 = require("./util/misc");
const Maybe_1 = require("./types/Generic/Maybe");
const UrlTemplate_1 = require("./types/UrlTemplate");
const Resource_1 = require("./types/Resource");
exports.Resource = Resource_1.default;
const ResourceIdentifier_1 = require("./types/ResourceIdentifier");
exports.ResourceIdentifier = ResourceIdentifier_1.default;
const http_1 = require("http");
exports.IncomingMessage = http_1.IncomingMessage;
exports.ServerResponse = http_1.ServerResponse;
const globalResourceDefaults = Immutable.fromJS({
    transformLinkage: false,
    pagination: {}
});
class ResourceTypeRegistry {
    constructor(typeDescs = Object.create(null), descDefaults = {}, errorsConfig) {
        this._errorsConfig = errorsConfig && Object.assign({}, errorsConfig, { urlTemplates: this.processUrlTemplates(errorsConfig.urlTemplates) });
        const nodes = [], roots = [], edges = {};
        Object.keys(typeDescs).forEach(typeName => {
            const nodeParentType = typeDescs[typeName].parentType;
            nodes.push(typeName);
            if (nodeParentType) {
                edges[nodeParentType] = edges[nodeParentType] || {};
                edges[nodeParentType][typeName] = true;
            }
            else {
                roots.push(typeName);
            }
        });
        const typeRegistrationOrder = misc_1.pseudoTopSort(nodes, edges, roots);
        this._types = {};
        this._typesMetadata = { nodes, edges, roots };
        const instanceDefaults = globalResourceDefaults.mergeDeep(this.processTypeDesc(descDefaults));
        typeRegistrationOrder.forEach((typeName) => {
            const thisDescProcessed = this.processTypeDesc(typeDescs[typeName]);
            const thisDescImmutable = Immutable.fromJS(thisDescProcessed);
            const { parentType } = typeDescs[typeName];
            const thisDescBase = parentType
                ? this._types[parentType]
                : instanceDefaults;
            this._types[typeName] = thisDescBase.mergeDeep(thisDescImmutable);
            if (!this._types[typeName].get("dbAdapter")) {
                throw new Error("Every resource type must be registered with a db adapter!");
            }
        });
    }
    errorsConfig() {
        return this._errorsConfig;
    }
    type(typeName) {
        return Maybe_1.default(this._types[typeName])
            .map(it => it.toJS())
            .getOrDefault(undefined);
    }
    hasType(typeName) {
        return typeName in this._types;
    }
    urlTemplates(type) {
        if (type) {
            return Maybe_1.default(this._types[type])
                .map(it => it.get("urlTemplates"))
                .map(it => it.toJS())
                .getOrDefault(undefined);
        }
        return Object.keys(this._types).reduce((prev, typeName) => {
            prev[typeName] = this.urlTemplates(typeName);
            return prev;
        }, {});
    }
    dbAdapter(typeName) {
        return this.doGet("dbAdapter", typeName);
    }
    uniqueAdapters() {
        const adaptersToTypeNames = new Map();
        Object.keys(this._types).map(typeName => {
            const adapter = this._types[typeName].get("dbAdapter");
            adaptersToTypeNames.set(adapter, (adaptersToTypeNames.get(adapter) || []).concat(typeName));
        });
        return adaptersToTypeNames;
    }
    beforeSave(typeName) {
        return this.doGet("beforeSave", typeName);
    }
    beforeRender(typeName) {
        return this.doGet("beforeRender", typeName);
    }
    defaultIncludes(typeName) {
        return this.doGet("defaultIncludes", typeName);
    }
    info(typeName) {
        return this.doGet("info", typeName);
    }
    transformLinkage(typeName) {
        return this.doGet("transformLinkage", typeName);
    }
    parentTypeName(typeName) {
        return this.doGet("parentType", typeName);
    }
    pagination(typeName) {
        return this.doGet("pagination", typeName);
    }
    typeNames() {
        return Object.keys(this._types);
    }
    childTypeNames(typeName) {
        return Object.keys(this._typesMetadata.edges[typeName] || {});
    }
    rootTypeNames() {
        return Object.keys(this._types)
            .filter(typeName => this.parentTypeName(typeName) === undefined);
    }
    rootTypeNameOf(typeName) {
        const pathToType = this.typePathTo(typeName);
        return pathToType[pathToType.length - 1];
    }
    typePathTo(typeName) {
        const path = [typeName];
        let parentType;
        while ((parentType = this.parentTypeName(path[path.length - 1]))) {
            path.push(parentType);
        }
        return path;
    }
    asTypePath(typesList, throughType) {
        const pathToThroughType = throughType ? this.typePathTo(throughType) : [];
        const remainingTypes = typesList.slice();
        if (!typesList.length) {
            return false;
        }
        for (const type of pathToThroughType) {
            const indexOfType = remainingTypes.indexOf(type);
            if (indexOfType === -1) {
                return false;
            }
            remainingTypes.splice(indexOfType, 1);
        }
        const finalPath = [...pathToThroughType];
        let currentTypeChildren = throughType
            ? this.childTypeNames(throughType)
            : this.rootTypeNames();
        while (remainingTypes.length && currentTypeChildren.length) {
            let nextTypeFound = false;
            for (const child of currentTypeChildren) {
                const indexOfChild = remainingTypes.indexOf(child);
                if (indexOfChild > -1) {
                    nextTypeFound = true;
                    remainingTypes.splice(indexOfChild, 1);
                    currentTypeChildren = this.childTypeNames(child);
                    finalPath.unshift(child);
                    break;
                }
            }
            if (!nextTypeFound) {
                return false;
            }
        }
        return remainingTypes.length ? false : finalPath;
    }
    doGet(attrName, typeName) {
        return Maybe_1.default(this._types[typeName])
            .map(it => it.get(attrName))
            .map(it => it instanceof Immutable.Map || it instanceof Immutable.List
            ? it.toJS()
            : it)
            .getOrDefault(undefined);
    }
    processTypeDesc(it) {
        if (it.urlTemplates) {
            return Object.assign({}, it, { urlTemplates: this.processUrlTemplates(it.urlTemplates) });
        }
        return it;
    }
    processUrlTemplates(it) {
        return mapObject(it, template => {
            return typeof template === 'string' ? UrlTemplate_1.fromRFC6570(template) : template;
        });
    }
}
exports.default = ResourceTypeRegistry;
