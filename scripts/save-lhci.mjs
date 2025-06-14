import fs from 'node:fs/promises';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const dir = '.lhci';
const files = await fs.readdir(dir);
const reportFiles = files.filter((f) => f.endsWith('.report.json'));

for (const file of reportFiles) {
  const raw = await fs.readFile(path.join(dir, file), 'utf8');
  const json = JSON.parse(raw);

  const perf = json?.categories?.performance?.score;
  if (typeof perf !== 'number') {
    console.warn(`⚠️  skip ${file} — performance.score missing`);
    continue;
  }

  const run = {
    ts: new Date(json.fetchTime),
    url: json.finalUrl,
    perfScore: perf,
    lcp: json.audits?.['largest-contentful-paint']?.numericValue ?? null,
    tti: json.audits?.interactive?.numericValue ?? null,
    fcp: json.audits?.['first-contentful-paint']?.numericValue ?? null,
    json,
  };

  await prisma.lighthouseRun.create({ data: run });
  console.log(`✅ saved ${file}`);
}

console.log('🎉  All Lighthouse reports saved to PostgreSQL');
