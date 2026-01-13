'use client';

import { motion } from 'motion/react';
import { skeletonContainer, skeletonItem } from '@/lib/motion-variants';
import { BlogPostSkeleton } from '../home/blog-post.skeleton';

export const AllBlogPostsLoading = () => {
  return (
    <motion.div
      variants={skeletonContainer}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-8"
    >
      {Array.from({ length: 3 }).map((_, idx) => (
        <motion.div key={idx} variants={skeletonItem}>
          <BlogPostSkeleton type="row" />
        </motion.div>
      ))}
    </motion.div>
  );
};
