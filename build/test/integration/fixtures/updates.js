"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VALID_ORG_STATE_GOVT_PATCH = {
    "type": "organizations",
    "id": "54419d550a5069a2129ef254",
    "attributes": {
        "name": "State Government Renamed"
    }
};
exports.NEVER_APPLIED_STATE_GOVT_PATCH = {
    "type": "organizations",
    "id": "54419d550a5069a2129ef254",
    "attributes": {
        "name": "astienaseti"
    }
};
exports.NEVER_APPLIED_SCHOOL_PATCH = {
    "type": "organizations",
    "id": "59af14d3bbd18cd55ea08ea3",
    "attributes": {
        "name": "astienaseti"
    }
};
exports.VALID_ORG_VIRTUAL_PATCH = {
    "type": "organizations",
    "id": "59ac9c0ecc4c356fcda65202",
    "attributes": {
        "name": "changed name",
        "echo": "Hello!"
    }
};
exports.INVALID_ORG_PATCH_NO_ID = {
    "type": "organizations",
    "attributes": {
        "name": "changed name",
        "echo": "Hello!"
    }
};
exports.VALID_ORG_RELATIONSHIP_PATCH = {
    "data": [{
            "type": "people", "id": "53f54dd98d1e62ff12539db3"
        }]
};
exports.VALID_TO_MANY_RELATIONSHIP_EMPTY_PATCH = {
    "data": []
};
exports.VALID_TO_ONE_RELATIONSHIP_EMPTY_PATCH = {
    "data": null
};
exports.VALID_SCHOOL_PRINCIPAL_PATCH = {
    data: {
        "type": "people", "id": "53f54dd98d1e62ff12539db3"
    }
};
