'use client';

import { Sandpack, SandpackProps } from '@codesandbox/sandpack-react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';

function useInView(options?: IntersectionObserverInit) {
  const [inView, setInView] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const updateEntry = useCallback(([entry]: IntersectionObserverEntry[]) => {
    setEntry(entry);
    setInView(entry.isIntersecting);
  }, []);

  useEffect(() => {
    const node = ref.current;
    const hasIOSupport = !!window.IntersectionObserver;

    if (!hasIOSupport || !node) {
      setInView(true);
      return;
    }

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(updateEntry, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options,
    });

    observerRef.current.observe(node);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [updateEntry, options]);

  return { ref, inView, entry };
}

interface SandpackFile {
  code: string;
  hidden?: boolean;
  active?: boolean;
  readOnly?: boolean;
}

type SandpackFiles = Record<string, string | SandpackFile>;

interface SandpackLazyProps extends Omit<SandpackProps, 'files'> {
  files: SandpackFiles;
  loadingHeight?: number;
  onError?: (error: Error) => void;
}

const SandpackLazy = memo(
  ({ files, loadingHeight = 500, onError, ...props }: SandpackLazyProps) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const mountedRef = useRef(true);
    const loadTimeoutRef = useRef<NodeJS.Timeout>(null);

    const { ref, inView } = useInView({
      threshold: 0.1,
      rootMargin: '100px',
    });

    const attemptLoad = useCallback(() => {
      if (!mountedRef.current) return;

      try {
        setIsLoaded(true);
        setHasError(false);
        setErrorMessage('');
      } catch (error) {
        const err = error as Error;
        setHasError(true);
        setErrorMessage(err.message || '알 수 없는 오류가 발생했습니다.');
        onError?.(err);
      }
    }, [onError]);

    useEffect(() => {
      if (inView && !isLoaded && !hasError && mountedRef.current) {
        loadTimeoutRef.current = setTimeout(() => {
          attemptLoad();
        }, 100);
      }

      return () => {
        if (loadTimeoutRef.current) {
          clearTimeout(loadTimeoutRef.current);
        }
      };
    }, [inView, isLoaded, hasError, attemptLoad]);

    useEffect(() => {
      mountedRef.current = true;

      return () => {
        mountedRef.current = false;
        if (loadTimeoutRef.current) {
          clearTimeout(loadTimeoutRef.current);
        }
      };
    }, []);

    if (hasError) {
      return (
        <div className="my-8 rounded-md border border-red-300 bg-red-50 p-4">
          <p className="font-medium text-red-600">
            코드 에디터를 로드할 수 없습니다.
          </p>
          {errorMessage && (
            <p className="mt-1 text-sm text-red-500">{errorMessage}</p>
          )}
          <button
            onClick={() => {
              setHasError(false);
              setIsLoaded(false);
              attemptLoad();
            }}
            className="mt-3 rounded bg-red-600 px-4 py-2 text-sm text-white transition-colors hover:bg-red-700"
            type="button"
          >
            다시 시도
          </button>
        </div>
      );
    }

    return (
      <div ref={ref} className="my-8">
        {!isLoaded ? (
          <div
            className="animate-pulse rounded-md bg-gray-100"
            style={{ height: `${loadingHeight}px` }}
            aria-label="코드 에디터 로딩 중"
          />
        ) : (
          <Sandpack
            files={files}
            template="react"
            options={{
              editorHeight: 500,
              showNavigator: false,
              showTabs: true,
              showLineNumbers: true,
              showInlineErrors: true,
              bundlerTimeOut: 30000,
              ...props.options,
            }}
            {...props}
          />
        )}
      </div>
    );
  },
);

SandpackLazy.displayName = 'SandpackLazy';

const baseFiles: SandpackFiles = {
  '/App.js': `import "./styles.css";
import { useState } from "react";

export default function App() {
  const [toasts, setToasts] = useState(0);

  return (
    <div className="wrapper">
      <div className="toaster">
        {Array.from({ length: toasts }).map((_, i) => (
          <Toast key={i} />
        ))}
      </div>
      <button
        className="button"
        onClick={() => {
          setToasts(toasts + 1);
        }}
      >
        Add toast
      </button>
    </div>
  );
}

function Toast() {
  return (
    <div className="toast" >
      <span className="title">테스트 타이틀</span>
      <span className="description">테스트 설명입니다.</span>
    </div>
  );
}`,
};

const styleVariants = {
  variant1: `
.toast {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6px;                     
  padding: 12px 16px 14px;      
  width: 100%;
  font-size: 14px;              
  border-radius: 8px;
  background: #fff;             
  border-left: 4px solid #6366f1; 
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.06),
    0 4px 12px rgba(0, 0, 0, 0.08); 
}`,
  variant2: `
.toast {
  position: absolute;
  bottom: 0;     
  display: flex;
  flex-direction: column;
  gap: 6px;                     
  padding: 12px 16px 14px;      
  width: 100%;
  font-size: 14px;              
  border-radius: 8px;
  background: #fff;             
  border-left: 4px solid #6366f1; 
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.06),
    0 4px 12px rgba(0, 0, 0, 0.08); 
}`,
  variant3: `
.toast {
  position: absolute;
  bottom: 0;     
  display: flex;
  flex-direction: column;
  gap: 6px;                     
  padding: 12px 16px 14px;      
  width: 100%;
  font-size: 14px;              
  border-radius: 8px;
  background: #fff;             
  border-left: 4px solid #6366f1; 
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.06),
    0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(calc(var(--index) * (5% + var(--gap)) * -1));
}`,
  variant4: `
.toast {
  position: absolute;
  bottom: 0;     
  display: flex;
  flex-direction: column;
  gap: 6px;                     
  padding: 12px 16px 14px;      
  width: 100%;
  font-size: 14px;              
  border-radius: 8px;
  background: #fff;             
  border-left: 4px solid #6366f1; 
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.06),
    0 4px 12px rgba(0, 0, 0, 0.08);
  opacity: 0;
  transition: transform 400ms ease, opacity 400ms ease;
}
.toast[data-open="true"] {
  opacity: 1;
  transform: translateY(calc(var(--index) * (5% + var(--gap)) * -1));
}`,
} as const;

const commonStyles = `
.title {
  font-weight: 600;             
  color: #111827;               
}

.description {
  line-height: 1.2;             
  color: #6b7280;               
  font-weight: 400;             
}

.toaster {
  position: absolute;
  bottom: 96px;                 
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: var(--gap);
  --gap: 18px;                  
  width: 356px;
}

.button {
  position: relative;
  display: inline-block;
  margin-top: auto;
  width: auto;
  height: 36px;                 
  padding-inline: 14px;         
  font-size: 14px;
  font-weight: 500;
  background: #fff;
  border-radius: 9999px;
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.08),
    0 3px 3px rgba(0, 0, 0, 0.04); 
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.button:hover {
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.12),
    0 4px 6px rgba(0, 0, 0, 0.08);
}

.wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 24px;
  height: 440px;                
}`;

const appVariants = {
  variant3: `import "./styles.css";
import { useState } from "react";

export default function App() {
  const [toasts, setToasts] = useState(0);

  return (
    <div className="wrapper">
      <div className="toaster">
        {Array.from({ length: toasts }).map((_, i) => (
          <Toast key={i} index={toasts - (i + 1)} />
        ))}
      </div>
      <button
        className="button"
        onClick={() => {
          setToasts(toasts + 1);
        }}
      >
        Add toast
      </button>
    </div>
  );
}

function Toast({index}) {
  return (
    <div className="toast" style={{"--index": index}} >
      <span className="title">테스트 타이틀</span>
      <span className="description">테스트 설명입니다.</span>
    </div>
  );
}`,
  variant4: `import "./styles.css";
import { useState, useEffect } from "react";

export default function App() {
  const [toasts, setToasts] = useState(0);

  return (
    <div className="wrapper">
      <div className="toaster">
        {Array.from({ length: toasts }).map((_, i) => (
          <Toast key={i} index={toasts - (i + 1)} />
        ))}
      </div>
      <button
        className="button"
        onClick={() => {
          setToasts(toasts + 1);
        }}
      >
        Add toast
      </button>
    </div>
  );
}

function Toast({index}) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {setIsMounted(true)}, [])

  return (
    <div className="toast" data-open={isMounted} style={{"--index": index}} >
      <span className="title">테스트 타이틀</span>
      <span className="description">테스트 설명입니다.</span>
    </div>
  );
}`,
} as const;

export const SonnerImpl1 = () => {
  const files: SandpackFiles = {
    ...baseFiles,
    '/styles.css': styleVariants.variant1 + commonStyles,
  };

  return <SandpackLazy files={files} />;
};

export const SonnerImpl2 = () => {
  const files: SandpackFiles = {
    ...baseFiles,
    '/styles.css': styleVariants.variant2 + commonStyles,
  };

  return <SandpackLazy files={files} />;
};

export const SonnerImpl3 = () => {
  const files: SandpackFiles = {
    '/App.js': appVariants.variant3,
    '/styles.css': styleVariants.variant3 + commonStyles,
  };

  return <SandpackLazy files={files} />;
};

export const SonnerImpl4 = () => {
  const files: SandpackFiles = {
    '/App.js': appVariants.variant4,
    '/styles.css': styleVariants.variant4 + commonStyles,
  };

  return <SandpackLazy files={files} />;
};
