import type { NextConfig } from 'next';
import createMDX from '@next/mdx';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: 's3-alpha-sig.figma.com', protocol: 'https' },
      { hostname: 'res.cloudinary.com', protocol: 'https' },
    ],
  },
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  transpilePackages:
    process.env.NODE_ENV !== 'production' ? ['next-mdx-remote'] : undefined,
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
