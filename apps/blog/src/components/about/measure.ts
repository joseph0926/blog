export type Measurement = {
  id: string;
  from: string;
  to: string;
  caption: string;
  source: string;
};

export type ParsedMeasure = {
  prefix: string;
  value: number;
  suffix: string;
  decimals: number;
};

export const parseMeasure = (raw: string): ParsedMeasure | null => {
  const match = /^([^\d]*)(\d[\d,]*(?:\.\d+)?)(.*)$/.exec(raw.trim());
  if (!match) return null;
  const [, prefix, digits, suffix] = match;
  const value = Number(digits.replace(/,/g, ''));
  if (Number.isNaN(value)) return null;
  const decimals = digits.includes('.') ? digits.split('.')[1].length : 0;
  return { prefix, value, suffix, decimals };
};

export const measureRatio = (from: string, to: string) => {
  const a = parseMeasure(from);
  const b = parseMeasure(to);
  if (!a || !b || a.value === 0) return 1;
  return Math.min(2.5, Math.max(0.3, b.value / a.value));
};
