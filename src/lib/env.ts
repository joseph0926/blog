export const ENV = (() => {
  const raw = process.env.APP_ENV ?? 'development';
  if (raw === 'production') return 'prod';
  if (raw === 'development') return 'dev';
  return raw;
})() as 'prod' | 'dev';
