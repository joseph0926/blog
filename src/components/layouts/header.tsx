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
          <h1 className="text-center text-9xl font-extrabold tracking-tighter uppercase">
            {title ?? 'joseph0926'}
          </h1>
        </div>
      )}
    </Container>
  );
};
