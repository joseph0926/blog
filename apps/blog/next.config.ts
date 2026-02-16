import createBundleAnalyzer from '@next/bundle-analyzer';
import createMDX from '@next/mdx';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: 's3-alpha-sig.figma.com', protocol: 'https' },
      { hostname: 'res.cloudinary.com', protocol: 'https', pathname: '/**' },
    ],
  },
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  transpilePackages:
    process.env.NODE_ENV !== 'production'
      ? ['next-mdx-remote', '@joseph0926/ui']
      : ['@joseph0926/ui'],
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.APP_VERSION ?? 'dev',
    NEXT_PUBLIC_VERCEL_ENV: process.env.VERCEL_ENV ?? 'dev',
  },
};

const withMDX = createMDX({});
const withBundleAnalyzer = createBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: false,
});
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

export default withNextIntl(withBundleAnalyzer(withMDX(nextConfig)));
