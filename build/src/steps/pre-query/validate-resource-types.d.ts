import ResourceSet from "../../types/ResourceSet";
import ResourceIdentifierSet from "../../types/ResourceIdentifierSet";
import ResourceTypeRegistry from "../../ResourceTypeRegistry";
export default function (endpointParentType: string, data: ResourceSet | ResourceIdentifierSet, registry: ResourceTypeRegistry): Promise<void>;
