import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileName: string }> }
) {
  try {
    const { fileName } = await params;

    const response = await fetch(`${API_BASE_URL}/download/${fileName}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`External API error: ${response.status}`);
    }

    // Get the file as a stream
    const fileStream = response.body;
    
    if (!fileStream) {
      throw new Error('No file content received');
    }

    // Set appropriate headers for file download
    const headers = new Headers();
    headers.set('Content-Type', 'video/mp4');
    headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
    
    // Copy headers from the external API response if they exist
    const contentLength = response.headers.get('content-length');
    if (contentLength) {
      headers.set('Content-Length', contentLength);
    }

    return new NextResponse(fileStream, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Error downloading file:', error);
    return NextResponse.json(
      { error: 'Failed to download file' },
      { status: 500 }
    );
  }
}