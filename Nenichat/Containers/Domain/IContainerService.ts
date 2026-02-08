/**
 * Interface for container orchestration services.
 */
export interface IContainerService {
    /**
     * Creates a new container (project/compose) for a business.
     * @param businessId The ID of the business.
     * @returns The ID of the created container project.
     */
    createContainer(businessId: number): Promise<string>;

    /**
     * Deploys an existing container project.
     * @param composeId The ID of the compose project.
     * @returns The deployment result.
     */
    deployContainer(composeId: string): Promise<any>;

    /**
     * Updates the container configuration (compose file and environment variables).
     * @param composeId The ID of the compose project.
     * @param businessId The ID of the business.
     * @param port The port to expose.
     * @returns The update result.
     */
    updateContainerConfiguration(
        composeId: string,
        businessId: number,
        port: number
    ): Promise<any>;
    /**
     * Updates the container configuration with a specific phone.
     * @param composeId The ID of the compose project.
     * @param businessId The ID of the business.
     * @param port The port to expose.
     * @param initialPhone The initial phone number.
     * @param phoneId The ID of the phone in the system.
     * @returns The update result.
     */
    updateContainerWithPhone(
        composeId: string,
        businessId: number,
        port: number,
        initialPhone: string,
        phoneId: string
    ): Promise<any>;
}
