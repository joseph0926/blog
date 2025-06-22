/*
  Warnings:

  - You are about to drop the column `appVersion` on the `BuildArtifact` table. All the data in the column will be lost.
  - You are about to drop the column `cls` on the `BuildArtifact` table. All the data in the column will be lost.
  - You are about to drop the column `inp` on the `BuildArtifact` table. All the data in the column will be lost.
  - You are about to drop the column `jsCoverage` on the `BuildArtifact` table. All the data in the column will be lost.
  - You are about to drop the column `lcp` on the `BuildArtifact` table. All the data in the column will be lost.
  - You are about to drop the column `perfScore` on the `BuildArtifact` table. All the data in the column will be lost.
  - You are about to alter the column `commitHash` on the `BuildArtifact` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(40)`.

*/
-- CreateEnum
CREATE TYPE "Environment" AS ENUM ('prod', 'dev');

-- DropIndex
DROP INDEX "BuildArtifact_appVersion_key";

-- AlterTable
ALTER TABLE "ApiMetric" ADD COLUMN     "environment" "Environment" NOT NULL DEFAULT 'prod';

-- AlterTable
ALTER TABLE "BuildArtifact" DROP COLUMN "appVersion",
DROP COLUMN "cls",
DROP COLUMN "inp",
DROP COLUMN "jsCoverage",
DROP COLUMN "lcp",
DROP COLUMN "perfScore",
ADD COLUMN     "bundleGzipKb" DOUBLE PRECISION,
ADD COLUMN     "environment" "Environment" NOT NULL DEFAULT 'prod',
ADD COLUMN     "reportUrl" TEXT,
ALTER COLUMN "commitHash" SET DATA TYPE CHAR(40);

-- AlterTable
ALTER TABLE "RumMetric" ADD COLUMN     "environment" "Environment" NOT NULL DEFAULT 'prod';

-- CreateIndex
CREATE INDEX "BuildArtifact_branch_ts_idx" ON "BuildArtifact"("branch", "ts");

CREATE MATERIALIZED VIEW "ApiMetricHourlyMV" AS
SELECT
  date_trunc('hour', "ts")                            AS "bucket",
  "env",
  "route",
  "appVersion",
  count(*)                                            AS "hits",
  percentile_cont(0.95) WITHIN GROUP (ORDER BY "reqDur") AS "p95Req",
  percentile_cont(0.99) WITHIN GROUP (ORDER BY "reqDur") AS "p99Req",
  percentile_cont(0.95) WITHIN GROUP (ORDER BY "dbDur")  AS "p95Db",
  percentile_cont(0.99) WITHIN GROUP (ORDER BY "dbDur")  AS "p99Db"
FROM "ApiMetric"
GROUP BY 1,2,3
WITH NO DATA;

CREATE INDEX "ApiMetricHourly_bucket_idx"
  ON "ApiMetricHourlyMV" ("bucket" DESC);

REFRESH MATERIALIZED VIEW "ApiMetricHourlyMV";