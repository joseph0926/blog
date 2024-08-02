import { Badge } from '@/components/ui/badge';
import { GridLayout, GridLayoutHeader, GridLayoutTitle } from '@/components/ui/grid-layout';

const DUMMY_IMG =
  'https://images.unsplash.com/photo-1712652056542-58ca6baac1d3?q=80&w=2837&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

const postListTitle = (
  <div className="flex flex-col gap-3 pt-2">
    <h1>Olivia Rhye • 1 Jan 2023</h1>
    <h2>UX review presentations</h2>
    <p>
      How do you create compelling presentations that wow your colleagues and impress your managers?
    </p>
  </div>
);
const postListDescription = (
  <div className="flex items-center gap-2">
    <Badge className="rounded-[1rem]">Javascript</Badge>
    <Badge className="rounded-[1rem]">React</Badge>
    <Badge className="rounded-[1rem]">Angular</Badge>
  </div>
);

export function RecentPostList() {
  return (
    <GridLayout className="md:grid-cols-2">
      <GridLayoutHeader className="row-span-2 h-full">
        <GridLayoutTitle
          gridTitle={postListTitle}
          gridDescription={postListDescription}
          imageClassName="w-[592px] h-[228px]"
          img={DUMMY_IMG}
          width={592}
          height={228}
        />
      </GridLayoutHeader>
      <GridLayoutHeader className="row-span-2">
        <GridLayoutTitle
          gridTitle={postListTitle}
          gridDescription={postListDescription}
          imageClassName="w-[320px] h-[200px]"
          img={DUMMY_IMG}
          width={320}
          height={200}
          className="flex flex-col justify-between"
        />
        <GridLayoutTitle
          gridTitle={postListTitle}
          gridDescription={postListDescription}
          imageClassName="w-[320px] h-[200px]"
          img={DUMMY_IMG}
          width={320}
          height={200}
          className="flex flex-col justify-between"
        />
      </GridLayoutHeader>
      <GridLayoutHeader className="md:col-span-2">
        <GridLayoutTitle gridTitle={postListTitle} gridDescription={postListDescription} />
      </GridLayoutHeader>
    </GridLayout>
  );
}
