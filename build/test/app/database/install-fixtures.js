"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const define_fixtures_1 = require("./define-fixtures");
define_fixtures_1.default.then(obj => {
    return obj.fixturesReset().then(() => process.exit(0));
});
