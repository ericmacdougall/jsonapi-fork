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
const R = require("ramda");
const mongoose = require("mongoose");
mongoose.set("debug", (collectionName, method, query, doc) => {
    console.log(`${collectionName}.${method}`, JSON.stringify(query), doc);
});
const pluralize = require("pluralize");
const parse_query_params_1 = require("../../steps/pre-query/parse-query-params");
const misc_1 = require("../../util/misc");
const objectValueEntries_1 = require("../../util/objectValueEntries");
const schema_1 = require("./utils/schema");
const subtyping_1 = require("./utils/subtyping");
const doc_to_resource_1 = require("./utils/doc-to-resource");
const naming_conventions_1 = require("../../util/naming-conventions");
const util = require("./lib");
const Errors = require("../../util/errors");
const Data_1 = require("../../types/Generic/Data");
const ResourceIdentifier_1 = require("../../types/ResourceIdentifier");
const Relationship_1 = require("../../types/Relationship");
const Field_1 = require("../../types/Documentation/Field");
const FieldType_1 = require("../../types/Documentation/FieldType");
const RelationshipType_1 = require("../../types/Documentation/RelationshipType");
const AddToRelationshipQuery_1 = require("../../types/Query/AddToRelationshipQuery");
const RemoveFromRelationshipQuery_1 = require("../../types/Query/RemoveFromRelationshipQuery");
const isPoint = R.allPass([
    Array.isArray,
    R.pipe(R.length, R.equals(2)),
    R.all(it => Number(it) === it)
]);
class MongooseAdapter {
    constructor(models = mongoose.models, toTypeName = naming_conventions_1.getTypeName, idGenerator) {
        this.models = models;
        this.toTypeName = toTypeName;
        this.idGenerator = idGenerator;
        this.typeNamesToModelNames = {};
        this.modelNamesToTypeNames = {};
        for (const modelName of Object.keys(models)) {
            const typeName = toTypeName(modelName);
            this.typeNamesToModelNames[typeName] = modelName;
            this.modelNamesToTypeNames[modelName] = typeName;
        }
    }
    docToResource(doc, fields) {
        return doc_to_resource_1.default(this.models, this.modelNamesToTypeNames, doc, fields);
    }
    docsToResourceData(docs, isPlural, fields) {
        return this.constructor.docsToResourceData(this.models, this.modelNamesToTypeNames, docs, isPlural, fields);
    }
    getTypePath(model) {
        return subtyping_1.getTypePath(model, this.modelNamesToTypeNames);
    }
    find(query) {
        return __awaiter(this, void 0, void 0, function* ()
        {
            const { type, populates: includePaths, select: fields, sort: sorts, offset, limit, isSingular: singular } = query;
            const mode = singular ? "findOne" : "find";
            const filters = query.getFilters();
            const model = this.getModel(type);
            let includeFilters = {}
            Object.keys(filters).forEach(f => includeFilters[f] = filters[f])
            if (filters.args[type]) {
                filters.args = filters.args[type]
            }
            const mongofiedFilters = util.toMongoCriteria(filters);
            this.constructor.assertIdsValid(filters, singular);
            const isPaginating = mode !== "findOne" &&
                (typeof offset !== "undefined" || typeof limit !== "undefined");
            let primaryDocumentsPromise, includedResourcesPromise;
            const queryBuilder = mode === "findOne"
                ? model[mode](mongofiedFilters)
                : model[mode](mongofiedFilters);
            const collectionSizePromise = isPaginating
                ? model.count(mongofiedFilters).exec()
                : Promise.resolve(undefined);
            if (Array.isArray(sorts)) {
                const geoDistanceSort = sorts.find((it) => {
                    const exp = it.expression;
                    return exp && exp.operator === 'geoDistance';
                });
                if (geoDistanceSort) {
                    if (sorts.length !== 1) {
                        throw Errors.invalidQueryParamValue({
                            detail: `Cannot combine geoDistance sorts with other sorts.`,
                            source: { parameter: "sort" }
                        });
                    }
                    if (geoDistanceSort.direction !== "ASC") {
                        throw Errors.invalidQueryParamValue({
                            detail: `Cannot sort by descending geoDistance; only ascending.`,
                            source: { parameter: "sort" }
                        });
                    }
                    queryBuilder.near(geoDistanceSort.expression.args[0].value, {
                        center: {
                            type: "Point", coordinates: geoDistanceSort.expression.args[1]
                        },
                        maxDistance: 4503599627370496,
                        spherical: true
                    });
                }
                else {
                    queryBuilder.sort(sorts.map(it => {
                        if (!("field" in it)) {
                            throw new Error("Got unsupported expression sort field; shouldn't happen.");
                        }
                        return (it.direction === 'DESC' ? '-' : '') + it.field;
                    }).join(" "));
                }
            }
            if (offset) {
                queryBuilder.skip(offset);
            }
            if (limit) {
                queryBuilder.limit(limit);
            }
            if (includePaths && includePaths.length > 0) {
                const populatedPaths = [];
                const refPaths = schema_1.getReferencePaths(model);
                includePaths.map((it) => it.split(".")).forEach((pathParts) => {
                    if (!refPaths.includes(pathParts[0])) {
                        throw Errors.invalidIncludePath({
                            detail: `Resources of type "${type}" don't have a(n) "${pathParts[0]}" relationship.`
                        });
                    }
                    populatedPaths.push(...pathParts);
                    const createPATH = (i, p) => {
                        const ret = {
                            "path": p[i]
                        }
                        if(includeFilters.args[p[i]]){
                            let tmp1 = {}
                            Object.keys(includeFilters).forEach(f => tmp1[f] = includeFilters[f])
                            tmp1.args = includeFilters.args[p[i]]
                            ret["match"] = util.toMongoCriteria(tmp1)
                        }
                        if(p[i+1]) ret["populate"] = createPATH(i+1, p)
                        return ret
                    }
                    queryBuilder.populate(createPATH(0, pathParts));
                });
                let includedResources = [];
                primaryDocumentsPromise = Promise.resolve(queryBuilder.exec()).then((docOrDocs) => {
                    const multiLevelInclude = (i, p, newData) => {
                        includedResources.push(...objectValueEntries_1.values(Data_1.default.fromJSON(newData)
                            .flatMap((doc) => {
                                return Data_1.default.of(p).flatMap((path) => {
                                    return typeof doc[path] === 'undefined'
                                        ? Data_1.default.empty
                                        : Data_1.default.fromJSON(doc[path]).map(docAtPath => {
                                            return this.docToResource(docAtPath, fields);
                                        });
                                });
                            })
                            .values
                            .reduce((acc, resource) => {
                                acc[`${resource.type}/${resource.id}`] = resource;
                                return acc;
                            }, {})))
                        if(p[i+1]) {
                            if(Array.isArray(newData[`${p[i]}`])) {
                                newData[`${p[i]}`].forEach(d => multiLevelInclude(i+1, p, d))
                            } else {
                                multiLevelInclude(i+1, p, newData[`${p[i]}`])
                            }
                        }
                    }
                    includePaths.forEach((v) => {
                        if(Array.isArray(docOrDocs)){
                            docOrDocs.forEach(d => multiLevelInclude(0, v.split("."), d))
                        } else {
                            multiLevelInclude(0, v.split("."), docOrDocs)
                        }
                    })
                    return docOrDocs;
                });
                includedResourcesPromise =
                    primaryDocumentsPromise.then(() => includedResources);
            }
            else {
                primaryDocumentsPromise = Promise.resolve(queryBuilder.exec());
                includedResourcesPromise = Promise.resolve(undefined);
            }
            return Promise.all([
                primaryDocumentsPromise.then((it) => {
                    return this.docsToResourceData(it, mode === 'find', fields);
                }),
                includedResourcesPromise,
                collectionSizePromise
            ]).then(([primary, included, collectionSize]) => {
                return { primary, included, collectionSize };
            }).catch(util.errorHandler);
        });
    }
    create(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { records: resourceData } = query;
            const getSmallestSubType = (it) => it.typePath[0];
            const setIdWithGenerator = typeof this.idGenerator === "function" &&
                ((doc) => { doc._id = this.idGenerator(doc); });
            const resourcesByParentType = misc_1.partition('type', resourceData);
            const creationPromises = Object.keys(resourcesByParentType).map(type => {
                const model = this.getModel(type);
                const discriminatorKey = schema_1.getDiscriminatorKey(model);
                const resources = resourcesByParentType[type];
                const docObjects = resources.map((resource) => {
                    const finalModel = this.getModel(getSmallestSubType(resource));
                    const forbiddenKeys = schema_1.getMetaKeys(finalModel);
                    if (forbiddenKeys.some(k => k in resource.attrs || k in resource.relationships)) {
                        throw Errors.illegalFieldName();
                    }
                    return util.resourceToDocObject(resource, (typePath) => {
                        if (typePath.length === 1) {
                            return {};
                        }
                        const smallestSubType = getSmallestSubType(resource);
                        if (!discriminatorKey || !this.getModel(smallestSubType)) {
                            throw new Error("Unexpected model name. Should've been caught earlier.");
                        }
                        return { [discriminatorKey]: this.typeNamesToModelNames[smallestSubType] };
                    });
                });
                if (setIdWithGenerator) {
                    docObjects.forEach(setIdWithGenerator);
                }
                return model.create(docObjects)
                    .catch(e => util.errorHandler(e, { type }));
            });
            return Promise.all(creationPromises).then((docArrays) => {
                const makeCollection = !resourceData.isSingular;
                const finalDocs = docArrays.reduce((a, b) => a.concat(b), []);
                return {
                    created: this.docsToResourceData(finalDocs, makeCollection)
                };
            });
        });
    }
    update(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { type: parentType, patch } = query;
            const parentModel = this.getModel(parentType);
            const prefetchedDocs = patch.map(it => it.adapterExtra).values.filter(it => !!it);
            const getOIdAsString = R.pipe(R.prop('_id'), String);
            const docIdsToFetch = [...misc_1.setDifference(patch.map(R.prop('id')).values, prefetchedDocs.map(getOIdAsString))];
            const remainingDocsQuery = parentModel.find({ _id: { $in: docIdsToFetch } }).lean();
            const docsToUpdate = docIdsToFetch.length === 0
                ? prefetchedDocs
                : [...prefetchedDocs, ...yield remainingDocsQuery.exec()];
            const docsToUpdateById = docsToUpdate.reduce(misc_1.reduceToObject(getOIdAsString), {});
            const updateOpts = {
                new: true,
                runValidators: false,
                upsert: false,
                strict: true
            };
            const singleDocUpdateQueries = yield patch.mapAsync((resourceUpdate) => __awaiter(this, void 0, void 0, function* () {
                const Model = this.getModel(resourceUpdate.typePath[0]);
                const versionKey = schema_1.getVersionKey(Model);
                if (!Model) {
                    throw new Error("Unknown model name.");
                }
                const existingDoc = docsToUpdateById[resourceUpdate.id];
                const changeSet = util.resourceToDocObject(resourceUpdate);
                if (!existingDoc) {
                    throw Errors.genericNotFound({
                        detail: `First missing resource was (${resourceUpdate.type}, ${resourceUpdate.id}).`
                    });
                }
                const forbiddenKeys = schema_1.getMetaKeys(Model);
                if (forbiddenKeys.some(k => k in changeSet)) {
                    throw Errors.illegalFieldName();
                }
                const updatedDoc = Model.hydrate(existingDoc).set(changeSet);
                try {
                    yield updatedDoc.validate();
                }
                catch (e) {
                    util.errorHandler(e, { type: resourceUpdate.type, id: resourceUpdate.id });
                }
                const modifiedPaths = updatedDoc.modifiedPaths();
                const updatedDocObject = updatedDoc.toObject();
                const finalUpdate = modifiedPaths.reduce((acc, key) => {
                    acc[key] = updatedDocObject[key];
                    return acc;
                }, {
                    "$inc": { [versionKey]: 1 }
                });
                const criteria = {
                    _id: resourceUpdate.id,
                    [versionKey]: existingDoc[versionKey]
                };
                return [parentModel.findOneAndUpdate(criteria, finalUpdate, updateOpts)];
            }));
            return {
                updated: yield singleDocUpdateQueries.flatMapAsync(([docUpdateQuery]) => __awaiter(this, void 0, void 0, function* () {
                    const doc = yield (docUpdateQuery.exec().catch(e => {
                        util.errorHandler(e, {
                            type: this.modelNamesToTypeNames[docUpdateQuery.model.modelName],
                            id: String(docUpdateQuery.getQuery()._id)
                        });
                    }));
                    if (!doc) {
                        throw Errors.occFail();
                    }
                    return this.docsToResourceData(doc, false);
                }))
            };
        });
    }
    delete(query) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!query.isSimpleIdQuery()) {
                throw new Error("Unsupported delete query");
            }
            const { type, isSingular: singular } = query;
            const mode = singular ? 'findOne' : 'find';
            const filters = query.getFilters();
            const mongofiedFilters = util.toMongoCriteria(filters);
            this.constructor.assertIdsValid(filters, singular);
            const QueryTypeModel = this.getModel(type);
            const baseModelName = QueryTypeModel.baseModelName || QueryTypeModel.modelName;
            const BaseModel = this.getModel(this.modelNamesToTypeNames[baseModelName]);
            const queryBuilder = mode === 'findOne'
                ? BaseModel[mode](mongofiedFilters)
                : BaseModel[mode](mongofiedFilters);
            const docsToDelete = yield queryBuilder.exec().then((docOrDocsOrNull) => {
                return Data_1.default.fromJSON(docOrDocsOrNull);
            }, util.errorHandler);
            const hasTypePathThrough = (throughType, doc) => {
                return this.getTypePath(doc.constructor).includes(throughType);
            };
            if (!docsToDelete.every(R.partial(hasTypePathThrough, [type]))) {
                throw Errors.invalidResourceType();
            }
            if (singular && docsToDelete.size === 0) {
                throw Errors.genericNotFound();
            }
            docsToDelete.forEach(it => { it.remove(); });
            return {
                deleted: docsToDelete.map(it => this.docToResource(it))
            };
        });
    }
    addToRelationship(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.updateRelationship(query);
        });
    }
    removeFromRelationship(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.updateRelationship(query);
        });
    }
    updateRelationship(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { type, id, relationshipName, linkage } = query;
            const model = this.getModel(type);
            const linkageType = this.getRelationshipLinkageType(model, relationshipName);
            if (!linkage.every(it => it.type === linkageType)) {
                throw Errors.invalidLinkageType({
                    detail: `All linkage must have type: ${linkageType}.`
                });
            }
            const updatedIds = linkage.map(it => it.id);
            const options = {
                runValidators: true,
                context: "query",
                new: false
            };
            const update = Object.assign({}, (query instanceof RemoveFromRelationshipQuery_1.default
                ? { $pullAll: { [relationshipName]: updatedIds } }
                : { $addToSet: { [relationshipName]: { $each: updatedIds } } }), { $inc: { [schema_1.getVersionKey(model)]: 1 } });
            return model.findOneAndUpdate({ "_id": id }, update, options).exec()
                .then(unUpdatedDoc => {
                const beforeData = Data_1.default.fromJSON(unUpdatedDoc[relationshipName])
                    .map(oid => new ResourceIdentifier_1.default(linkageType, String(oid)));
                const finalIdsIterator = query instanceof AddToRelationshipQuery_1.default
                    ? new Set([...beforeData.values.map(it => it.id), ...updatedIds]).values()
                    : misc_1.setDifference(beforeData.values.map(it => it.id), updatedIds).values();
                const afterData = Data_1.default.of([...finalIdsIterator].map(thisId => new ResourceIdentifier_1.default(linkageType, thisId)));
                const owner = { type, id: String(id), path: relationshipName };
                return {
                    before: Relationship_1.default.of({ data: beforeData, owner }),
                    after: Relationship_1.default.of({ data: afterData, owner })
                };
            })
                .catch(util.errorHandler);
        });
    }
    getTypePaths(items) {
        return __awaiter(this, void 0, void 0, function* () {
            const itemsByType = misc_1.partition("type", items);
            const types = Object.keys(itemsByType);
            const res = {};
            for (const type of types) {
                const theseItems = itemsByType[type];
                const BaseModel = this.getModel(type);
                const discriminatorKey = schema_1.getDiscriminatorKey(BaseModel);
                const modelForLeanDoc = (it) => (discriminatorKey && it[discriminatorKey])
                    ? this.getModel(this.modelNamesToTypeNames[it[discriminatorKey]])
                    : BaseModel;
                if (!BaseModel.discriminators) {
                    res[type] = theseItems.reduce((acc, item) => {
                        acc[item.id] = { typePath: this.getTypePath(BaseModel) };
                        return acc;
                    }, {});
                }
                else {
                    const docsPromise = BaseModel.find({ _id: { $in: theseItems.map(it => it.id) } }).lean().exec();
                    res[type] = docsPromise.then(docs => {
                        return docs.reduce((acc, doc) => {
                            acc[String(doc._id)] = {
                                typePath: this.getTypePath(modelForLeanDoc(doc)),
                                extra: doc
                            };
                            return acc;
                        }, {});
                    });
                }
            }
            const values = yield Promise.all(types.map(type => res[type]));
            return types.reduce((acc, type, i) => {
                acc[type] = values[i];
                return acc;
            }, {});
        });
    }
    getModel(typeName) {
        const modelName = this.typeNamesToModelNames[typeName];
        if (!modelName || !this.models[modelName]) {
            throw new Error(`No model for type "${typeName}" is registered with the MongooseAdapter.`);
        }
        return this.models[modelName];
    }
    getRelationshipNames(typeName) {
        const model = this.getModel(typeName);
        return schema_1.getReferencePaths(model);
    }
    getRelationshipLinkageType(ownerModel, relName) {
        try {
            const refModelName = schema_1.getReferencedModelName(ownerModel, relName);
            const refModelType = this.modelNamesToTypeNames[refModelName];
            const refModel = this.getModel(refModelType);
            return this.getTypePath(refModel).pop();
        }
        catch (e) {
            throw new Error(`Missing/invalid model name for relationship ${relName}.`);
        }
    }
    static docsToResourceData(models, modelNamesToTypeNames, docs, isPlural, fields) {
        if (!docs || (!isPlural && Array.isArray(docs) && docs.length === 0)) {
            throw Errors.genericNotFound();
        }
        const docsArray = !Array.isArray(docs) ? [docs] : docs;
        const resources = docsArray.map((it) => doc_to_resource_1.default(models, modelNamesToTypeNames, it, fields));
        return isPlural
            ? Data_1.default.of(resources)
            : Data_1.default.pure(resources[0]);
    }
    static getStandardizedSchema(model, pluralizer = pluralize.plural.bind(pluralize)) {
        const versionKey = schema_1.getVersionKey(model);
        const discriminatorKey = schema_1.getDiscriminatorKey(model);
        const virtuals = model.schema.virtuals;
        const schemaFields = [];
        const getFieldType = (path, schemaType) => {
            if (path === "_id") {
                return new FieldType_1.default("Id", false);
            }
            const typeOptions = schemaType.options.type;
            const holdsArray = Array.isArray(typeOptions);
            const baseType = holdsArray ? typeOptions[0].ref : typeOptions.name;
            const refModelName = schema_1.getReferencedModelName(model, path);
            return !refModelName ?
                new FieldType_1.default(baseType, holdsArray) :
                new RelationshipType_1.default(holdsArray, refModelName, naming_conventions_1.getTypeName(refModelName, pluralizer));
        };
        model.schema.eachPath((name, type) => {
            if ([versionKey, discriminatorKey].includes(name)) {
                return;
            }
            const schemaType = type;
            const fieldType = getFieldType(name, schemaType);
            const publicName = name === "_id" ? "id" : name;
            const likelyAutoGenerated = publicName === "id" ||
                (fieldType.baseType === "Date" &&
                    /created|updated|modified/.test(publicName) &&
                    typeof schemaType.options.default === "function");
            let defaultVal;
            if (likelyAutoGenerated) {
                defaultVal = "__AUTO__";
            }
            else if (schemaType.options.default && typeof schemaType.options.default !== "function") {
                defaultVal = schemaType.options.default;
            }
            const baseTypeOptions = Array.isArray(schemaType.options.type)
                ? schemaType.options.type[0]
                : schemaType.options;
            const validationRules = {
                required: !!schemaType.options.required,
                oneOf: baseTypeOptions.enum
                    ? schemaType.enumValues ||
                        (schemaType.caster && schemaType.caster.enumValues)
                    : undefined,
                max: schemaType.options.max || undefined
            };
            schemaType.validators.forEach((validatorObj) => {
                Object.assign(validationRules, validatorObj.validator.JSONAPIDocumentation);
            });
            schemaFields.push(new Field_1.default(publicName, fieldType, validationRules, this.toFriendlyName(publicName), defaultVal));
        });
        for (const virtual in virtuals) {
            if (virtual === "id") {
                continue;
            }
            schemaFields.push(new Field_1.default(virtual, undefined, undefined, this.toFriendlyName(virtual)));
        }
        return schemaFields;
    }
    static toFriendlyName(pathOrModelName) {
        const ucFirst = (v) => v.charAt(0).toUpperCase() + v.slice(1);
        const pascalCasedString = pathOrModelName.split(".").map(ucFirst).join("");
        let matches;
        const words = [];
        const wordsRe = /[A-Z]([A-Z]*(?![^A-Z])|[^A-Z]*)/g;
        while ((matches = wordsRe.exec(pascalCasedString)) !== null) {
            words.push(matches[0]);
        }
        return words.join(" ");
    }
    static assertIdsValid(filters, isSingular) {
        const idsArray = filters.args.reduce((acc, filter) => {
            return parse_query_params_1.isId(filter.args[0]) && filter.args[0].value === 'id'
                ? acc.concat(filter.args[1])
                : acc;
        }, []);
        if (!idsArray.every(this.idIsValid)) {
            throw isSingular
                ? Errors.genericNotFound({ detail: "Invalid ID." })
                : Errors.invalidId();
        }
    }
    static idIsValid(id) {
        return typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);
    }
}
MongooseAdapter.supportedOperators = {
    "and": {},
    "or": {},
    'eq': {},
    'neq': {},
    'ne': {},
    'in': {},
    'nin': {},
    'lt': {},
    'gt': {},
    'lte': {},
    'gte': {},
    'geoDistance': {
        arity: 2,
        legalIn: ["sort"],
        finalizeArgs(operators, operator, args) {
            if (!parse_query_params_1.isId(args[0])) {
                throw new SyntaxError(`"geoDistance" operator expects field reference as first argument.`);
            }
            if (!isPoint(args[1])) {
                throw new SyntaxError(`"geoDistance" operator expects [lng,lat] as second argument.`);
            }
            return args;
        }
    },
    'geoWithin': {
        arity: 2,
        legalIn: ["filter"],
        finalizeArgs(operators, operator, args) {
            if (!parse_query_params_1.isId(args[0])) {
                throw new SyntaxError(`"geoWithin" operator expects field reference as first argument.`);
            }
            const isToGeoCircle = R.allPass([
                parse_query_params_1.isFieldExpression,
                R.propEq("operator", "toGeoCircle")
            ]);
            if (!isToGeoCircle(args[1])) {
                throw new SyntaxError(`"geoDistance" operator expects a toGeoCircle as second argument.`);
            }
            return args;
        }
    },
    'toGeoCircle': {
        arity: 2,
        legalIn: ["filter"],
        finalizeArgs(operators, operator, args) {
            if (!isPoint(args[0])) {
                throw new SyntaxError(`"toGeoCircle" operator expects a center point as first argument.`);
            }
            if (typeof args[1] !== 'number' || Number.isNaN(args[1])) {
                throw new SyntaxError(`"toGeoCircle" operator expects a radius in meters as second argument.`);
            }
            return args;
        }
    }
};
exports.default = MongooseAdapter;
