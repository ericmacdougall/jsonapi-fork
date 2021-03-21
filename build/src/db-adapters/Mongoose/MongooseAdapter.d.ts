/// <reference types="mongoose" />
import mongodb = require("mongodb");
import mongoose = require("mongoose");
import pluralize = require("pluralize");
import { Model, Document } from "mongoose";
import { AndExpression, SupportedOperators } from "../../types/";
import Data from "../../types/Generic/Data";
import { ResourceWithTypePath } from "../../types/Resource";
import Relationship from '../../types/Relationship';
import FieldDocumentation from "../../types/Documentation/Field";
import { Adapter, TypeInfo, TypeIdMapOf, ReturnedResource } from "../AdapterInterface";
import CreateQuery from "../../types/Query/CreateQuery";
import FindQuery from "../../types/Query/FindQuery";
import DeleteQuery from "../../types/Query/DeleteQuery";
import UpdateQuery from "../../types/Query/UpdateQuery";
import AddToRelationshipQuery from "../../types/Query/AddToRelationshipQuery";
import RemoveFromRelationshipQuery from "../../types/Query/RemoveFromRelationshipQuery";
export default class MongooseAdapter implements Adapter<typeof MongooseAdapter> {
    protected models: {
        [modelName: string]: Model<any>;
    };
    protected toTypeName: (modelName: string) => string;
    protected idGenerator: ((doc: mongoose.Document) => mongodb.ObjectID) | undefined;
    "constructor": typeof MongooseAdapter;
    protected typeNamesToModelNames: {
        [typeName: string]: string | undefined;
    };
    protected modelNamesToTypeNames: {
        [modelName: string]: string | undefined;
    };
    constructor(models?: {
        [modelName: string]: Model<any>;
    }, toTypeName?: (modelName: string) => string, idGenerator?: ((doc: mongoose.Document) => mongodb.ObjectID) | undefined);
    docToResource(doc: Document, fields?: object): ResourceWithTypePath;
    docsToResourceData(docs: null | Document | Document[], isPlural: boolean, fields?: object): Data<ResourceWithTypePath>;
    getTypePath(model: Model<any>): string[];
    find(query: FindQuery): Promise<{
        primary: Data<ReturnedResource>;
        included: ReturnedResource[] | undefined;
        collectionSize: number | undefined;
    }>;
    create(query: CreateQuery): Promise<{
        created: Data<ReturnedResource>;
    }>;
    update(query: UpdateQuery): Promise<{
        updated: Data<ReturnedResource>;
    }>;
    delete(query: DeleteQuery): Promise<{
        deleted: Data<ReturnedResource>;
    }>;
    addToRelationship(query: AddToRelationshipQuery): Promise<{
        before: Relationship;
        after: Relationship;
    }>;
    removeFromRelationship(query: RemoveFromRelationshipQuery): Promise<{
        before: Relationship;
        after: Relationship;
    }>;
    private updateRelationship(query);
    getTypePaths(items: {
        type: string;
        id: string;
    }[]): Promise<TypeIdMapOf<TypeInfo>>;
    getModel(typeName: string): mongoose.Model<any>;
    getRelationshipNames(typeName: any): string[];
    protected getRelationshipLinkageType(ownerModel: Model<any>, relName: string): string;
    static docsToResourceData(models: any, modelNamesToTypeNames: any, docs: null | mongoose.Document | mongoose.Document[], isPlural: boolean, fields?: object): Data<ResourceWithTypePath>;
    static getStandardizedSchema(model: mongoose.Model<any>, pluralizer?: typeof pluralize.plural): FieldDocumentation[];
    static toFriendlyName(pathOrModelName: string): string;
    static assertIdsValid(filters: AndExpression, isSingular: boolean): void;
    static idIsValid(id: any): boolean;
    static supportedOperators: SupportedOperators;
}
