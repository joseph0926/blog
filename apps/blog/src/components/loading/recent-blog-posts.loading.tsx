'use client';

import { motion } from 'motion/react';
import { skeletonContainer, skeletonItem } from '@/lib/motion-variants';
import { BlogPostSkeleton } from '../home/blog-post.skeleton';

export const RecentBlogPostsLoading = () => {
  return (
    <motion.div variants={skeletonContainer} initial="hidden" animate="visible">
      <section className="grid grid-cols-1 gap-x-8 gap-y-12 lg:grid-cols-2">
        <motion.div variants={skeletonItem}>
          <BlogPostSkeleton type="col" />
        </motion.div>
        <motion.div
          variants={skeletonContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-y-12"
        >
          {[1, 2].map((idx) => (
            <motion.div key={idx} variants={skeletonItem}>
              <BlogPostSkeleton type="row" />
            </motion.div>
          ))}
        </motion.div>
      </section>
      <motion.div variants={skeletonItem} className="mt-12">
        <BlogPostSkeleton type="row" />
      </motion.div>
    </motion.div>
  );
};
