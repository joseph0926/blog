export type MetricType = {
  backend: 'psql' | 'kv';
  dbDur: number;
  cacheHit?: boolean;
};

export type ActionResponse<T = null> = {
  data: T | null;
  message: string;
  success: boolean;
  status: number;
  metric?: MetricType;
};
