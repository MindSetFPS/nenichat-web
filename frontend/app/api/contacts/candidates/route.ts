import { NextResponse } from 'next/server';
import { contactRepository } from '@/repository/ContactRepository';

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
export async function GET() {
  try {
    const candidates = await contactRepository.findMergeCandidates();
    return NextResponse.json(candidates, { status: 200 });
  } catch (error) {
    console.error('Error fetching merge candidates:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
