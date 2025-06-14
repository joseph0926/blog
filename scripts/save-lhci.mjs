import fs from 'node:fs/promises';
import path from 'node:path';
import { prisma } from '../src/lib/prisma.js';

const dir = '.lhci';
const files = await fs.readdir(dir);

for (const f of files.filter((n) => n.endsWith('.json'))) {
  const json = JSON.parse(await fs.readFile(path.join(dir, f), 'utf8'));

  const run = {
    ts: new Date(json.fetchTime),
    url: json.finalUrl,
    perfScore: json.categories.performance.score,
    lcp: json.audits['largest-contentful-paint'].numericValue,
    tti: json.audits.interactive.numericValue,
    fcp: json.audits['first-contentful-paint'].numericValue,
    json,
  };

  await prisma.lighthouseRun.create({ data: run });
}

console.log('✅ Lighthouse results saved to PostgreSQL');
