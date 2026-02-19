import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { SupabaseCampaignRepository } from '@/Nenichat/Campaigns/infra/persistance/SupabaseCampaignRepository';
import { SupabaseAudienceContactRepository } from '@/Nenichat/Audiences/infra/persistance/SupabaseAudienceContactRepository';
import { getBusinessFromUser } from '@/lib/user-auth';
import { IContact } from "@/Nenichat/Contacts/domain/IContact";
import SendMessage from "@/Nenichat/Messages/app/send-message";

/**
 * Executes a campaign by sending messages to all contacts in the audience.
 * @param req The Next.js request object.
 * @param params The route parameters.
 * @returns A Next.js response object.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerSupabaseClient();
  const { business, error: authError } = await getBusinessFromUser(supabase);

  if (authError || !business) {
    return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
  }

  const campaignRepository = new SupabaseCampaignRepository(supabase);
  const audienceContactRepository = new SupabaseAudienceContactRepository(supabase);

  try {
    const { id: campaignId } = await params;
    if (!campaignId) {
      return NextResponse.json(
        { message: "Campaign ID is required" },
        { status: 400 }
      );
    }

    const campaign = await campaignRepository.findById(business.id, campaignId);

    if (!campaign) {
      return NextResponse.json(
        { message: "Campaign not found or unauthorized" },
        { status: 404 }
      );
    }

    if (!campaign.audienceIds || campaign.audienceIds.length === 0) {
      console.log("No audiences for this campaign");
      return NextResponse.json({ message: "Campaign has no audiences" });
    }

    let allContacts: IContact[] = [];

    for (const audienceId of campaign.audienceIds) {
      const contacts: IContact[] =
        await audienceContactRepository.findByAudienceId(business.id, audienceId);
      allContacts.push(...contacts);
    }

    const uniqueContacts = allContacts.reduce((acc, current) => {
      if (!acc.find((item) => item.id === current.id)) {
        acc.push(current);
      }
      return acc;
    }, [] as IContact[]);

    // Note: SendMessage is currently a placeholder/legacy in this codebase
    for (const contact of uniqueContacts) {
      if (contact.phone_number && campaign.message) {
        await SendMessage(contact.phone_number, campaign.message);
      }
    }

    // Update next_run_at if needed, or similar metadata
    const campaignToUpdate = {
      ...campaign,
      next_run_at: new Date()
    };
    await campaignRepository.update(business.id, campaignToUpdate);

    return NextResponse.json({ message: "Campaign executed successfully" });
  } catch (error: any) {
    console.error("Error executing campaign:", error);
    return NextResponse.json(
      { message: "Error executing campaign", details: error.message },
      { status: 500 }
    );
  }
}
