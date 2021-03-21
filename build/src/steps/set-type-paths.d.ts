import Resource from "../types/Resource";
import ResourceIdentifier from "../types/ResourceIdentifier";
import ResourceTypeRegistry from "../ResourceTypeRegistry";
export default function (resourcesAndIds: (Resource | ResourceIdentifier)[], useInputTypesList: boolean, requiredThroughType: string | undefined, registry: ResourceTypeRegistry): Promise<void>;
