import { IContact } from "@/Nenichat/Contacts/domain/IContact";

/*
* Given an audience, returns a list of contacts that belong to that audience.
* @param audienceId - The ID of the audience.
* @returns A list of contacts that belong to the audience.
*/
export const getAudienceMembers = async (audienceId: string) => {
    const response = await fetch(`/api/audiences/${audienceId}/members`);
    if (!response.ok) {
        throw new Error("Failed to fetch audience members");
    }
    const data = await response.json() as IContact[];
    return data;
};  