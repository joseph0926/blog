'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';
import { ComponentProps } from 'react';

function GridLayout({ className, children }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'mx-auto grid w-full grid-cols-1 gap-4 md:auto-rows-[18rem] md:grid-cols-3',
        className
      )}
    >
      {children}
    </div>
  );
}

function GridLayoutHeader({ className, children }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'group/grid row-span-1 flex flex-col justify-between space-y-4 rounded-xl border border-transparent bg-white p-4 shadow-input transition duration-200 hover:shadow-xl dark:border-white/[0.2] dark:bg-black dark:shadow-none',
        className
      )}
    >
      {children}
    </div>
  );
}

function GridLayoutTitle({
  img,
  gridTitle,
  gridDescription,
  className,
  width,
  height,
  imageClassName,
  innerClassName,
}: {
  gridTitle: string | React.ReactNode;
  gridDescription: string | React.ReactNode;
  img?: string;
  width?: number;
  height?: number;
  imageClassName?: string;
  innerClassName?: string;
} & ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'h-full w-full overflow-hidden transition duration-200 group-hover/grid:translate-x-2',
        className
      )}
    >
      {img && (
        <Image src={img} alt="thumbnail" width={width} height={height} className={imageClassName} />
      )}
      <div
        className={cn(
          'mb-2 mt-2 font-sans font-bold text-neutral-600 dark:text-neutral-200',
          innerClassName
        )}
      >
        {gridTitle}
        {gridDescription}
      </div>
    </div>
  );
}

export { GridLayout, GridLayoutHeader, GridLayoutTitle };
