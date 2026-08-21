import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getBusinessFromUser } from '@/lib/user-auth';
import { SupabaseTemplateRepository } from '@/Nenichat/Templates/infra/persistance/SupabaseTemplateRepository';

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { business, error: authError } = await getBusinessFromUser(supabase);

  if (authError || !business) {
    return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
  }

  try {
    const repo = new SupabaseTemplateRepository(supabase);
    const templates = await repo.list(business.id);
    return NextResponse.json(templates);
  } catch (error: any) {
    console.error('Error listing templates:', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { business, error: authError } = await getBusinessFromUser(supabase);

  if (authError || !business) {
    return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, message } = await request.json();

    if (!name || !message) {
      return NextResponse.json({ error: 'Name and message are required' }, { status: 400 });
    }

    const repo = new SupabaseTemplateRepository(supabase);
    const template = await repo.create(business.id, { name, message });
    return NextResponse.json(template, { status: 201 });
  } catch (error: any) {
    console.error('Error creating template:', error);
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}
