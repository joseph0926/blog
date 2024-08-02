import { GridLayout, GridLayoutHeader, GridLayoutTitle } from '@/components/ui/grid-layout';
import { Skeleton } from '@/components/ui/skeleton';

const postListTitle = <Skeleton className="h-[200px] w-full" />;
const postListDescription = <p>test3</p>;

export function AllPostList() {
  return (
    <GridLayout>
      <GridLayoutHeader>
        <GridLayoutTitle gridTitle={postListTitle} gridDescription={postListDescription} />
      </GridLayoutHeader>
      <GridLayoutHeader>
        <GridLayoutTitle gridTitle={postListTitle} gridDescription={postListDescription} />
      </GridLayoutHeader>
      <GridLayoutHeader>
        <GridLayoutTitle gridTitle={postListTitle} gridDescription={postListDescription} />
      </GridLayoutHeader>
      <GridLayoutHeader>
        <GridLayoutTitle gridTitle={postListTitle} gridDescription={postListDescription} />
      </GridLayoutHeader>
      <GridLayoutHeader>
        <GridLayoutTitle gridTitle={postListTitle} gridDescription={postListDescription} />
      </GridLayoutHeader>
      <GridLayoutHeader>
        <GridLayoutTitle gridTitle={postListTitle} gridDescription={postListDescription} />
      </GridLayoutHeader>
    </GridLayout>
  );
}
