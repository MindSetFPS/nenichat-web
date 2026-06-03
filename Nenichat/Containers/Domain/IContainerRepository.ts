/**
 * Interface for container data persistence.
 * 
 * Possible container states:
 * 'none'        - No container or compose exists at all.
 * 'empty'       - Container created, no compose setup yet.
 * 'created'     - Compose setup done, not yet deployed.
 * 'deployed'    - Deployed, no phone connected.
 * 'connected'   - Deployed + phone connected (WhatsApp session active).
 * 'error'       - Error encountered.
 * 'stopped'     - Stopped (e.g., non-payment).
 * 'unreachable' - Container not responding (nuked/broken). Must be recreated.
 */
export interface IContainerRepository {
    /**
     * Updates the container information in the data store.
     * @param businessId The ID of the business.
     * @param containerId The ID of the container project.
     * @param port The assigned port.
     */
    updateContainerInfo(
        businessId: number,
        containerId: string,
        port: number
    ): Promise<void>;

    /**
     * Updates the QR code for a business container.
     * @param businessId The ID of the business.
     * @param qrCode The QR code string.
     */
    updateQrCode(businessId: number, qrCode: string): Promise<void>;

    /**
     * Updates the container state.
     * @param businessId The ID of the business.
     * @param state The container state.
     */
    updateContainerState(businessId: number, state: string): Promise<void>;

    /**
     * Creates a container row in the database.
     * @param businessId The ID of the business.
     * @param containerId The ID of the container project.
     */
    insertContainer(businessId: number, containerId: string): Promise<void>;

    /**
     * Gets a container by business ID.
     * @param businessId The ID of the business.
     */
    getContainerByBusinessId(businessId: number): Promise<any | null>;

    /**
     * Resets a container record to 'empty' state (clears container_id, QR, phone_id).
     * Used when the container is broken and needs recreation from scratch.
     * @param businessId The ID of the business.
     */
    resetContainer(businessId: number): Promise<void>;
}
