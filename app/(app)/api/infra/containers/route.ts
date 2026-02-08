import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { containerService, SupabaseContainerRepository } from '@/Nenichat/Containers';

interface LoginResponse {
    code: string;
    message: string;
    results: {
        qr_duration: number;
        qr_link: string;
        qr_image_link?: string; // Keep for backward compatibility if needed
    };
}

/**
 * GET handler for the infra containers API.
 * Checks for user authentication before proceeding.
 * 
 * @param {NextRequest} request - The incoming request object.
 * @returns {Promise<NextResponse>} The response object.
 */
export async function GET(request: NextRequest) {
    try {
        // Initialize Supabase client
        const supabase = await createServerSupabaseClient();

        // Check for user authentication
        // getUser() is more secure than getSession() as it validates the user with the Supabase API
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || user === null) {
            return NextResponse.json(
                { error: 'Unauthorized', message: 'You must be logged in to access this resource.' },
                { status: 401 }
            );
        }

        // Proceed with the logic for authenticated users
        // For example, fetching data from the database
        // const { data, error } = await supabase.from('your_table').select('*').eq('user_id', user.id);

        return NextResponse.json({
            message: 'Authentication successful',
            userId: user.id,
            timestamp: new Date().toISOString(),
        });

    } catch (error) {
        console.error('Unexpected error in API route:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', message: 'An unexpected error occurred.' },
            { status: 500 }
        );
    }
}

/**
 * POST handler for the infra containers API.
 * Checks for user authentication before proceeding.
 * 
 * @param {NextRequest} request - The incoming request object.
 * @returns {Promise<NextResponse>} The response object.
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        let supaRepo = new SupabaseContainerRepository(supabase);
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || user === null) {
            return NextResponse.json(
                { error: 'Unauthorized', message: 'You must be logged in to perform this action.' },
                { status: 401 }
            );
        }

        const body = await request.json();

        // Perform container creation

        // steps
        // 1. Check if container already exists
        const existingContainer = await supaRepo.getContainerByBusinessId(body.business_id);
        let composeId = existingContainer?.container_id;

        if (!composeId) {
            // 2. create whatsapp container(business_id)
            composeId = await containerService.createContainer(body.business_id);
            await supaRepo.insertContainer(body.business_id, composeId);
        }

        if (composeId) {
            // Helper to wait for a short duration
            const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

            // 2. set initial wapp container(compose_id, business_id, port, source_type="raw")
            const initialWappContainer = await containerService.updateContainerConfiguration(composeId, body.business_id, 6666);
            // wait a few seconds for container initialization
            // 3. deploy whatsapp container(compose_id)
            const deployedWappContainer = await containerService.deployContainer(composeId);
            await wait(6000);
            // 4. Update container info in Supabase
            await supaRepo.updateContainerInfo(body.business_id, composeId, 6666);

            // Helper to retry getting the QR code
            const waitForQrCode = async (retries = 10, delay = 5000): Promise<string | null> => {
                const dokployHost = process.env.DOKPLOY_SERVER_URL ? new URL(process.env.DOKPLOY_SERVER_URL).hostname : 'localhost';
                // Construct the URL. Assuming Traefik exposes it via /api/user/{business_id}
                // or direct port access if configured. Based on templates, it is exposed via Traefik.
                // However, from within the cluster/network/host context, access might differ.
                // For now, attempting via the Dokploy/Traefik host.
                // Note: Protocol might be http or https depending on Traefik config. Assuming http for internal/dev/ip access if no cert.
                const wappUrl = `http://${dokployHost}/api/user/${body.business_id}/app/login`;
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

                                    // If the URL doesn't contain the /api/user/{business_id} prefix, we inject it.
                                    // The container reports its URL based on its internal view, but external access 
                                    // through Traefik requires the specific path prefix.
                                    if (rawUrl.includes('/statics/qrcode/') && !rawUrl.includes(`/api/user/${body.business_id}`)) {
                                        try {
                                            const urlObj = new URL(rawUrl);
                                            qrCodeImageURL = `${urlObj.protocol}//${urlObj.host}/api/user/${body.business_id}${urlObj.pathname}`;
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

            // 5. Poll for QR code and update Supabase (Non-blocking usually, but here we might want to wait a bit to ensure it works)
            // We can fire and forget, or wait. Waiting ensures we don't return success prematurely.
            // Given Step 2 (next step) expects QR code, we should probably try to get it here.

            // Start the polling in background so we don't timeout the request? 
            // Or wait a reasonable amount. Next.js functions have timeouts.
            // Let's wait for a few attempts.
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
                        const fileName = `qr-${body.business_id}-${Date.now()}.png`;
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

                        await supaRepo.updateQrCode(body.business_id, publicUrl);

                    } catch (error) {
                        console.error("Error processing QR code image:", error);
                    }
                } else {
                    console.error("Failed to retrieve QR code after retries");
                }
            })();

            return NextResponse.json({
                success: true,
                message: 'Action performed successfully',
                processedBy: user.id
            });
        } else {
            return NextResponse.json({
                success: false,
                message: 'Action failed',
                processedBy: user.id
            });
        }


    } catch (error) {
        console.error('Unexpected error in POST API route:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', message: 'An unexpected error occurred.' },
            { status: 500 }
        );
    }
}
