import { Footer } from '@/components/home/footer';
import { Header } from '@/components/layouts/header';
import { TopProgress } from '@/components/ui/top-progress';

export default function PostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TopProgress />
      <Header useTitle={false} />
      {children}
      <Footer />
    </>
  );
}
