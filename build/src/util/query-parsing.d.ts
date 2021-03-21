/// <reference types="ramda" />
import R = require("ramda");
import { Just, Nothing } from "../types/Generic/Maybe";
export { Just, Nothing };
export declare const getQueryParamValue: R.CurriedFunction2<string, string | undefined, Just<string> | Nothing<string>>;
