import { Navbar } from '../layouts/navbar';
import { Container } from '../ui/container';

type HeaderProps = {
  useTitle?: boolean;
  title?: string;
  size?: 'sm' | 'md' | 'lg';
};

export const Header = ({ useTitle, title, size = 'lg' }: HeaderProps) => {
  return (
    <header className="border-border/70 bg-background/95 supports-[backdrop-filter]:bg-background/85 sticky top-0 z-50 border-b backdrop-blur">
      <Container as="div" size={size}>
        <Navbar />
      </Container>
      {useTitle && (
        <div className="border-border/70 border-t">
          <Container as="div" size={size} className="py-10 sm:py-12">
            <h1 className="text-foreground text-center text-4xl font-semibold tracking-tight uppercase sm:text-5xl md:text-6xl lg:text-7xl">
              {title ?? 'joseph0926'}
            </h1>
          </Container>
        </div>
      )}
    </header>
  );
};
