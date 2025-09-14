export const ENV = (() => {
  const raw = process.env.NEXT_PUBLIC_APP_ENV ?? 'development';
  if (raw === 'production') return 'prod';
  if (raw === 'development') return 'dev';
  return raw;
})() as 'prod' | 'dev';
