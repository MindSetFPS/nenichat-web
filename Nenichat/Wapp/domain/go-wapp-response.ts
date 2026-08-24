/**
 * Standard envelope returned by every GoWapp (go-whatsapp-web-multidevice) endpoint.
 * @see https://github.com/aldinokemal/go-whatsapp-web-multidevice
 */
export interface GoWappResponse<T = unknown> {
    code: string;
    message: string;
    results: T;
}
