import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const POST_COMPONENT_MAP = {
  '2025-06-25-react-react-fiber': ['StackReconciler', 'FiberWrapper'],
  '2025-06-28-css-sonner-toast-': [
    'SonnerSample',
    'SonnerImpl1',
    'SonnerImpl2',
    'SonnerImpl3',
    'SonnerImpl4',
  ],
  '2025-07-13-learn-react-02-suspense-': [
    'SyncVsAsyncDemo',
    'TraditionalLoadingDemo',
    'SuspenseDemo',
    'SuspenseTransitionDemo',
    'PerformanceComparisonDemo',
  ],
  '2025-08-24-nextjs-cache': [
    'CacheDescription',
    'NetworkSimulator',
    'AuctionSimulator',
    'CacheStrategyQuiz',
  ],
  '2025-08-29-react-query-1': ['ProxyTrack'],

  '2025-06-25-learn-react-01-react-': [],
  '2025-07-24-react-query-issue-': [],
  '2025-08-15-trpc-01-rest-api-api-': [],
  '2025-09-02-react-query-usequeries-combine-pr-merge': [],
  '2025-09-13-react-router-unstablemiddleware-shouldrevalidate': [],
  '2025-10-03-react-usestate': [],
};

const COMPONENT_IMPORT_MAP = {
  StackReconciler: '@/mdx/components/stack-reconciler',
  FiberWrapper: '@/mdx/components/fiber/fiber-wrapper',

  SonnerSample: '@/mdx/components/sonner/sonner-sample',
  SonnerImpl1: '@/mdx/components/sonner/sonner-impl',
  SonnerImpl2: '@/mdx/components/sonner/sonner-impl',
  SonnerImpl3: '@/mdx/components/sonner/sonner-impl',
  SonnerImpl4: '@/mdx/components/sonner/sonner-impl',

  SyncVsAsyncDemo: '@/mdx/components/suspense/sync-vs-async-demo',
  TraditionalLoadingDemo: '@/mdx/components/suspense/traditional-loading-demo',
  SuspenseDemo: '@/mdx/components/suspense/suspense-demo',
  SuspenseTransitionDemo: '@/mdx/components/suspense/suspense-transition-demo',
  PerformanceComparisonDemo: '@/mdx/components/suspense/perf-compare-demo',

  CacheDescription: '@/mdx/components/cache/cache-description',
  NetworkSimulator: '@/mdx/components/cache/network-simulator',
  AuctionSimulator: '@/mdx/components/cache/auction-simulator',
  CacheStrategyQuiz: '@/mdx/components/cache/cache-strategy-quiz',

  ProxyTrack: '@/mdx/components/react-query/proxy-track',
};

function slugToFunctionName(slug) {
  return (
    'Post_' +
    slug
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join('_')
  );
}

async function generatePostComponent(slug, components) {
  const functionName = slugToFunctionName(slug);

  const importGroups = {};
  components.forEach((comp) => {
    const importPath = COMPONENT_IMPORT_MAP[comp];
    if (!importGroups[importPath]) {
      importGroups[importPath] = [];
    }
    importGroups[importPath].push(comp);
  });

  const imports = Object.entries(importGroups)
    .map(([path, comps]) => `import { ${comps.join(', ')} } from '${path}';`)
    .join('\n');

  const template = `${imports ? imports + '\n' : ''}import { compileMDX } from 'next-mdx-remote/rsc';
import { getPostContent } from '@/services/post.service';

export async function ${functionName}() {
  const { source } = await getPostContent('${slug}');
  
  const { content } = await compileMDX({
    source,
    components: {${components.length > 0 ? '\n      ' + components.join(',\n      ') + ',\n    ' : ''}},
    options: { parseFrontmatter: true },
  });
  
  return content;
}
`;

  return { functionName, template };
}

function generateDefaultPostComponent() {
  return `import { compileMDX } from 'next-mdx-remote/rsc';
import { getPostContent } from '@/services/post.service';

interface DefaultPostProps {
  slug: string;
}

export async function DefaultPost({ slug }: DefaultPostProps) {
  const { source } = await getPostContent(slug);
  
  const { content } = await compileMDX({
    source,
    components: {},
    options: { parseFrontmatter: true },
  });
  
  return content;
}
`;
}

function generatePostContentRouter(postFunctionMap) {
  const dynamicImports = Object.entries(postFunctionMap)
    .map(([slug, functionName]) => {
      if (functionName === 'DefaultPost') {
        return `  '${slug}': dynamic(
    () => import('./mdx-posts/default-post').then(m => ({ default: () => m.DefaultPost({ slug: '${slug}' }) })),
    { loading: () => <div className="h-[67vh] animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg" /> }
  )`;
      }
      return `  '${slug}': dynamic(
    () => import('./mdx-posts/${slug}').then(m => m.${functionName}),
    { loading: () => <div className="h-[67vh] animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg" /> }
  )`;
    })
    .join(',\n');

  return `import dynamic from 'next/dynamic';


const postComponents = {
${dynamicImports}
} as const;

interface PostContentProps {
  slug: string;
}

export function PostContent({ slug }: PostContentProps) {
  const PostComponent = postComponents[slug as keyof typeof postComponents];
  
  if (!PostComponent) {
    
    const DefaultComponent = dynamic(
      () => import('./mdx-posts/default-post').then(m => ({ 
        default: () => m.DefaultPost({ slug }) 
      })),
      { loading: () => <div className="h-[67vh] animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg" /> }
    );
    return <DefaultComponent />;
  }
  
  return <PostComponent />;
}
`;
}

async function main() {
  const mdxPostsDir = path.join(__dirname, '../src/components/post/mdx-posts');

  await fs.mkdir(mdxPostsDir, { recursive: true });

  console.log('mdx-posts 디렉토리 생성 완료');

  const postFunctionMap = {};

  for (const [slug, components] of Object.entries(POST_COMPONENT_MAP)) {
    if (components.length === 0) {
      postFunctionMap[slug] = 'DefaultPost';
      console.log(`${slug} - 기본 컴포넌트 사용`);
      continue;
    }

    const { functionName, template } = await generatePostComponent(
      slug,
      components,
    );
    const filePath = path.join(mdxPostsDir, `${slug}.tsx`);

    await fs.writeFile(filePath, template, 'utf-8');
    postFunctionMap[slug] = functionName;

    console.log(`${slug}.tsx 생성 완료 (${components.length}개 컴포넌트)`);
  }

  const defaultPostPath = path.join(mdxPostsDir, 'default-post.tsx');
  await fs.writeFile(defaultPostPath, generateDefaultPostComponent(), 'utf-8');
  console.log('default-post.tsx 생성 완료');

  const postContentPath = path.join(
    __dirname,
    '../src/components/post/post-content.tsx',
  );
  await fs.writeFile(
    postContentPath,
    generatePostContentRouter(postFunctionMap),
    'utf-8',
  );
  console.log('post-content.tsx 업데이트 완료');

  console.log('\n생성 완료 요약:');
  console.log(`- 총 포스트 수: ${Object.keys(POST_COMPONENT_MAP).length}`);
  console.log(
    `- 커스텀 컴포넌트 포스트: ${Object.values(POST_COMPONENT_MAP).filter((c) => c.length > 0).length}`,
  );
  console.log(
    `- 기본 컴포넌트 포스트: ${Object.values(POST_COMPONENT_MAP).filter((c) => c.length === 0).length}`,
  );

  console.log('모든 파일 생성 완료!');
  console.log('다음 명령어로 빌드를 실행하세요: pnpm build');
}

main().catch(console.error);
