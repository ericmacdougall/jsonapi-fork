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
const _ = require("lodash");
const path = require("path");
const pug = require("pug");
const Negotiator = require("negotiator");
const dasherize = require("dasherize");
const ResourceSet_1 = require("../types/ResourceSet");
const Document_1 = require("../types/Document");
const Resource_1 = require("../types/Resource");
const naming_conventions_1 = require("../util/naming-conventions");
const http_1 = require("http");
exports.IncomingMessage = http_1.IncomingMessage;
exports.ServerResponse = http_1.ServerResponse;
class DocumentationController {
    constructor(registry, apiInfo, templatePath, dasherizeJSONKeys = true, toModelName = naming_conventions_1.getModelName) {
        this.registry = registry;
        this.toModelName = toModelName;
        this.handle = (request, serverReq, serverRes) => __awaiter(this, void 0, void 0, function* () {
            const response = { headers: {}, body: undefined, status: 200 };
            const negotiator = new Negotiator({ headers: { accept: request.accepts } });
            const contentType = negotiator.mediaType(["text/html", "application/vnd.api+json"]);
            response.headers["content-type"] = contentType;
            response.headers.vary = "Accept";
            const templateData = _.cloneDeepWith(this.templateData, cloneCustomizer);
            templateData.resourcesMap = _.mapValues(templateData.resourcesMap, (typeInfo, typeName) => {
                return this.transformTypeInfo(typeName, typeInfo, request, response, serverReq, serverRes);
            });
            if (contentType && contentType.toLowerCase() === "text/html") {
                response.body = pug.renderFile(this.template, templateData);
            }
            else {
                const descriptionResources = [];
                Object.keys(templateData.resourcesMap).forEach(type => {
                    descriptionResources.push(new Resource_1.default("jsonapi-descriptions", type, templateData.resourcesMap[type]));
                });
                response.body = new Document_1.default({
                    primary: ResourceSet_1.default.of({ data: descriptionResources })
                }).toString();
            }
            return response;
        });
        const defaultTempPath = "../../templates/documentation.pug";
        this.template = templatePath || path.resolve(__dirname, defaultTempPath);
        this.dasherizeJSONKeys = dasherizeJSONKeys;
        const data = Object.assign({}, apiInfo, { resourcesMap: {} });
        this.registry.typeNames().forEach((typeName) => {
            data.resourcesMap[typeName] = this.getTypeInfo(typeName);
        });
        this.templateData = data;
    }
    getTypeInfo(type) {
        const typeDesc = this.registry.type(type);
        if (!typeDesc) {
            throw new Error("Trying to get type info for unregistered type.");
        }
        const adapter = typeDesc.dbAdapter;
        const model = adapter.getModel(type);
        const modelName = this.toModelName(type);
        const info = typeDesc.info;
        const schema = adapter.constructor.getStandardizedSchema(model);
        const ucFirst = (v) => v.charAt(0).toUpperCase() + v.slice(1);
        schema.forEach((field) => {
            const pathInfo = (info && info.fields && info.fields[field.name]) || {};
            const overrideableKeys = ["friendlyName", "kind", "description"];
            for (const key in pathInfo) {
                if (overrideableKeys.indexOf(key) > -1 || !(key in field)) {
                    field[key] = pathInfo[key];
                }
                else if (typeof field[key] === "object" && !Array.isArray(field[key])) {
                    Object.assign(field[key], pathInfo[key]);
                }
            }
        });
        const result = {
            name: {
                "model": modelName,
                "singular": adapter.constructor.toFriendlyName(modelName),
                "plural": type.split("-").map(ucFirst).join(" ")
            },
            fields: schema,
            parentType: this.registry.parentTypeName(type),
            childTypes: this.registry.childTypeNames(type)
        };
        const defaultIncludes = this.registry.defaultIncludes(type);
        if (defaultIncludes)
            result.defaultIncludes = defaultIncludes;
        if (info && info.example)
            result.example = info.example;
        if (info && info.description)
            result.description = info.description;
        return result;
    }
    transformTypeInfo(typeName, info, request, response, frameworkReq, frameworkRes) {
        if (this.dasherizeJSONKeys && response.headers['content-type'] === "application/vnd.api+json") {
            return dasherize(info);
        }
        return info;
    }
}
exports.default = DocumentationController;
function cloneCustomizer(value) {
    if (isCustomObject(value)) {
        const state = _.cloneDeep(value);
        Object.setPrototypeOf(state, Object.getPrototypeOf(value));
        Object.defineProperty(state, "constructor", {
            writable: true,
            enumerable: false,
            value: value.constructor
        });
        for (const key in state) {
            if (isCustomObject(value[key])) {
                state[key] = _.cloneDeepWith(value[key], cloneCustomizer);
            }
        }
        return state;
    }
    return undefined;
}
function isCustomObject(v) {
    return v && typeof v === "object" && v.constructor !== Object && !Array.isArray(v);
}
