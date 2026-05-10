'use client';

import { cn } from '@joseph0926/ui/lib/utils';
import { Check, Copy } from 'lucide-react';
import { type ComponentPropsWithoutRef, useRef, useState } from 'react';

type PostCodeBlockProps = ComponentPropsWithoutRef<'pre'> & {
  copyLabel: string;
  copiedLabel: string;
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

  const copyCode = async () => {
    const text = preRef.current?.textContent;
    if (!text) return;

    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="group border-border/75 bg-muted/35 dark:bg-muted/25 relative my-7 overflow-hidden rounded-md border">
      <button
        type="button"
        onClick={copyCode}
        className="border-border/70 bg-background/90 text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute top-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-md border transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        aria-label={copied ? copiedLabel : copyLabel}
        title={copied ? copiedLabel : copyLabel}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>
      <pre
        ref={preRef}
        className={cn(
          'm-0 max-h-[640px] overflow-x-auto bg-transparent p-5 pr-14 font-mono text-[13px] leading-6 shadow-none',
          className,
        )}
        {...props}
      >
        {children}
      </pre>
    </div>
  );
}
