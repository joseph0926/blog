type SectionHeadingProps = {
  id: string;
  number: string;
  title: string;
};

export const SectionHeading = ({ id, number, title }: SectionHeadingProps) => (
  <header className="flex items-baseline gap-4">
    <p className="text-muted-foreground font-mono text-xs tabular-nums">
      {number}
    </p>
    <h2
      id={id}
      className="text-foreground text-xl font-semibold tracking-tight"
    >
      {title}
    </h2>
  </header>
);
