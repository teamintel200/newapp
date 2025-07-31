import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tempDirName = searchParams.get('tempDirName');

  if (!tempDirName) {
    return NextResponse.json(
      { error: 'tempDirName parameter is required' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/status?tempDirName=${tempDirName}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status === 200) {
      const data = await response.json();
      console.log(data.status);
      if (data.status === "COMPLETED") {
        return NextResponse.json({ status: 'completed' }, { status: 200 });
      } else if (data.status === "PROCESSING") {
        return NextResponse.json({ status: 'processing' }, { status: 200 });
      } else {
        return NextResponse.json(
          { error: 'Unknown status from external API' },
          { status: 200 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Unexpected response from external API' },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Error checking job status:', error);
    return NextResponse.json(
      { error: 'Failed to check job status' },
      { status: 500 }
    );
  }
}