export declare const RFC6570String: unique symbol;
export declare type UrlTemplate = {
    (data: any): string;
    [RFC6570String]?: string;
};
export declare function fromRFC6570(template: string): UrlTemplate;
export declare function fromUrl(url: string): () => string;
