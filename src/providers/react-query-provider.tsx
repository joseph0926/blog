'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { httpBatchLink } from '@trpc/react-query';
import { useRef, useState } from 'react';
import superjson from 'superjson';
import { trpc } from '@/lib/trpc';

export default function ReactQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClientRef = useRef<QueryClient>(null);
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: '/api/trpc',
          transformer: superjson,
        }),
      ],
    }),
  );

  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient({
      defaultOptions: { queries: { staleTime: 60 * 1000 } },
    });
  }

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClientRef.current}>
      <QueryClientProvider client={queryClientRef.current}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </trpc.Provider>
  );
}
