import { GoWappResponse } from '../domain/go-wapp-response';

const DEFAULT_BASE_URL = 'http://localhost:3000';
const DEFAULT_TIMEOUT_MS = 15000;
const QR_POLL_RETRIES = 10;
const QR_POLL_DELAY_MS = 5000;
const DOWNLOAD_RETRIES = 5;
const DOWNLOAD_DELAY_MS = 2000;

export interface WappConfig {
    baseUrl?: string;
    user?: string;
    password?: string;
    deviceId?: number | string;
    timeoutMs?: number;
}

export interface WappPollOptions {
    retries?: number;
    delayMs?: number;
}

interface LoginQrResults {
    qr_link?: string;
    qr_image_link?: string;
}

/**
 * Runtime information reported by the gateway's /app/info endpoint.
 */
export interface WappAppInfo {
    version?: string;
    os?: string;
    base_path?: string;
    max_file_size?: number;
    max_video_size?: number;
    max_image_size?: number;
    chatwoot_enabled?: boolean;
}

function wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function isDebugEnabled(): boolean {
    return process.env.WAPP_DEBUG === 'true';
}

/**
 * Error thrown by Wapp when the gateway responds with a non-2xx status.
 * Carries the upstream HTTP status so callers can forward or branch on it.
 */
export class WappApiError extends Error {
    readonly status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = 'WappApiError';
        this.status = status;
    }
}

/**
 * The container reports its URL based on its internal view, but external access
 * through Traefik requires the specific /api/user/{business_id} path prefix.
 * The gateway (v9.0.1+) keeps the request port in generated URLs; we use the
 * hostname only so the rewritten URL stays reachable through Traefik on the
 * public port (80/443) and never carries the internal :3000.
 */
export function normalizeGatewayUrl(rawUrl: string, businessId: number | string): string {
    const prefix = `/api/user/${businessId}`;
    if (!rawUrl.includes('/statics/') || rawUrl.includes(prefix)) {
        return rawUrl;
    }
    try {
        const urlObj = new URL(rawUrl);
        return `${urlObj.protocol}//${urlObj.hostname}${prefix}${urlObj.pathname}${urlObj.search}`;
    } catch (e) {
        console.error("Error parsing gateway URL:", e);
        return rawUrl;
    }
}

/**
 * Rewrites the gateway's QR link to be reachable through Traefik, preserving the
 * /api/user/{business_id} prefix and dropping any internal port.
 */
function resolveQrImageUrl(rawUrl: string, businessId: number): string {
    return normalizeGatewayUrl(rawUrl, businessId);
}

/**
 * Transport client for a per-business GoWapp gateway container
 * (go-whatsapp-web-multidevice). Owns base URL, Basic auth, the X-Device-Id
 * header, request timeouts, and error normalization. Domain-facing adapters
 * (chats, messages) hold an instance and map responses to their own models.
 *
 * @see https://github.com/aldinokemal/go-whatsapp-web-multidevice
 */
export class Wapp {
    private readonly baseUrl: string;
    private readonly user?: string;
    private readonly password?: string;
    private readonly deviceId?: number | string;
    private readonly timeoutMs: number;

    constructor(config: WappConfig = {}) {
        this.baseUrl = config.baseUrl || process.env.NEXT_PUBLIC_WAPP_API_URL || DEFAULT_BASE_URL;
        this.user = config.user ?? process.env.WAPP_USER;
        this.password = config.password ?? process.env.WAPP_PASSWORD;
        this.deviceId = config.deviceId;
        this.timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    }

    private buildHeaders(deviceIdOverride?: number | string): Record<string, string> {
        const headers: Record<string, string> = {};

        if (this.user && this.password) {
            headers['Authorization'] = `Basic ${btoa(`${this.user}:${this.password}`)}`;
        }

        const deviceId = deviceIdOverride ?? this.deviceId;
        if (deviceId) {
            headers['X-Device-Id'] = `${deviceId}`;
        }

        return headers;
    }

    private async fetchWithTimeout(url: string, init: RequestInit = {}): Promise<Response> {
        return fetch(url, { ...init, signal: AbortSignal.timeout(this.timeoutMs) });
    }

    /**
     * Performs a JSON request against the gateway and returns the standard envelope.
     * @throws {WappApiError} On non-2xx responses.
     * @throws {Error} On network failure or timeout.
     */
    async request<T = unknown>(path: string, init: RequestInit = {}): Promise<GoWappResponse<T>> {
        const url = `${this.baseUrl}${path}`;
        const headers = {
            'Content-Type': 'application/json',
            ...this.buildHeaders(),
            ...(init.headers as Record<string, string> | undefined),
        };

        if (isDebugEnabled()) {
            console.log(`[Wapp] ${init.method ?? 'GET'} ${url}`);
        }

        const response = await this.fetchWithTimeout(url, { ...init, headers });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const detail = errorData.message || errorData.error || `status ${response.status}`;
            console.warn(`[Wapp] ${init.method ?? 'GET'} ${url} failed: ${detail}`);
            throw new WappApiError(`GoWapp API request failed (${response.status}): ${detail}`, response.status);
        }

        if (isDebugEnabled()) {
            const clone = response.clone();
            clone.text().then(t => console.log(`[Wapp] Response: ${t.slice(0, 500)}`)).catch(() => {});
        }

        return response.json();
    }

    /**
     * Registers a device slot for the given id. Tolerant by design: failures are
     * logged but not thrown, so callers can proceed to poll for login.
     */
    async ensureDeviceSlot(deviceId: number | string): Promise<void> {
        const url = `${this.baseUrl}/api/user/${deviceId}/devices`;
        console.log(`Creating device slot at: ${url}`);
        try {
            await this.request(`/api/user/${deviceId}/devices`, {
                method: 'POST',
                body: JSON.stringify({ device_id: deviceId }),
                headers: this.buildHeaders(deviceId),
            });
            console.log('Device slot created successfully');
        } catch (err) {
            console.warn('Failed to create device slot (continuing):', err);
        }
    }

    /**
     * Ensures the device slot exists, then polls the login endpoint until it
     * returns a QR code link (rewritten to be reachable through Traefik) or the
     * attempts are exhausted.
     */
    async getLoginQrLink(businessId: number, options?: WappPollOptions): Promise<string | null> {
        const retries = options?.retries ?? QR_POLL_RETRIES;
        const delayMs = options?.delayMs ?? QR_POLL_DELAY_MS;

        await this.ensureDeviceSlot(businessId);

        const path = `/api/user/${businessId}/devices/${businessId}/login`;
        let qrCodeImageURL = "";
        if (isDebugEnabled()) {
            console.log(`Polling for QR code at: ${this.baseUrl}${path}`);
        }

        for (let i = 0; i < retries; i++) {
            try {
                if (isDebugEnabled()) {
                    console.log(`Attempt ${i + 1} to fetch QR from ${this.baseUrl}${path}`);
                }
                const response = await this.fetchWithTimeout(`${this.baseUrl}${path}`, {
                    headers: this.buildHeaders(businessId),
                });

                if (!response.ok) {
                    console.warn(`Attempt ${i + 1} server returned status ${response.status}`);
                } else {
                    const contentType = response.headers.get("content-type");
                    if (contentType && contentType.includes("application/json")) {
                        const data: GoWappResponse<LoginQrResults> = await response.json();
                        if (data && data.results && (data.results.qr_link || data.results.qr_image_link)) {
                            qrCodeImageURL = resolveQrImageUrl(data.results.qr_link || data.results.qr_image_link || "", businessId);
                            break;
                        }
                    } else {
                        const text = await response.text();
                        console.warn(`Attempt ${i + 1} received non-JSON response:`, text.substring(0, 100));
                    }
                }
            } catch (err) {
                console.error(`Attempt ${i + 1} failed:`, err);
            }
            await wait(delayMs);
        }
        return qrCodeImageURL || null;
    }

    /**
     * Asks the gateway to attempt to reconnect this device's WhatsApp session.
     * @throws {WappApiError} When the gateway rejects the signal.
     * @throws {Error} On network failure or timeout.
     */
    async reconnect(businessId: number | string): Promise<void> {
        await this.request(`/api/user/${businessId}/app/reconnect`, {
            headers: this.buildHeaders(businessId),
        });
    }

    /**
     * Returns runtime information about the gateway app (version, OS, limits).
     * Note: container-level endpoint, sent without the X-Device-Id header.
     * @throws {WappApiError} When the gateway rejects the request.
     * @throws {Error} On network failure or timeout.
     */
    async getAppInfo(businessId: number | string): Promise<WappAppInfo | null> {
        const response = await this.request<WappAppInfo>(`/api/user/${businessId}/app/info`);
        return response.results ?? null;
    }

    /**
     * Lists the WhatsApp devices (linked phones) registered under this
     * business's gateway app.
     * @throws {WappApiError} When the gateway rejects the request.
     * @throws {Error} On network failure or timeout.
     */
    async getAppDevices(businessId: number | string): Promise<Record<string, unknown>[]> {
        const response = await this.request<Record<string, unknown>[]>(`/api/user/${businessId}/app/devices`, {
            headers: this.buildHeaders(businessId),
        });
        return response.results ?? [];
    }

    /**
     * Downloads a remote file with retries, resolving its contents as ArrayBuffer.
     * @throws {Error} After exhausting the attempts.
     */
    async downloadFile(url: string, options?: WappPollOptions): Promise<ArrayBuffer> {
        const retries = options?.retries ?? DOWNLOAD_RETRIES;
        const delayMs = options?.delayMs ?? DOWNLOAD_DELAY_MS;

        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const response = await fetch(url);
                if (response.ok) {
                    return await response.arrayBuffer();
                }
                console.warn(`Attempt ${attempt} to download file failed with status ${response.status}`);
            } catch (e) {
                console.warn(`Attempt ${attempt} to download file error:`, e);
            }
            await wait(delayMs);
        }
        throw new Error(`Failed to download file after ${retries} attempts from ${url}`);
    }
}

/**
 * Checks whether a GoWapp container answers at all. Lenient by design: any HTTP
 * response means the container is up; only network failures/timeouts mean down.
 * When no explicit baseUrl is given, the gateway origin comes from
 * NEXT_PUBLIC_WAPP_API_URL and, if a deviceId is provided, the probe targets
 * that business's Traefik route (/api/user/{deviceId}/devices).
 */
export async function checkWappHealth(
    baseUrl?: string,
    options?: { deviceId?: number | string; user?: string; password?: string; timeoutMs?: number },
): Promise<boolean> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), options?.timeoutMs ?? 5000);
    try {
        const user = options?.user ?? process.env.WAPP_USER ?? 'admin';
        const password = options?.password ?? process.env.WAPP_PASSWORD ?? 'admin';
        const origin = baseUrl || process.env.NEXT_PUBLIC_WAPP_API_URL || DEFAULT_BASE_URL;
        const target = options?.deviceId != null
            ? `${origin}/api/user/${options.deviceId}/devices`
            : `${origin}/devices`;
        await fetch(target, {
            headers: { 'Authorization': `Basic ${btoa(`${user}:${password}`)}` },
            signal: controller.signal,
        });
        return true;
    } catch {
        return false;
    } finally {
        clearTimeout(timer);
    }
}
