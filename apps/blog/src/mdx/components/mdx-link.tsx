import type { ComponentPropsWithoutRef } from 'react';
import { Link } from '@/i18n/navigation';

type MdxLinkProps = ComponentPropsWithoutRef<'a'>;

const isInternalPath = (href: string) =>
  href.startsWith('/') &&
  !href.startsWith('//') &&
  !href.startsWith('/api') &&
  !href.startsWith('/admin') &&
  !href.startsWith('/login');

export function MdxLink({ href, ...props }: MdxLinkProps) {
  if (typeof href !== 'string') {
    return <a href={href} {...props} />;
  }

  if (isInternalPath(href)) {
    return <Link href={href} {...props} />;
  }

  return <a href={href} {...props} />;
}
