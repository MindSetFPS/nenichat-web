import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { SupabaseContainerRepository } from '@/Nenichat/Containers';

interface LoginResponse {
    code: string;
    message: string;
    results: {
        qr_duration: number;
        qr_link: string;
        qr_code_updated_at: string;
        qr_image_link?: string;
    };
}

/*
Regenerates the QR Code in case a user interrupted the process,
or if the QR code expired. This will trigger the same process as the initial QR code generation, but without creating a new container.
*/
export async function POST(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        const supaRepo = new SupabaseContainerRepository(supabase);
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || user === null) {
            return NextResponse.json(
                { error: 'Unauthorized', message: 'You must be logged in to perform this action.' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { business_id } = body;

        if (!business_id) {
            return NextResponse.json(
                { error: 'Bad Request', message: 'business_id is required.' },
                { status: 400 }
            );
        }

        // Check if container exists
        const existingContainer = await supaRepo.getContainerByBusinessId(business_id);
        if (!existingContainer) {
            return NextResponse.json(
                { error: 'Not Found', message: 'No container found for this business.' },
                { status: 404 }
            );
        }

        const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

        // Helper to retry getting the QR code
        const waitForQrCode = async (retries = 10, delay = 5000): Promise<string | null> => {
            const dokployHost = process.env.DOKPLOY_SERVER_URL ? new URL(process.env.DOKPLOY_SERVER_URL).hostname : 'localhost';
            const wappUrl = `http://${dokployHost}/api/user/${business_id}/app/login`;
            let qrCodeImageURL = "";

            for (let i = 0; i < retries; i++) {
                try {
                    console.log(`Attempt ${i + 1} to fetch QR from ${wappUrl}`);
                    const response = await fetch(wappUrl, {
                        headers: {
                            'Authorization': `Basic ${btoa('admin:admin')}`
                        }
                    });

                    if (!response.ok) {
                        console.warn(`Attempt ${i + 1} server returned status ${response.status}`);
                    } else {
                        const contentType = response.headers.get("content-type");
                        if (contentType && contentType.includes("application/json")) {
                            const data: LoginResponse = await response.json();
                            if (data && data.results && (data.results.qr_link || data.results.qr_image_link)) {
                                const rawUrl = data.results.qr_link || data.results.qr_image_link || "";

                                if (rawUrl.includes('/statics/qrcode/') && !rawUrl.includes(`/api/user/${business_id}`)) {
                                    try {
                                        const urlObj = new URL(rawUrl);
                                        qrCodeImageURL = `${urlObj.protocol}//${urlObj.host}/api/user/${business_id}${urlObj.pathname}`;
                                        console.log("Transformed QR URL to:", qrCodeImageURL);
                                    } catch (e) {
                                        console.error("Error parsing QR URL:", e);
                                        qrCodeImageURL = rawUrl;
                                    }
                                } else {
                                    qrCodeImageURL = rawUrl;
                                }
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
                await wait(delay);
            }
            return qrCodeImageURL || null;
        };

        // QR Code Regeneration Process
        (async () => {
            const qrImageLink = await waitForQrCode();
            if (qrImageLink) {
                try {
                    // Download the image with retries
                    let imageBuffer: ArrayBuffer | null = null;
                    for (let i = 0; i < 5; i++) {
                        try {
                            const imageResponse = await fetch(qrImageLink);
                            if (imageResponse.ok) {
                                imageBuffer = await imageResponse.arrayBuffer();
                                break;
                            }
                            console.warn(`Attempt ${i + 1} to download QR image failed with status ${imageResponse.status}`);
                        } catch (e) {
                            console.warn(`Attempt ${i + 1} to download QR image error:`, e);
                        }
                        await wait(2000);
                    }

                    if (!imageBuffer) {
                        throw new Error(`Failed to fetch QR image after retries from ${qrImageLink}`);
                    }

                    // Upload to Supabase Storage
                    const fileName = `qr-${business_id}-${Date.now()}.png`;
                    const { data: uploadData, error: uploadError } = await supabase.storage
                        .from('qr')
                        .upload(fileName, imageBuffer, {
                            contentType: 'image/png',
                            upsert: true
                        });

                    if (uploadError) {
                        throw uploadError;
                    }

                    // Get Public URL
                    const { data: { publicUrl } } = supabase.storage
                        .from('qr')
                        .getPublicUrl(fileName);

                    console.log("QR Image uploaded to:", publicUrl);

                    await supaRepo.updateQrCode(business_id, publicUrl);
                    await supaRepo.updateContainerState(business_id, 'deployed');
                } catch (error) {
                    console.error("Error processing QR code image:", error);
                    await supaRepo.updateContainerState(business_id, 'error');
                }
            } else {
                console.error("Failed to retrieve QR code after retries");
                await supaRepo.updateContainerState(business_id, 'error');
            }
        })();

        return NextResponse.json({
            success: true,
            message: 'QR code regeneration initiated successfully',
            processedBy: user.id
        });

    } catch (error) {
        console.error('Unexpected error in QR regeneration API route:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', message: 'An unexpected error occurred.' },
            { status: 500 }
        );
    }
}