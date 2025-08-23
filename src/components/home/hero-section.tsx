'use client';

import { ChevronDown, Code2, Sparkles, Terminal } from 'lucide-react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'motion/react';
import { useEffect, useRef, useState } from 'react';

const techStack = [
  { name: 'React', gradient: 'from-cyan-500 to-blue-600' },
  {
    name: 'Next.js',
    gradient: 'from-gray-700 to-gray-900 dark:from-white dark:to-gray-400',
  },
  { name: 'TypeScript', gradient: 'from-blue-400 to-blue-600' },
  { name: 'Modern Web', gradient: 'from-purple-500 to-pink-500' },
];

const codeSnippets = [
  'const [state, setState] = useState()',
  '<Suspense fallback={<Loading />}>',
  'export default async function Page()',
  'server components',
  'use client',
  'async function getData()',
];

function FloatingCube({ delay = 0 }) {
  return (
    <motion.div
      className="absolute h-32 w-32"
      initial={{
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
      }}
      animate={{
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        rotateX: [0, 360],
        rotateY: [0, 360],
      }}
      transition={{
        duration: 20 + Math.random() * 10,
        repeat: Infinity,
        delay,
        ease: 'linear',
      }}
    >
      <div
        className="border-primary/10 dark:border-primary/20 h-full w-full rounded-lg border backdrop-blur-sm"
        style={{
          transform: 'perspective(1000px) rotateX(45deg) rotateY(45deg)',
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.01), rgba(255,255,255,0.05))',
        }}
      />
    </motion.div>
  );
}

function ParticleField() {
  const particles = Array.from({ length: 50 });

  return (
    <div className="absolute inset-0 overflow-hidden">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="bg-primary/20 absolute h-1 w-1 rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: window.innerHeight + 100,
          }}
          animate={{
            y: -100,
            x: Math.random() * window.innerWidth,
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            delay: Math.random() * 10,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}

export function HeroSection() {
  const [currentTech, setCurrentTech] = useState(0);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  const rotateX = useTransform(y, [-300, 300], [5, -5]);
  const rotateY = useTransform(x, [-300, 300], [-5, 5]);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setCurrentTech((prev) => (prev + 1) % techStack.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const moveX = (e.clientX - centerX) * 0.3;
    const moveY = (e.clientY - centerY) * 0.3;
    mouseX.set(moveX);
    mouseY.set(moveY);
  };

  const handleScrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight * 0.85,
      behavior: 'smooth',
    });
  };

  return (
    <section
      ref={containerRef}
      className="bg-background dark:bg-background relative flex min-h-[85vh] flex-col justify-center overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      <div className="absolute inset-0 opacity-30 dark:opacity-40">
        <div className="from-primary/10 to-accent/10 absolute inset-0 bg-gradient-to-br via-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--primary)_0%,_transparent_50%)] opacity-10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--accent)_0%,_transparent_50%)] opacity-10" />
      </div>
      <motion.div
        className="absolute inset-0"
        style={{ rotateX, rotateY, transformPerspective: 1200 }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black_20%,transparent_70%)] bg-[size:4rem_4rem] opacity-[0.5] dark:opacity-[0.3]" />
      </motion.div>
      {mounted && <ParticleField />}
      {mounted && (
        <div className="pointer-events-none absolute inset-0">
          {[0, 2, 4].map((delay) => (
            <FloatingCube key={delay} delay={delay} />
          ))}
        </div>
      )}
      {mounted && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {codeSnippets.map((snippet, i) => (
            <motion.div
              key={i}
              className="absolute font-mono text-xs"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0.1, 0.3, 0.1],
                y: [-10, 10, -10],
              }}
              transition={{
                duration: 15,
                delay: i * 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{
                left: `${10 + (i % 3) * 40}%`,
                top: `${15 + Math.floor(i / 3) * 50}%`,
                color: 'hsl(var(--primary))',
                textShadow: '0 0 20px rgba(var(--primary-rgb), 0.3)',
                opacity: 0.2,
              }}
            >
              {snippet}
            </motion.div>
          ))}
        </div>
      )}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-30 dark:opacity-40"
        style={{ x, y }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className={`h-[600px] w-[600px] rounded-full bg-gradient-to-r ${techStack[currentTech].gradient}`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              filter: 'blur(100px)',
            }}
          />
        </div>
      </motion.div>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02] dark:opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      <motion.div
        className="relative z-10 mx-auto max-w-5xl px-4"
        style={{
          rotateX: useTransform(y, [-200, 200], [2, -2]),
          rotateY: useTransform(x, [-200, 200], [-2, 2]),
          transformPerspective: 1200,
        }}
      >
        <motion.div
          className="mb-6 flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative">
            <div className="bg-primary/20 absolute inset-0 blur-xl" />
            <div className="border-border/50 bg-background/50 dark:bg-background/80 relative inline-flex items-center gap-2 rounded-full border px-3 py-1 backdrop-blur-sm">
              <Sparkles className="text-primary h-3 w-3" />
              <span className="text-muted-foreground text-xs font-medium">
                Frontend Developer
              </span>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-center">
            <span className="text-foreground block text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
              Deep Dive into
            </span>
            <AnimatePresence mode="wait">
              <motion.span
                key={currentTech}
                className={`mt-2 block bg-gradient-to-r text-4xl font-black tracking-tight sm:text-5xl md:text-6xl lg:text-7xl ${techStack[currentTech].gradient} bg-clip-text text-transparent`}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.2, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                {techStack[currentTech].name}
              </motion.span>
            </AnimatePresence>
          </h1>
        </motion.div>
        <motion.p
          className="text-muted-foreground mx-auto mt-6 max-w-2xl text-center text-base sm:text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          React와 TypeScript로
          <br className="block sm:hidden" /> 문제를 해결하며 배운 것들을
          기록합니다
        </motion.p>
        <motion.div
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <motion.button
            onClick={handleScrollToContent}
            className="group bg-primary text-primary-foreground relative inline-flex items-center gap-2 overflow-hidden rounded-lg px-5 py-2.5 text-sm font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="from-primary/0 via-primary-foreground/10 to-primary/0 absolute inset-0 translate-x-[-100%] bg-gradient-to-r transition-transform duration-500 group-hover:translate-x-[100%]" />
            <Terminal className="relative z-10 h-4 w-4" />
            <span className="relative z-10">최신 포스트</span>
            <motion.span
              className="relative z-10 inline-block"
              animate={{ x: [0, 3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              →
            </motion.span>
          </motion.button>
          <motion.a
            href="/about"
            className="border-border hover:bg-accent inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Code2 className="h-4 w-4" />
            About
          </motion.a>
        </motion.div>
      </motion.div>
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
      >
        <motion.button
          onClick={handleScrollToContent}
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-muted-foreground hover:text-foreground flex cursor-pointer flex-col items-center gap-1 transition-colors"
        >
          <span className="text-xs">Scroll</span>
          <ChevronDown className="h-4 w-4" />
        </motion.button>
      </motion.div>
    </section>
  );
}
