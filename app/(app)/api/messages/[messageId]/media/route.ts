import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getBusinessFromUser } from "@/lib/user-auth";
import { Wapp } from "@/Nenichat/Wapp";

/*
  It is a little weird that we need an endpoint to tell the wapp container to download media,
  it will stay for now but maybe i can think of something smarter.

  Another thing is that now we need to think of storage, if a business depends on a lot of media 
  being sent or received, we may hit limits.
*/

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { business, error: authError } = await getBusinessFromUser(supabase);

    if (authError || !business) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messageId } = await params;
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");

    if (!phone) {
      return NextResponse.json({ error: "Missing phone parameter" }, { status: 400 });
    }

    const wapp = new Wapp({ deviceId: String(business.id) });
    const result = await wapp.downloadMessageMedia(messageId, phone);

    if (!result?.file_url) {
      return NextResponse.json({ error: "No media URL returned" }, { status: 404 });
    }

    return NextResponse.json({
      file_url: result.file_url,
      media_type: result.media_type,
      filename: result.filename,
    });
  } catch (error) {
    console.error("Error downloading media:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to download media", details: message },
      { status: 500 }
    );
  }
}
