/// <reference types="mongoose" />
import { Model } from "mongoose";
import { StrictDictMap } from "../../../types";
export declare function getTypePath(model: Model<any>, modelNamesToTypeNames: StrictDictMap<string>): string[];
