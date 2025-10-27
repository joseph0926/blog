import { compileMDX } from 'next-mdx-remote/rsc';
import { BackButtonDemo } from '@/mdx/components/url/back-button-demo';
import { ProfilerResult } from '@/mdx/components/url/profiler-result';
import { ServiceComparison } from '@/mdx/components/url/service-comparison';
import { getPostContent } from '@/services/post.service';

export async function Post_2025_10_27_Cheukjeothago_Bigyohago_Pandanhagi_Pilteo_Guhyeon_Sago_Gwajeot() {
  const { source } = await getPostContent(
    '2025-10-27-cheukjeothago-bigyohago-pandanhagi-pilteo-guhyeon-sago-gwajeot',
  );

  const { content } = await compileMDX({
    source,
    components: {
      ProfilerResult,
      ServiceComparison,
      BackButtonDemo,
    },
    options: { parseFrontmatter: true },
  });

  return content;
}
