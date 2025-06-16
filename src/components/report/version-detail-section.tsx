import { getVersionDelta } from '@/actions/report.action';
import { getLatestVersions } from '@/actions/rum.action';
import { VersionDeltaCards } from './version-delta-cards';

type Props = {
  cur: string;
  prev?: string;
  ff?: 'desktop' | 'mobile';
};

export async function VersionDeltaSection({
  cur,
  prev = 'previous',
  ff,
}: Props) {
  const versions = await getLatestVersions();

  const curVersion = cur === 'latest' ? (versions[0] ?? null) : cur;

  let prevVersion: string | null;
  if (!prev || prev === 'previous' || prev === 'prev') {
    prevVersion = versions.find((v) => v !== curVersion) ?? null;
  } else if (prev === 'latest') {
    prevVersion = versions[0] ?? null;
  } else {
    prevVersion = prev;
  }

  if (!curVersion || !prevVersion) {
    return (
      <section className="bg-card rounded-xl border p-4 shadow-sm">
        <h2 className="mb-4 text-lg font-medium">Version Comparison</h2>
        <p className="text-muted-foreground text-sm">
          버전 데이터가 부족합니다.
        </p>
      </section>
    );
  }

  const { data } = await getVersionDelta(curVersion, prevVersion, ff);

  return (
    <section className="bg-card rounded-xl border p-4 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-medium">
        Version Comparison
        <span className="text-muted-foreground text-xs">
          ( {curVersion} vs {prevVersion} )
        </span>
      </h2>
      <VersionDeltaCards
        delta={data}
        cur={curVersion}
        prev={prevVersion}
        versions={versions}
      />
    </section>
  );
}
