import { Navbar } from '../layouts/navbar';
import { Container } from '../ui/container';

type HeaderProps = {
  size?: 'sm' | 'md' | 'lg';
};

export const Header = ({ size = 'lg' }: HeaderProps) => {
  return (
    <header className="bg-background sticky top-0 z-50">
      <Container as="div" size={size}>
        <Navbar />
      </Container>
    </header>
  );
};
