import { NextResponse } from "next/server";
import { audienceRepository } from "@/Nenichat/Audiences/infra/persistance/AudienceRepository";
import { IAudience } from "@/Nenichat/Audiences/domain/IAudience";

export async function GET() {
  try {
    const audiences = await audienceRepository.findAll();
    return new Response(JSON.stringify(audiences));
  } catch (error) {
    console.error("Error fetching audiences:", error);
    return NextResponse.json(
      { message: "Error fetching audiences" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, description } = await request.json();
    if (!name || !description) {
      return NextResponse.json(
        { message: "Name and description are required" },
        { status: 400 }
      );
    }

    const newAudience: IAudience = {
      id: 0, // ID will be assigned by the database
      name,
      description,
      created_at: new Date(),
    };
    const createdAudience = await audienceRepository.create(newAudience);
    return NextResponse.json(createdAudience, { status: 201 });
  } catch (error) {
    console.error("Error creating audience:", error);
    return NextResponse.json(
      { message: "Error creating audience" },
      { status: 500 }
    );
  }
}
