'use client';

import { Tag } from '@prisma/client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useRef } from 'react';
import { Button } from '../ui/button';
import { Floating } from '../ui/floating';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

type BlogFilterProps = {
  tags: Tag[];
};

export const BlogFilter = ({ tags }: BlogFilterProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams],
  );

  const handleCategoryFilter = (cat: string) => {
    router.replace(pathname + '?' + createQueryString('category', cat));
  };
  const clearFilter = () => {
    router.replace(pathname);
  };

  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <div className="sticky top-14 left-4 z-10 hidden h-3/4 w-44 p-2 xl:block">
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-4">
            <Label>Search</Label>
            <Input ref={inputRef} />
          </div>
          <div className="flex flex-col gap-4">
            <Label>Category</Label>
            <ul className="flex flex-col gap-2.5">
              {tags?.map((tag) => (
                <li key={tag.id}>
                  <Button
                    variant="link"
                    className="cursor-pointer"
                    onClick={() => handleCategoryFilter(tag.name)}
                  >
                    {tag.name.toUpperCase()}
                  </Button>
                </li>
              ))}
            </ul>
          </div>
          <Button
            variant="outline"
            className="border-destructive text-destructive cursor-pointer"
            onClick={clearFilter}
          >
            Clear
          </Button>
        </div>
      </div>
      <Floating
        clearFilter={clearFilter}
        onClick={handleCategoryFilter}
        items={tags}
      />
    </>
  );
};
