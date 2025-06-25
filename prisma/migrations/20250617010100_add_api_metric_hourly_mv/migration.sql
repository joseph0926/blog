-- CreateEnum
CREATE TYPE "FormFactor" AS ENUM ('desktop', 'mobile');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tags" TEXT[],
    "thumbnail" TEXT,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiMetric" (
    "id" BIGSERIAL NOT NULL,
    "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "day" TIMESTAMP(3) NOT NULL,
    "route" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "backend" TEXT NOT NULL,
    "region" TEXT,
    "reqDur" DOUBLE PRECISION NOT NULL,
    "dbDur" DOUBLE PRECISION,
    "cpuMs" DOUBLE PRECISION,
    "memRssMb" DOUBLE PRECISION,
    "cacheHit" BOOLEAN NOT NULL DEFAULT false,
    "appVersion" TEXT NOT NULL,

    CONSTRAINT "ApiMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RumMetric" (
    "id" BIGSERIAL NOT NULL,
    "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "day" TIMESTAMP(3) NOT NULL,
    "url" TEXT,
    "route" TEXT NOT NULL,
    "formFactor" "FormFactor" NOT NULL,
    "lcp" DOUBLE PRECISION,
    "fid" DOUBLE PRECISION,
    "cls" DOUBLE PRECISION,
    "inp" DOUBLE PRECISION,
    "ttfb" DOUBLE PRECISION,
    "fcp" DOUBLE PRECISION,
    "deviceMem" DOUBLE PRECISION,
    "connType" TEXT,
    "userAgent" TEXT,
    "appVersion" TEXT NOT NULL,

    CONSTRAINT "RumMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuildArtifact" (
    "id" BIGSERIAL NOT NULL,
    "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "appVersion" TEXT NOT NULL,
    "commitHash" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "perfScore" DOUBLE PRECISION NOT NULL,
    "lcp" DOUBLE PRECISION,
    "cls" DOUBLE PRECISION,
    "inp" DOUBLE PRECISION,
    "bundleKb" DOUBLE PRECISION NOT NULL,
    "jsCoverage" DOUBLE PRECISION,

    CONSTRAINT "BuildArtifact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");

-- CreateIndex
CREATE INDEX "Post_createdAt_id_idx" ON "Post"("createdAt", "id");

-- CreateIndex
CREATE INDEX "Post_tags_idx" ON "Post" USING GIN ("tags");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "RefreshToken_token_idx" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "ApiMetric_day_route_method_statusCode_idx" ON "ApiMetric"("day", "route", "method", "statusCode");

-- CreateIndex
CREATE INDEX "ApiMetric_appVersion_route_ts_idx" ON "ApiMetric"("appVersion", "route", "ts");

-- CreateIndex
CREATE INDEX "RumMetric_day_route_formFactor_idx" ON "RumMetric"("day", "route", "formFactor");

-- CreateIndex
CREATE UNIQUE INDEX "BuildArtifact_appVersion_key" ON "BuildArtifact"("appVersion");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

DROP MATERIALIZED VIEW IF EXISTS "ApiMetricHourlyMV" CASCADE;

CREATE MATERIALIZED VIEW "ApiMetricHourlyMV" AS
SELECT
  date_trunc('hour', "ts")                            AS "bucket",
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
