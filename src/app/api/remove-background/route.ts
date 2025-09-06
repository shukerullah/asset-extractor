import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    
    const response = await fetch('http://localhost:8000/remove-background', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    const blob = await response.blob();
    
    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
      },
    });

  } catch (error) {
    console.error('Background removal failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Backend unavailable',
        message: 'Please start the backend: cd backend && python main.py'
      },
      { status: 500 }
    );
  }
}