"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const misc_1 = require("../util/misc");
const Relationship_1 = require("./Relationship");
class Resource {
    constructor(type, id, attrs = Object.create(null), relationships = Object.create(null), meta = Object.create(null)) {
        [this.type, this.id, this.attrs, this.relationships, this.meta] =
            [type, id, attrs, relationships, meta];
    }
    get id() {
        return this._id;
    }
    set id(id) {
        this._id = (typeof id !== "undefined") ? String(id) : undefined;
    }
    get type() {
        return this._type;
    }
    set type(type) {
        if (!type) {
            throw errorWithCode("type is required", 1);
        }
        this._type = String(type);
    }
    get typesList() {
        return this.meta.types;
    }
    equals(otherResource) {
        return this.id === otherResource.id && this.type === otherResource.type;
    }
    get attrs() {
        return this._attrs;
    }
    set attrs(attrs) {
        validateFieldGroup(attrs, this._relationships, true);
        this._attrs = attrs;
    }
    get attributes() {
        return this.attrs;
    }
    set attributes(attrs) {
        this.attrs = attrs;
    }
    get relationships() {
        return this._relationships;
    }
    set relationships(relationships) {
        validateFieldGroup(relationships, this._attrs);
        this._relationships = relationships;
    }
    set meta(meta) {
        if (typeof meta !== "object" || meta === null) {
            throw errorWithCode("meta must be an object.", 2);
        }
        this._meta = meta;
    }
    get meta() {
        return this._meta;
    }
    removeAttr(attrPath) {
        if (this._attrs) {
            misc_1.deleteNested(attrPath, this._attrs);
        }
    }
    removeRelationship(relationshipPath) {
        if (this._relationships) {
            misc_1.deleteNested(relationshipPath, this._relationships);
        }
    }
    setRelationship(relationshipPath, data) {
        validateFieldGroup({ [relationshipPath]: true }, this._attrs);
        this._relationships[relationshipPath] = Relationship_1.default.of({
            data,
            owner: { type: this._type, id: this._id, path: relationshipPath }
        });
    }
    toJSON(urlTemplates) {
        const hasMeta = !misc_1.objectIsEmpty(this.meta);
        const showTypePath = this.typePath && this.typePath.length > 1;
        const meta = showTypePath
            ? Object.assign({}, this.meta, { types: this.typePath }) : this.meta;
        const json = Object.assign({ id: this.id, type: this.type, attributes: this.attrs }, (showTypePath || hasMeta ? { meta } : {}));
        const templateData = Object.assign({}, json);
        const selfTemplate = urlTemplates.self;
        if (selfTemplate) {
            json.links = {
                self: selfTemplate(templateData)
            };
        }
        if (!misc_1.objectIsEmpty(this.relationships)) {
            json.relationships = {};
            Object.keys(this.relationships).forEach(path => {
                const { related, relationship } = urlTemplates;
                const finalTemplates = { related, self: relationship };
                json.relationships[path] =
                    this.relationships[path].toJSON(finalTemplates);
            });
        }
        return json;
    }
}
exports.default = Resource;
function validateFieldGroup(group, otherFields, isAttributes = false) {
    if (!misc_1.isPlainObject(group)) {
        throw errorWithCode("Attributes and relationships must be provided as an object.", 3);
    }
    if ("id" in group || "type" in group) {
        throw errorWithCode("`type` and `id` cannot be used as field names.", 4);
    }
    Object.keys(group).forEach(field => {
        if (isAttributes) {
            validateComplexAttribute(group[field]);
        }
        if (otherFields !== undefined && typeof otherFields[field] !== "undefined") {
            throw errorWithCode("A resource can't have an attribute and a relationship with the same name.", 5, { field });
        }
    });
}
function validateComplexAttribute(attrOrAttrPart) {
    if (misc_1.isPlainObject(attrOrAttrPart)) {
        const { relationships, links } = attrOrAttrPart;
        if (typeof relationships !== "undefined" || typeof links !== "undefined") {
            throw errorWithCode('Complex attributes may not have "relationships" or "links" keys.', 6);
        }
        Object.keys(attrOrAttrPart).forEach(key => {
            validateComplexAttribute(attrOrAttrPart[key]);
        });
    }
    else if (Array.isArray(attrOrAttrPart)) {
        attrOrAttrPart.forEach(validateComplexAttribute);
    }
}
function errorWithCode(message, code, extra) {
    const x = new Error(message);
    x.code = code;
    Object.assign(x, extra);
    return x;
}
