import { Pool } from 'pg';
import { ContactRepository } from '../ContactRepository';
import { Contact } from '../Contact';
import { IContact } from '../IContact';

jest.mock('pg');

const mockQuery = jest.fn();
(Pool as jest.Mock).mockImplementation(() => {
  return {
    query: mockQuery,
  };
});

describe('ContactRepository', () => {
  let repository: ContactRepository;
  let pool: Pool;

  beforeEach(() => {
    mockQuery.mockClear();
    pool = new Pool();
    repository = new ContactRepository(pool);
  });

  it('should find a contact by ID', async () => {
    const contactData = {
      id: 1,
      phone_number: '1234567890',
      lid: 'lid1',
      username: 'testuser',
      pushname: 'Test User',
      contact_name: 'Test Contact',
      is_user: false,
      created_at: new Date(),
      updated_at: new Date(),
    };
    mockQuery.mockResolvedValueOnce({ rows: [contactData] });

    const contact = await repository.findById(1n);

    expect(contact).toBeInstanceOf(Contact);
    expect(contact?.id).toBe(1);
    expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM contacts WHERE id = $1', [1n]);
  });

  it('should return null when contact is not found by ID', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const contact = await repository.findById(1n);

    expect(contact).toBeNull();
  });

  it('should find a contact by phone number', async () => {
    const contactData = {
      id: 1,
      phone_number: '1234567890',
      lid: 'lid1',
      username: 'testuser',
      pushname: 'Test User',
      contact_name: 'Test Contact',
      is_user: false,
      created_at: new Date(),
      updated_at: new Date(),
    };
    mockQuery.mockResolvedValueOnce({ rows: [contactData] });

    const contact = await repository.findByPhoneNumber('1234567890');

    expect(contact).toBeInstanceOf(Contact);
    expect(contact?.phone_number).toBe('1234567890');
    expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM contacts WHERE phone_number = $1', [
      '1234567890',
    ]);
  });

  it('should find a contact by lid', async () => {
    const contactData = {
      id: 1,
      phone_number: '1234567890',
      lid: 'lid1',
      username: 'testuser',
      pushname: 'Test User',
      contact_name: 'Test Contact',
      is_user: false,
      created_at: new Date(),
      updated_at: new Date(),
    };
    mockQuery.mockResolvedValueOnce({ rows: [contactData] });

    const contact = await repository.findByLid('lid1');

    expect(contact).toBeInstanceOf(Contact);
    expect(contact?.lid).toBe('lid1');
    expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM contacts WHERE lid = $1', ['lid1']);
  });

  it('should create a new contact', async () => {
    const newContact: Partial<IContact> = {
      phone_number: '1234567890',
      is_user: false,
    };
    const createdContactData = {
      id: 1,
      ...newContact,
      created_at: new Date(),
      updated_at: new Date(),
    };
    mockQuery
      .mockResolvedValueOnce({ rows: [] }) // findByPhoneNumber
      .mockResolvedValueOnce({ rows: [createdContactData] }); // INSERT

    const contact = await repository.save(newContact);

    expect(contact).toBeInstanceOf(Contact);
    expect(contact.id).toBe(1);
    expect(mockQuery).toHaveBeenCalledWith(
      'INSERT INTO contacts (phone_number, lid, username, pushname, contact_name, is_user) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [
        newContact.phone_number,
        undefined,
        undefined,
        undefined,
        undefined,
        newContact.is_user,
      ]
    );
  });

  it('should update an existing contact', async () => {
    const existingContact: IContact = {
      id: 1,
      phone_number: '1234567890',
      lid: 'lid1',
      username: 'testuser',
      pushname: 'Test User',
      contact_name: 'Test Contact',
      is_user: false,
      created_at: new Date(),
      updated_at: new Date(),
    };
    const updatedData: Partial<IContact> = {
      username: 'updateduser',
    };
    const updatedContactData = { ...existingContact, ...updatedData };

    mockQuery
      .mockResolvedValueOnce({ rows: [existingContact] }) // findByPhoneNumber
      .mockResolvedValueOnce({ rows: [updatedContactData] }); // UPDATE

    const contact = await repository.save({
      phone_number: '1234567890',
      ...updatedData,
    });

    expect(contact).toBeInstanceOf(Contact);
    expect(contact.username).toBe('updateduser');
    expect(mockQuery).toHaveBeenCalledWith(
      'UPDATE contacts SET phone_number = $1, lid = $2, username = $3, pushname = $4, contact_name = $5, is_user = $6, updated_at = NOW() WHERE id = $7 RETURNING *',
      [
        existingContact.phone_number,
        existingContact.lid,
        updatedData.username,
        existingContact.pushname,
        existingContact.contact_name,
        existingContact.is_user,
        existingContact.id,
      ]
    );
  });

  it('should list contacts', async () => {
    const contactsData = [
      {
        id: 1,
        phone_number: '1234567890',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        phone_number: '0987654321',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];
    mockQuery.mockResolvedValueOnce({ rows: contactsData });

    const contacts = await repository.list(0, 10);

    expect(contacts.length).toBe(2);
    expect(contacts[0]).toBeInstanceOf(Contact);
    expect(mockQuery).toHaveBeenCalledWith(
      'SELECT * FROM contacts ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [10, 0]
    );
  });
});
