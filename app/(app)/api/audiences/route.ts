import { NextResponse } from "next/server";
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { SupabaseAudienceRepository } from '@/Nenichat/Audiences/infra/persistance/SupabaseAudienceRepository';
import { getBusinessFromUser } from '@/lib/user-auth';

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { business, error: authError } = await getBusinessFromUser(supabase);

  if (authError || !business) {
    return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
  }

  const audienceRepository = new SupabaseAudienceRepository(supabase);

  try {
    const audiences = await audienceRepository.findAll(business.id);
    return NextResponse.json(audiences);
  } catch (error: any) {
    console.error("Error fetching audiences:", error);
    return NextResponse.json(
      { message: "Error fetching audiences", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { business, error: authError } = await getBusinessFromUser(supabase);

  if (authError || !business) {
    return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 });
  }

  const audienceRepository = new SupabaseAudienceRepository(supabase);

  try {
    const { name, description } = await request.json();
    if (!name) {
      return NextResponse.json(
        { message: "Name is required" },
        { status: 400 }
      );
    }

    const createdAudience = await audienceRepository.create(business.id, {
      name,
      description
    } as any); // cast to any because create handles Omit

    return NextResponse.json(createdAudience, { status: 201 });
  } catch (error: any) {
    console.error("Error creating audience:", error);
    return NextResponse.json(
      { message: "Error creating audience", details: error.message },
      { status: 500 }
    );
  }
}
