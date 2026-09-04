import createBundleAnalyzer from '@next/bundle-analyzer';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  transpilePackages:
    process.env.NODE_ENV !== 'production'
      ? ['next-mdx-remote', '@joseph0926/ui']
      : ['@joseph0926/ui'],
  env: {
    NEXT_PUBLIC_VERCEL_ENV: process.env.VERCEL_ENV ?? 'dev',
  },
};

const withBundleAnalyzer = createBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: false,
});
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

export default withNextIntl(withBundleAnalyzer(nextConfig));
