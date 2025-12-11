export async function deleteOrder(orderId: number) {
    const res = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
    });

    if (!res.ok) {
        throw new Error("Failed to delete order");
    }
}