import { NextResponse } from 'next/server';
import { contactRepository } from '@/Nenichat/Contacts/infra/persistance/ContactRepository';

/**
 * @swagger
 * /api/contacts/candidates:
 *   get:
 *     summary: Get contacts that are candidates for merging
 *     description: Retrieves a list of contacts where either the phone_number or lid is null, indicating they might be incomplete and candidates for merging.
 *     responses:
 *       200:
 *         description: A list of contact merge candidates.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/IContact'
 *       500:
 *         description: Internal server error.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = (page - 1) * limit;

    const { contacts, total } = await contactRepository.findMergeCandidates(offset, limit);

    return NextResponse.json({
      data: contacts,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching merge candidates:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
