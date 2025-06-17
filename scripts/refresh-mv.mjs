import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

try {
  await prisma.$executeRawUnsafe(
    'REFRESH MATERIALIZED VIEW "ApiMetricHourlyMV";',
  );
  await prisma.$executeRawUnsafe(
    'REFRESH MATERIALIZED VIEW "RumMetricDailyMV";',
  );
  console.log('Materialized views refreshed');
} catch (err) {
  console.error('[refresh-mv] error →', err);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
