export type BackendLabel = 'psql' | 'kv';

export type TimedResult<T> = {
  data: T;
  dbDur: number;
};

export const timed = async <T>(
  backend: BackendLabel,
  fn: () => Promise<T>,
): Promise<{ data: T; dbDur: number; backend: BackendLabel }> => {
  const t0 = performance.now();
  const data = await fn();
  const dbDur = performance.now() - t0;

  return { data, dbDur, backend };
};
