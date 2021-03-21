/// <reference types="mongoose" />
import mongoose = require("mongoose");
declare const _default: Promise<{
    fixturesRemoveAll: () => Promise<void>;
    fixturesReset(): Promise<mongoose.Document[]>;
}>;
export default _default;
