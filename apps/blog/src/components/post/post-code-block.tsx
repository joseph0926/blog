'use client';

import { cn } from '@joseph0926/ui/lib/utils';
import { Check, Copy } from 'lucide-react';
import {
  type ComponentPropsWithoutRef,
  isValidElement,
  useRef,
  useState,
} from 'react';

type PostCodeBlockProps = ComponentPropsWithoutRef<'pre'> & {
  copyLabel: string;
  copiedLabel: string;
};

const getLanguage = (children: unknown) => {
  if (!isValidElement<{ className?: string }>(children)) return null;
  const match = /language-([\w-]+)/.exec(children.props.className ?? '');
  return match?.[1] ?? null;
};

export function PostCodeBlock({
  className,
  children,
  copyLabel,
  copiedLabel,
  ...props
}: PostCodeBlockProps) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);
  const language = getLanguage(children);

  const copyCode = async () => {
    const text = preRef.current?.textContent;
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="border-rule bg-card my-7 overflow-hidden rounded-sm border">
      <div className="border-rule flex h-9 items-center justify-between border-b pr-1.5 pl-4">
        <span className="text-muted-foreground font-mono text-[11px]">
          {language ?? 'code'}
        </span>
        <button
          type="button"
          onClick={copyCode}
          className={cn(
            'focus-visible:ring-ring inline-flex h-7 items-center gap-1.5 rounded-sm px-2 font-mono text-[11px] transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none',
            copied
              ? 'text-accent-ink'
              : 'text-muted-foreground hover:text-foreground',
          )}
          aria-label={copied ? copiedLabel : copyLabel}
          title={copied ? copiedLabel : copyLabel}
        >
          {copied ? (
            <Check className="motion-safe:animate-ink-settle h-3.5 w-3.5" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          <span aria-hidden="true">{copied ? copiedLabel : copyLabel}</span>
        </button>
      </div>
      <pre
        ref={preRef}
        className={cn(
          'text-foreground m-0 max-h-[640px] overflow-x-auto bg-transparent p-5 font-mono text-[13px] leading-6 shadow-none [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-inherit',
          className,
        )}
        {...props}
      >
        {children}
      </pre>
    </div>
  );
}
