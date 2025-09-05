import { NextResponse } from 'next/server';

/**
 * Development-only API route
 * In production, all requests go directly to Railway backend
 * This endpoint is only used during local development
 */
export async function POST(): Promise<NextResponse> {
  // In production, this endpoint should not be called
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { 
        error: 'This endpoint is disabled in production',
        message: 'Please use the Railway backend directly',
        backend_url: process.env.NEXT_PUBLIC_BACKEND_URL || 'Backend URL not configured'
      },
      { status: 501 }
    );
  }

  // For development, return a helpful message
  return NextResponse.json(
    { 
      error: 'Development mode',
      message: 'This endpoint requires local Python setup for development',
      instructions: [
        'Install: pip install rembg onnxruntime',
        'Ensure backend/remove_background.py exists',
        'For production, deploy to Railway backend'
      ]
    },
    { status: 501 }
  );
}