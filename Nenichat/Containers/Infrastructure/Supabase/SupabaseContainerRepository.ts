import { supabase } from "@/lib/supabase";
import { IContainerRepository } from "../../Domain/IContainerRepository";

/**
 * Implementation of IContainerRepository using Supabase.
 */
export class SupabaseContainerRepository implements IContainerRepository {
    /**
     * Updates the container project ID and external port for a business.
     */
    async updateContainerInfo(
        businessId: number,
        containerId: string,
        port: number
    ): Promise<void> {
        const { error } = await supabase
            .from("whatsapp-containers")
            .update({
                container_id: containerId,
                port: port
            })
            .eq("business_id", businessId);

        if (error) {
            console.error("Error updating WhatsApp container in Supabase:", error);
            throw error;
        }
    }
}
