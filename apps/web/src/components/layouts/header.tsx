import { Navbar } from '../layouts/navbar';
import { Container } from '../ui/container';

type HeaderProps = {
  useTitle?: boolean;
  title?: string;
};

export const Header = ({ useTitle, title }: HeaderProps) => {
  return (
    <Container as="header" size="md" className="flex flex-col gap-12">
      <Navbar />
      {useTitle && (
        <div className="border-t border-b py-12">
          <h1 className="text-center text-5xl font-extrabold tracking-tighter uppercase sm:text-6xl md:text-7xl lg:text-9xl">
            {title ?? 'joseph0926'}
          </h1>
        </div>
      )}
    </Container>
  );
};
