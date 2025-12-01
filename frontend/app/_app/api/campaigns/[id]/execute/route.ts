
import { NextRequest, NextResponse } from "next/server";
import { ICampaign } from "@/Nenichat/Campaigns/domain/ICampaign";
import { campaignRepository } from "@/Nenichat/Campaigns/infra/persistance/CampaignRepository";
import { audienceContactRepository } from "@/Nenichat/Audiences/infra/persistance/AudienceContactRepository";
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
  try {
    const { id: campaignId } = await params;
    if (!campaignId) {
      return NextResponse.json(
        { message: "Campaign ID is required" },
        { status: 400 }
      );
    }

    const campaign: ICampaign | null = await campaignRepository.findById(
      campaignId,
      true,
      true
    );

    if (!campaign) {
      return NextResponse.json(
        { message: "Campaign not found" },
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
        await audienceContactRepository.findByAudienceId(audienceId);
      allContacts.push(...contacts);
    }

    const uniqueContacts = allContacts.reduce((acc, current) => {
      if (!acc.find((item) => item.id === current.id)) {
        acc.push(current);
      }
      return acc;
    }, [] as IContact[]);

    uniqueContacts.forEach(async (contact: IContact) => {
      if (contact.phone_number && campaign.message) {
        await SendMessage(contact.phone_number, campaign.message);
      }
    });

    campaign.executed_at = new Date().toISOString();
    await campaignRepository.update(campaign);

    return NextResponse.json({ message: "Campaign executed successfully" });
  } catch (error) {
    console.error("Error executing campaign:", error);
    return NextResponse.json(
      { message: "Error executing campaign" },
      { status: 500 }
    );
  }
}
