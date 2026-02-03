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
}
