import { Request } from "../../../types";
export default function validateContentType(request: Pick<Request, "contentType">, supportedExt?: any): Promise<void>;
