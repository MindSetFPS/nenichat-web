import { SupabaseClient } from '@supabase/supabase-js';
import { IContainerRepository } from '@/Nenichat/Containers/Domain/IContainerRepository';
import { Wapp } from '@/Nenichat/Wapp';

/**
 * Polls the WhatsApp gateway for a fresh login QR code and persists it:
 * uploads the image to the Supabase Storage `qr` bucket, saves its public
 * URL via the repository, and marks the container as deployed. On any
 * failure the container is marked as errored.
 *
 * @returns {Promise<boolean>} Whether a QR code was fetched and stored.
 */
export async function fetchAndStoreQrCode(
    supabase: SupabaseClient,
    repository: IContainerRepository,
    businessId: number,
): Promise<boolean> {
    const dokployHost = process.env.DOKPLOY_SERVER_URL ? new URL(process.env.DOKPLOY_SERVER_URL).hostname : 'localhost';
    const wapp = new Wapp({
        baseUrl: `http://${dokployHost}`,
        user: 'admin',
        password: 'admin',
    });

    const qrImageLink = await wapp.getLoginQrLink(businessId);
    if (!qrImageLink) {
        console.error("Failed to retrieve QR code after retries");
        await repository.updateContainerState(businessId, 'error');
        return false;
    }

    try {
        const imageBuffer = await wapp.downloadFile(qrImageLink);

        const fileName = `qr-${businessId}-${Date.now()}.png`;
        const { error: uploadError } = await supabase.storage
            .from('qr')
            .upload(fileName, imageBuffer, {
                contentType: 'image/png',
                upsert: true
            });

        if (uploadError) {
            throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('qr')
            .getPublicUrl(fileName);

        console.log("QR Image uploaded to:", publicUrl);

        await repository.updateQrCode(businessId, publicUrl);
        await repository.updateContainerState(businessId, 'deployed');
        return true;
    } catch (error) {
        console.error("Error processing QR code image:", error);
        await repository.updateContainerState(businessId, 'error');
        return false;
    }
}
