import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export async function POST(request: NextRequest) {
  try {
    const response = await fetch(`${API_BASE_URL}/temp-directory`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`External API error: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error calling temp-directory API:', error);
    return NextResponse.json(
      { error: 'Failed to create project directory' },
      { status: 500 }
    );
  }
}