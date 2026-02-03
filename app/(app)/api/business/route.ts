
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * POST handler for creating a new business.
 * 
 * @param {NextRequest} request - The incoming request containing business details.
 * @returns {Promise<NextResponse>} A JSON response containing the created business or an error message.
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, email } = await request.json();

        if (!name) {
            return NextResponse.json({ error: 'Business name is required' }, { status: 400 });
        }

        const { data: business, error: businessError } = await supabase
            .from('business')
            .insert([
                {
                    name,
                    email: email || user.email,
                    owner_id: user.id
                }
            ])
            .select()
            .single();

        if (businessError) {
            console.error('Error creating business:', businessError);
            return NextResponse.json({ error: businessError.message }, { status: 500 });
        }

        return NextResponse.json(business);
    } catch (error) {
        console.error('Unexpected error in business API:', error);
        return NextResponse.json({ error: 'Failed to create business' }, { status: 500 });
    }
}

/**
 * GET handler for retrieving the user's business.
 */
export async function GET() {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: businesses, error: businessError } = await supabase
            .from('business')
            .select('*')
            .eq('owner_id', user.id)
            .limit(1);

        if (businessError) {
            console.error('Error fetching business:', businessError);
            return NextResponse.json({ error: businessError.message }, { status: 500 });
        }

        const business = businesses && businesses.length > 0 ? businesses[0] : null;
        return NextResponse.json(business);
    } catch (error) {
        console.error('Unexpected error in business API:', error);
        return NextResponse.json({ error: 'Failed to fetch business' }, { status: 500 });
    }
}
