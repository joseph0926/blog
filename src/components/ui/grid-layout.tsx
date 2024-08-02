import { cn } from '@/lib/utils';
import Image, { ImageProps } from 'next/image';
import { ComponentProps } from 'react';

type GridLayoutTitleProps = {
  gridTitle: React.ReactNode;
  gridDescription: React.ReactNode;
  image?: ImageProps;
  innerClassName?: string;
  className?: string;
};

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

function GridLayoutTitle({ image, gridTitle, gridDescription, className }: GridLayoutTitleProps) {
  return (
    <div
      className={cn(
        'h-full w-full overflow-hidden transition duration-200 group-hover/grid:translate-x-2',
        className
      )}
    >
      {image && (
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          className={image.className}
          style={image.style}
        />
      )}
      <div
        className={cn(
          'mb-2 mt-2 flex flex-col justify-between gap-5 font-sans font-bold text-neutral-600 dark:text-neutral-200'
        )}
      >
        {gridTitle}
        {gridDescription}
      </div>
    </div>
  );
}

export { GridLayout, GridLayoutHeader, GridLayoutTitle };
