import { Footer } from '@/components/home/footer';
import { Header } from '@/components/layouts/header';

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header size="sm" useTitle={false} />
      {children}
      <Footer size="sm" />
    </>
  );
}
