import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '../ui/badge';

const DUMMY_TAGS = [
  { id: '1', tag: 'React' },
  { id: '2', tag: 'NextJs' },
  { id: '3', tag: 'Javascript' },
];

type BlogPostProps = {
  type?: 'row' | 'col';
};

export const BlogPost = ({ type = 'col' }: BlogPostProps) => {
  return (
    <article
      className={cn(
        'flex w-full gap-8',
        type === 'row' ? 'flex-row' : 'flex-col',
      )}
    >
      <Image
        src="https://s3-alpha-sig.figma.com/img/0095/33dd/b18880647940253fa905f2a8d6a3a95e?Expires=1742774400&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=GWYj579a8MRQ1JZTAQH6n2ruS5rfPQCrY32QfqxIhwnon5TV5GN4qRkBbJHr6~vbfNq~QqoG9kX9KgZ9RIve31BJaEAKKVbfHS9nb1yEoaOBPalb6LwH6RYqpbAwKIkMHlLY8mkOudAM79RIxc4GOrkJyAU33azrUXKx89iJUpICKdAM~-YvYHxwz3-hUOPtPwrMswE~pD0QOY8pFYZbhXkQ1cgtDoO8xSK~LQCr1nprvvEoyVgjNiHvCCgwSI3IQkt0gSpqFI8jOO4hqkHmVbKpHRV5dZKw9IHC8ezM0NH-9LGplzZEP~B23YC5dwR0-lr44ZI5PC2rxskfdoPJzg__"
        width={1200}
        height={675}
        alt=""
        className={cn(
          'aspect-video rounded-lg object-cover',
          type === 'row' ? 'w-1/3 sm:w-1/2' : 'w-full',
        )}
      />
      <div className="flex flex-col gap-3">
        <span className="text-muted-foreground text-sm">
          Olivia Rhye • 1 Jan 2023
        </span>
        <Link href="#" className="hover:underline">
          <h2 className="line-clamp-1 text-2xl font-semibold">
            UX review presentations
          </h2>
        </Link>
        <p className="text-muted-foreground line-clamp-2 text-base">
          How do you create compelling presentations that wow your colleagues
          and impress your managers?
        </p>
        <ul className="flex flex-wrap items-center gap-2">
          {DUMMY_TAGS.map((tag) => (
            <Badge
              key={tag.id}
              variant="outline"
              className="mt-0.5 inline-block rounded-full px-2.5 text-xs font-medium md:mt-3"
            >
              {tag.tag}
            </Badge>
          ))}
        </ul>
      </div>
    </article>
  );
};
