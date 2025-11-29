/**
 * A function that updates de audiences of a contact.
 */
export async function updateContactAudiences(contactId: string, audiencesIds: string[]) {
    const response = await fetch(`/api/contacts/${contactId}/audiences`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ audiencesIds: audiencesIds }),
    });
    if (!response.ok) {
        throw new Error('Failed to update contact audiences');
    }
    return response.json();
}