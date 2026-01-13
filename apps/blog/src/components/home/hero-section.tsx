'use client';

import { ArrowDown, ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { staggerContainer, staggerItem } from '@/lib/motion-variants';

const techStack = ['React', 'Next.js', 'TypeScript', 'Web'];

export function HeroSection() {
  const [currentTech, setCurrentTech] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setCurrentTech((prev) => (prev + 1) % techStack.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleScrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight * 0.85,
      behavior: 'smooth',
    });
  };

  return (
    <section className="relative flex min-h-[85vh] flex-col items-center justify-center px-6">
      <motion.div
        className="relative z-10 mx-auto max-w-4xl text-center"
        variants={staggerContainer}
        initial="hidden"
        animate={mounted ? 'visible' : 'hidden'}
      >
        <motion.div className="mb-6" variants={staggerItem}>
          <span className="text-muted-foreground inline-flex items-center gap-2 text-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Frontend Developer
          </span>
        </motion.div>

        <motion.h1 variants={staggerItem} className="relative">
          <span className="text-foreground block text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Deep Dive into
          </span>
          <span className="relative mt-2 block h-[1.2em] text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
            <AnimatePresence mode="wait">
              <motion.span
                key={currentTech}
                className="text-foreground absolute inset-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                {techStack[currentTech]}
                <motion.span
                  className="bg-foreground absolute bottom-0 left-0 h-0.75"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2.8, ease: 'linear' }}
                />
              </motion.span>
            </AnimatePresence>
          </span>
        </motion.h1>

        <motion.p
          className="text-muted-foreground mx-auto mt-8 max-w-lg text-base sm:text-lg"
          variants={staggerItem}
        >
          React와 TypeScript로 문제를 해결하며
          <br className="hidden sm:block" /> 배운 것들을 기록합니다
        </motion.p>

        <motion.div
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          variants={staggerItem}
        >
          <button
            onClick={handleScrollToContent}
            className="bg-foreground text-background inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]"
          >
            최신 포스트
            <ArrowDown className="h-4 w-4" />
          </button>
          <Link
            href="/about"
            className="border-border text-foreground hover:bg-muted inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-medium transition-colors duration-150"
          >
            About
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </motion.div>

      <motion.button
        onClick={handleScrollToContent}
        className="text-muted-foreground hover:text-foreground absolute bottom-8 left-1/2 -translate-x-1/2 transition-colors duration-150"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 6, 0] }}
        transition={{
          opacity: { duration: 0.5, delay: 0.8 },
          y: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
        }}
        aria-label="Scroll to content"
      >
        <ArrowDown className="h-5 w-5" />
      </motion.button>
    </section>
  );
}
