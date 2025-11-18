import { NextResponse } from 'next/server';
import { contactRepository } from '@/repository/ContactRepository';

/**
 * @swagger
 * /api/contacts/merge:
 *   post:
 *     summary: Merge multiple contacts into a primary contact
 *     description: Merges a list of secondary contacts into a specified primary contact. All related data will be re-assigned to the primary contact, and secondary contacts will be deleted.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - primaryContactId
 *               - secondaryContactIds
 *             properties:
 *               primaryContactId:
 *                 type: string
 *                 format: bigint
 *                 description: The ID of the contact to merge into.
 *               secondaryContactIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: bigint
 *                 description: An array of IDs of contacts to be merged and then deleted.
 *     responses:
 *       200:
 *         description: Contacts merged successfully.
 *       400:
 *         description: Invalid request body or merge parameters.
 *       500:
 *         description: Internal server error during merge operation.
 */
export async function POST(request: Request) {
  try {
    const { primaryContactId, secondaryContactIds } = await request.json();

    if (!primaryContactId || !secondaryContactIds || !Array.isArray(secondaryContactIds) || secondaryContactIds.length === 0) {
      return NextResponse.json({ message: 'Invalid request body. primaryContactId and secondaryContactIds (array) are required.' }, { status: 400 });
    }

    // Convert string IDs to bigint
    const primaryId = BigInt(primaryContactId);
    const secondaryIds = secondaryContactIds.map((id: string) => BigInt(id));

    await contactRepository.mergeContacts(primaryId, secondaryIds);

    return NextResponse.json({ message: 'Contacts merged successfully.' }, { status: 200 });
  } catch (error: any) {
    console.error('Error merging contacts:', error);
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
  }
}
