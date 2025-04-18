export async function uploadImage(file: File) {
  const form = new FormData();
  form.append('file', file);

  const res = await fetch('/api/upload', { method: 'POST', body: form });
  if (!res.ok) throw new Error('업로드 실패');
  const { url } = (await res.json()) as { url: string };
  return url;
}
