import { Badge } from '@joseph0926/ui/components/badge';
import { Button } from '@joseph0926/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@joseph0926/ui/components/card';
import { cn } from '@joseph0926/ui/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertCircle,
  BookOpen,
  ChevronRight,
  Clock,
  Crosshair,
  Target,
  Zap,
} from 'lucide-react';
import { Link, type LoaderFunctionArgs, useLoaderData } from 'react-router';
import { CaptureService } from '@/services/capture.service.server';
import { LearningNoteService } from '@/services/learning-note.service.server';

export async function loader({}: LoaderFunctionArgs) {
  const activeCaptures = await CaptureService.findByStatus('IN_PROGRESS');

  const capturesWithNotes = await Promise.all(
    activeCaptures.map(async (capture) => ({
      ...capture,
      notes: await LearningNoteService.findByCaptureId(capture.id),
    })),
  );

  return { activeCaptures: capturesWithNotes };
}

export default function QueuePage() {
  const { activeCaptures } = useLoaderData<typeof loader>();

  const getPriorityColor = (dueDate: Date | null) => {
    if (!dueDate) return 'border-green-500/50';
    const daysLeft = Math.ceil(
      (new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
    if (daysLeft <= 1) return 'border-red-500';
    if (daysLeft <= 3) return 'border-orange-500';
    if (daysLeft <= 7) return 'border-yellow-500';
    return 'border-green-500/50';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="relative mb-8 overflow-hidden rounded-lg border border-cyan-500/20 p-6 backdrop-blur">
        <div className="bg-grid-cyan/5 absolute inset-0" />
        <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="relative flex items-center justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <Crosshair className="h-8 w-8 text-cyan-500" />
              <h1 className="bg-gradient-to-r from-cyan-800 via-blue-800 to-purple-800 bg-clip-text text-4xl font-black tracking-wider text-transparent uppercase dark:from-cyan-200 dark:via-blue-200 dark:to-purple-200">
                미션 컨트롤
              </h1>
            </div>
            <p className="font-mono text-sm tracking-widest uppercase">
              [ 활성 작업: {activeCaptures.length} ]
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2 rounded border border-cyan-500/30 px-3 py-1">
              <div className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
              <span className="font-mono text-xs">시스템 온라인</span>
            </div>
            <span className="font-mono text-xs">
              {new Date().toLocaleString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </span>
          </div>
        </div>
      </div>
      {activeCaptures.length === 0 ? (
        <Card className="relative overflow-hidden border-2 border-dashed border-cyan-500/30 backdrop-blur">
          <div className="bg-grid-cyan/5 absolute inset-0" />
          <CardContent className="relative flex flex-col items-center justify-center py-16">
            <div className="relative mb-6">
              <div className="absolute inset-0 animate-ping rounded-full bg-cyan-500/20" />
              <Target className="relative h-16 w-16 text-cyan-500/50" />
            </div>
            <h3 className="mb-2 font-mono text-xl font-bold tracking-wider text-cyan-400 uppercase">
              활성 작업 없음
            </h3>
            <p className="mb-6 text-center font-mono text-sm text-cyan-200/60">
              캡처 데이터베이스에서 새 미션 시작
            </p>
            <Button
              asChild
              className="group relative overflow-hidden border-cyan-500/50 hover:border-cyan-400 hover:bg-cyan-900/50"
            >
              <Link to="/">
                <span className="relative z-10 flex items-center gap-2 font-mono tracking-wider uppercase">
                  <Zap className="h-4 w-4" />
                  데이터베이스 접근
                </span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {activeCaptures.map((capture) => (
            <Card
              key={capture.id}
              className={cn(
                'group relative overflow-hidden border-2 backdrop-blur transition-all duration-300',
                'hover:border-cyan-400/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]',
                getPriorityColor(capture.dueDate),
              )}
            >
              <div className="absolute top-0 left-0 h-8 w-8 border-t-2 border-l-2 border-cyan-500/50" />
              <div className="absolute top-0 right-0 h-8 w-8 border-t-2 border-r-2 border-cyan-500/50" />
              <div className="absolute bottom-0 left-0 h-8 w-8 border-b-2 border-l-2 border-cyan-500/50" />
              <div className="absolute right-0 bottom-0 h-8 w-8 border-r-2 border-b-2 border-cyan-500/50" />
              <div className="group-hover:animate-scan absolute inset-x-0 top-0 h-px opacity-0" />
              <CardHeader className="relative">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <CardTitle className="line-clamp-2 font-mono text-lg font-bold tracking-wide uppercase">
                      {capture.content}
                    </CardTitle>
                    {capture.context && (
                      <CardDescription className="line-clamp-1 font-mono text-xs">
                        <span className="text-cyan-500">컨텍스트:</span>{' '}
                        {capture.context}
                      </CardDescription>
                    )}
                  </div>
                  <Badge
                    variant="outline"
                    className="ml-2 border-cyan-500/50 font-mono text-xs uppercase"
                  >
                    <div className="mr-1 h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
                    활성
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="relative space-y-4">
                <div className="grid grid-cols-2 gap-3 rounded border border-cyan-500/20 p-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-cyan-500" />
                    <div className="flex flex-col">
                      <span className="font-mono text-[10px] text-cyan-500/60 uppercase">
                        경과 시간
                      </span>
                      <span className="font-mono text-xs text-cyan-300">
                        {formatDistanceToNow(new Date(capture.createdAt), {
                          addSuffix: false,
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-3 w-3 text-cyan-500" />
                    <div className="flex flex-col">
                      <span className="font-mono text-[10px] text-cyan-500/60 uppercase">
                        정보
                      </span>
                      <span className="font-mono text-xs text-cyan-300">
                        {capture.notes.length}개 파일
                      </span>
                    </div>
                  </div>
                </div>
                {capture.dueDate && (
                  <div className="flex items-center gap-2 rounded border border-orange-500/30 px-3 py-2">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    <div className="flex-1">
                      <span className="font-mono text-[10px] text-orange-500/80 uppercase">
                        마감 경고
                      </span>
                      <div className="font-mono text-xs font-semibold text-orange-400">
                        T-
                        {formatDistanceToNow(new Date(capture.dueDate), {
                          addSuffix: false,
                        }).toUpperCase()}
                      </div>
                    </div>
                  </div>
                )}
                <Button
                  asChild
                  className="group relative w-full overflow-hidden border-cyan-500/50 font-mono tracking-wider uppercase hover:border-cyan-400 hover:bg-cyan-900/30"
                  variant="outline"
                >
                  <Link to={`/queue/${capture.id}/notes`}>
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <Crosshair className="h-4 w-4" />
                      정보 확인
                      <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
