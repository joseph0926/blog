import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.buildArtifact.create({
    data: {
      commitHash: process.env.GIT_SHA ?? '',
      branch: process.env.GIT_BRANCH ?? '',
      bundleKb: Number(process.env.BUNDLE_RAW_KB ?? 0),
      bundleGzipKb: Number(process.env.BUNDLE_GZIP_KB ?? 0),
    },
  });
}

main()
  .then(() => console.log('BuildArtifact saved'))
  .catch((err) => {
    console.error(err);
    exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
