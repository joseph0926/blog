import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/require-admin';

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
]);
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export const runtime = 'nodejs';

function streamUpload(
  buffer: Buffer,
  folder = 'blog-thumbnails',
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        format: 'webp',
        transformation: [
          {
            width: 1200,
            height: 630,
            crop: 'limit',
            quality: 'auto:good',
            fetch_format: 'auto',
          },
        ],
      },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve(result);
      },
    );
    stream.end(buffer);
  });
}

export async function POST(req: NextRequest) {
  // 인증 검사
  const authError = await requireAdmin(req);
  if (authError) return authError;

  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ message: '파일 없음' }, { status: 400 });
  }

  // 파일 타입 검증
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { message: '지원하지 않는 파일 형식입니다' },
      { status: 415 },
    );
  }

  // 파일 크기 검증
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { message: '파일 크기는 5MB 이하여야 합니다' },
      { status: 413 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const { secure_url } = await streamUpload(buffer);
    return NextResponse.json({ url: secure_url });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: '업로드 실패' }, { status: 500 });
  }
}
