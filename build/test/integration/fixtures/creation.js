"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VALID_PERSON_RESOURCE_NO_ID = {
    "type": "people",
    "attributes": {
        "name": "Ethan Resnick",
        "email": "ethan.resnick@gmail.com",
        "gender": "male"
    }
};
exports.VALID_ORG_RESOURCE_NO_ID = {
    "type": "organizations",
    "attributes": {
        "name": "Test Organization",
        "modified": "2015-01-01T00:00:00.000Z",
        "echo": "Hello!"
    },
    "relationships": {
        "liaisons": {
            "data": [{ "type": "people", "id": "53f54dd98d1e62ff12539db3" }]
        }
    }
};
exports.VALID_ORG_RESOURCE_NO_ID_EXTRA_MEMBER = Object.assign({}, exports.VALID_ORG_RESOURCE_NO_ID, { "extraMember": true });
exports.ORG_RESOURCE_CLIENT_ID = Object.assign({}, exports.VALID_ORG_RESOURCE_NO_ID, { "id": "53f54dd98d1e62ff12539db3" });
exports.ORG_RESOURCE_FALSEY_CLIENT_ID = Object.assign({}, exports.VALID_ORG_RESOURCE_NO_ID, { "id": "0" });
exports.ORG_RESOURCE_FALSEY_CLIENT_ID_2 = Object.assign({}, exports.VALID_ORG_RESOURCE_NO_ID, { "id": "" });
exports.VALID_SCHOOL_RESOURCE_NO_ID = {
    "type": "organizations",
    "meta": {
        "types": ["organizations", "schools"]
    },
    "attributes": {
        "name": "Test School",
        "isCollege": false
    }
};
exports.INVALID_ORG_RESOURCE_NO_ID = {
    "type": "organizations",
    "attributes": {}
};
exports.VALID_SCHOOL_RESOURCE_NO_ID_EMPTY_PRINCIPAL_NO_LIAISONS = {
    "type": "organizations",
    "meta": {
        "types": ["organizations", "schools"]
    },
    "attributes": {
        "name": "Test School",
        "isCollege": false
    },
    "relationships": {
        "principal": { "data": null }
    }
};
exports.INVALID_ORG_RESOURCE_NO_DATA_IN_RELATIONSHIP = {
    "type": "organizations",
    "relationships": {
        "liaisons": {
            "type": "people", "id": "53f54dd98d1e62ff12539db3"
        }
    }
};
