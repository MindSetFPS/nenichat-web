export async function getWappDevices(businessId: number): Promise<unknown> {
    const params = new URLSearchParams({
        businessId: businessId.toString(),
    });

    const response = await fetch(`/api/whatsapp/devices?${params}`, {
        credentials: 'include',
    });

    if (response.ok) {
        return await response.json();
    } else {
        const errorText = await response.text();
        const message = `Failed to get devices: ${response.status}: ${errorText}`;
        console.error(message);
        throw new Error(message);
    }
}
