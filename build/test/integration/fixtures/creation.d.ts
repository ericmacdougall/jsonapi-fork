export declare const VALID_PERSON_RESOURCE_NO_ID: {
    "type": string;
    "attributes": {
        "name": string;
        "email": string;
        "gender": string;
    };
};
export declare const VALID_ORG_RESOURCE_NO_ID: {
    "type": string;
    "attributes": {
        "name": string;
        "modified": string;
        "echo": string;
    };
    "relationships": {
        "liaisons": {
            "data": {
                "type": string;
                "id": string;
            }[];
        };
    };
};
export declare const VALID_ORG_RESOURCE_NO_ID_EXTRA_MEMBER: {
    "extraMember": boolean;
    "type": string;
    "attributes": {
        "name": string;
        "modified": string;
        "echo": string;
    };
    "relationships": {
        "liaisons": {
            "data": {
                "type": string;
                "id": string;
            }[];
        };
    };
};
export declare const ORG_RESOURCE_CLIENT_ID: {
    "id": string;
    "type": string;
    "attributes": {
        "name": string;
        "modified": string;
        "echo": string;
    };
    "relationships": {
        "liaisons": {
            "data": {
                "type": string;
                "id": string;
            }[];
        };
    };
};
export declare const ORG_RESOURCE_FALSEY_CLIENT_ID: {
    "id": string;
    "type": string;
    "attributes": {
        "name": string;
        "modified": string;
        "echo": string;
    };
    "relationships": {
        "liaisons": {
            "data": {
                "type": string;
                "id": string;
            }[];
        };
    };
};
export declare const ORG_RESOURCE_FALSEY_CLIENT_ID_2: {
    "id": string;
    "type": string;
    "attributes": {
        "name": string;
        "modified": string;
        "echo": string;
    };
    "relationships": {
        "liaisons": {
            "data": {
                "type": string;
                "id": string;
            }[];
        };
    };
};
export declare const VALID_SCHOOL_RESOURCE_NO_ID: {
    "type": string;
    "meta": {
        "types": string[];
    };
    "attributes": {
        "name": string;
        "isCollege": boolean;
    };
};
export declare const INVALID_ORG_RESOURCE_NO_ID: {
    "type": string;
    "attributes": {};
};
export declare const VALID_SCHOOL_RESOURCE_NO_ID_EMPTY_PRINCIPAL_NO_LIAISONS: {
    "type": string;
    "meta": {
        "types": string[];
    };
    "attributes": {
        "name": string;
        "isCollege": boolean;
    };
    "relationships": {
        "principal": {
            "data": null;
        };
    };
};
export declare const INVALID_ORG_RESOURCE_NO_DATA_IN_RELATIONSHIP: {
    "type": string;
    "relationships": {
        "liaisons": {
            "type": string;
            "id": string;
        };
    };
};
