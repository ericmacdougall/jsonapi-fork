"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const fixtures = require("node-mongoose-fixtures");
const index_1 = require("./index");
const ObjectId = mongoose.Types.ObjectId;
const govtId = ObjectId("54419d550a5069a2129ef254");
const smithId = ObjectId("53f54dd98d1e62ff12539db2");
const doeId = ObjectId("53f54dd98d1e62ff12539db3");
const echoOrgId = ObjectId("59ac9c0ecc4c356fcda65202");
const genderPersonId = ObjectId("59af14d3bbd18cd55ea08ea1");
const invisibleResourceId = ObjectId("59af14d3bbd18cd55ea08ea2");
const elementaryId = ObjectId("59af14d3bbd18cd55ea08ea3");
const justForSubtypePatchId = ObjectId("5a5934cfc810949cebeecc33");
fixtures.save("all", {
    Person: [
        { name: "John Smith", email: "jsmith@gmail.com", gender: "male", _id: smithId },
        { name: "Jane Doe", gender: "female", _id: doeId, manages: elementaryId, homeSchool: elementaryId },
        { name: "Doug Wilson", gender: "male" },
        { name: "Jordi Jones", _id: genderPersonId, gender: "other" },
        { name: "An Inivisible Sorcerer", gender: "other", _id: invisibleResourceId },
    ],
    Organization: [{
            _id: govtId,
            name: "State Government",
            description: "Representing the good people.",
            liaisons: [doeId, smithId],
            location: { type: "Point", coordinates: [-73.9667, 40.78] }
        }, {
            _id: echoOrgId,
            name: "Org whose echo prop I'll change",
            reversed: "Test",
            liaisons: [doeId],
            modified: new Date("2015-01-01"),
            location: { type: "Point", coordinates: [10, 10] }
        }],
    School: [
        { name: "City College", description: "Just your average local college.", liaisons: [smithId] },
        { name: "State College", description: "Just your average state college." },
        { name: "Elementary School", description: "For the youngins.", principal: invisibleResourceId, _id: elementaryId },
        { name: "TO PATCH BY SUBTYPES TESTS", _id: justForSubtypePatchId }
    ]
});
exports.default = index_1.default.then(function () {
    function fixturesRemoveAll() {
        return new Promise((resolve, reject) => {
            fixtures.reset((err, res) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(res);
                }
            });
        });
    }
    return {
        fixturesRemoveAll,
        fixturesReset() {
            return fixturesRemoveAll().then(function () {
                return new Promise((resolve, reject) => {
                    fixtures("all", (err, res) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve(res);
                        }
                    });
                });
            });
        }
    };
});
