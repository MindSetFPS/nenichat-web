import { campaignRepository } from '../CampaignRepository';
import { pool } from '../db';
import { ICampaign } from '../../dto/ICampaign';

describe('CampaignRepository - Integration', () => {
  let createdCampaign: ICampaign | null = null;

  afterEach(async () => {
    if (createdCampaign) {
      await pool.query('DELETE FROM campaigns WHERE id = $1', [createdCampaign.id]);
      createdCampaign = null;
    }
  });

  afterAll(async () => {
    await pool.end();
  });

  it('should create a new campaign', async () => {
    const newCampaignData = {
      name: 'Test Campaign',
      description: 'This is a test campaign.',
      run_at: new Date().toISOString(),
    };

    createdCampaign = await campaignRepository.create(newCampaignData);

    expect(createdCampaign).not.toBeNull();
    expect(createdCampaign.id).toBeDefined();
    expect(createdCampaign.name).toBe(newCampaignData.name);
    expect(createdCampaign.description).toBe(newCampaignData.description);
  });

  it('should create a new campaign with executed_at', async () => {
    const newCampaignData = {
      name: 'Test Campaign Executed',
      description: 'This is a test campaign with executed_at.',
      run_at: new Date().toISOString(),
      executed_at: new Date().toISOString(),
    };

    createdCampaign = await campaignRepository.create(newCampaignData);

    expect(createdCampaign).not.toBeNull();
    expect(createdCampaign.id).toBeDefined();
    expect(createdCampaign.executed_at).toBeDefined();
  });

  it('should find a campaign by ID', async () => {
    const newCampaignData = {
      name: 'Test Campaign for Find',
      description: 'This is a test campaign.',
    };
    createdCampaign = await campaignRepository.create(newCampaignData);
    expect(createdCampaign).not.toBeNull();
    if (!createdCampaign) return;

    const foundCampaign = await campaignRepository.findById(createdCampaign.id);

    expect(foundCampaign).not.toBeNull();
    expect(foundCampaign?.id).toBe(createdCampaign.id);
    expect(foundCampaign?.name).toBe(createdCampaign.name);
  });

  it('should update a campaign', async () => {
    const newCampaignData = {
      name: 'Test Campaign to Update',
      description: 'This is a test campaign.',
    };
    createdCampaign = await campaignRepository.create(newCampaignData);
    expect(createdCampaign).not.toBeNull();
    if (!createdCampaign) return;

    const updatedData = {
      id: createdCampaign.id,
      name: 'Updated Campaign Name',
    };

    const updatedCampaign = await campaignRepository.update(updatedData);

    expect(updatedCampaign).not.toBeNull();
    expect(updatedCampaign.id).toBe(createdCampaign.id);
    expect(updatedCampaign.name).toBe(updatedData.name);
  });

  it('should list campaigns', async () => {
    const newCampaignData = {
      name: 'Test Campaign for List',
      description: 'This is a test campaign.',
    };
    createdCampaign = await campaignRepository.create(newCampaignData);
    expect(createdCampaign).not.toBeNull();

    const campaigns = await campaignRepository.list(0, 10);

    expect(campaigns).toBeInstanceOf(Array);
    expect(campaigns.length).toBeGreaterThan(0);
    const found = campaigns.find(c => c.id === createdCampaign?.id);
    expect(found).toBeDefined();
  });
});
