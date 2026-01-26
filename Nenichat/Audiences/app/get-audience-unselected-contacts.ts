import { IContact } from "@/Nenichat/Contacts/domain/IContact";
/*
* Given an audience, returns a list of contacts that dont belong to that audience.
* @param audienceId - The ID of the audience.
* @returns A list of contacts that dont belong to the audience.
*/
export const getAudienceUnselectedContacts = async (audienceId: string): Promise<IContact[]> => {
    try {
        const response = await fetch(`/api/audiences/${audienceId}/available-contacts`);
        if (!response.ok) {
            throw new Error("Failed to fetch available contacts");
        }
        return await response.json() as IContact[];
    } catch (error) {
        console.error("Error fetching available contacts:", error);
        return [];
    }
}