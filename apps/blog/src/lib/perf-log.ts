import 'server-only';
import fs from 'node:fs';
import path from 'node:path';

type PerfLogData = Record<string, unknown>;

type PerfLogRecord = {
  ts: string;
  label: string;
  data?: PerfLogData;
};

const perfDebugEnabled = process.env.BLOG_PERF_DEBUG === '1';
const perfLogPath =
  process.env.BLOG_PERF_LOG_PATH ??
  path.join(process.cwd(), '.perf', 'perf-log.jsonl');

let dirReady = false;

const ensureLogDir = () => {
  if (dirReady) return;
  fs.mkdirSync(path.dirname(perfLogPath), { recursive: true });
  dirReady = true;
};

const writePerfLine = (label: string, data?: PerfLogData) => {
  try {
    ensureLogDir();
    const record: PerfLogRecord = {
      ts: new Date().toISOString(),
      label,
      data,
    };
    fs.appendFileSync(perfLogPath, `${JSON.stringify(record)}\n`);
  } catch {
    // best-effort logging only
  }
};

export const perfLog = (label: string, data?: PerfLogData) => {
  if (!perfDebugEnabled) return;
  writePerfLine(label, data);
};

export const perfTimer = (label: string) => {
  if (!perfDebugEnabled) {
    return (_data?: PerfLogData) => {};
  }

  const start = performance.now();

  return (data?: PerfLogData) => {
    const durMs = Math.round((performance.now() - start) * 10) / 10;
    writePerfLine(label, { ...data, durMs });
  };
};
