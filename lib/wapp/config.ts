/**
 * Public origin of the GoWapp gateway (Traefik entry point, no path).
 * Required in every environment; there is intentionally no hardcoded fallback.
 */
export function getWappBaseUrl(): string {
    const baseUrl = process.env.NEXT_PUBLIC_WAPP_API_URL;
    if (!baseUrl) {
        throw new Error('NEXT_PUBLIC_WAPP_API_URL is not configured');
    }
    return baseUrl.replace(/\/+$/, '');
}
