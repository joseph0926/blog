'use client';

import { Skeleton } from '@joseph0926/ui/components/skeleton';
import { motion } from 'motion/react';
import { skeletonContainer, skeletonItem } from '@/lib/motion-variants';

export const PostHeaderLoading = () => {
  return (
    <motion.div
      variants={skeletonContainer}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-6"
    >
      <motion.div variants={skeletonItem} className="flex items-center gap-3">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-5 w-32" />
      </motion.div>
      <motion.div variants={skeletonItem}>
        <Skeleton className="h-12 w-4/5" />
      </motion.div>
      <motion.div variants={skeletonItem}>
        <Skeleton className="h-6 w-full max-w-2xl" />
      </motion.div>
      <motion.div variants={skeletonItem}>
        <Skeleton className="aspect-video w-full rounded-xl" />
      </motion.div>
    </motion.div>
  );
};
