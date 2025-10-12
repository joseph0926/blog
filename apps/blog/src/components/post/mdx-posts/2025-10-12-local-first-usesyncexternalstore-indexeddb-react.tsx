import { compileMDX } from 'next-mdx-remote/rsc';
import { AutoSyncComparison } from '@/mdx/components/local-first/auto-sync-comparison';
import { MemoryCachePatternDemo } from '@/mdx/components/local-first/memory-cache-pattern-demo';
import { SyncExternalStoreDemo } from '@/mdx/components/local-first/sync-external-store-demo';
import { getPostContent } from '@/services/post.service';

export async function Post_2025_10_12_Local_First_Usesyncexternalstore_Indexeddb_React() {
  const { source } = await getPostContent(
    '2025-10-12-local-first-usesyncexternalstore-indexeddb-react',
  );

  const { content } = await compileMDX({
    source,
    components: {
      SyncExternalStoreDemo,
      MemoryCachePatternDemo,
      AutoSyncComparison,
    },
    options: { parseFrontmatter: true },
  });

  return content;
}
