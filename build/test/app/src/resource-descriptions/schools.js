"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
module.exports = {
    parentType: "organizations",
    urlTemplates: {
        "self": "http://127.0.0.1:3000/schools/{id}",
        "relationship": "http://127.0.0.1:3000/schools/{ownerId}/relationships/{path}",
        "related": "http://127.0.0.1:3000/schools/{ownerId}/{path}"
    },
    info: {
        "description": "A description of your School resource (optional).",
        "fields": {
            "isCollege": {
                "description": "Whether the school is a college, by the U.S. meaning."
            }
        }
    },
    beforeSave(resource, meta, extras, superFn) {
        return __awaiter(this, void 0, void 0, function* () {
            const transformed = yield superFn(resource);
            transformed.attrs.modified = new Date("2015-10-27T05:16:57.257Z");
            if (resource.id === '5a5934cfc810949cebeecc33') {
                transformed.attrs.description = "Special, beforeSave description.";
            }
            return transformed;
        });
    },
    beforeRender(resource, meta, extras, superFn) {
        resource.attrs.schoolBeforeRender = true;
        return superFn(resource);
    },
    pagination: { defaultPageSize: 2 }
};
