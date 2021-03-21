import Resource from "../../types/Resource";
import ResourceSet from "../../types/ResourceSet";
import ResourceIdentifier from "../../types/ResourceIdentifier";
import ResourceIdentifierSet from "../../types/ResourceIdentifierSet";
export declare const hasId: (it: ResourceIdentifier | Resource) => boolean;
export default function (data: ResourceSet | ResourceIdentifierSet): Promise<void>;
