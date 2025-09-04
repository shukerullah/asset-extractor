import { NextRequest, NextResponse } from 'next/server';

// Types
interface ApiError {
  error: string;
}

// API Route Handler
export async function POST(request: NextRequest): Promise<NextResponse<ApiError> | NextResponse> {
  try {
    // Arrange: Get form data and validate file
    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Act: Process the image
    const imageBuffer = Buffer.from(await file.arrayBuffer());
    const result = await removeBackgroundHF(imageBuffer);
    
    // Assert: Return processed result or fallback
    if (result) {
      return new NextResponse(new Uint8Array(result), {
        headers: { 
          'Content-Type': 'image/png',
          'Cache-Control': 'no-cache'
        }
      });
    } else {
      // Fallback: return original image
      return new NextResponse(new Uint8Array(imageBuffer), {
        headers: { 
          'Content-Type': 'image/png',
          'Cache-Control': 'no-cache'
        }
      });
    }

  } catch (error) {
    console.error('Background removal error:', error);
    return NextResponse.json(
      { error: 'Processing failed' },
      { status: 500 }
    );
  }
}

// Background Removal Service
async function removeBackgroundHF(imageBuffer: Buffer): Promise<Buffer | null> {
  try {
    // Arrange: Prepare headers and API call
    const headers: HeadersInit = {
      'Content-Type': 'application/octet-stream',
    };

    if (process.env.HUGGINGFACE_API_TOKEN) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`;
    }

    // Act: Call Hugging Face API
    const response = await fetch('https://api-inference.huggingface.co/models/briaai/RMBG-1.4', {
      method: 'POST',
      headers,
      body: new Uint8Array(imageBuffer)
    });

    // Assert: Check response and return result
    if (!response.ok) {
      throw new Error(`HuggingFace API error: ${response.status}`);
    }

    const result = await response.arrayBuffer();
    return Buffer.from(result);

  } catch (error) {
    console.error('HuggingFace API failed:', error);
    return null;
  }
}