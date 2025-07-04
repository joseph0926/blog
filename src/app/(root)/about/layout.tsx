import { TopProgress } from '@/components/ui/top-progress';

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TopProgress />
      {children}
    </>
  );
}
