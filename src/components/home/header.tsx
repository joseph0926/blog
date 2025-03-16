import { Navbar } from '../layouts/navbar';
import { Container } from '../ui/container';

export const Header = () => {
  return (
    <Container as="header" size="md" className="flex flex-col gap-12">
      <Navbar />
      <div className="border-t border-b py-12">
        <h1 className="text-center text-9xl font-extrabold tracking-tighter uppercase">
          joseph0926
        </h1>
      </div>
    </Container>
  );
};
