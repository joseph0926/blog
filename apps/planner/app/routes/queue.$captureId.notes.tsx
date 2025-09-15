import '@/styles/tactical.css';
import { Badge } from '@joseph0926/ui/components/badge';
import { Button } from '@joseph0926/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@joseph0926/ui/components/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@joseph0926/ui/components/dialog';
import { Input } from '@joseph0926/ui/components/input';
import { Textarea } from '@joseph0926/ui/components/textarea';
import { cn } from '@joseph0926/ui/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  Clock,
  Crosshair,
  Database,
  Edit,
  FileText,
  Layers,
  Plus,
  Shield,
  Terminal,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import {
  Link,
  type LoaderFunctionArgs,
  useFetcher,
  useLoaderData,
  useParams,
} from 'react-router';
import { TiptapEditor } from '@/components/editor/tiptap-editor';
import { CaptureService } from '@/services/capture.service.server';
import { LearningNoteService } from '@/services/learning-note.service.server';

export async function loader({ params }: LoaderFunctionArgs) {
  const { captureId } = params;

  if (!captureId) {
    throw new Response('캡처 ID가 필요합니다', { status: 400 });
  }

  const capture = await CaptureService.findById(captureId);
  if (!capture) {
    throw new Response('캡처를 찾을 수 없습니다', { status: 404 });
  }

  const notes = await LearningNoteService.findByCaptureId(captureId);

  return { capture, notes };
}

export default function CaptureNotesPage() {
  const { capture, notes } = useLoaderData<typeof loader>();
  const { captureId } = useParams();
  const fetcher = useFetcher();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteSummary, setNewNoteSummary] = useState('');

  const handleCreateNote = () => {
    const formData = new FormData();
    formData.append('intent', 'create');
    formData.append('captureId', captureId!);
    formData.append('title', newNoteTitle);
    formData.append('content', newNoteContent);
    formData.append('summary', newNoteSummary);

    fetcher.submit(formData, {
      method: 'POST',
      action: '/api/learning-note',
    });

    setIsCreateDialogOpen(false);
    setNewNoteTitle('');
    setNewNoteContent('');
    setNewNoteSummary('');
  };

  const handleDeleteNote = (noteId: string) => {
    if (!confirm('이 노트를 삭제하시겠습니까?')) return;

    const formData = new FormData();
    formData.append('intent', 'delete');
    formData.append('id', noteId);

    fetcher.submit(formData, {
      method: 'POST',
      action: '/api/learning-note',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          asChild
          className="group mb-4 border border-cyan-500/20 hover:border-cyan-400/50"
        >
          <Link to="/queue">
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span className="font-mono text-sm tracking-wider uppercase">
              대시보드로 돌아가기
            </span>
          </Link>
        </Button>
        <div className="relative overflow-hidden rounded-lg border border-cyan-500/30 p-6 backdrop-blur">
          <div className="bg-grid-cyan absolute inset-0" />
          <div className="scanner-line" />
          <div className="absolute top-0 left-0 h-12 w-12 border-t-2 border-l-2 border-cyan-400/50" />
          <div className="absolute top-0 right-0 h-12 w-12 border-t-2 border-r-2 border-cyan-400/50" />
          <div className="absolute bottom-0 left-0 h-12 w-12 border-b-2 border-l-2 border-cyan-400/50" />
          <div className="absolute right-0 bottom-0 h-12 w-12 border-r-2 border-b-2 border-cyan-400/50" />

          <div className="relative flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-3 flex items-center gap-3">
                <Database className="h-8 w-8 text-cyan-400" />
                <h1 className="bg-gradient-to-r from-cyan-800 via-blue-800 to-purple-800 bg-clip-text text-4xl font-black tracking-wider text-transparent uppercase dark:from-cyan-200 dark:via-blue-200 dark:to-purple-200">
                  미션 정보
                </h1>
              </div>
              <div className="space-y-2">
                <p className="font-mono text-lg font-semibold">
                  {capture.content}
                </p>
                {capture.context && (
                  <p className="font-mono text-sm">
                    <span>컨텍스트:</span>
                    <span>{capture.context}</span>
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Badge
                variant="outline"
                className={cn(
                  'border font-mono text-xs uppercase',
                  capture.status === 'IN_PROGRESS'
                    ? 'border-green-500/50'
                    : 'border-slate-500/50',
                )}
              >
                <Activity className="mr-1 h-3 w-3 animate-pulse" />
                {capture.status.replace('_', ' ')}
              </Badge>
              <Badge
                variant="outline"
                className="border-cyan-500/50 font-mono text-xs uppercase"
              >
                <Crosshair className="mr-1 h-3 w-3" />
                {capture.type.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4 rounded border border-cyan-500/20 p-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <div className="flex flex-col">
              <span className="font-mono text-[10px] uppercase">시작일</span>
              <span className="font-mono text-xs">
                {formatDistanceToNow(new Date(capture.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
          {capture.dueDate && (
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <div className="flex flex-col">
                <span className="font-mono text-[10px] text-orange-500/60 uppercase">
                  마감일
                </span>
                <span className="font-mono text-xs text-orange-400">
                  {format(new Date(capture.dueDate), 'MMM dd, yyyy')}
                </span>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-cyan-500" />
            <div className="flex flex-col">
              <span className="font-mono text-[10px] text-cyan-500/60 uppercase">
                정보 파일
              </span>
              <span className="font-mono text-xs text-cyan-300">
                {notes.length} 개 문서
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between rounded border border-cyan-500/20 p-3">
            <h2 className="flex items-center gap-2 font-mono text-lg font-bold tracking-wider text-cyan-400 uppercase">
              <Terminal className="h-5 w-5" />
              정보 데이터베이스
            </h2>
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="group relative overflow-hidden border-cyan-500/50 font-mono text-xs tracking-wider uppercase hover:border-cyan-400 hover:bg-cyan-900/30">
                  <Plus className="mr-2 h-4 w-4" />
                  <span>정보 추가</span>
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>새 학습 노트 만들기</DialogTitle>
                  <DialogDescription>
                    이 미션에 대한 학습 여정을 기록하세요
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      제목
                    </label>
                    <Input
                      placeholder="노트 제목을 입력하세요..."
                      value={newNoteTitle}
                      onChange={(e) => setNewNoteTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      요약 (선택사항)
                    </label>
                    <Textarea
                      placeholder="노트의 간단한 요약..."
                      value={newNoteSummary}
                      onChange={(e) => setNewNoteSummary(e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      내용
                    </label>
                    <TiptapEditor
                      content={newNoteContent}
                      onChange={setNewNoteContent}
                      placeholder="학습 내용을 작성하세요..."
                      className="min-h-[300px]"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      취소
                    </Button>
                    <Button
                      onClick={handleCreateNote}
                      disabled={!newNoteTitle || !newNoteContent}
                    >
                      노트 만들기
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {notes.length === 0 ? (
            <Card className="relative overflow-hidden border-2 border-dashed border-cyan-500/30 backdrop-blur">
              <div className="bg-grid-cyan absolute inset-0" />
              <CardContent className="relative flex flex-col items-center justify-center py-16">
                <div className="relative mb-6">
                  <div className="absolute inset-0 animate-ping rounded-full bg-cyan-500/20" />
                  <FileText className="relative h-16 w-16 text-cyan-500/50" />
                </div>
                <h3 className="mb-2 font-mono text-xl font-bold tracking-wider text-cyan-400 uppercase">
                  데이터베이스가 비어있습니다
                </h3>
                <p className="text-center font-mono text-sm text-cyan-400">
                  정보 문서화를 시작하세요
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {notes.map((note, index) => (
                <Card
                  key={note.id}
                  className="group relative overflow-hidden border-2 border-cyan-500/30 transition-all hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]"
                >
                  <div className="absolute top-0 left-0 flex h-8 w-12 items-center justify-center border-r border-b border-cyan-500/30 font-mono text-xs text-cyan-400">
                    #{String(index + 1).padStart(2, '0')}
                  </div>
                  <div className="group-hover:animate-scan absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0" />
                  <CardHeader className="pt-10">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="font-mono text-lg font-bold tracking-wide uppercase">
                          {note.title}
                        </CardTitle>
                        {note.summary && (
                          <CardDescription className="mt-2 font-mono text-xs">
                            <span className="text-cyan-500">요약:</span>{' '}
                            {note.summary}
                          </CardDescription>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="border border-transparent hover:border-cyan-500/30 hover:bg-cyan-950/30"
                        >
                          <Link to={`/queue/${captureId}/notes/${note.id}`}>
                            <Edit className="h-4 w-4 text-cyan-400" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteNote(note.id)}
                          className="border border-transparent hover:border-red-500/30 hover:bg-red-950/30"
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm dark:prose-invert line-clamp-3 max-w-none rounded border border-cyan-500/10 p-3">
                      <div dangerouslySetInnerHTML={{ __html: note.content }} />
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="font-mono text-xs text-cyan-500/60">
                        <span className="text-cyan-600">수정일:</span>{' '}
                        {formatDistanceToNow(new Date(note.updatedAt), {
                          addSuffix: true,
                        }).toUpperCase()}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="group relative overflow-hidden border-cyan-500/50 font-mono text-xs tracking-wider uppercase hover:border-cyan-400 hover:bg-cyan-900/30"
                      >
                        <Link to={`/queue/${captureId}/notes/${note.id}`}>
                          <span className="relative z-10">파일 열기</span>
                          <ChevronRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
                          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-4">
          <Card className="relative overflow-hidden border-2 border-cyan-500/30">
            <div className="bg-grid-cyan absolute inset-0 opacity-5" />
            <CardHeader className="relative border-b border-cyan-500/20">
              <CardTitle className="flex items-center gap-2 font-mono text-lg font-bold tracking-wider text-cyan-400 uppercase">
                <Shield className="h-5 w-5" />
                작업 상태
              </CardTitle>
            </CardHeader>
            <CardContent className="relative space-y-3 p-4">
              <dl className="space-y-3">
                <div className="flex items-center justify-between rounded border border-cyan-500/10 px-3 py-2">
                  <dt className="font-mono text-xs text-cyan-500/60 uppercase">
                    상태
                  </dt>
                  <dd className="flex items-center gap-1 font-mono text-xs font-semibold text-cyan-300">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                    {capture.status.replace('_', ' ')}
                  </dd>
                </div>
                <div className="flex items-center justify-between rounded border border-cyan-500/10 px-3 py-2">
                  <dt className="font-mono text-xs text-cyan-500/60 uppercase">
                    분류
                  </dt>
                  <dd className="font-mono text-xs font-semibold text-cyan-300">
                    {capture.type.replace('_', ' ')}
                  </dd>
                </div>
                <div className="flex items-center justify-between rounded border border-cyan-500/10 px-3 py-2">
                  <dt className="font-mono text-xs text-cyan-500/60 uppercase">
                    정보 개수
                  </dt>
                  <dd className="font-mono text-xs font-semibold text-cyan-300">
                    {notes.length} 개 파일
                  </dd>
                </div>
                <div className="flex items-center justify-between rounded border border-cyan-500/10 px-3 py-2">
                  <dt className="font-mono text-xs text-cyan-500/60 uppercase">
                    시작일
                  </dt>
                  <dd className="font-mono text-xs font-semibold text-cyan-300">
                    {format(new Date(capture.createdAt), 'yyyy.MM.dd')}
                  </dd>
                </div>
                {capture.dueDate && (
                  <div className="flex items-center justify-between rounded border border-orange-500/20 px-3 py-2">
                    <dt className="font-mono text-xs text-orange-500/80 uppercase">
                      목표일
                    </dt>
                    <dd className="font-mono text-xs font-semibold text-orange-400">
                      {format(new Date(capture.dueDate), 'yyyy.MM.dd')}
                    </dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
