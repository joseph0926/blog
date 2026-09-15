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
