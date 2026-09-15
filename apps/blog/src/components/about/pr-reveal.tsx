'use client';

import {
  motion,
  type MotionValue,
  transform,
  useScroll,
  useTransform,
} from 'motion/react';
import { useRef } from 'react';
import { useAboutScroll } from './about-scroll';
import { SectionHeading } from './section-heading';

export type PrEntry = {
  key: string;
  project: string;
  id: string;
  title: string;
  desc: string;
};

type PrRevealProps = {
  id: string;
  number: string;
  title: string;
  lead: string;
  prs: PrEntry[];
  projectsHeading: string;
  projects: string[];
};

const pad = (value: number) => String(value).padStart(2, '0');

const PrSheet = ({ pr }: { pr: PrEntry }) => (
  <article className="border-rule bg-background flex h-full flex-col border p-6 sm:p-8">
    <p className="text-muted-foreground flex items-baseline gap-3 font-mono text-xs tabular-nums">
      <span>{pr.project}</span>
      <span className="text-accent-ink">{pr.id}</span>
    </p>
    <h3 className="text-foreground mt-6 text-lg leading-7 font-medium break-keep">
      {pr.title}
    </h3>
    <p className="text-muted-foreground mt-3 max-w-[52ch] text-sm leading-6 break-keep">
      {pr.desc}
    </p>
  </article>
);

/** 낱장은 자기 차례에 아래에서 올라오고, 뒤 낱장이 쌓일수록 위로 밀리며 작아진다. */
const StackedSheet = ({
  pr,
  index,
  count,
  progress,
}: {
  pr: PrEntry;
  index: number;
  count: number;
  progress: MotionValue<number>;
}) => {
  const length = 1 / count;
  const activeAt = index * length;
  const enterInputs =
    index === 0 ? [0, 1] : [activeAt - length * 0.5, activeAt];
  const enterY = useTransform(
    progress,
    transform(enterInputs, index === 0 ? ['0%', '0%'] : ['115%', '0%']),
  );

  const depthInputs: number[] = [0];
  const depthOutputs: number[] = [0];
  for (let later = index + 1; later < count; later += 1) {
    const laterAt = later * length;
    depthInputs.push(laterAt - length * 0.5, laterAt);
    depthOutputs.push(later - index - 1, later - index);
  }
  const depth = useTransform(progress, transform(depthInputs, depthOutputs));
  const stackY = useTransform(depth, (value) => value * -14);
  const scale = useTransform(depth, (value) => 1 - value * 0.04);

  return (
    <motion.li
      style={{ y: enterY, zIndex: index }}
      className="absolute inset-x-0 top-0 h-full"
    >
      <motion.div style={{ y: stackY, scale }} className="h-full origin-top">
        <PrSheet pr={pr} />
      </motion.div>
    </motion.li>
  );
};

const ProjectsList = ({
  heading,
  projects,
}: {
  heading: string;
  projects: string[];
}) => (
  <>
    <h3 className="text-muted-foreground mt-12 text-xs">{heading}</h3>
    <ul className="text-foreground mt-3 max-w-[68ch] space-y-3 text-sm leading-6 break-keep">
      {projects.map((project) => (
        <li key={project} className="border-rule border-l-2 pl-4">
          {project}
        </li>
      ))}
    </ul>
  </>
);

export const PrReveal = ({
  id,
  number,
  title,
  lead,
  prs,
  projectsHeading,
  projects,
}: PrRevealProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrub } = useAboutScroll();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });
  const count = prs.length;
  const activeIndex = useTransform(scrollYProgress, (p) =>
    Math.min(count - 1, Math.floor(p * count)),
  );
  const counter = useTransform(
    activeIndex,
    (index) => `${pad(index + 1)} / ${pad(count)}`,
  );
  const project = useTransform(activeIndex, (index) => prs[index].project);
  const prId = useTransform(activeIndex, (index) => prs[index].id);
  const headingId = `${id}-title`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="border-rule scroll-mt-14 border-t pt-12 lg:pt-16"
    >
      <SectionHeading id={headingId} number={number} title={title} />
      <p className="text-muted-foreground mt-3 max-w-[62ch] text-sm leading-6 break-keep">
        {lead}
      </p>

      <div
        ref={ref}
        style={scrub ? { height: `${count * 100}svh` } : undefined}
      >
        {scrub ? (
          <div className="sticky top-14 grid h-[calc(100svh-3.5rem)] content-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:gap-10">
            <div aria-hidden="true">
              <motion.p className="text-muted-foreground font-mono text-xs tabular-nums">
                {counter}
              </motion.p>
              <motion.p className="text-foreground mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">
                {project}
              </motion.p>
              <motion.p className="text-accent-ink mt-3 font-mono text-lg tabular-nums sm:text-2xl">
                {prId}
              </motion.p>
            </div>
            <ol className="relative h-[19rem] sm:h-[20rem]">
              {prs.map((pr, index) => (
                <StackedSheet
                  key={pr.key}
                  pr={pr}
                  index={index}
                  count={count}
                  progress={scrollYProgress}
                />
              ))}
            </ol>
          </div>
        ) : (
          <ol className="mt-8 grid gap-4">
            {prs.map((pr) => (
              <li key={pr.key}>
                <PrSheet pr={pr} />
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="pb-12 lg:pb-16">
        <ProjectsList heading={projectsHeading} projects={projects} />
      </div>
    </section>
  );
};
