'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useRef } from 'react';
import { Button } from '../ui/button';
import { Floating } from '../ui/floating';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

const DUMMY_CATEGORIES = ['react', 'js', 'tuto'];

export const BlogFilter = () => {
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
    router.push(pathname + '?' + createQueryString('category', cat));
  };

  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="fixed top-14 left-4 z-10 h-3/4 w-44 p-2">
      <div className="hidden flex-col gap-10 xl:flex">
        <div className="flex flex-col gap-4">
          <Label>Search</Label>
          <Input ref={inputRef} />
        </div>
        <div className="flex flex-col gap-4">
          <Label>Category</Label>
          <ul className="flex flex-col gap-2.5">
            {DUMMY_CATEGORIES.map((cat) => (
              <li key={cat}>
                <Button
                  variant="link"
                  className="cursor-pointer"
                  onClick={() => handleCategoryFilter(cat)}
                >
                  {cat}
                </Button>
              </li>
            ))}
          </ul>
        </div>
        <Button
          variant="outline"
          className="border-destructive text-destructive cursor-pointer"
          onClick={() => {
            router.push(pathname);
          }}
        >
          Clear
        </Button>
      </div>
      <Floating onClick={handleCategoryFilter} items={DUMMY_CATEGORIES} />
    </div>
  );
};
