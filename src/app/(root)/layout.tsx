import { Footer } from '@/components/home/footer';
import { Header } from '@/components/layouts/header';
import { Container } from '@/components/ui/container';

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header useTitle />
      <Container as="main" size="lg">
        {children}
      </Container>
      <Footer />
    </>
  );
}
