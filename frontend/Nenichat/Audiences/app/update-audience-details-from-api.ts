export default async function updateAudienceDetailsFromApi(audienceId: string, name: string, description: string) {
    const response = await fetch(`/api/audiences/${audienceId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, description }),
    });
    return response;
}