import Data from "./Generic/Data";
import ResourceIdentifier from "./ResourceIdentifier";
import { DataWithLinksArgs } from "./index";
import MaybeDataWithLinks from "./MaybeDataWithLinks";
export default class ResourceIdentifierSet extends MaybeDataWithLinks<ResourceIdentifier> {
    protected _data: Data<ResourceIdentifier>;
    protected constructor(it: DataWithLinksArgs<ResourceIdentifier>);
    readonly isSingular: boolean;
    toJSON(): {
        links: {
            [linkName: string]: any;
        };
        data: {
            id: string;
            type: string;
        } | {
            id: string;
            type: string;
        }[] | null | undefined;
    };
    static of(it: DataWithLinksArgs<ResourceIdentifier>): ResourceIdentifierSet;
}
