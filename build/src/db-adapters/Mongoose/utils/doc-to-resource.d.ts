/// <reference types="mongoose" />
import { Model, Document } from "mongoose";
import { ResourceWithTypePath } from "../../../types/Resource";
import { StrictDictMap } from "../../../types";
export default function docToResource(models: {
    [modelName: string]: Model<any>;
}, modelNamesToTypeNames: StrictDictMap<string>, doc: Document, fields?: object): ResourceWithTypePath;
