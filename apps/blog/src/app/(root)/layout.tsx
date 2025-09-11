import { Footer } from '@/components/home/footer';
import { Header } from '@/components/layouts/header';

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
