/**
 * A reusable client function to get contact audiences from the API
 */

export const getContactAudiences = async (contactId: string) => {
    try {
        const response = await fetch(`/api/contacts/${contactId}/audiences`);
        if (!response.ok) {
            throw new Error("Failed to fetch contact audiences");
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching contact audiences:", error);
    }
};