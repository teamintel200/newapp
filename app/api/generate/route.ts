import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Create new FormData for external API
    const externalFormData = new FormData();
    
    // Copy all form data fields to the external FormData
    for (const [key, value] of formData.entries()) {
      externalFormData.append(key, value);
    }
    
    const response = await fetch(`${API_BASE_URL}/generate`, {
      method: 'POST',
      body: externalFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`External API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error calling generate API:', error);
    return NextResponse.json(
      { error: 'Failed to generate video', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}