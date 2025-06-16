import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import HeaderFiltersClient from './header-filters.client';
import { cache } from 'react';

const ranges = [
  { label: '24h', value: '24h' },
  { label: '7d', value: '7d' },
  { label: '30d', value: '30d' },
];

const getLatestVersions = cache(async () => {
  const rows = await prisma.lighthouseRun.findMany({
    select: { appVersion: true },
    distinct: ['appVersion'],
    orderBy: { ts: 'desc' },
    take: 6,
  });
  return rows.map((r) => r.appVersion);
});

export async function HeaderFilters() {
  const hdrs = await headers();
  const currentUrl = new URL(
    hdrs.get('x-nextjs-absolute-url') ?? 'http://localhost:3000/report',
  );
  const pathname = currentUrl.pathname;
  const currentRange = currentUrl.searchParams.get('range') ?? '7d';
  const currentVersion = currentUrl.searchParams.get('version') ?? 'latest';

  const versions = await getLatestVersions();

  return (
    <HeaderFiltersClient
      pathname={pathname}
      initRange={currentRange}
      initVersion={currentVersion}
      ranges={ranges}
      versions={versions}
    />
  );
}
