import { compileMDX } from 'next-mdx-remote/rsc';
import { BundleSizeComparison } from '@/mdx/components/rsc-build/bundle-size-comparison';
import { BundleSplitDiagram } from '@/mdx/components/rsc-build/bundle-split-diagram';
import { CodeTransformAnimation } from '@/mdx/components/rsc-build/code-transform-animation';
import { HydrationTimeline } from '@/mdx/components/rsc-build/hydration-timeline';
import { RSCPayloadVisualization } from '@/mdx/components/rsc-build/rsc-payload-visualization';
import { getPostContent } from '@/services/post.service';

export async function Post_2025_11_01_Rscneun_Eotteoundefinedge_Seobeokeulraieonteu_Beondeuleul_Nanulkka() {
  const { source } = await getPostContent(
    '2025-11-01-rscneun-eotteoundefinedge-seobeokeulraieonteu-beondeuleul-nanulkka',
  );

  const { content } = await compileMDX({
    source,
    components: {
      CodeTransformAnimation,
      RSCPayloadVisualization,
      HydrationTimeline,
      BundleSplitDiagram,
      BundleSizeComparison,
    },
    options: { parseFrontmatter: true },
  });

  return content;
}
