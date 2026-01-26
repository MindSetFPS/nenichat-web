import { IAudience } from "../domain/IAudience";

/*
* Given an audience ID, returns the audience details.
* @param id - The ID of the audience.
* @returns The audience details.
*/
export const getAudienceDetails = async (id: string) => {
    const response = await fetch(`/api/audiences/${id}`);
    if (!response.ok) {
        if (response.status === 404) {
            return null;
        }
        throw new Error("Failed to fetch audience details");
    }
    const data = await response.json() as IAudience;
    return data;
};