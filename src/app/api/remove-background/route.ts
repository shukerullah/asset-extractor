import { NextResponse } from 'next/server';

export async function POST(): Promise<NextResponse> {
  return NextResponse.json(
    { 
      error: 'API moved to Railway backend',
      message: 'This endpoint is disabled. Use Railway backend directly.',
      backend_url: process.env.NEXT_PUBLIC_BACKEND_URL || 'Backend URL not configured'
    },
    { status: 501 }
  );
}