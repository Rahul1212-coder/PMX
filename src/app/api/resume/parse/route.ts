import { NextResponse } from 'next/server';
import { parseResumeDocument } from '@/lib/resume/parser';

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No resume file provided. Please select a PDF or DOCX file to upload.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds maximum limit of 10MB.` },
        { status: 400 }
      );
    }

    const fileName = file.name || 'resume.pdf';
    const mimeType = file.type || '';
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    try {
      const parsedDoc = await parseResumeDocument({
        fileName,
        fileSize: file.size,
        buffer,
        mimeType,
      });

      return NextResponse.json({
        success: true,
        document: parsedDoc,
      });
    } catch (parseError: any) {
      return NextResponse.json(
        { error: parseError?.message || 'Failed to parse resume document contents.' },
        { status: 422 }
      );
    }
  } catch (error: any) {
    console.error('API parse error:', error);
    return NextResponse.json(
      { error: error?.message || 'An unexpected error occurred while uploading the file.' },
      { status: 500 }
    );
  }
}
