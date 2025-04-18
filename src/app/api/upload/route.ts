import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

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
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve(result);
      },
    );
    stream.end(buffer);
  });
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as Blob | null;
  if (!file)
    return NextResponse.json({ message: '파일 없음' }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const { secure_url } = await streamUpload(buffer);
    return NextResponse.json({ url: secure_url });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: '업로드 실패' }, { status: 500 });
  }
}
