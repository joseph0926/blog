'use client';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@joseph0926/ui/components/tabs';

export type PrEntry = {
  key: string;
  project: string;
  id: string;
  title: string;
  desc: string;
};

type PrTabsProps = {
  prs: PrEntry[];
  groups: { project: string; countLabel: string }[];
};

export const PrTabs = ({ prs, groups }: PrTabsProps) => {
  const projects = groups.map((group) => group.project);

  return (
    <Tabs defaultValue={projects[0]} className="gap-0">
      <TabsList className="border-rule h-auto w-full flex-wrap justify-start gap-x-1 gap-y-1 rounded-none border-b bg-transparent p-0">
        {groups.map(({ project, countLabel }) => {
          return (
            <TabsTrigger
              key={project}
              value={project}
              className="press data-[state=active]:border-accent-ink data-[state=active]:text-foreground text-muted-foreground hover:text-foreground focus-visible:ring-ring -mb-px h-9 flex-none rounded-none border-0 border-b-2 border-transparent px-1 text-sm font-normal shadow-none transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              {project}
              <span className="text-muted-foreground font-mono text-[11px] tabular-nums">
                {countLabel}
              </span>
            </TabsTrigger>
          );
        })}
      </TabsList>
      {projects.map((project) => (
        <TabsContent key={project} value={project} className="pt-2">
          <ol>
            {prs
              .filter((pr) => pr.project === project)
              .map((pr) => (
                <li
                  key={pr.key}
                  className="border-rule grid gap-2 border-b py-4 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-6"
                >
                  <span className="text-muted-foreground font-mono text-xs leading-6 tabular-nums">
                    {pr.id}
                  </span>
                  <div className="max-w-[68ch] min-w-0">
                    <p className="text-foreground text-base leading-6 font-medium">
                      {pr.title}
                    </p>
                    <p className="text-muted-foreground mt-1 text-sm leading-6">
                      {pr.desc}
                    </p>
                  </div>
                </li>
              ))}
          </ol>
        </TabsContent>
      ))}
    </Tabs>
  );
};
