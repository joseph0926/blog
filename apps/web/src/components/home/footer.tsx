import { INFO } from '@/constants/info';
import { Container } from '../ui/container';
import { LogoIcon } from '../ui/icons';

export const Footer = () => {
  return (
    <Container as="footer" size="md" className="mt-12 mb-6">
      <LogoIcon textColor="var(--foreground)" />
      <div className="flex items-center gap-2 text-sm font-medium">
        <span className='after:px-2 after:content-["·"]'>
          &copy;2025 joseph0926
        </span>
        <span className='after:px-2 after:content-["·"]'>
          <a href={INFO.GITHUB} target="_blank">
            GitHub
          </a>
        </span>
        <span>
          <a href={INFO.LINKEDIN} target="_blank">
            Linkedin
          </a>
        </span>
      </div>
    </Container>
  );
};
