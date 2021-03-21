"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const person_1 = require("../src/models/person");
const school_1 = require("../src/models/school");
const organization_1 = require("../src/models/organization");
const OrganizationModel = organization_1.default.model;
const OrganizationSchema = organization_1.default.schema;
const models = {
    Person: person_1.default,
    Organization: OrganizationModel,
    School: school_1.default(OrganizationModel, OrganizationSchema)
};
exports.default = mongoose.connect("mongodb://localhost/integration-test", { useMongoClient: true }).then(() => {
    return {
        models() {
            return models;
        },
        instance() {
            return mongoose;
        }
    };
});
