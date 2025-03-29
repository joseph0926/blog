import { cva, type VariantProps } from 'class-variance-authority';
import { ComponentProps, ElementType } from 'react';
import { cn } from '@/lib/utils';

const containerVariant = cva('mx-auto px-4', {
  variants: {
    size: {
      md: 'max-w-[1216px]',
      lg: 'max-w-[1260px]',
    },
  },
});

type ContainerProps = ComponentProps<'section'> &
  VariantProps<typeof containerVariant> & { as?: ElementType };

export const Container = ({
  className,
  children,
  size,
  as: Component = 'section',
  ...rest
}: ContainerProps) => {
  return (
    <Component className={cn(containerVariant({ size, className }))} {...rest}>
      {children}
    </Component>
  );
};
