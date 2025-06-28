import { unstable_cache } from 'next/cache';

/* eslint-disable  @typescript-eslint/no-explicit-any */
export function cached<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyPrefix: string[],
  tags: string[],
) {
  return unstable_cache(fn, keyPrefix, { tags });
}
