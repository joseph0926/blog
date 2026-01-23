'use client';

import { AnimatePresence, motion, useScroll, useTransform } from 'motion/react';
import { useEffect, useState } from 'react';
import { CommandLine } from './command-line';
import { OutputDisplay } from './output-display';
import { ProgressBar } from './progress-bar';
import { ProjectSelector } from './project-selector';
import { TerminalHeader } from './terminal-header';

export const TerminalAbout = () => {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [showWhoami, setShowWhoami] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const { scrollYProgress } = useScroll();

  const phase = useTransform(scrollYProgress, [0, 0.2, 0.4, 0.6], [0, 1, 2, 3]);

  useEffect(() => {
    const unsubscribe = phase.onChange((value) => {
      setCurrentPhase(Math.floor(value));
    });
    return unsubscribe;
  }, [phase]);

  useEffect(() => {
    if (currentPhase >= 2 && analysisProgress < 1) {
      const timer = setInterval(() => {
        setAnalysisProgress((prev) => {
          if (prev >= 1) {
            clearInterval(timer);
            return 1;
          }
          return prev + 0.02;
        });
      }, 50);
      return () => clearInterval(timer);
    }
  }, [currentPhase, analysisProgress]);

  return (
    <div className="bg-background min-h-[200vh] p-4 sm:p-6 lg:p-8">
      <div className="sticky top-4 mx-auto max-w-4xl sm:top-8">
        <motion.div
          className="border-border bg-background rounded-lg border shadow-2xl"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <TerminalHeader />
          <div className="min-h-[400px] p-4 sm:min-h-[500px] sm:p-6">
            <AnimatePresence>
              {currentPhase >= 0 && (
                <>
                  <CommandLine
                    command="whoami"
                    delay={500}
                    onComplete={() => setShowWhoami(true)}
                  />
                  {showWhoami && (
                    <OutputDisplay delay={100}>
                      <div className="space-y-1">
                        <div className="text-chart-3 dark:text-chart-3 text-lg font-bold break-words sm:text-xl">
                          김영훈 | Frontend Engineer
                        </div>
                        <div className="text-muted-foreground text-sm sm:text-base">
                          오픈소스 기여자 | 성능 최적화 전문 | 2년차
                        </div>
                      </div>
                    </OutputDisplay>
                  )}
                </>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {currentPhase >= 1 && (
                <motion.div
                  className="mt-4 sm:mt-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <CommandLine
                    command="current-status --detailed"
                    delay={200}
                    onComplete={() => setShowStatus(true)}
                  />
                  {showStatus && (
                    <OutputDisplay delay={100}>
                      <div className="space-y-2">
                        <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2 sm:gap-4 sm:text-sm">
                          <div className="break-words">
                            <span className="text-muted-foreground">위치:</span>
                            <span className="ml-1 sm:ml-2">
                              EA Korea (Frontend)
                            </span>
                          </div>
                          <div className="break-words">
                            <span className="text-muted-foreground">경력:</span>
                            <span className="ml-1 sm:ml-2">
                              2년 (2023.07 ~)
                            </span>
                          </div>
                          <div className="break-words">
                            <span className="text-muted-foreground">
                              오픈소스:
                            </span>
                            <span className="text-chart-2 dark:text-chart-2 ml-1 sm:ml-2">
                              5개 프로젝트 기여
                            </span>
                          </div>
                          <div className="break-words">
                            <span className="text-muted-foreground">
                              주요 성과:
                            </span>
                            <span className="text-chart-2 dark:text-chart-2 ml-1 sm:ml-2">
                              API 55% 감소
                            </span>
                          </div>
                        </div>
                      </div>
                    </OutputDisplay>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {currentPhase >= 2 && (
                <motion.div
                  className="mt-4 sm:mt-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <CommandLine
                    command="analyze-contributions --recent"
                    delay={200}
                  />
                  <OutputDisplay delay={800}>
                    <ProgressBar
                      progress={analysisProgress}
                      label="오픈소스 기여 분석 중..."
                    />
                    {analysisProgress >= 1 && (
                      <motion.div
                        className="mt-4 space-y-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <div className="text-chart-2 dark:text-chart-2 text-sm">
                          ✓ 분석 완료: 5개 프로젝트, 12개 PR
                        </div>
                        <div className="space-y-1 pl-2 text-xs sm:pl-4 sm:text-sm">
                          <div className="break-words">
                            1. React Query: useQueries 성능 개선 (Merged)
                          </div>
                          <div className="break-words">
                            2. React Router: 경로 버그 수정
                          </div>
                          <div className="break-words">
                            3. shadcn/ui: Radix 호환성 개선 (Merged)
                          </div>
                          <div className="text-muted-foreground">...</div>
                        </div>
                      </motion.div>
                    )}
                  </OutputDisplay>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {currentPhase >= 3 && (
                <motion.div
                  className="mt-4 sm:mt-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <ProjectSelector />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
      <motion.div
        className="text-muted-foreground fixed right-4 bottom-4 font-mono text-xs sm:right-8 sm:bottom-8 sm:text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        스크롤하여 더 보기 ↓
      </motion.div>
    </div>
  );
};
