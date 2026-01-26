
// A reusable client function to fetch audiences from the API

import { IAudience } from "../domain/IAudience";

export const getAudiences = async () => {
    try {
        const response = await fetch("/api/audiences");
        if (!response.ok) {
            throw new Error("Failed to fetch audiences");
        }
        const data: IAudience[] = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching audiences:", error);
    }
};