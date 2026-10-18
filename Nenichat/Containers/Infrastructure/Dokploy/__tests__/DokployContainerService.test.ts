import { DokployContainerService } from '../DokployContainerService';

describe('DokployContainerService', () => {
    beforeEach(() => {
        process.env.DOKPLOY_SERVER_URL = 'https://dokploy.test';
        process.env.DOKPLOY_API_KEY = 'test-key';
        process.env.DOKPLOY_PROJECT_ID = 'project-1';
        process.env.DOKPLOY_ENVIRONMENT_ID = 'env-1';
        process.env.WAPP_WEBHOOK_BASE_URL = 'https://hook.test';
        process.env.GOWAPP_USER = 'user';
        process.env.GOWAPP_PASSWORD = 'pass';
    });

    it('throws when an env var is missing', () => {
        delete process.env.DOKPLOY_API_KEY;

        expect(() => new DokployContainerService()).toThrow(
            'Missing Dokploy environment variables: DOKPLOY_API_KEY',
        );
    });

    it('renders the compose file placeholders', () => {
        const service: any = new DokployContainerService();

        const result = service.renderComposeFile(
            'id={business_id} auth={basic_auth} url={webhook_base_url}',
            42,
        );

        expect(result).toBe('id=42 auth=user:pass url=https://hook.test');
    });
});
