import { Card } from '@joseph0926/ui/components/card';
import { ArrowDown, Database, Link2, PanelsTopLeft } from 'lucide-react';
import { Fragment } from 'react';

type Locale = 'ko' | 'en';

const COPY = {
  ko: {
    title: '상태마다 기준이 되는 곳을 나눴습니다',
    description:
      'URL은 어디를 열지 정하고, TanStack Query는 그 위치에서 보여줄 현재 서버 데이터를 가져옵니다.',
    stages: [
      {
        title: 'URL',
        role: '공유할 위치',
        detail: 'accountId, tab, panel',
      },
      {
        title: 'TanStack Query',
        role: '현재 서버 데이터',
        detail: 'accountId로 계정 조회',
      },
      {
        title: '화면',
        role: '두 상태를 조합',
        detail: '계정 데이터와 화면 위치 렌더링',
      },
    ],
  },
  en: {
    title: 'Each kind of state had one owner',
    description:
      'The URL decides where to open. TanStack Query fetches the current server data shown at that location.',
    stages: [
      {
        title: 'URL',
        role: 'Shared location',
        detail: 'accountId, tab, panel',
      },
      {
        title: 'TanStack Query',
        role: 'Current server data',
        detail: 'Fetch the account by accountId',
      },
      {
        title: 'Screen',
        role: 'Combine both states',
        detail: 'Render account data at the URL location',
      },
    ],
  },
} satisfies Record<
  Locale,
  {
    title: string;
    description: string;
    stages: Array<{ title: string; role: string; detail: string }>;
  }
>;

const icons = [Link2, Database, PanelsTopLeft];

export function StateOwnershipDiagram({ locale = 'ko' }: { locale?: Locale }) {
  const copy = COPY[locale];

  return (
    <Card className="not-prose border-border/70 bg-card my-8 overflow-hidden p-4 sm:p-6">
      <div>
        <h3 className="m-0 text-lg font-semibold">{copy.title}</h3>
        <p className="text-muted-foreground mt-2 mb-0 text-sm leading-6">
          {copy.description}
        </p>
      </div>
      <ol className="mt-6 mb-0 grid list-none gap-3 p-0 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center">
        {copy.stages.map((stage, index) => {
          const Icon = icons[index];

          return (
            <Fragment key={stage.title}>
              <li className="border-border bg-background/80 m-0 min-h-40 rounded-2xl border p-4">
                <div className="bg-primary/10 text-primary mb-4 flex h-10 w-10 items-center justify-center rounded-xl">
                  <Icon aria-hidden="true" className="h-5 w-5" />
                </div>
                <p className="m-0 text-base font-semibold">{stage.title}</p>
                <p className="text-primary mt-1 mb-0 text-sm font-medium">
                  {stage.role}
                </p>
                <p className="text-muted-foreground mt-3 mb-0 font-mono text-xs leading-5">
                  {stage.detail}
                </p>
              </li>
              {index < copy.stages.length - 1 && (
                <li className="m-0 flex justify-center" aria-hidden="true">
                  <ArrowDown className="text-muted-foreground h-5 w-5 md:-rotate-90" />
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </Card>
  );
}
