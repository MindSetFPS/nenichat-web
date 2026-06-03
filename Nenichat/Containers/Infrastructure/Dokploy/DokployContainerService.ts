import { IContainerService } from "../../Domain/IContainerService";
import { INITIAL_COMPOSE_FILE, COMPOSE_FILE_WITH_PHONE } from "./templates";

/**
 * Implementation of IContainerService using Dokploy API.
 */
export class DokployContainerService implements IContainerService {
    private readonly serverUrl: string;
    private readonly apiKey: string;
    private readonly projectId: string;
    private readonly environmentId: string;

    constructor() {
        this.serverUrl = process.env.DOKPLOY_SERVER_URL || "";
        this.apiKey = process.env.DOKPLOY_API_KEY || "";
        this.projectId = process.env.DOCKPLOY_PROJECT_ID || "";
        this.environmentId = process.env.DOCKPLOY_ENVIRONMENT_ID || "";

        if (!this.serverUrl || !this.apiKey || !this.projectId || !this.environmentId) {
            console.warn("Dokploy environment variables are missing. Some container operations may fail.");
        }
    }

    /**
     * Helper to make POST requests to Dokploy API.
     */
    private async post<T>(endpoint: string, payload: any): Promise<T> {
        const response = await fetch(`${this.serverUrl}/api/${endpoint}`, {
            method: "POST",
            headers: {
                "accept": "application/json",
                "x-api-key": this.apiKey,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            return await response.json();
        } else {
            const errorText = await response.text();
            const message = `Dokploy POST ${endpoint} failed with status ${response.status}: ${errorText}`;
            console.error(message);
            throw new Error(message);
        }
    }

    /**
     * Creates a new compose project in Dokploy.
     */
    async createContainer(businessId: number): Promise<string> {
        const payload = {
            name: `wapp-${businessId}-compose`,
            description: `wapp-${businessId}-compose`,
            environmentId: this.environmentId,
            composeType: "docker-compose",
            projectId: this.projectId,
            appName: "test-docker-compose",
        };

        const result = await this.post<{ composeId: string }>("compose.create", payload);
        return result.composeId;
    }

    /**
     * Deploys a compose project in Dokploy.
     */
    async deployContainer(composeId: string): Promise<any> {
        return await this.post("compose.deploy", { composeId });
    }

    /**
     * Updates the compose file and environment variables for a project.
     */
    async updateContainerConfiguration(
        composeId: string,
        businessId: number,
    ): Promise<any> {
        const composeFile = INITIAL_COMPOSE_FILE.replace(/{business_id}/g, businessId.toString())

        const env = `BUSINESS_ID=${businessId}
SUPABASE_URL=\${{project.SUPABASE_URL}}
SUPABASE_KEY=\${{project.SUPABASE_KEY}}
`;

        const payload = {
            composeId,
            composeFile,
            sourceType: "raw",
            env
        };

        return await this.post("compose.update", payload);
    }

    /**
     * Deletes a compose project from Dokploy.
     */
    async deleteContainer(composeId: string): Promise<void> {
        await this.post("compose.delete", { composeId });
    }

    /**
     * Updates the container configuration with a specific phone.
     */
    async updateContainerWithPhone(
        composeId: string,
        businessId: number,
        initialPhone: string,
        phoneId: string
    ): Promise<any> {
        const composeFile = COMPOSE_FILE_WITH_PHONE
            .replace(/{business_id}/g, businessId.toString())
            .replace(/{initial_phone}/g, initialPhone)
            .replace(/{phone_id}/g, phoneId);

        const env = `BUSINESS_ID=${businessId}
SUPABASE_URL=\${{project.SUPABASE_URL}}
SUPABASE_KEY=\${{project.SUPABASE_KEY}}
`;

        const payload = {
            composeId,
            composeFile,
            sourceType: "raw",
            env
        };

        return await this.post("compose.update", payload);
    }
}
