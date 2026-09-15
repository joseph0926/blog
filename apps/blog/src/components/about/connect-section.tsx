'use client';

import { motion, transform, useTransform } from 'motion/react';
import { useAboutScroll } from './about-scroll';
import { SectionHeading } from './section-heading';

type ConnectLink = {
  href: string;
  label: string;
};

type ConnectSectionProps = {
  id: string;
  number: string;
  title: string;
  name: string;
  role: string;
  description: string;
  links: ConnectLink[];
};

const inkLink =
  'press text-foreground hover:text-accent-ink focus-visible:ring-ring inline-flex items-center gap-2 rounded-sm underline decoration-rule decoration-1 underline-offset-[6px] transition-colors duration-150 hover:decoration-accent-ink focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:outline-none';

/** 표지의 뒷면. 이름과 역할이 괘선 양 끝에서 다시 모인다. */
export const ConnectSection = ({
  id,
  number,
  title,
  name,
  role,
  description,
  links,
}: ConnectSectionProps) => {
  const { connectRef, connectProgress, reduceMotion } = useAboutScroll();
  const nameX = useTransform(
    connectProgress,
    transform([0, 1], [reduceMotion ? 0 : -48, 0]),
  );
  const roleX = useTransform(
    connectProgress,
    transform([0, 1], [reduceMotion ? 0 : 48, 0]),
  );
  const lineScale = useTransform(connectProgress, transform([0, 1], [1.12, 1]));
  const headingId = `${id}-title`;

  return (
    <section
      ref={connectRef}
      id={id}
      aria-labelledby={headingId}
      className="border-rule scroll-mt-20 border-t border-b py-12 lg:py-16"
    >
      <SectionHeading id={headingId} number={number} title={title} />
      <p className="text-foreground mt-6 max-w-[62ch] text-base leading-7 break-keep">
        {description}
      </p>
      <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        {links.map((link) => {
          const isMail = link.href.startsWith('mailto');
          return (
            <li key={link.href}>
              <a
                href={link.href}
                target={isMail ? undefined : '_blank'}
                rel={isMail ? undefined : 'noopener noreferrer'}
                className={inkLink}
              >
                {link.label}
              </a>
            </li>
          );
        })}
      </ul>
      <div className="mt-16 flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-8 lg:mt-24">
        <motion.p
          style={{ x: nameX }}
          className="text-foreground text-[clamp(2.25rem,6vw,4.5rem)] leading-[0.95] font-semibold tracking-[-0.03em]"
        >
          {name}
        </motion.p>
        <motion.span
          aria-hidden="true"
          style={{ scaleX: lineScale }}
          className="border-rule mb-[0.35em] hidden flex-1 origin-center border-t sm:block"
        />
        <motion.p
          style={{ x: roleX }}
          className="text-muted-foreground mb-[0.25em] text-lg sm:text-right sm:text-xl"
        >
          {role}
        </motion.p>
      </div>
    </section>
  );
};
