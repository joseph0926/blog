import { Footer } from '@/components/home/footer';
import { Header } from '@/components/home/header';

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
