import { NextRequest, NextResponse } from 'next/server';
import { updateSuggestionSelection, deleteChatSuggestion } from '@/Nenichat/ChatSuggestions';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { is_selected } = await request.json();
    const suggestionId = BigInt(params.id);

    if (typeof is_selected !== 'boolean') {
      return NextResponse.json(
        { error: 'is_selected must be a boolean' }, 
        { status: 400 }
      );
    }

    const updatedSuggestion = await updateSuggestionSelection(
      suggestionId, 
      is_selected
    );

    if (!updatedSuggestion) {
      return NextResponse.json(
        { error: 'Chat suggestion not found' }, 
        { status: 404 }
      );
    }

    return NextResponse.json(updatedSuggestion);
  } catch (error) {
    console.error('Error updating chat suggestion:', error);
    return NextResponse.json(
      { error: 'Failed to update chat suggestion' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const suggestionId = BigInt(params.id);
    const deleted = await deleteChatSuggestion(suggestionId);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Chat suggestion not found' }, 
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting chat suggestion:', error);
    return NextResponse.json(
      { error: 'Failed to delete chat suggestion' }, 
      { status: 500 }
    );
  }
}