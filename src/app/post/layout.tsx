import { Footer } from '@/components/home/footer';
import { Header } from '@/components/layouts/header';

export default function PostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header useTitle={false} />
      {children}
      <Footer />
    </>
  );
}
