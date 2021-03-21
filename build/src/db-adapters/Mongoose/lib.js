"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const APIError_1 = require("../../types/APIError");
const Errors = require("../../util/errors");
const MongooseError = require("mongoose/lib/error");
function errorHandler(err, context) {
    const errors = [];
    if (err.errors) {
        Object.keys(err.errors).forEach(errKey => {
            const thisError = err.errors[errKey];
            const metaSource = { source: Object.assign({ field: thisError.path }, context) };
            const errorFormatted = (() => {
                if (err.name === 'ValidationError') {
                    if (thisError.kind === 'required') {
                        return Errors.missingField({
                            detail: thisError.message,
                            rawError: thisError,
                            meta: Object.assign({}, metaSource)
                        });
                    }
                    if (APIError_1.default.isDisplaySafe(thisError.reason)) {
                        const apiError = APIError_1.default.fromError(thisError.reason);
                        apiError.meta = Object.assign({}, apiError.meta, metaSource);
                        return apiError;
                    }
                    else if (thisError.reason && !(thisError.reason instanceof MongooseError)) {
                        return Errors.invalidFieldValue({
                            detail: `Invalid value for path "${thisError.path}"`,
                            rawError: thisError.reason,
                            meta: Object.assign({}, metaSource)
                        });
                    }
                    return Errors.invalidFieldValue({
                        detail: thisError.message,
                        rawError: thisError,
                        meta: Object.assign({}, metaSource)
                    });
                }
                return APIError_1.default.fromError(thisError);
            })();
            errors.push(errorFormatted);
        });
    }
    else if (err.name === 'MongoError' && err.code === 11000) {
        errors.push(Errors.uniqueViolation({
            rawError: err,
            code: 11000
        }));
    }
    else {
        errors.push(err);
    }
    throw errors;
}
exports.errorHandler = errorHandler;
function toMongoCriteria(constraint) {
    const mongoOperator = "$" + (constraint.operator === 'neq' ? 'ne' : constraint.operator);
    if (constraint.operator === "and" || constraint.operator === "or") {
        return !constraint.args.length
            ? {}
            : {
                [mongoOperator]: constraint.args.map(toMongoCriteria)
            };
    }
    if (constraint.operator === "toGeoCircle") {
        throw new APIError_1.default({
            status: 400,
            title: "Can only have toGeoCircle inside of a geoWithin."
        });
    }
    const fieldName = constraint.args[0].value;
    const mongoField = (fieldName === 'id' ? '_id' : fieldName);
    const value = constraint.args[1];
    if (constraint.operator === "geoWithin") {
        if (!(value && value.operator === 'toGeoCircle')) {
            throw new Error("Expected toGeoCircle for second argument.");
        }
        const finalValue = {
            $centerSphere: [value.args[0], value.args[1] / 6378100]
        };
        return {
            [mongoField]: {
                [mongoOperator]: finalValue
            }
        };
    }
    if (constraint.operator === 'eq') {
        return { [mongoField]: value };
    }
    return {
        [mongoField]: {
            [mongoOperator]: value
        }
    };
}
exports.toMongoCriteria = toMongoCriteria;
function resourceToDocObject(resource, typePathFn) {
    const res = Object.assign({}, resource.attrs, (typePathFn ? typePathFn(resource.typePath) : {}));
    Object.keys(resource.relationships).forEach(key => {
        res[key] = resource.relationships[key].unwrapDataWith(it => it.id);
    });
    return res;
}
exports.resourceToDocObject = resourceToDocObject;
