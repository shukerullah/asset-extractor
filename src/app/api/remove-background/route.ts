import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, readFile, unlink, access, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { backgroundRemovalLimiter } from '@/utils/rate-limiter';

const execAsync = promisify(exec);

// Constants for better maintainability
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const PYTHON_TIMEOUT = 300000; // 5 minutes
const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp'];

// Types
interface ApiError {
  error: string;
  details?: string;
}

interface ProcessingStats {
  inputSize: number;
  outputSize: number;
  processingTime: number;
  model: string;
}

// API Route Handler
export async function POST(request: NextRequest): Promise<NextResponse<ApiError> | NextResponse> {
  const tempPaths = { input: null as string | null, output: null as string | null };

  const startTime = Date.now();
  
  // Rate limiting check
  const clientIp = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown';
  const rateLimitResult = backgroundRemovalLimiter.check(clientIp);
  
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { 
        error: 'Rate limit exceeded', 
        details: `Too many requests. Try again after ${new Date(rateLimitResult.resetTime).toLocaleTimeString()}` 
      },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
        }
      }
    );
  }
  
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

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { 
          error: 'File too large', 
          details: `Maximum file size is ${MAX_FILE_SIZE / 1024 / 1024}MB` 
        },
        { status: 413 }
      );
    }

    // Validate file type
    if (!SUPPORTED_FORMATS.includes(file.type)) {
      return NextResponse.json(
        { 
          error: 'Unsupported file format', 
          details: `Supported formats: ${SUPPORTED_FORMATS.join(', ')}` 
        },
        { status: 415 }
      );
    }

    console.log('🔄 Processing image with local Python script...');
    console.log('📊 File info:', { name: file.name, size: file.size, type: file.type });

    // Act: Process the image using local Python script
    const imageBuffer = Buffer.from(await file.arrayBuffer());
    const { result, stats } = await removeBackgroundLocal(imageBuffer, tempPaths);
    
    const processingTime = Date.now() - startTime;
    console.log('📊 Processing completed:', {
      ...stats,
      totalTime: `${processingTime}ms`
    });
    
    // Assert: Return processed result
    return new NextResponse(new Uint8Array(result), {
      headers: { 
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'X-Processing-Time': processingTime.toString(),
        'X-Input-Size': stats.inputSize.toString(),
        'X-Output-Size': stats.outputSize.toString(),
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': rateLimitResult.resetTime.toString()
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
    if (tempPaths.input) {
      try { await unlink(tempPaths.input); } catch {}
    }
    if (tempPaths.output) {
      try { await unlink(tempPaths.output); } catch {}
    }
  }
}

// Local Background Removal Service
async function removeBackgroundLocal(
  imageBuffer: Buffer, 
  tempPaths: { input: string | null; output: string | null }
): Promise<{ result: Buffer; stats: ProcessingStats }> {
  const startTime = Date.now();
  const tempId = randomUUID();
  const tempDir = join(process.cwd(), 'temp');
  const inputPath = join(tempDir, `input_${tempId}.png`);
  const outputPath = join(tempDir, `output_${tempId}.png`);
  const scriptPath = join(process.cwd(), 'scripts', 'remove_background.py');

  // Store paths for cleanup
  tempPaths.input = inputPath;
  tempPaths.output = outputPath;

  try {
    console.log('📁 Creating temp directory...');
    
    // Create temp directory if it doesn't exist (using fs.mkdir for better error handling)
    try {
      await access(tempDir);
    } catch {
      await mkdir(tempDir, { recursive: true });
    }

    // Verify Python script exists
    try {
      await access(scriptPath);
    } catch {
      throw new Error(`Python script not found at: ${scriptPath}`);
    }

    console.log('💾 Saving input image to:', inputPath);
    
    // Save input image to temporary file
    await writeFile(inputPath, imageBuffer);

    console.log('🐍 Running Python script...');
    
    // Run Python script with improved error handling
    const command = `python3 "${scriptPath}" "${inputPath}" "${outputPath}" --model u2net --verbose`;
    console.log('🚀 Command:', command);
    
    const { stdout, stderr } = await execAsync(command, { 
      timeout: PYTHON_TIMEOUT,
      maxBuffer: 1024 * 1024 // 1MB buffer for output
    });
    
    if (stderr && !stderr.includes('UserWarning')) {
      console.warn('⚠️  Python stderr:', stderr);
    }
    if (stdout) {
      console.log('📄 Python stdout:', stdout);
    }

    console.log('📖 Reading processed image...');
    
    // Verify output file exists
    try {
      await access(outputPath);
    } catch {
      throw new Error('Python script did not create output file');
    }
    
    // Read the processed image
    const resultBuffer = await readFile(outputPath);
    
    const processingTime = Date.now() - startTime;
    const stats: ProcessingStats = {
      inputSize: imageBuffer.length,
      outputSize: resultBuffer.length,
      processingTime,
      model: 'u2net'
    };
    
    console.log('✅ Background removal completed successfully!');
    console.log('📊 Stats:', stats);
    
    return { result: resultBuffer, stats };

  } catch (error) {
    console.error('❌ Local background removal failed:', error);
    
    // Enhanced fallback with proper error logging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.log('🔄 Using fallback: returning original image due to:', errorMessage);
    
    const fallbackStats: ProcessingStats = {
      inputSize: imageBuffer.length,
      outputSize: imageBuffer.length,
      processingTime: Date.now() - startTime,
      model: 'fallback'
    };
    
    return { result: imageBuffer, stats: fallbackStats };
  }
}