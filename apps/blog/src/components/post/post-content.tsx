import dynamic from 'next/dynamic';

const postComponents = {
  '2025-06-25-react-react-fiber': dynamic(
    () =>
      import('./mdx-posts/2025-06-25-react-react-fiber').then(
        (m) => m.Post_2025_06_25_React_React_Fiber,
      ),
    {
      loading: () => (
        <div className="h-[67vh] animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
      ),
    },
  ),
  '2025-06-28-css-sonner-toast-': dynamic(
    () =>
      import('./mdx-posts/2025-06-28-css-sonner-toast-').then(
        (m) => m.Post_2025_06_28_Css_Sonner_Toast_,
      ),
    {
      loading: () => (
        <div className="h-[67vh] animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
      ),
    },
  ),
  '2025-07-13-learn-react-02-suspense-': dynamic(
    () =>
      import('./mdx-posts/2025-07-13-learn-react-02-suspense-').then(
        (m) => m.Post_2025_07_13_Learn_React_02_Suspense_,
      ),
    {
      loading: () => (
        <div className="h-[67vh] animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
      ),
    },
  ),
  '2025-08-24-nextjs-cache': dynamic(
    () =>
      import('./mdx-posts/2025-08-24-nextjs-cache').then(
        (m) => m.Post_2025_08_24_Nextjs_Cache,
      ),
    {
      loading: () => (
        <div className="h-[67vh] animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
      ),
    },
  ),
  '2025-08-29-react-query-1': dynamic(
    () =>
      import('./mdx-posts/2025-08-29-react-query-1').then(
        (m) => m.Post_2025_08_29_React_Query_1,
      ),
    {
      loading: () => (
        <div className="h-[67vh] animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
      ),
    },
  ),
  '2025-06-25-learn-react-01-react-': dynamic(
    () =>
      import('./mdx-posts/default-post').then((m) => ({
        default: () =>
          m.DefaultPost({ slug: '2025-06-25-learn-react-01-react-' }),
      })),
    {
      loading: () => (
        <div className="h-[67vh] animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
      ),
    },
  ),
  '2025-07-24-react-query-issue-': dynamic(
    () =>
      import('./mdx-posts/default-post').then((m) => ({
        default: () => m.DefaultPost({ slug: '2025-07-24-react-query-issue-' }),
      })),
    {
      loading: () => (
        <div className="h-[67vh] animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
      ),
    },
  ),
  '2025-08-15-trpc-01-rest-api-api-': dynamic(
    () =>
      import('./mdx-posts/default-post').then((m) => ({
        default: () =>
          m.DefaultPost({ slug: '2025-08-15-trpc-01-rest-api-api-' }),
      })),
    {
      loading: () => (
        <div className="h-[67vh] animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
      ),
    },
  ),
  '2025-09-02-react-query-usequeries-combine-pr-merge': dynamic(
    () =>
      import('./mdx-posts/default-post').then((m) => ({
        default: () =>
          m.DefaultPost({
            slug: '2025-09-02-react-query-usequeries-combine-pr-merge',
          }),
      })),
    {
      loading: () => (
        <div className="h-[67vh] animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
      ),
    },
  ),
  '2025-09-13-react-router-unstablemiddleware-shouldrevalidate': dynamic(
    () =>
      import('./mdx-posts/default-post').then((m) => ({
        default: () =>
          m.DefaultPost({
            slug: '2025-09-13-react-router-unstablemiddleware-shouldrevalidate',
          }),
      })),
    {
      loading: () => (
        <div className="h-[67vh] animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
      ),
    },
  ),
  '2025-10-03-react-usestate': dynamic(
    () =>
      import('./mdx-posts/2025-10-03-react-usestate').then(
        (m) => m.Post_2025_10_03_React_Usestate,
      ),
    {
      loading: () => (
        <div className="h-[67vh] animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
      ),
    },
  ),
  '2025-10-11-csr-ssr': dynamic(
    () =>
      import('./mdx-posts/default-post').then((m) => ({
        default: () => m.DefaultPost({ slug: '2025-10-11-csr-ssr' }),
      })),
    {
      loading: () => (
        <div className="h-[67vh] animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
      ),
    },
  ),
  '2025-10-12-local-first-usesyncexternalstore-indexeddb-react': dynamic(
    () =>
      import(
        './mdx-posts/2025-10-12-local-first-usesyncexternalstore-indexeddb-react'
      ).then(
        (m) =>
          m.Post_2025_10_12_Local_First_Usesyncexternalstore_Indexeddb_React,
      ),
    {
      loading: () => (
        <div className="h-[67vh] animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
      ),
    },
  ),
  '2025-10-12-csr-prepaint': dynamic(
    () =>
      import('./mdx-posts/default-post').then((m) => ({
        default: () => m.DefaultPost({ slug: '2025-10-12-csr-prepaint' }),
      })),
    {
      loading: () => (
        <div className="h-[67vh] animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
      ),
    },
  ),
  '2025-10-27-cheukjeothago-bigyohago-pandanhagi-pilteo-guhyeon-sago-gwajeot':
    dynamic(
      () =>
        import(
          './mdx-posts/2025-10-27-cheukjeothago-bigyohago-pandanhagi-pilteo-guhyeon-sago-gwajeot'
        ).then(
          (m) =>
            m.Post_2025_10_27_Cheukjeothago_Bigyohago_Pandanhagi_Pilteo_Guhyeon_Sago_Gwajeot,
        ),
      {
        loading: () => (
          <div className="h-[67vh] animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
        ),
      },
    ),
} as const;

interface PostContentProps {
  slug: string;
}

export function PostContent({ slug }: PostContentProps) {
  const PostComponent = postComponents[slug as keyof typeof postComponents];

  if (!PostComponent) {
    const DefaultComponent = dynamic(
      () =>
        import('./mdx-posts/default-post').then((m) => ({
          default: () => m.DefaultPost({ slug }),
        })),
      {
        loading: () => (
          <div className="h-[67vh] animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
        ),
      },
    );
    return <DefaultComponent />;
  }

  return <PostComponent />;
}
