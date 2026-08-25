import { GoWappChatRepository } from '@/Nenichat/Chats/infra/api';
import { GoWappMessageRepository } from '@/Nenichat/Messages/infra/api';
import { Wapp } from '@/Nenichat/Wapp';

jest.setTimeout(15000);

function envFromDotEnv(key: string): string | undefined {
    const line = require('fs')
        .readFileSync('.env', 'utf8')
        .split('\n')
        .find((l: string) => l.startsWith(`${key}=`));
    return line ? line.slice(key.length + 1).trim() : undefined;
}

const GATEWAY_URL = envFromDotEnv('NEXT_PUBLIC_WAPP_API_URL');
const USER = envFromDotEnv('WAPP_USER');
const PASSWORD = envFromDotEnv('WAPP_PASSWORD');
const BUSINESS_ID = '115';

const describeIfConfigured = GATEWAY_URL ? describe : describe.skip;

describeIfConfigured('Wapp client (live gateway)', () => {
    const wapp = new Wapp({
        baseUrl: GATEWAY_URL,
        user: USER,
        password: PASSWORD,
    });

    it('getAppInfo() answers', async () => {
        const info = await wapp.getAppInfo(BUSINESS_ID);
        console.log('app info:', JSON.stringify(info));
        expect(info).toBeTruthy();
    });

    it('getAppDevices() includes the business device', async () => {
        const devices = await wapp.getAppDevices(BUSINESS_ID);
        console.log('devices:', JSON.stringify(devices));
        expect(devices.some((d) => d.device === BUSINESS_ID)).toBe(true);
    });
});

describeIfConfigured('GoWappChatRepository (live gateway)', () => {
    const repo = new GoWappChatRepository({
        baseUrl: GATEWAY_URL,
        user: USER,
        password: PASSWORD,
        deviceId: BUSINESS_ID,
    });

    it('list() returns chats', async () => {
        const chats = await repo.list(0, 26);
        console.log(`fetched ${chats.length} chats`);
        expect(chats.length).toBeGreaterThan(0);
        expect(chats[0].jid).toContain('@');
    });
});

describeIfConfigured('GoWappMessageRepository (live gateway)', () => {
    const chatRepo = new GoWappChatRepository({
        baseUrl: GATEWAY_URL,
        user: USER,
        password: PASSWORD,
        deviceId: BUSINESS_ID,
    });
    const msgRepo = new GoWappMessageRepository({
        baseUrl: GATEWAY_URL,
        user: USER,
        password: PASSWORD,
        deviceId: BUSINESS_ID,
    });

    it('findByChatId() returns messages for a known chat', async () => {
        const chats = await chatRepo.list(0, 26);
        const group = chats.find((c) => c.is_group);

        if (!group) {
            console.log('no group chat available to test against, skipping');
            return;
        }

        const messages = await msgRepo.findByChatId(group.jid, 0, 5);
        console.log(`fetched ${messages.length} messages for ${group.jid}`);
        expect(Array.isArray(messages)).toBe(true);
    });
});
