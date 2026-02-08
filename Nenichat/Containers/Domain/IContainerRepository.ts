/**
 * Interface for container data persistence.
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
}
