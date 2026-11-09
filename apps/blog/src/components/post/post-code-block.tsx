'use client';

import { cn } from '@joseph0926/ui/lib/utils';
import { Check, Copy } from 'lucide-react';
import {
  type ComponentPropsWithoutRef,
  isValidElement,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

type PostCodeBlockProps = ComponentPropsWithoutRef<'pre'> & {
  copyLabel: string;
  copiedLabel: string;
  copyErrorLabel: string;
  expandLabel: string;
  collapseLabel: string;
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
  copyErrorLabel,
  expandLabel,
  collapseLabel,
  ...props
}: PostCodeBlockProps) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>(
    'idle',
  );
  const [foldable, setFoldable] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);
  const activeRef = useRef(true);
  const generatedId = useId();
  const codeId = props.id ?? generatedId;
  const copied = copyStatus === 'copied';
  const language = getLanguage(children);

  useLayoutEffect(() => {
    const pre = preRef.current;
    if (!pre) return;
    const measure = () => setFoldable(pre.scrollHeight > 240);
    const observer = new ResizeObserver(measure);
    observer.observe(pre);
    if (pre.firstElementChild) observer.observe(pre.firstElementChild);
    measure();
    return () => observer.disconnect();
  }, [children]);

  useEffect(() => {
    activeRef.current = true;
    return () => {
      activeRef.current = false;
      window.clearTimeout(timerRef.current);
    };
  }, []);

  const copyCode = async () => {
    const text = preRef.current?.textContent;
    if (!text) return;

    window.clearTimeout(timerRef.current);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      if (activeRef.current) setCopyStatus('failed');
      return;
    }
    if (!activeRef.current) return;
    setCopyStatus('copied');
    timerRef.current = window.setTimeout(() => setCopyStatus('idle'), 1200);
  };

  return (
    <div className="bg-muted my-7 overflow-hidden rounded-[4px]">
      <div className="flex h-9 items-center justify-between pr-1.5 pl-5">
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
          'text-foreground m-0 overflow-auto bg-transparent px-5 pt-1 pb-5 font-mono text-[13px] leading-6 break-words whitespace-pre-wrap shadow-none [&_code]:block [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-inherit',
          foldable && !expanded && 'max-h-[240px]',
          className,
        )}
        {...props}
        id={codeId}
        tabIndex={0}
      >
        {children}
      </pre>
      {foldable && (
        <button
          type="button"
          aria-controls={codeId}
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring block min-h-11 w-full px-5 py-2 text-center text-sm focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset"
        >
          {expanded ? collapseLabel : expandLabel}
        </button>
      )}
      <p
        role="status"
        className={
          copyStatus === 'failed'
            ? 'text-muted-foreground m-0 px-5 py-2 text-sm'
            : 'sr-only'
        }
      >
        {copyStatus === 'failed' ? copyErrorLabel : copied ? copiedLabel : ''}
      </p>
    </div>
  );
}
