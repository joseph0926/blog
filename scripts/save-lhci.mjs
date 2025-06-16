import { promises as fs } from 'node:fs';
import path from 'node:path';
import { argv, exit } from 'node:process';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import { PrismaClient } from '@prisma/client';

const args = {};
for (let i = 2; i < argv.length; i++) {
  const token = argv[i];
  if (!token.startsWith('--')) continue;

  if (token.includes('=')) {
    const [k, v] = token.split('=');
    args[k.replace(/^--/, '')] = v;
  } else {
    args[token.replace(/^--/, '')] = argv[i + 1];
    i++;
  }
}

const appVersion = args.appVersion ?? 'local';
const formFactor = args.formFactor ?? 'desktop';
const reportDir = args.dir ?? `.lhci/${appVersion}/${formFactor}`;

if (!args.appVersion || args.appVersion === 'local') {
  console.error('--appVersion 인자가 전달되지 않았습니다.');
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  let files;
  try {
    files = await fs.readdir(reportDir);
  } catch {
    console.warn(`Directory not found: ${reportDir}`);
    return;
  }

  const reportFiles = files.filter(
    (f) =>
      f.endsWith('.report.json') ||
      (f.startsWith('report-') && f.endsWith('.json')),
  );
  if (reportFiles.length === 0) {
    console.warn(`No reports found in ${reportDir}`);
    return;
  }

  for (const file of reportFiles) {
    const raw = await fs.readFile(path.join(reportDir, file), 'utf8');
    const json = JSON.parse(raw);

    const perf = json?.categories?.performance?.score;
    if (typeof perf !== 'number') {
      console.warn(`skip ${file} — performance.score missing`);
      continue;
    }

    const fetchTs = new Date(json.fetchTime);
    const KST = 'Asia/Seoul';
    const zoned = utcToZonedTime(fetchTs, KST);
    const dayKst = startOfDay(zoned);
    const day = zonedTimeToUtc(dayKst, KST);
    const url = json.finalUrl;
    const route = new URL(url).pathname || '/';

    await prisma.lighthouseRun.create({
      data: {
        ts: fetchTs,
        day,
        url,
        route,
        appVersion,
        formFactor,
        perfScore: perf,
        lcp: json.audits?.['largest-contentful-paint']?.numericValue ?? null,
        cls: json.audits?.['cumulative-layout-shift']?.numericValue ?? null,
        inp:
          json.audits?.['experimental-interaction-to-next-paint']
            ?.numericValue ?? null,
        json,
      },
    });

    console.log(`saved ${file}`);
  }
}

main()
  .then(() => console.log('All Lighthouse reports saved to PostgreSQL'))
  .catch((err) => {
    console.error(err);
    exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
