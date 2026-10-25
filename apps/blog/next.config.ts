import createBundleAnalyzer from '@next/bundle-analyzer';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  // 저장소 지침은 루트 AGENTS.md가 소유한다. next dev가 에이전트를 감지해
  // apps/blog/AGENTS.md를 만들면 verify.sh의 작업 트리 무변경 검사가 깨진다.
  agentRules: false,
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
