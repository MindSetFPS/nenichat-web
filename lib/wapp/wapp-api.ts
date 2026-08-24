import type { WappAppInfo } from "@/Nenichat/Wapp";

export type { WappAppInfo };

export interface WappDevice {
    name?: string;
    device?: string;
}

/**
 * Minimal shape of a `whatsapp-containers` row needed by Wapp UI components.
 */
export interface WappContainerRef {
    business_id: number;
}

/**
 * Response of GET /api/whatsapp/devices: either linked devices
 * (container marked 'connected') or an empty SUCCESS envelope.
 */
export interface WappDevicesResponse {
    success?: boolean;
    devices?: WappDevice[];
    code?: string;
    message?: string;
    results?: null;
}

export async function getWappInfo(businessId: number): Promise<WappAppInfo | null> {
    try {
        const params = new URLSearchParams({
            businessId: businessId.toString(),
        });

        const response = await fetch(`/api/whatsapp/info?${params}`, {
            credentials: 'include',
        });

        if (!response.ok) {
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching wapp app info:', error);
        return null;
    }
}

export async function getWappDevices(businessId: number): Promise<WappDevicesResponse> {
    const params = new URLSearchParams({
        businessId: businessId.toString(),
    });

    const response = await fetch(`/api/whatsapp/devices?${params}`, {
        credentials: 'include',
    });

    if (!response.ok) {
        const errorText = await response.text();
        const message = `Failed to get devices: ${response.status}: ${errorText}`;
        console.error(message);
        throw new Error(message);
    }

    return await response.json();
}
