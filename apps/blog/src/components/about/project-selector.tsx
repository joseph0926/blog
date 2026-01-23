'use client';

import { ChevronRight, GitBranch } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useMemo, useState } from 'react';

interface ProjectDetails {
  problem: string;
  analysis: string;
  solution: string;
  result?: string;
}

interface Project {
  id: number;
  name: string;
  repo: string;
  issue: string;
  pr: string;
  status: string;
  impact: string;
  description: string;
  details: ProjectDetails;
}

interface ProjectSelectorProps {
  // eslint-disable-next-line no-unused-vars
  onComplete?: (project: Project) => void;
}

export const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  onComplete,
}) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [typing, setTyping] = useState<boolean>(false);

  const projects: Project[] = useMemo(
    () => [
      {
        id: 1,
        name: 'React Query 성능 개선',
        repo: 'TanStack/query',
        issue: '#8604',
        pr: '#8641',
        status: 'Merged ✓',
        impact: '55% 성능 향상',
        description: 'useQueries O(N²) → O(N) 최적화',
        details: {
          problem: '100개 쿼리 처리 시 브라우저 프리징',
          analysis: 'Observer 매칭 시 중복 계산 발견',
          solution: 'observerMatches 캐싱 전략 적용',
          result: '공식 릴리스 v5.66.3',
        },
      },
      {
        id: 2,
        name: 'React Router 버그 수정',
        repo: 'remix-run/react-router',
        issue: '#14156',
        pr: '#14156',
        status: 'In Review',
        impact: '경로 생성 정확도 개선',
        description: 'relative() 절대경로 버그 해결',
        details: {
          problem: 'relative() 함수가 절대 경로 ID 생성',
          analysis: 'route.id 없을 시 절대 경로 변환',
          solution: '사전 ID 생성으로 경로 보존',
          result: '메인테이너 리뷰 진행 중',
        },
      },
      {
        id: 3,
        name: 'shadcn/ui 호환성',
        repo: 'shadcn-ui/ui',
        issue: '#7949',
        pr: '#7949',
        status: 'Open',
        impact: 'Radix Slot 완벽 호환',
        description: 'asChild prop 에러 해결',
        details: {
          problem: 'React.Children.only 에러 발생',
          analysis: 'Radix Slot과 복수 children 충돌',
          solution: '조건부 렌더링으로 분기 처리',
        },
      },
    ],
    [],
  );

  const handleSelect = useCallback(
    (project: Project) => {
      setTyping(true);
      setTimeout(() => {
        setSelectedProject(project);
        setTyping(false);
        setTimeout(() => {
          setShowDetails(true);
          if (onComplete) onComplete(project);
        }, 500);
      }, 1000);
    },
    [onComplete],
  );

  const handleReset = useCallback(() => {
    setSelectedProject(null);
    setShowDetails(false);
  }, []);

  const getStatusBadgeClass = useCallback((status: string) => {
    return status.includes('Merged')
      ? 'bg-green-500/20 text-green-500'
      : 'bg-yellow-500/20 text-yellow-500';
  }, []);

  const getDetailLabel = useCallback((key: string) => {
    const labelMap: Record<string, string> = {
      problem: '문제',
      analysis: '분석',
      solution: '해결',
      result: '결과',
    };
    return labelMap[key] || key;
  }, []);

  return (
    <div className="font-mono text-sm sm:text-base">
      <div className="mb-4 flex items-center gap-1 sm:gap-2">
        <span className="text-chart-1 flex-shrink-0">$</span>
        <span className="break-all">select-project --interactive</span>
      </div>
      {!selectedProject && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="pl-2 sm:pl-4"
        >
          <div className="text-muted-foreground mb-3 text-xs sm:text-sm">
            &gt; 어떤 프로젝트를 자세히 보시겠습니까?
          </div>

          <div className="space-y-2 sm:space-y-3">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ x: 10 }}
                onClick={() => handleSelect(project)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelect(project);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`Select project: ${project.name}`}
                className="group border-border hover:border-chart-1 hover:bg-card focus:ring-chart-1 flex cursor-pointer items-center gap-2 rounded-lg border p-2 transition-all focus:ring-2 focus:outline-none sm:gap-3 sm:p-3"
              >
                <span className="text-chart-3 flex-shrink-0 text-xs sm:text-sm">
                  [{project.id}]
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                    <span className="truncate text-sm font-semibold sm:text-base">
                      {project.name}
                    </span>
                    <span
                      className={`flex-shrink-0 rounded-full px-1.5 py-0.5 text-xs sm:px-2 ${getStatusBadgeClass(project.status)}`}
                    >
                      {project.status}
                    </span>
                  </div>
                  <div className="text-muted-foreground mt-1 text-xs sm:text-sm">
                    <span className="block sm:inline">
                      {project.description}
                    </span>
                    <span className="hidden sm:inline"> • </span>
                    <span className="block sm:inline">{project.impact}</span>
                  </div>
                </div>
                <ChevronRight className="text-muted-foreground group-hover:text-foreground h-3 w-3 flex-shrink-0 transition-colors sm:h-4 sm:w-4" />
              </motion.div>
            ))}
          </div>

          <div className="text-muted-foreground mt-4 text-center text-xs sm:text-left">
            클릭하여 선택하세요...
          </div>
        </motion.div>
      )}

      {typing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-muted-foreground pl-2 text-sm sm:pl-4"
        >
          선택 중: {selectedProject?.id}
          <span className="bg-foreground ml-1 inline-block h-3 w-1 animate-pulse sm:h-4 sm:w-2" />
        </motion.div>
      )}

      <AnimatePresence>
        {selectedProject && showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6"
          >
            <div className="border-border rounded-lg border p-3 sm:p-4">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-0">
                <div className="min-w-0 flex-1">
                  <h3 className="text-chart-3 flex items-center gap-2 text-base font-bold sm:text-lg">
                    <GitBranch className="h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" />
                    <span className="truncate">{selectedProject.name}</span>
                  </h3>
                  <div className="text-muted-foreground mt-1 text-xs break-all sm:text-sm">
                    {selectedProject.repo}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  <a
                    href="#"
                    className="bg-card border-border hover:bg-secondary flex-shrink-0 rounded border px-1.5 py-0.5 text-xs transition-colors sm:px-2 sm:py-1"
                    aria-label={`Pull Request ${selectedProject.pr}`}
                  >
                    {selectedProject.pr}
                  </a>
                  <a
                    href="#"
                    className="bg-card border-border hover:bg-secondary flex-shrink-0 rounded border px-1.5 py-0.5 text-xs transition-colors sm:px-2 sm:py-1"
                    aria-label={`Issue ${selectedProject.issue}`}
                  >
                    {selectedProject.issue}
                  </a>
                </div>
              </div>

              <div className="space-y-4">
                {Object.entries(selectedProject.details).map(
                  ([key, value], index) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex flex-col gap-1 sm:flex-row sm:gap-4"
                    >
                      <div className="text-muted-foreground w-full text-xs font-medium sm:w-20 sm:text-sm sm:font-normal">
                        {getDetailLabel(key)}:
                      </div>
                      <div className="flex-1 text-xs break-words sm:text-sm">
                        {value}
                      </div>
                    </motion.div>
                  ),
                )}
              </div>

              {selectedProject.id === 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-4"
                >
                  <div className="bg-card border-border overflow-x-auto rounded border p-2 text-xs sm:p-3">
                    <div className="text-muted-foreground mb-2">문제 코드</div>
                    <code className="text-red-400">
                      observers.filter(observer =&gt;{'\n'}
                      {'  '}queries.includes(observer.query) // O(N) × N번{'\n'}
                      )
                    </code>
                    <div className="text-muted-foreground mt-3 mb-2">
                      개선 코드
                    </div>
                    <code className="text-green-400">
                      observerMatches 캐싱으로 중복 계산 제거{'\n'}
                      const cached = getCachedMatches(observer);{'\n'}
                      if (cached) return cached; // O(1)
                    </code>
                  </div>
                </motion.div>
              )}
            </div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              onClick={handleReset}
              className="text-muted-foreground hover:text-foreground mt-4 w-full text-center text-xs transition-colors sm:w-auto sm:text-left"
            >
              ← 다른 프로젝트 보기
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
