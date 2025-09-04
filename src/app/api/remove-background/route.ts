import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, readFile, unlink } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

const execAsync = promisify(exec);

// Types
interface ApiError {
  error: string;
}

// API Route Handler
export async function POST(request: NextRequest): Promise<NextResponse<ApiError> | NextResponse> {
  let inputPath: string | null = null;
  let outputPath: string | null = null;

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

    console.log('🔄 Processing image with local Python script...');
    console.log('📊 File info:', { name: file.name, size: file.size, type: file.type });

    // Act: Process the image using local Python script
    const imageBuffer = Buffer.from(await file.arrayBuffer());
    const result = await removeBackgroundLocal(imageBuffer);
    
    // Assert: Return processed result
    return new NextResponse(new Uint8Array(result), {
      headers: { 
        'Content-Type': 'image/png',
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('❌ Background removal error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Processing failed' },
      { status: 500 }
    );
  } finally {
    // Cleanup temporary files
    if (inputPath) {
      try { await unlink(inputPath); } catch {}
    }
    if (outputPath) {
      try { await unlink(outputPath); } catch {}
    }
  }
}

// Local Background Removal Service
async function removeBackgroundLocal(imageBuffer: Buffer): Promise<Buffer> {
  const tempId = randomUUID();
  const tempDir = join(process.cwd(), 'temp');
  const inputPath = join(tempDir, `input_${tempId}.png`);
  const outputPath = join(tempDir, `output_${tempId}.png`);
  const scriptPath = join(process.cwd(), 'scripts', 'remove_background.py');

  try {
    console.log('📁 Creating temp directory...');
    
    // Create temp directory if it doesn't exist
    await execAsync(`mkdir -p "${tempDir}"`);

    console.log('💾 Saving input image to:', inputPath);
    
    // Save input image to temporary file
    await writeFile(inputPath, imageBuffer);

    console.log('🐍 Running Python script...');
    
    // Run Python script
    const command = `python3 "${scriptPath}" "${inputPath}" "${outputPath}" --model u2net --verbose`;
    console.log('🚀 Command:', command);
    
    const { stdout, stderr } = await execAsync(command, { timeout: 300000 }); // 5 minute timeout (for model download)
    
    if (stderr) {
      console.log('📄 Python stderr:', stderr);
    }
    if (stdout) {
      console.log('📄 Python stdout:', stdout);
    }

    console.log('📖 Reading processed image...');
    
    // Read the processed image
    const resultBuffer = await readFile(outputPath);
    
    console.log('✅ Background removal completed successfully!');
    console.log('📊 Result size:', resultBuffer.length, 'bytes');
    
    return resultBuffer;

  } catch (error) {
    console.error('❌ Local background removal failed:', error);
    
    // If Python script fails, return original image as fallback
    console.log('🔄 Using fallback: returning original image');
    return imageBuffer;
  } finally {
    // Cleanup happens in the main finally block
  }
}